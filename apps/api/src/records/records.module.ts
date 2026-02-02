import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { WebhooksController } from './webhooks/webhooks.controller';
import { RecordsService } from './records.service';
import { MapsService } from '../maps/maps.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { JwtModule } from '@/jwt/jwt.module';
import { RecordSearchService } from './services/records-search.service';
import { ElasticsearchConfigModule } from '@/elasticsearch/elasticsearch.module';
import { RecordSyncConsumer } from './consumer/record-sync.consumer';
import { OutboxModule } from '@/outbox/outbox.module';
import { ImageProcessingService } from './services/image-processing.service';
import { ObjectStorageService } from './services/object-storage.service';
import { UsersService } from '@/users/users.service';
import { RecordTagsService } from './services/records-tags.service';
import { TagsModule } from '@/tags/tags.module';
import { ImagesModule } from '@/images/images.module';
import { RecordGraphService } from './services/records-graph.service';
import { RecordLocationService } from './services/records-location.service';
import { RecordQueryService } from './services/records-query.service';
import { RecordImageService } from './services/records-image.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule,
    ElasticsearchConfigModule,
    OutboxModule,
    TagsModule,
    ImagesModule,
  ],
  controllers: [RecordsController, WebhooksController, RecordSyncConsumer],
  providers: [
    RecordsService,
    RecordSearchService,
    RecordTagsService,
    RecordImageService,
    RecordGraphService,
    RecordLocationService,
    RecordQueryService,
    ImageProcessingService,
    ObjectStorageService,
    UsersService,
    MapsService,
  ],
  exports: [RecordsService, RecordSearchService],
})
export class RecordsModule {}
