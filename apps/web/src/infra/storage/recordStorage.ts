import type { StoredRecordPin } from '@/infra/types/storage';

const STORAGE_KEY = 'locus_created_records';

/**
 * localStorage에서 생성된 기록 목록 가져오기
 * JSON.parse 후 Date 객체 복원
 */
export function getStoredRecordPins(): StoredRecordPin[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as {
      record: {
        id: string;
        text: string;
        tags: string[];
        location: { name: string; address: string };
        createdAt: string; // JSON에서는 문자열
      };
      coordinates?: { lat: number; lng: number };
      publicId: string;
    }[];

    // Date 객체 복원
    return parsed.map((item) => ({
      ...item,
      record: {
        ...item.record,
        createdAt: new Date(item.record.createdAt),
      },
    })) as StoredRecordPin[];
  } catch (error) {
    console.error('기록 불러오기 실패:', error);
    return [];
  }
}

/**
 * localStorage에 기록 추가
 */
export function addStoredRecordPin(pin: StoredRecordPin): void {
  try {
    const existing = getStoredRecordPins();

    const isDuplicate = existing.some((p) => p.publicId === pin.publicId);
    if (!isDuplicate) {
      existing.push(pin);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  } catch (error) {
    console.error('기록 저장 실패:', error);
  }
}

/**
 * localStorage에서 기록 삭제
 */
export function removeStoredRecordPin(publicId: string): void {
  try {
    const existing = getStoredRecordPins();
    const filtered = existing.filter((p) => p.publicId !== publicId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('기록 삭제 실패:', error);
  }
}

/**
 * localStorage 초기화 (모든 기록 삭제)
 */
export function clearStoredRecordPins(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('기록 초기화 실패:', error);
  }
}
