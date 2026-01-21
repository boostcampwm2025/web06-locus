import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
  Get,
  Param,
  Query,
  Body,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { FilesInterceptor } from '@nestjs/platform-express';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { GetRecordsQueryDto } from './dto/get-records-query.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { RecordListResponseDto } from './dto/records-list-reponse.dto';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateRecordDto } from './dto/update-record.dto';
import { GraphResponseDto } from './dto/graph.response.dto';
import { MAX_FILE_COUNT, multerOptions } from './config/multer.config';
import {
  CreateRecordSwagger,
  DeleteRecordSwagger,
  GetRecordsSwagger,
} from './swagger/records.swagger';
import { JsonBody } from '@/common/decorators/json-body.decorator';

@ApiTags('records')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @GetRecordsSwagger()
  async getRecordsInBounds(
    @CurrentUser('sub') userId: bigint,
    @Query() query: GetRecordsQueryDto,
  ): Promise<RecordListResponseDto> {
    return await this.recordsService.getRecordsInBounds(userId, query);
  }

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

  @UseGuards(JwtAuthGuard)
  @Get(':publicId/graph')
  async getGraph(
    @CurrentUser('sub') userId: bigint,
    @Param('publicId') publicId: string,
  ): Promise<GraphResponseDto> {
    const graphData = await this.recordsService.getGraph(publicId, userId);
    return graphData;
  }

  @Patch(':publicId')
  @ApiOperation({ summary: '기록 수정' })
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FilesInterceptor('images', 10))
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateRecord(
    @CurrentUser('sub') userId: bigint,
    @Param('publicId') publicId: string,
    @Body() dto: UpdateRecordDto,
    // @UploadedFiles() files?: Array<Express.Multer.File>,
  ): Promise<RecordResponseDto> {
    return this.recordsService.updateRecord(userId, publicId, dto);
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
}
