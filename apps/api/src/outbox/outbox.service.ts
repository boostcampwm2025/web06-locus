import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Outbox, OutboxStatus, Prisma } from '@prisma/client';
import { OutboxEvent } from '@/common/constants/event-types.constants';
import { OutboxMetricsService } from '@/infra/monitoring/services/outbox-metrics.service';

@Injectable()
export class OutboxService {
  private readonly MAX_RETRY_COUNT = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxMetricsService: OutboxMetricsService,
  ) {}

  async publish(tx: Prisma.TransactionClient, data: OutboxEvent) {
    const event = tx.outbox.create({
      data: {
        aggregateType: data.aggregateType,
        aggregateId: BigInt(data.aggregateId),
        eventType: data.eventType,
        status: OutboxStatus.PENDING,
        // Prisma 타입에 맞게 조정
        payload: data.payload as Prisma.InputJsonValue,
      },
    });
    this.outboxMetricsService.recordStatusTransition(
      '',
      OutboxStatus.PENDING,
      data.eventType,
    );
    return event;
  }

  async getPendingOutboxEvents(): Promise<Outbox[]> {
    return this.prisma.outbox.findMany({
      where: {
        status: { in: [OutboxStatus.PENDING, OutboxStatus.RETRY] },
        retryCount: { lt: this.MAX_RETRY_COUNT },
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
}
