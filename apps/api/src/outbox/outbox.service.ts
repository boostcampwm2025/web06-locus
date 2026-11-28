import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Outbox, OutboxStatus, Prisma } from '@prisma/client';
import { OutboxEvent } from '@/common/constants/event-types.constants';

/** 발행이 이 횟수만큼 실패하면 에러 로그로 알린다. 재시도는 계속한다. */
export const OUTBOX_ALERT_RETRY_COUNT = 5;

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async publish(tx: Prisma.TransactionClient, data: OutboxEvent) {
    return tx.outbox.create({
      data: {
        aggregateType: data.aggregateType,
        aggregateId: BigInt(data.aggregateId),
        eventType: data.eventType,
        status: OutboxStatus.PENDING,
        // Prisma 타입에 맞게 조정
        payload: data.payload as Prisma.InputJsonValue,
      },
    });
  }

  async getPendingOutboxEvents(): Promise<Outbox[]> {
    return this.prisma.outbox.findMany({
      where: {
        status: { in: [OutboxStatus.PENDING, OutboxStatus.RETRY] },
      },
      take: 100,
      // 계속 실패하는 이벤트가 새 이벤트를 막지 않도록 적게 실패한 것부터 가져온다.
      orderBy: [{ retryCount: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async updateStatus(id: bigint, status: OutboxStatus) {
    await this.prisma.outbox.update({
      where: { id },
      data: { status, processedAt: new Date() },
    });
  }

  /**
   * 발행 실패를 기록하고 누적 실패 횟수를 돌려준다.
   * - 브로커 장애가 길어져도 이벤트를 잃지 않도록 포기하지 않고 항상 RETRY로 남긴다.
   * - retryCount는 조회 순서와 실패 알림에 쓴다.
   * - 단일 인스턴스 전제: 조회 시점의 retryCount로 누적 횟수를 계산한다.
   */
  async markPublishFailed(
    outbox: Pick<Outbox, 'id' | 'retryCount'>,
  ): Promise<number> {
    await this.prisma.outbox.update({
      where: { id: outbox.id },
      data: {
        status: OutboxStatus.RETRY,
        retryCount: { increment: 1 },
        processedAt: new Date(),
      },
    });

    return outbox.retryCount + 1;
  }
}
