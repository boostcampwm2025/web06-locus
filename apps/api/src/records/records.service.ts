import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReverseGeocodingService } from './services/reverse-geocoding.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { RecordModel } from './records.types';
import {
  LocationNotFoundException,
  RecordAccessDeniedException,
  RecordCreationFailedException,
  RecordNotFoundException,
} from './exceptions/record.exceptions';
import { GRAPH_RAWS_SQL } from './sql/graph.raw.sql';
import { GraphRowType } from './type/graph.type';
import { GraphEdgeDto, GraphNodeDto } from './dto/graph.dto';
import { GraphResponseDto } from './dto/graph.response.dto';
import { createRecordSyncPayload } from './type/record-sync.types';
import { Prisma, Record } from '@prisma/client';
import { OutboxService } from '@/outbox/outbox.service';
import {
  AGGREGATE_TYPE,
  OUTBOX_EVENT_TYPE,
} from '@/common/constants/event-types.constants';
import {
  GET_RECORD_LOCATION_SQL,
  UPDATE_RECORD_LOCATION_SQL,
} from './sql/record-raw.query';
import { UpdateRecordDto } from './dto/update-record.dto';
import { ReverseGeocodingResult } from './services/reverse-geocoding.types';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reverseGeocodingService: ReverseGeocodingService,
    private readonly outboxService: OutboxService,
  ) {}

  async createRecord(
    userId: bigint,
    dto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    const { name, address } = await this.getAddressFromCoordinates(
      dto.location.latitude,
      dto.location.longitude,
    );

    try {
      const record = await this.prisma.$transaction(async (tx) => {
        const created = await this.saveRecord(tx, userId, dto, name, address);
        const updated = await this.updateLocation(
          tx,
          created.id,
          dto.location.longitude,
          dto.location.latitude,
        );

        await this.outboxService.publish(tx, {
          aggregateType: AGGREGATE_TYPE.RECORD,
          aggregateId: updated.id.toString(),
          eventType: OUTBOX_EVENT_TYPE.RECORD_CREATED,
          payload: createRecordSyncPayload(userId, updated),
        });

        return updated;
      });

      this.logger.log(
        `Record created: publicId=${record.publicId}, userId=${userId}, title="${dto.title}"`,
      );

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

  // NOTE: 업데이트 로직 대충 작성 (todo: 휴고의 로직으로 변경)
  async updateRecord(
    userId: bigint,
    publicId: string,
    dto: UpdateRecordDto,
  ): Promise<RecordResponseDto> {
    const record = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.record.findFirst({ where: { publicId } });

      if (!existing) throw new RecordNotFoundException(publicId);
      if (existing.userId !== userId)
        throw new RecordAccessDeniedException(publicId);

      let locationName = existing.locationName;
      let locationAddress = existing.locationAddress;

      if (dto.location) {
        const { name, address } = await this.getAddressFromCoordinates(
          dto.location.latitude,
          dto.location.longitude,
        );
        locationName = name;
        locationAddress = address;
      }

      const updated = await tx.record.update({
        where: { id: existing.id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.content !== undefined && { content: dto.content }),
          ...(dto.tags !== undefined && { tags: dto.tags }),
          ...(dto.location && { locationName, locationAddress }),
        },
      });

      const updatedRecord = dto.location
        ? await this.updateLocation(
            tx,
            updated.id,
            dto.location.latitude,
            dto.location.longitude,
          )
        : await this.getRecordWithLocation(tx, existing.id, updated);

      await this.outboxService.publish(tx, {
        aggregateType: AGGREGATE_TYPE.RECORD,
        aggregateId: updatedRecord.id.toString(),
        eventType: OUTBOX_EVENT_TYPE.RECORD_UPDATED,
        payload: createRecordSyncPayload(userId, updatedRecord),
      });

      return updatedRecord;
    });
    return RecordResponseDto.from(record);
  }

  // NOTE: 삭제 로직 대충 작성 (todo: 휴고의 로직으로 변경)
  async deleteRecord(userId: bigint, publicId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.record.findFirst({ where: { publicId } });

      if (!existing) throw new RecordNotFoundException(publicId);
      if (existing.userId !== userId)
        throw new RecordAccessDeniedException(publicId);

      await tx.record.delete({ where: { id: existing.id } });

      await this.outboxService.publish(tx, {
        aggregateType: AGGREGATE_TYPE.RECORD,
        aggregateId: existing.id.toString(),
        eventType: OUTBOX_EVENT_TYPE.RECORD_DELETED,
        payload: {
          recordId: existing.id.toString(),
          publicId: existing.publicId,
          userId: userId.toString(),
        },
      });
    });
  }

  async findOneByPublicId(publicId: string) {
    const record = await this.prisma.record.findUnique({
      where: { publicId },
      select: {
        id: true,
        userId: true,
        publicId: true,
      },
    });

    if (!record) {
      throw new RecordNotFoundException(publicId);
    }

    return record;
  }

  async getGraph(
    startRecordPublicId: string,
    userId: bigint,
  ): Promise<GraphResponseDto> {
    const startRecordId = await this.getRecordIdByPublicId(startRecordPublicId);

    // 그래프 탐색 쿼리 실행
    const rows = await this.prisma.$queryRaw<GraphRowType[]>(
      GRAPH_RAWS_SQL(startRecordId, BigInt(userId)),
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

  // NOTE: repository 계층으로 분리..?
  private async saveRecord(
    tx: Prisma.TransactionClient,
    userId: bigint,
    dto: CreateRecordDto,
    locationName: string | null,
    address: string | null,
  ) {
    return tx.record.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content ?? null,
        locationName,
        locationAddress: address,
        tags: dto.tags ?? [],
        isFavorite: false,
      },
    });
  }

  private async updateLocation(
    tx: Prisma.TransactionClient,
    recordId: bigint,
    longitude: number,
    latitude: number,
  ): Promise<RecordModel> {
    const [updated] = await tx.$queryRaw<RecordModel[]>(
      UPDATE_RECORD_LOCATION_SQL(recordId, longitude, latitude),
    );
    return updated;
  }

  private async getAddressFromCoordinates(
    latitude: number,
    longitude: number,
  ): Promise<ReverseGeocodingResult> {
    const { name, address } =
      await this.reverseGeocodingService.getAddressFromCoordinates(
        latitude,
        longitude,
      );
    return { name, address };
  }

  private async getRecordWithLocation(
    tx: Prisma.TransactionClient,
    recordId: bigint,
    updatedRecord: Record,
  ): Promise<RecordModel> {
    const locations = await tx.$queryRaw<
      { longitude: number; latitude: number }[]
    >(GET_RECORD_LOCATION_SQL(recordId));

    const locationData = locations[0];
    if (!locationData) {
      throw new LocationNotFoundException(updatedRecord.publicId);
    }
    const { userId: _, ...rest } = updatedRecord;

    return {
      ...rest,
      longitude: locationData.longitude,
      latitude: locationData.latitude,
    } as RecordModel;
  }
}
