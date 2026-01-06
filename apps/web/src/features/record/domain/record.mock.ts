import type { Record, RecordFormData, Location } from '../types';

/**
 * Mock ID 생성 함수
 */
function generateMockId(): string {
  return `record_${String(Date.now())}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Mock 데이터로 기록 생성
 */
export function createMockRecord(
  formData: RecordFormData,
  location: Location,
): Record {
  return {
    id: generateMockId(),
    text: formData.text,
    tags: formData.tags,
    location,
    createdAt: new Date(),
  };
}
