import type { Record as RecordType } from '@/features/record/types';
import type { RecordConnectionItem } from '@/features/connection/types/recordConnection';
import { getStoredRecordPins } from '@/infra/storage/recordStorage';

/**
 * TODO: 지도 SDK 연동 시 제거할 mock 데이터
 * 개발 환경에서 API 데이터가 없을 때 사용
 */
export const MOCK_RECORDS: Record<string | number, RecordType> = {
  2: {
    id: '2',
    text: '경복궁에서 산책하며 느낀 생각들\n\n자연 속에서 걷다 보면 마음이 편안해진다. 새소리와 바람소리가 귀에 들어오고, 발 아래로 느껴지는 흙의 감촉이 좋다.',
    location: {
      name: '경복궁',
      address: '서울특별시 종로구 사직로 161',
    },
    tags: ['산책', '자연', '휴식'],
    createdAt: new Date('2024-01-15'),
  },
  3: {
    id: '3',
    text: '남산타워에서 본 서울의 야경\n\n도시의 불빛들이 마치 별처럼 반짝인다. 높은 곳에서 내려다보니 일상의 고민들이 작아 보인다.',
    location: {
      name: '남산타워',
      address: '서울특별시 용산구 남산공원길 105',
    },
    tags: ['야경', '도시', '명상'],
    createdAt: new Date('2024-01-20'),
  },
  4: {
    id: '4',
    text: '덕수궁 돌담길을 따라 걷다\n\n역사의 흔적이 남아있는 돌담을 만지며 과거를 상상해본다. 시간이 멈춘 것 같은 이곳에서 평온함을 느낀다.',
    location: {
      name: '덕수궁',
      address: '서울특별시 중구 세종대로 99',
    },
    tags: ['역사', '산책', '평온'],
    createdAt: new Date('2024-01-25'),
  },
  5: {
    id: '5',
    text: '한강공원에서 느낀 자유로움\n\n강바람이 불어오는 이곳에서 모든 걱정을 내려놓는다. 하늘과 강이 만나는 지평선을 보며 마음이 넓어진다.',
    location: {
      name: '반포한강공원',
      address: '서울특별시 서초구 반포동',
    },
    tags: ['한강', '자유', '휴식'],
    createdAt: new Date('2024-02-01'),
  },
  6: {
    id: '6',
    text: '강남역 지하상가에서 발견한 작은 카페\n\n바쁜 일상 속에서도 잠시 멈춰 쉴 수 있는 공간. 커피 한 잔과 함께 내면의 소리에 귀 기울인다.',
    location: {
      name: '강남역',
      address: '서울특별시 강남구 강남대로 396',
    },
    tags: ['카페', '일상', '휴식'],
    createdAt: new Date('2024-02-05'),
  },
  7: {
    id: '7',
    text: '명동 거리를 걷다\n\n사람들의 발걸음과 상점들의 불빛이 어우러진 밤거리. 도시의 생동감 속에서도 나만의 속도를 찾는다.',
    location: {
      name: '명동',
      address: '서울특별시 중구 명동길 26',
    },
    tags: ['도시', '야경', '산책'],
    createdAt: new Date('2024-02-10'),
  },
  8: {
    id: '8',
    text: '남산 한옥마을에서의 오후\n\n전통과 현대가 공존하는 이곳에서 시간의 흐름을 느낀다. 옛것과 새것이 만나는 지점에서 영감을 얻는다.',
    location: {
      name: '남산 한옥마을',
      address: '서울특별시 중구 퇴계로34길 28',
    },
    tags: ['전통', '문화', '영감'],
    createdAt: new Date('2024-02-15'),
  },
  9: {
    id: '9',
    text: '북촌 한옥마을 골목길\n\n좁은 골목 사이로 스며드는 햇살. 이곳을 지나가는 사람들의 이야기가 궁금해진다. 시간이 천천히 흐르는 느낌이다.',
    location: {
      name: '북촌 한옥마을',
      address: '서울특별시 종로구 계동길 37',
    },
    tags: ['한옥', '골목', '평온'],
    createdAt: new Date('2024-02-20'),
  },
  10: {
    id: '10',
    text: '잠실 롯데타워 전망대\n\n도시 전체를 한눈에 내려다보는 순간. 작은 나지만 이 거대한 도시의 일부라는 것을 느낀다.',
    location: {
      name: '롯데월드타워',
      address: '서울특별시 송파구 올림픽로 300',
    },
    tags: ['전망', '도시', '명상'],
    createdAt: new Date('2024-02-25'),
  },
  11: {
    id: '11',
    text: '인사동 골목에서 발견한 작은 서점\n\n책 냄새와 고요함이 어우러진 공간. 종이책을 넘기는 소리가 마음에 평화를 가져다준다.',
    location: {
      name: '인사동',
      address: '서울특별시 종로구 인사동길',
    },
    tags: ['책', '평화', '문화'],
    createdAt: new Date('2024-03-01'),
  },
  12: {
    id: '12',
    text: '이태원 언덕길을 오르며\n\n경사진 길을 오르는 것이 인생과 닮았다. 한 걸음씩 올라가다 보면 어느새 높은 곳에 도달해 있다.',
    location: {
      name: '이태원',
      address: '서울특별시 용산구 이태원로27길 20',
    },
    tags: ['산책', '성장', '명상'],
    createdAt: new Date('2024-03-05'),
  },
};

