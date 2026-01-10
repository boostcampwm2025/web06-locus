import { Controller, Get, Query } from '@nestjs/common';
import { RecordSearchService, SearchResponse } from './record-search.service';

@Controller('records/search')
export class RecordSearchController {
  constructor(private readonly recordSearchService: RecordSearchService) {}

  // NOTE: 요 친구들은 테스트용이라 삭제해야 해요.
  @Get('test')
  async saveTestData() {
    const record = await this.recordSearchService.save({
      title: '서비스 테스트',
      content: '서비스 레벨 테스트',
    });
    return record;
  }

  @Get()
  async getTestData(
    @Query('keyword') keyword: string,
  ): Promise<SearchResponse> {
    return await this.recordSearchService.search(keyword);
  }
}
