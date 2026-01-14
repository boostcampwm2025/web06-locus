import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { JwtModule } from '@/jwt/jwt.module';

@Module({
  imports: [JwtModule],
  providers: [ConnectionsService],
  exports: [],
  controllers: [ConnectionsController],
})
export class ConnectionsModule {}
