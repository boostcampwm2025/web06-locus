import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business.exception';

export class PwaException extends BusinessException {
  constructor() {
    super(
      HttpStatus.FORBIDDEN,
      'PWA_ONLY',
      '해당 기능은 PWA 앱에서만 사용할 수 있습니다.',
    );
  }
}
