import type { Meta, StoryObj } from '@storybook/react-vite';
import RecordCard from './RecordCard';
import type { Location } from '@/features/record/types';
import type { RecordCardProps } from './RecordCard.types';
import type { Image } from '@locus/shared';

const meta = {
  title: 'Shared/UI/Record/RecordCard',
  component: RecordCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: {
      action: 'card clicked',
      description: '카드 클릭 핸들러',
    },
  },
} satisfies Meta<typeof RecordCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockLocation: Location = {
  name: '경복궁',
  address: '서울특별시 종로구 사직로 161',
};

const mockDate = new Date('2025-12-15');

const mockImage: Image = {
  publicId: 'img_mock123',
  thumbnail: {
    url: '/record-placehold.webp',
    width: 400,
    height: 300,
    size: 48000,
  },
  medium: {
    url: '/record-placehold.webp',
    width: 800,
    height: 600,
    size: 120000,
  },
  original: {
    url: '/record-placehold.webp',
    width: 1920,
    height: 1440,
    size: 450000,
  },
  order: 0,
};

export const WithImage: Story = {
  args: {
    recordId: 'rec_001',
    title: '경복궁 나들이',
    location: mockLocation,
    date: mockDate,
    tags: ['역사', '명소'],
    connectionCount: 3,
    image: mockImage,
    onClick: () => {
      /* empty */
    },
  },
  parameters: {
    docs: {
      description: {
        story: '이미지가 있는 기록 카드',
      },
    },
  },
};

export const WithoutImage: Story = {
  args: {
    recordId: 'rec_002',
    title: '경복궁 나들이',
    location: mockLocation,
    date: mockDate,
    tags: ['역사', '명소'],
    connectionCount: 3,
    onClick: () => {
      /* empty */
    },
  },
  parameters: {
    docs: {
      description: {
        story: '이미지가 없는 기록 카드 (placeholder 표시)',
      },
    },
  },
};

export const WithLongTitle: Story = {
  args: {
    recordId: 'rec_003',
    title: '한옥의 고즈넉한 분위기와 골목길이 인상적인 북촌 한옥마을',
    location: {
      name: '북촌 한옥마을',
      address: '서울특별시 종로구 계동길',
    },
    date: new Date('2025-12-14'),
    tags: ['문화', '명소'],
    connectionCount: 2,
    onClick: () => {
      /* empty */
    },
  },
  parameters: {
    docs: {
      description: {
        story: '긴 제목이 있는 기록 카드 (말줄임 처리)',
      },
    },
  },
};

export const WithSingleTag: Story = {
  args: {
    recordId: 'rec_004',
    title: '서울숲 산책',
    location: {
      name: '서울숲',
      address: '서울특별시 성동구 뚝섬로 273',
    },
    date: new Date('2025-12-13'),
    tags: ['자연'],
    connectionCount: 5,
    onClick: () => {
      /* empty */
    },
  },
  parameters: {
    docs: {
      description: {
        story: '태그가 하나인 기록 카드',
      },
    },
  },
};

export const WithManyTags: Story = {
  args: {
    recordId: 'rec_005',
    title: '강남역 맛집 탐방',
    location: {
      name: '강남역',
      address: '서울특별시 강남구 강남대로',
    },
    date: new Date('2025-12-12'),
    tags: ['맛집', '한식', '데이트', '친구', '저녁'],
    connectionCount: 8,
    image: mockImage,
    onClick: () => {
      /* empty */
    },
  },
  parameters: {
    docs: {
      description: {
        story: '태그가 많은 기록 카드 (+N 표시)',
      },
    },
  },
};

export const States: Story = {
  args: {} as RecordCardProps,
  render: () => (
    <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
      <RecordCard
        recordId="rec_006"
        title="경복궁 나들이"
        location={mockLocation}
        date={mockDate}
        tags={['역사', '명소']}
        connectionCount={3}
        image={mockImage}
      />
      <RecordCard
        recordId="rec_007"
        title="북촌 한옥마을"
        location={{
          name: '북촌 한옥마을',
          address: '서울특별시 종로구 계동길',
        }}
        date={new Date('2025-12-14')}
        tags={['문화', '명소']}
        connectionCount={2}
      />
      <RecordCard
        recordId="rec_008"
        title="서울숲 산책"
        location={{
          name: '서울숲',
          address: '서울특별시 성동구 뚝섬로 273',
        }}
        date={new Date('2025-12-13')}
        tags={['자연', '공원']}
        connectionCount={5}
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '여러 기록 카드를 리스트로 표시한 예시',
      },
    },
  },
};
