import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RecordService } from './record.service';
import { CreateRecordDto } from './dto/create-record.dto';

@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRecord(@Body() dto: CreateRecordDto) {
    await this.recordService.createRecord(dto, 1);
  }
}
