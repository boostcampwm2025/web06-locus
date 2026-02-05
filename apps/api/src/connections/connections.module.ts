import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { JwtModule } from '@/jwt/jwt.module';
import { RecordsModule } from '@/records/records.module';
import { RedisModule } from '@/redis/redis.module';

@Module({
  imports: [JwtModule, RecordsModule, RedisModule],
  providers: [ConnectionsService],
  exports: [],
  controllers: [ConnectionsController],
})
export class ConnectionsModule {}
