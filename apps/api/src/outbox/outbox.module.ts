import { Module } from '@nestjs/common';
import { OutboxPublisher } from './outbox.publisher';
import { RabbitMqModule } from '@/mq/rabbitmq.module';
import { OutboxService } from './outbox.service';

@Module({
  imports: [RabbitMqModule],
  providers: [OutboxPublisher, OutboxService],
})
export class OutboxModule {}
