import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { ReverseGeocodingService } from './services/reverse-geocoding.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { JwtModule } from '@/jwt/jwt.module';
import { RecordSearchService } from './record-search.service';
import { ElasticsearchConfigModule } from '@/elasticsearch/elasticsearch.module';
import { RecordSyncConsumer } from './consumer/record-sync.consumer';
import { OutboxModule } from '@/outbox/outbox.module';

@Module({
  imports: [PrismaModule, JwtModule, ElasticsearchConfigModule, OutboxModule],
  controllers: [RecordsController, RecordSyncConsumer],
  providers: [RecordsService, ReverseGeocodingService, RecordSearchService],
  exports: [RecordsService, RecordSearchService],
})
export class RecordsModule {}
