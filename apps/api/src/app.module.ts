import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RecordsModule } from './records/records.module';
import { ResponseTransformInterceptor } from './common/interceptors/response-tranform.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { OutboxModule } from './outbox/outbox.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitMqModule } from './mq/rabbitmq.module';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';
import { ConnectionsModule } from './connections/connections.module';
import { TagsModule } from './tags/tags.module';
import { MapsModule } from './maps/maps.module';
import { NotificationModule } from './notification/notification.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RabbitMqModule,
    OutboxModule,
    RedisModule,
    MailModule,
    AuthModule,
    UsersModule,
    ConnectionsModule,
    RecordsModule,
    TagsModule,
    MapsModule,
    NotificationModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
