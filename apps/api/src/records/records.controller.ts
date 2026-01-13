import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

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
    @CurrentUser('sub') userId: number,
    @Body() dto: CreateRecordDto,
  ): Promise<RecordResponseDto> {
    return this.recordsService.createRecord(userId, dto);
  }
}
