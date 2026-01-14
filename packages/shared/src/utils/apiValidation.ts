import { z } from 'zod';

/**
 * API 응답을 Zod 스키마로 검증하고 타입 안전하게 반환
 * @param schema - Zod 스키마
 * @param data - 검증할 데이터
 * @returns 검증된 데이터
 * @throws ZodError - 검증 실패 시
 */
export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): T {
  return schema.parse(data);
}

/**
 * API 응답을 Zod 스키마로 안전하게 검증 (에러 발생 시 null 반환)
 * @param schema - Zod 스키마
 * @param data - 검증할 데이터
 * @returns 검증된 데이터 또는 null
 */
export function safeValidateApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * API 응답을 Zod 스키마로 검증하고 결과 객체 반환
 * @param schema - Zod 스키마
 * @param data - 검증할 데이터
 * @returns 검증 결과 객체
 */
export function validateApiResponseWithResult<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };

  return { success: false, error: result.error };
}
