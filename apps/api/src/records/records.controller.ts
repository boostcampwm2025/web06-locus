import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GraphResponseDto } from './dto/graph.response.dto';
import { ParseJsonPipe } from '@/common/pipes/parse-json.pipe';
import { MAX_FILE_COUNT, multerOptions } from './config/multer.config';

@ApiTags('records')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', MAX_FILE_COUNT, multerOptions))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '기록 생성',
    description:
      '새로운 위치 기반 기록을 생성합니다. 이미지는 선택 사항이며 최대 5개까지 업로드 가능합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '기록이 성공적으로 생성되었습니다.',
    type: RecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      '잘못된 요청 (필수 필드 누락, 유효성 검증 실패, 이미지 형식 오류)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없거나 유효하지 않습니다.',
  })
  async createRecord(
    @CurrentUser('sub') userId: bigint,
    @Body('data', ParseJsonPipe) dto: CreateRecordDto,
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
}
