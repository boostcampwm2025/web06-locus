import { BusinessException } from '@/common/exceptions/business.exception';
import { RecordErrorCode } from '../constants/error-codes';
import { HttpStatus } from '@nestjs/common';

// 400 Bad Request - 클라이언트 에러
export class TitleMissingException extends BusinessException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.TITLE_MISSING,
      '제목이 누락되었습니다.',
    );
  }
}

export class TitleTooLongException extends BusinessException {
  constructor(currentLength: number) {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.TITLE_TOO_LONG,
      '제목이 너무 깁니다. (최대 100자)',
      {
        field: 'title',
        max_length: 100,
        current_length: currentLength,
      },
    );
  }
}

export class ContentTooLongException extends BusinessException {
  constructor(currentLength: number) {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.CONTENT_TOO_LONG,
      '내용이 너무 깁니다. (최대 500자)',
      {
        field: 'content',
        max_length: 500,
        current_length: currentLength,
      },
    );
  }
}

export class LocationMissingException extends BusinessException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.LOCATION_MISSING,
      '위치 정보가 누락되었습니다.',
    );
  }
}

export class InvalidLatitudeException extends BusinessException {
  constructor(value: number) {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.INVALID_LATITUDE,
      '위도 값이 유효하지 않습니다. (-90 ~ 90)',
      {
        field: 'location.latitude',
        value,
      },
    );
  }
}

export class InvalidLongitudeException extends BusinessException {
  constructor(value: number) {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.INVALID_LONGITUDE,
      '경도 값이 유효하지 않습니다. (-180 ~ 180)',
      {
        field: 'location.longitude',
        value,
      },
    );
  }
}

export class LocationNameMissingException extends BusinessException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.LOCATION_NAME_MISSING,
      '장소 이름이 누락되었습니다.',
      {
        field: 'location.name',
      },
    );
  }
}

export class LocationAddressMissingException extends BusinessException {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.LOCATION_ADDRESS_MISSING,
      '장소 주소가 누락되었습니다.',
      {
        field: 'location.address',
      },
    );
  }
}

export class TooManyImagesException extends BusinessException {
  constructor(uploadedCount: number) {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.TOO_MANY_IMAGES,
      '이미지 개수가 초과되었습니다. (최대 5개)',
      {
        max_count: 5,
        uploaded_count: uploadedCount,
      },
    );
  }
}

export class ImageSizeExceededException extends BusinessException {
  constructor(filename: string, size: number) {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.IMAGE_SIZE_EXCEEDED,
      '이미지 파일 크기가 초과되었습니다. (최대 2MB)',
      {
        filename,
        size,
        max_size: 2097152, // 2MB in bytes
      },
    );
  }
}

export class InvalidImageFormatException extends BusinessException {
  constructor(providedFormat: string) {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.INVALID_IMAGE_FORMAT,
      '지원하지 않는 이미지 형식입니다.',
      {
        provided_format: providedFormat,
        allowed_formats: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/heic',
          'image/heif',
        ],
      },
    );
  }
}

export class InvalidJsonFormatException extends BusinessException {
  constructor(error: string) {
    super(
      HttpStatus.BAD_REQUEST,
      RecordErrorCode.INVALID_JSON_FORMAT,
      'JSON 형식이 올바르지 않습니다.',
      {
        error,
      },
    );
  }
}

// 500 Internal Server Error - 서버 에러
export class ImageProcessingFailedException extends BusinessException {
  constructor(filename: string, error: Error) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RecordErrorCode.IMAGE_PROCESSING_FAILED,
      '이미지 처리에 실패했습니다.',
      {
        filename,
        error: error.message,
      },
    );
  }
}

export class RecordCreationFailedException extends BusinessException {
  constructor(error: Error) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RecordErrorCode.RECORD_CREATION_FAILED,
      '기록 생성에 실패했습니다.',
      {
        error: error.message,
      },
    );
  }
}

export class RecordAccessDeniedException extends BusinessException {
  constructor(recordId: string) {
    super(
      403,
      RecordErrorCode.RECORD_ACCESS_DENIED,
      '해당 기록에 대한 권한이 없습니다.',
      { record_id: recordId },
    );
  }
}

export class RecordNotFoundException extends BusinessException {
  constructor(recordId: string) {
    super(404, RecordErrorCode.RECORD_NOT_FOUND, '기록을 찾을 수 없습니다.', {
      record_id: recordId,
    });
  }
}

export class LocationNotFoundException extends BusinessException {
  constructor(recordId: string) {
    super(
      404,
      RecordErrorCode.LOCATION_NOT_FOUND,
      '기록의 장소를 찾을 수 없습니다.',
      { record_id: recordId },
    );
  }
}
