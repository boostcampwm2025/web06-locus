/** 200번대 성공 응답 */
export interface ApiResponseSuccess<T> {
  status: 'success';
  data: T;
}

/** 400번대 클라이언트 오류 */
export interface ApiResponseFail {
  status: 'fail';
  data: {
    code: string;
    message?: string;
    /** 실패 상세 원인 (예: 실패 필드명, 실패 이유 등) */
    details?: unknown;
  };
}

/** 500번대 서버 오류 */
export interface ApiResponseError {
  status: 'error';
  message: string;
  code?: string;
  /** 서버 오류 부가 데이터(옵션) */
  data?: unknown;
}

export type ApiResponseType<T> =
  | ApiResponseSuccess<T>
  | ApiResponseFail
  | ApiResponseError;
