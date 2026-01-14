import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RecordSearchService {
  private readonly logger = new Logger(RecordSearchService.name);
}
