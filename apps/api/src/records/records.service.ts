import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReverseGeocodingService } from './services/reverse-geocoding.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { RecordModel } from './records.types';
import { RecordCreationFailedException } from './exceptions/record.exceptions';

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

        // 2-2. geometry 필드만 업데이트
        await tx.$executeRaw`
          UPDATE records
          SET location = ST_GeomFromText(
            ${`POINT(${dto.location.longitude} ${dto.location.latitude})`},
            4326
          )
          WHERE id = ${created.id}
        `;

        // 2-3. geometry 포함한 레코드 조회
        const [updated] = await tx.$queryRaw<RecordModel[]>`
          SELECT
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
          FROM records
          WHERE id = ${created.id}
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

  // TODO: 태그 관련 중간테이블 및 서비스 추가
  // TODO: 이미지 기능 추가
}
