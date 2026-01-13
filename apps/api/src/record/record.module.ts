import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { RecordSearchService } from './record-search.service';
import { RecordSyncConsumer } from './consumer/record-sync.consumer';
import { ElasticsearchConfigModule } from '@/elasticsearch/elasticsearch.module';

@Module({
  imports: [ElasticsearchConfigModule],
  controllers: [RecordController, RecordSyncConsumer],
  providers: [RecordService, RecordSearchService],
  exports: [RecordService, RecordSearchService],
})
export class RecordModule {}
