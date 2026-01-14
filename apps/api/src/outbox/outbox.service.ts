import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Outbox, OutboxStatus } from '@prisma/client';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);
  private readonly MAX_RETRY_COUNT = 5;

  constructor(private readonly prisma: PrismaService) {}

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
