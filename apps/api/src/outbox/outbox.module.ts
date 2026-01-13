import { Module } from '@nestjs/common';
import { OutboxPublisher } from './outbox.publisher';
import { RabbitMqModule } from '@/mq/rabbitmq.module';

@Module({
  imports: [RabbitMqModule],
  providers: [OutboxPublisher],
})
export class OutboxModule {}
