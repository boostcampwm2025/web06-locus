import { BusinessException } from '@/common/exceptions/business.exception';
import { MapsErrorCode } from '../constants/error-codes';

export class NotFoundAddressException extends BusinessException {
  constructor(address: string) {
    super(404, MapsErrorCode.ADDRESS_NOT_FOUND, '검색된 주소가 없습니다.', {
      address,
    });
  }
}
