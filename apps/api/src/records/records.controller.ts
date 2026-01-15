import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateRecordDto } from './dto/update-record.dto';

@ApiTags('records')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '기록 생성',
    description: '새로운 위치 기반 기록을 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '기록이 성공적으로 생성되었습니다.',
    type: RecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (필수 필드 누락, 유효성 검증 실패)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 토큰이 없거나 유효하지 않습니다.',
  })
  async createRecord(
    @CurrentUser('sub') userId: bigint,
    @Body() dto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    return await this.recordsService.createRecord(userId, dto);
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: '기록 삭제',
    description: '기록을 삭제합니다. 삭제된 기록은 복구할 수 없습니다.',
  })
  @ApiParam({
    name: 'publicId',
    description: '삭제할 기록의 공개 ID',
    example: 'abc123xyz',
  })
  @ApiResponse({ status: 404, description: '기록을 찾을 수 없습니다.' })
  @ApiResponse({ status: 403, description: '기록 삭제 권한이 없습니다.' })
  async deleteRecord(
    @CurrentUser('sub') userId: bigint,
    @Param('publicId') publicId: string,
  ): Promise<void> {
    await this.recordsService.deleteRecord(userId, publicId);
  }
}