/**
 * Mock 기록을 RecordConnectionItem으로 변환
 * localStorage에 저장된 기록도 포함
 */
export function convertMockRecordsToConnectionItems(
  searchQuery?: string,
): RecordConnectionItem[] {
  const mockRecords = Object.values(MOCK_RECORDS);

  // localStorage에서 생성된 기록 가져오기
  const storedPins = getStoredRecordPins();
  const storedRecords = storedPins.map((pin) => pin.record);

  // mock 기록과 저장된 기록 합치기 (중복 제거 - publicId 기준)
  const allRecordsMap = new Map<string, RecordType>();
  mockRecords.forEach((record) => {
    allRecordsMap.set(record.id, record);
  });
  storedRecords.forEach((record) => {
    // 저장된 기록이 mock 기록과 중복되지 않으면 추가
    if (!allRecordsMap.has(record.id)) {
      allRecordsMap.set(record.id, record);
    }
  });

  const allRecords = Array.from(allRecordsMap.values());

  // 검색어가 있으면 필터링
  if (searchQuery?.trim()) {
    const query = searchQuery.trim().toLowerCase();
    const filtered = allRecords.filter((record) => {
      return (
        record.text.toLowerCase().includes(query) ||
        record.location.name.toLowerCase().includes(query) ||
        record.location.address.toLowerCase().includes(query) ||
        record.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });

    return filtered.map((record) => ({
      id: record.id, // record.id가 publicId
      title: record.text.split('\n')[0] || record.text.substring(0, 30),
      location: record.location,
      date: record.createdAt,
      tags: record.tags,
      isRelated: true,
    }));
  }

  // 검색어가 없으면 전체 반환
  return allRecords.map((record) => ({
    id: record.id, // record.id가 publicId
    title: record.text.split('\n')[0] || record.text.substring(0, 30),
    location: record.location,
    date: record.createdAt,
    tags: record.tags,
    isRelated: false,
  }));
}

/**
 * Mock 기록을 RecordListItem으로 변환
 */
export function convertMockRecordsToRecordListItems() {
  return Object.values(MOCK_RECORDS).map((record) => ({
    id: record.id,
    title: record.text.split('\n')[0] || record.text.substring(0, 30),
    location: record.location,
    date: record.createdAt,
    tags: record.tags,
    connectionCount: 0, // mock 데이터에는 연결 정보가 없으므로 0
    imageUrl: undefined, // mock 데이터에는 이미지가 없으므로 undefined
  }));
}
