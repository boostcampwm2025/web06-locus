import {
  ApiResponseError,
  ApiResponseFail,
  ApiResponseSuccess,
} from '../type/api-response.types';

export const ApiResponse = {
  success<T>(data: T): ApiResponseSuccess<T> {
    return { status: 'success', data };
  },

  fail(code: string, message?: string, details?: unknown): ApiResponseFail {
    return { status: 'fail', code, message, details };
  },

  error(message: string, code?: string, details?: unknown): ApiResponseError {
    return { status: 'error', message, code, details };
  },
};
