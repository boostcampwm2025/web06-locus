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
import { GetRecordsByLocationDto } from './dto/get-records-by-location.dto';
import { GetAllRecordsDto } from './dto/get-all-records.dto';
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
  GetRecordDetailSwagger,
  GetRecordsSwagger,
  GetRecordsByLocationSwagger,
  GetAllRecordsSwagger,
  SearchRecordsSwagger,
} from './swagger/records.swagger';
import { JsonBody } from '@/common/decorators/json-body.decorator';
import { GraphNeighborRecordsDto } from './dto/graph-details.response.dto';
import { SearchRecordsDto } from './dto/search-records.dto';
import { SearchRecordListResponseDto } from './dto/search-record-list-response.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.request.dto';
import { UpdateFavoriteResponseDto } from './dto/update-favorite.response.dto';

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

  @Get('location')
  @UseGuards(JwtAuthGuard)
  @GetRecordsByLocationSwagger()
  async getRecordsByLocation(
    @CurrentUser('sub') userId: bigint,
    @Query() query: GetRecordsByLocationDto,
  ): Promise<RecordListResponseDto> {
    return await this.recordsService.getRecordsByLocation(userId, query);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @GetAllRecordsSwagger()
  async getAllRecords(
    @CurrentUser('sub') userId: bigint,
    @Query() query: GetAllRecordsDto,
  ): Promise<RecordListResponseDto> {
    return await this.recordsService.getAllRecords(userId, query);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @SearchRecordsSwagger()
  async searchRecords(
    @CurrentUser('sub') userId: bigint,
    @Query() dto: SearchRecordsDto,
  ): Promise<SearchRecordListResponseDto> {
    return await this.recordsService.searchRecords(userId, dto);
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

  @Get(':publicId')
  @UseGuards(JwtAuthGuard)
  @GetRecordDetailSwagger()
  async getRecordDetail(
    @CurrentUser('sub') userId: bigint,
    @Param('publicId') publicId: string,
  ): Promise<RecordResponseDto> {
    return await this.recordsService.getRecordDetail(userId, publicId);
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

  @UseGuards(JwtAuthGuard)
  @Get(':publicId/graph/details')
  async getGraphNeighbor(
    @CurrentUser('sub') userId: bigint,
    @Param('publicId') publicId: string,
  ): Promise<GraphNeighborRecordsDto> {
    const graphNeighborRecords =
      await this.recordsService.getGraphNeighborDetail(publicId, userId);

    return {
      start: publicId,
      depth: 1,
      records: graphNeighborRecords,
    };
  }

  @Patch(':publicId')
  @ApiOperation({ summary: '기록 수정' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateRecord(
    @CurrentUser('sub') userId: bigint,
    @Param('publicId') publicId: string,
    @Body() dto: UpdateRecordDto,
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

  @Patch(':publicId/favorite')
  @UseGuards(JwtAuthGuard)
  async updateFavorite(
    @CurrentUser('sub') userId: bigint,
    @Param('publicId') publicId: string,
    @Body() request: UpdateFavoriteDto,
  ): Promise<UpdateFavoriteResponseDto> {
    const updated = await this.recordsService.updateFavoriteInRecord(
      userId,
      publicId,
      request.isFavorite,
    );

    return updated;
  }
}
