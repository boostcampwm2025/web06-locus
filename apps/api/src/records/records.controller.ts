import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GraphResponseDto } from './dto/graph.response.dto';
import { MAX_FILE_COUNT, multerOptions } from './config/multer.config';
import {
  CreateRecordSwagger,
  DeleteRecordSwagger,
} from './swagger/records.swagger';
import { JsonBody } from '@/common/decorators/json-body.decorator';

@ApiTags('records')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', MAX_FILE_COUNT, multerOptions))
  @CreateRecordSwagger()
  async createRecord(
    @CurrentUser('sub') userId: bigint,
    @JsonBody(CreateRecordDto) dto: CreateRecordDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<RecordResponseDto> {
    return await this.recordsService.createRecord(userId, dto, images);
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @DeleteRecordSwagger()
  async deleteRecord(
    @CurrentUser('sub') userId: bigint,
    @Param('publicId') publicId: string,
  ): Promise<void> {
    await this.recordsService.deleteRecord(userId, publicId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':publicId/graph')
  async getGraph(
    @CurrentUser('sub') userId: bigint,
    @Param('publicId') publicId: string,
  ): Promise<GraphResponseDto> {
    const graphData = await this.recordsService.getGraph(publicId, userId);
    return graphData;
  }
}
