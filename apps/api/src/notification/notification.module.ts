import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { RabbitMqModule } from '@/mq/rabbitmq.module';
import { FirebaseProvider } from './firebase.config';
import { JwtModule } from '@/jwt/jwt.module';
import { NotificationScheduleService } from './notification-schedule.service';
import { NotificationScheduler } from './notification.scheduler';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [RedisModule, RabbitMqModule, JwtModule],
  controllers: [NotificationController, NotificationConsumer],
  providers: [
    FirebaseProvider,
    NotificationService,
    NotificationScheduleService,
    NotificationScheduler,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
