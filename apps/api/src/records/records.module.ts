import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { MapsService } from '../maps/maps.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { JwtModule } from '@/jwt/jwt.module';
import { RecordSearchService } from './record-search.service';
import { ElasticsearchConfigModule } from '@/elasticsearch/elasticsearch.module';
import { RecordSyncConsumer } from './consumer/record-sync.consumer';
import { OutboxModule } from '@/outbox/outbox.module';
import { UsersService } from '@/users/users.service';
import { RecordTagsService } from './record-tags.service';
import { TagsModule } from '@/tags/tags.module';
import { ImagesModule } from '@/images/images.module';
import { RecordGraphService } from './record-graph.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule,
    ElasticsearchConfigModule,
    OutboxModule,
    TagsModule,
    ImagesModule,
  ],
  controllers: [RecordsController, RecordSyncConsumer],
  providers: [
    RecordsService,
    RecordSearchService,
    RecordGraphService,
    UsersService,
    MapsService,
    RecordTagsService,
  ],
  exports: [RecordsService, RecordSearchService],
})
export class RecordsModule {}
