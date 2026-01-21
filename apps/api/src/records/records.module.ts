import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { MapsService } from '../maps/maps.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { JwtModule } from '@/jwt/jwt.module';
import { RecordSearchService } from './records-search.service';
import { ElasticsearchConfigModule } from '@/elasticsearch/elasticsearch.module';
import { RecordSyncConsumer } from './consumer/record-sync.consumer';
import { OutboxModule } from '@/outbox/outbox.module';
import { ImageProcessingService } from './services/image-processing.service';
import { ObjectStorageService } from './services/object-storage.service';
import { UsersService } from '@/users/users.service';

@Module({
  imports: [PrismaModule, JwtModule, ElasticsearchConfigModule, OutboxModule],
  controllers: [RecordsController, RecordSyncConsumer],
  providers: [
    RecordsService,
    RecordSearchService,
    ImageProcessingService,
    ObjectStorageService,
    UsersService,
    MapsService,
  ],
  exports: [RecordsService, RecordSearchService],
})
export class RecordsModule {}
