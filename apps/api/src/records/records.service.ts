import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReverseGeocodingService } from './services/reverse-geocoding.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { RecordModel } from './records.types';
import { RecordCreationFailedException } from './exceptions/record.exceptions';
import { createRecordSyncPayload } from './type/record-sync.types';
import { Prisma } from '@prisma/client';
import { OutboxService } from '@/outbox/outbox.service';
import {
  AGGREGATE_TYPE,
  OUTBOX_EVENT_TYPE,
} from '@/common/constants/event-types.constants';
import { UPDATE_RECORD_LOCATION_SQL } from './sql/record-raw.query';

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
}
