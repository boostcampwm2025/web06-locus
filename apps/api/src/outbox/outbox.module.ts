import { Module } from '@nestjs/common';
import { OutboxPublisher } from './outbox.publisher';
import { RabbitMqModule } from '@/mq/rabbitmq.module';
import { OutboxService } from './outbox.service';
import { PrometheusModule } from '@/infra/monitoring/prometheus.module';

@Module({
  imports: [RabbitMqModule, PrometheusModule],
  providers: [OutboxPublisher, OutboxService],
  exports: [OutboxService],
})
export class OutboxModule {}
