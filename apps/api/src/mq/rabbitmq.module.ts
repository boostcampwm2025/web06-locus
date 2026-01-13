import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_CONSTANTS } from '@/common/constants/rabbitmq.constants';

@Global()
@Module({
  imports: [
    // publisher 용
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_CONSTANTS.CLIENTS.RECORD_SYNC_PRODUCER,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL') ??
                'amqp://localhost:5672',
            ],
            queue: RABBITMQ_CONSTANTS.QUEUES.RECORD_SYNC,
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule], // 다른 모듈에서 'RECORD_SYNC_SERVICE'를 쓸 수 있게 내보냄
})
export class RabbitMqModule {}
