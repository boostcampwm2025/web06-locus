import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';

@Module({
  imports: [],
  providers: [ConnectionsService],
  exports: [],
  controllers: [ConnectionsController],
})
export class ConnectionsModule {}
