import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReverseGeocodingService } from './services/reverse-geocoding.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { RecordModel } from './records.types';
import {
  RecordCreationFailedException,
  RecordNotFoundException,
} from './exceptions/record.exceptions';
import { GRAPH_ROWS_SQL } from './sql/graph.row.sql';
import { GraphRowType } from './type/graph.type';
import { GraphEdgeDto, GraphNodeDto } from './dto/graph.dto';
import { GraphResponseDto } from './dto/graph.response.dto';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reverseGeocodingService: ReverseGeocodingService,
  ) {}

  async createRecord(
    userId: number,
    dto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    // 1. 역지오코딩 호출
    const { name, address } =
      await this.reverseGeocodingService.getAddressFromCoordinates(
        dto.location.latitude,
        dto.location.longitude,
      );

    if (!name && !address) {
      this.logger.warn(
        `Reverse geocoding failed: lat=${dto.location.latitude}, lng=${dto.location.longitude}`,
      );
    }

    // 2. Prisma create + geometry UPDATE
    try {
      const record = await this.prisma.$transaction(async (tx) => {
        // 2-1. location 제외 레코드 생성
        const created = await tx.record.create({
          data: {
            userId,
            title: dto.title,
            content: dto.content ?? null,
            locationName: name,
            locationAddress: address,
            tags: dto.tags ?? [],
            isFavorite: false,
          },
        });

        // 2-2. geometry 필드 업데이트 및 레코드 조회
        const [updated] = await tx.$queryRaw<RecordModel[]>`
          UPDATE records
          SET location = ST_SetSRID(
            ST_MakePoint(${dto.location.longitude}, ${dto.location.latitude}),
            4326
          )
          WHERE id = ${created.id}
          RETURNING
            id,
            public_id,
            title,
            content,
            ST_X(location) AS longitude,
            ST_Y(location) AS latitude,
            location_name,
            location_address,
            tags,
            is_favorite,
            created_at,
            updated_at
        `;

        return updated;
      });

      this.logger.log(
        `Record created: publicId=${record.public_id}, userId=${userId}, title="${dto.title}"`,
      );

      // 3. 응답 변환
      return RecordResponseDto.from(record);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to create record: userId=${userId}, error=${error.message}`,
          error.stack,
        );
        throw new RecordCreationFailedException(error);
      } else {
        this.logger.error(
          `Non-Error exception thrown during record creation: userId=${userId}, raw=${JSON.stringify(error)}`,
        );
        throw new Error('Unexpected non-Error exception thrown');
      }
    }
  }

  async getGraph(
    startRecordPublicId: string,
    userId: number,
  ): Promise<GraphResponseDto> {
    const startRecordId = await this.getRecordIdByPublicId(startRecordPublicId);

    // 그래프 탐색 쿼리 실행
    const rows = await this.prisma.$queryRawUnsafe<GraphRowType[]>(
      GRAPH_ROWS_SQL,
      startRecordId,
      userId,
    );

    const { nodes, edges } = this.buildGraphFromRows(rows);

    return {
      nodes,
      edges,
      meta: {
        start: startRecordPublicId,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        truncated: false,
      },
    };
  }

  async getRecordIdByPublicId(publicId: string): Promise<bigint> {
    const recordId = await this.prisma.record.findUnique({
      where: { publicId },
      select: {
        id: true,
      },
    });

    if (!recordId) {
      throw new RecordNotFoundException(publicId);
    }

    return recordId.id;
  }

  private buildGraphFromRows(rows: GraphRowType[]): {
    nodes: GraphNodeDto[];
    edges: GraphEdgeDto[];
  } {
    const nodes: GraphNodeDto[] = [];

    const edges: GraphEdgeDto[] = [];

    for (const row of rows) {
      if (row.row_type === 'node') {
        nodes.push({
          publicId: row.node_public_id,
          location: { latitude: row.latitude, longitude: row.longitude },
        });
      } else {
        // edge
        edges.push({
          fromRecordPublicId: row.from_public_id,
          toRecordPublicId: row.to_public_id,
        });
      }
    }

    return { nodes, edges };
  }

  // TODO: 태그 관련 중간테이블 및 서비스 추가
  // TODO: 이미지 기능 추가
}
