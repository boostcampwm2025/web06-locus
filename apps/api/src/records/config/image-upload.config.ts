import { ConfigService } from '@nestjs/config';

/**
 * 이미지 업로드 설정 토큰
 */
export const IMAGE_UPLOAD_CONFIG = 'IMAGE_UPLOAD_CONFIG';

/**
 * 이미지 업로드 설정 타입
 */
export interface ImageUploadConfig {
  headCheck: {
    maxRetries: number; // HEAD 체크 최대 재시도 횟수
    retryDelayMs: number; // 재시도 간격 (밀리초)
  };
  webhook: {
    cacheTtlSec: number; // 웹훅 캐시 TTL (초)
  };
}

/**
 * 이미지 업로드 설정 Provider
 *
 * 환경 변수:
 * - IMAGE_UPLOAD_HEAD_CHECK_MAX_RETRIES: HEAD 체크 최대 재시도 횟수 (기본: 10)
 * - IMAGE_UPLOAD_HEAD_CHECK_RETRY_DELAY_MS: 재시도 간격 ms (기본: 500)
 * - IMAGE_UPLOAD_WEBHOOK_CACHE_TTL_SEC: 웹훅 캐시 TTL 초 (기본: 300)
 */
export const ImageUploadConfigProvider = {
  provide: IMAGE_UPLOAD_CONFIG,
  useFactory: (configService: ConfigService): ImageUploadConfig => ({
    headCheck: {
      maxRetries: configService.get<number>(
        'IMAGE_UPLOAD_HEAD_CHECK_MAX_RETRIES',
        10,
      ),
      retryDelayMs: configService.get<number>(
        'IMAGE_UPLOAD_HEAD_CHECK_RETRY_DELAY_MS',
        500,
      ),
    },
    webhook: {
      cacheTtlSec: configService.get<number>(
        'IMAGE_UPLOAD_WEBHOOK_CACHE_TTL_SEC',
        300, // 5분
      ),
    },
  }),
  inject: [ConfigService],
};
