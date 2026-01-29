import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import ConnectionManagementPage from './ConnectionManagementPage';

const meta = {
  title: 'Features/Connection/ConnectionManagementPage',
  component: ConnectionManagementPage,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: {
        mobile1: {
          name: 'iPhone SE',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        mobile2: {
          name: 'iPhone 12/13',
          styles: {
            width: '390px',
            height: '844px',
          },
        },
        mobile3: {
          name: 'iPhone 14 Pro Max',
          styles: {
            width: '430px',
            height: '932px',
          },
        },
      },
      defaultViewport: 'mobile2',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onBack: {
      action: 'back clicked',
      description: '뒤로 가기 버튼 클릭 핸들러',
    },
    onSearchChange: {
      action: 'search changed',
      description: '검색 입력값 변경 핸들러',
    },
    onRecordRemove: {
      action: 'record removed',
      description: '연결 해제 버튼 클릭 핸들러',
    },
  },
} satisfies Meta<typeof ConnectionManagementPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// 샘플 데이터
const sampleBaseRecord = {
  id: '1',
  title: '서울숲 산책',
  location: {
    name: '서울숲',
    address: '서울특별시 성동구 뚝섬로 273',
  },
  date: new Date('2025-12-13'),
  tags: ['자연', '공원'],
  connectionCount: 5,
};

const sampleConnectedRecords = [
  {
    id: '2',
    title: '경복궁 나들이',
    location: {
      name: '경복궁',
      address: '서울특별시 종로구 사직로 161',
    },
    date: new Date('2025-12-15'),
    tags: ['역사', '명소'],
    imageUrl: undefined,
  },
  {
    id: '3',
    title: '한옥의 고즈넉한 분위기와 골목길이 인',
    location: {
      name: '북촌 한옥마을',
      address: '서울특별시 종로구 계동길 37',
    },
    date: new Date('2025-12-14'),
    tags: ['문화', '전통'],
    imageUrl: undefined,
  },
  {
    id: '4',
    title: '이태원 맛집 탐방',
    location: {
      name: '이태원',
      address: '서울특별시 용산구 이태원로27길 26',
    },
    date: new Date('2025-12-12'),
    tags: ['음식', '맛집'],
    imageUrl: undefined,
  },
  {
    id: '5',
    title: '명동 스피',
    location: {
      name: '명동',
      address: '서울특별시 중구 명동길 26',
    },
    date: new Date('2025-12-11'),
    tags: ['쇼핑', '관광'],
    imageUrl: undefined,
  },
  {
    id: '6',
    title: '남산 타워 전망',
    location: {
      name: '남산타워',
      address: '서울특별시 용산구 남산공원길 105',
    },
    date: new Date('2025-12-10'),
    tags: ['전망', '관광'],
    imageUrl: undefined,
  },
];

export const Default: Story = {
  args: {
    baseRecord: sampleBaseRecord,
    connectedRecords: sampleConnectedRecords,
    onBack: fn(),
    onSearchChange: fn(),
    onRecordRemove: fn(),
  },
};

export const WithImages: Story = {
  args: {
    baseRecord: sampleBaseRecord,
    connectedRecords: sampleConnectedRecords.map((record, index) => ({
      ...record,
      imageUrl: index % 2 === 0 ? '/record-placehold.webp' : undefined,
    })),
    onBack: fn(),
    onSearchChange: fn(),
    onRecordRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '일부 기록에 이미지가 있는 경우',
      },
    },
  },
};

export const FewRecords: Story = {
  args: {
    baseRecord: {
      ...sampleBaseRecord,
      connectionCount: 2,
    },
    connectedRecords: sampleConnectedRecords.slice(0, 2),
    onBack: fn(),
    onSearchChange: fn(),
    onRecordRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '연결된 기록이 적은 경우',
      },
    },
  },
};

export const ManyTags: Story = {
  args: {
    baseRecord: {
      ...sampleBaseRecord,
      tags: ['자연', '공원', '산책', '휴식', '운동', '건강'],
    },
    connectedRecords: sampleConnectedRecords.map((record) => ({
      ...record,
      tags: [
        ...record.tags,
        '추가태그1',
        '추가태그2',
        '추가태그3',
        '추가태그4',
      ],
    })),
    onBack: fn(),
    onSearchChange: fn(),
    onRecordRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '태그가 많은 경우',
      },
    },
  },
};

// 많은 기록을 생성하는 헬퍼 함수
const generateManyRecords = (count: number) => {
  const locations = [
    { name: '경복궁', address: '서울특별시 종로구 사직로 161' },
    { name: '북촌 한옥마을', address: '서울특별시 종로구 계동길 37' },
    { name: '이태원', address: '서울특별시 용산구 이태원로27길 26' },
    { name: '명동', address: '서울특별시 중구 명동길 26' },
    { name: '남산타워', address: '서울특별시 용산구 남산공원길 105' },
    { name: '홍대', address: '서울특별시 마포구 홍익로' },
    { name: '강남', address: '서울특별시 강남구 테헤란로' },
    { name: '한강공원', address: '서울특별시 영등포구 여의도로' },
    { name: '인사동', address: '서울특별시 종로구 인사동길' },
    { name: '삼성동', address: '서울특별시 강남구 테헤란로 152' },
  ];

  const titles = [
    '아름다운 전통 건축물 탐방',
    '시원한 바람과 함께한 산책',
    '맛있는 음식과 따뜻한 대화',
    '역사의 흔적을 따라 걷기',
    '새로운 발견과 추억 만들기',
    '평화로운 오후의 여유',
    '친구들과 함께한 즐거운 시간',
    '혼자만의 여유로운 순간',
    '예술과 문화를 만나다',
    '자연 속에서의 힐링',
  ];

  const tagSets = [
    ['역사', '명소'],
    ['자연', '산책'],
    ['음식', '맛집'],
    ['문화', '예술'],
    ['쇼핑', '관광'],
    ['휴식', '힐링'],
    ['사진', '기록'],
    ['친구', '모임'],
    ['혼자', '여유'],
    ['전통', '문화'],
  ];

  return Array.from({ length: count }, (_, index) => {
    const locationIndex = index % locations.length;
    const titleIndex = index % titles.length;
    const tagIndex = index % tagSets.length;
    const dateOffset = Math.floor(index / 5); // 5개씩 같은 날짜

    return {
      id: String(index + 2), // 기존 샘플 데이터와 겹치지 않도록
      title: `${titles[titleIndex]} ${index + 1}`,
      location: locations[locationIndex],
      date: new Date(2025, 11, 15 - dateOffset), // 날짜를 다르게 설정
      tags: tagSets[tagIndex],
      imageUrl: index % 3 === 0 ? '/record-placehold.webp' : undefined,
    };
  });
};

export const ManyRecords: Story = {
  args: {
    baseRecord: {
      ...sampleBaseRecord,
      connectionCount: 30,
    },
    connectedRecords: generateManyRecords(30),
    onBack: fn(),
    onSearchChange: fn(),
    onRecordRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '연결된 기록이 많은 경우 (30개) - 스크롤 및 검색 기능 테스트',
      },
    },
  },
};

export const VeryManyRecords: Story = {
  args: {
    baseRecord: {
      ...sampleBaseRecord,
      connectionCount: 50,
    },
    connectedRecords: generateManyRecords(50),
    onBack: fn(),
    onSearchChange: fn(),
    onRecordRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '연결된 기록이 매우 많은 경우 (50개) - 성능 및 사용성 테스트',
      },
    },
  },
};
