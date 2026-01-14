import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { Prisma } from '@prisma/client';
import { createRecordSyncPayload } from './type/record-sync.types';

@Injectable()
export class RecordService {
  constructor(private readonly prisma: PrismaService) {}

  // Record + Outbox는 반드시 같은 트랜잭션
  // 실패해도 DB 롤백 → 이벤트가 생성되는것을 보장 → 일관성 보장
  async createRecord(dto: CreateRecordDto, userId: bigint) {
    await this.prisma.$transaction(async (tx) => {
      // NOTE: 기록을 postgresql 에 생성 (실제로는 더 복잡) - 예시 코드
      const record = await tx.record.create({
        data: {
          userId,
          title: dto.title,
          content: dto.content,
          isFavorite: false,
          locationLat: dto.latitude,
          locationLng: dto.longitude,
          locationName: 'test',
          locationAddress: 'address',
        },
      });

      // outbox 테이블에 해당 기록 생성 이벤트 저장.
      await tx.outbox.create({
        data: {
          aggregateType: 'Record',
          aggregateId: record.id,
          eventType: 'RECORD_CREATED',
          payload: createRecordSyncPayload(
            record,
          ) as unknown as Prisma.InputJsonObject,
        },
      });
    });
  }
}
