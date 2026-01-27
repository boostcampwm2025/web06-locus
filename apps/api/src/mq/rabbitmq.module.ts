import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RMQ_CLIENT_MAP } from '@/common/constants/rabbitmq.constants';

const rmqClients = Object.keys(RMQ_CLIENT_MAP).map((clientName) => ({
  name: clientName,
  useFactory: (configService: ConfigService) => {
    const queueName = RMQ_CLIENT_MAP[clientName as keyof typeof RMQ_CLIENT_MAP];
    return createRmqClientOptions(queueName, configService);
  },
  inject: [ConfigService],
}));

const createRmqClientOptions = (
  queueName: string,
  configService: ConfigService,
) => ({
  transport: Transport.RMQ as const,
  options: {
    urls: [
      configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672',
    ],
    queue: queueName,
    queueOptions: { durable: true },
  },
});

@Global()
@Module({
  imports: [ClientsModule.registerAsync(rmqClients)],
  exports: [ClientsModule],
})
export class RabbitMqModule {}
