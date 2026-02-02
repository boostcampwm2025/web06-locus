import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RecordImageService } from '../services/records-image.service';
import { ResizeCompleteDto } from './dto/resize-complete.dto';
import { WebhookAuthGuard } from '../guards/webhook-auth.guard';

@ApiTags('webhooks')
@Controller('records/webhooks')
export class WebhooksController {
  constructor(private readonly recordImageService: RecordImageService) {}

  @Post('resize-complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(WebhookAuthGuard)
  @ApiOperation({
    summary: 'Cloud Functions 이미지 리사이징 완료 웹훅',
    description:
      'NCP Cloud Functions가 이미지 리사이징 완료 후 호출하는 엔드포인트.',
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: '웹훅 인증용 API Key',
    required: true,
  })
  @ApiResponse({
    status: 204,
    description: '이미지 업데이트 성공',
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 (유효성 검증 실패)',
  })
  @ApiUnauthorizedResponse({
    description: 'API Key 인증 실패',
  })
  async handleResizeComplete(@Body() dto: ResizeCompleteDto): Promise<void> {
    await this.recordImageService.handleResizeComplete(
      dto.imageId,
      dto.urls,
      dto.metadata,
    );
  }
}
