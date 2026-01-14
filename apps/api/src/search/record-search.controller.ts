import { Controller } from '@nestjs/common';
import { RecordSearchService } from './record-search.service';

@Controller('records/search')
export class RecordSearchController {
  constructor(private readonly recordSearchService: RecordSearchService) {}
}
