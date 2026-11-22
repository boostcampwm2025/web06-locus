import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Outbox, OutboxStatus, Prisma } from '@prisma/client';
import { OutboxEvent } from '@/common/constants/event-types.constants';

export const OUTBOX_MAX_RETRY_COUNT = 5;

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
        retryCount: { lt: OUTBOX_MAX_RETRY_COUNT },
      },
      take: 100,
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateStatus(id: bigint, status: OutboxStatus) {
    await this.prisma.outbox.update({
      where: { id },
      data: { status, processedAt: new Date() },
    });
  }

  /**
   * 발행 실패를 기록한다.
   * - retryCount를 1 증가시키고, 최대 횟수에 도달하면 DEAD, 아니면 RETRY로 전환
   * - retryCount를 실제로 올려야 getPendingOutboxEvents의 상한 조건과 DEAD 전환이 동작한다
   * - 단일 인스턴스 전제: 현재 retryCount로 다음 상태를 계산해 한 번의 UPDATE로 반영
   */
  async markPublishFailed(
    outbox: Pick<Outbox, 'id' | 'retryCount'>,
  ): Promise<{ status: OutboxStatus; retryCount: number }> {
    const retryCount = outbox.retryCount + 1;
    const status =
      retryCount >= OUTBOX_MAX_RETRY_COUNT
        ? OutboxStatus.DEAD
        : OutboxStatus.RETRY;

    await this.prisma.outbox.update({
      where: { id: outbox.id },
      data: { status, retryCount: { increment: 1 }, processedAt: new Date() },
    });

    return { status, retryCount };
  }
}
