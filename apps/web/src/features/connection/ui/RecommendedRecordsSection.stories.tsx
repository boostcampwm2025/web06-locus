import type { Meta, StoryObj } from '@storybook/react-vite';
import RecommendedRecordsSection from './RecommendedRecordsSection';
import type { RecordConnectionItem } from '../types/recordConnection';

const meta = {
  title: 'Features/Connection/RecommendedRecordsSection',
  component: RecommendedRecordsSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RecommendedRecordsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRecords: RecordConnectionItem[] = [
  {
    id: '1',
    title: '남산타워 전망',
    location: { name: '남산', address: '서울특별시 용산구' },
    date: new Date('2025-12-15'),
    tags: ['명소', '자연'],
    imageUrl: '/record-placehold.webp',
    isRelated: true,
  },
  {
    id: '2',
    title: '강남 카페거리',
    location: { name: '강남역', address: '서울특별시 강남구' },
    date: new Date('2025-12-14'),
    tags: ['쇼핑', '음식'],
    imageUrl: '/record-placehold.webp',
  },
];

export const Default: Story = {
  args: {
    title: '추천 기록',
    description: '동일한 태그 또는 인접한 장소',
    records: mockRecords,
    onRecordClick: () => {
      /* empty */
    },
  },
  parameters: {
    docs: {
      description: {
        story: '기본 추천 기록 섹션',
      },
    },
  },
};

export const CustomTitle: Story = {
  args: {
    title: '연관된 기록',
    description: '태그가 일치하는 기록들',
    records: [
      {
        id: '1',
        title: '경복궁 나들이',
        location: { name: '경복궁', address: '서울특별시 종로구' },
        date: new Date('2025-12-15'),
        tags: ['역사', '명소'],
        imageUrl: '/record-placehold.webp',
        isRelated: true,
      },
    ],
    onRecordClick: () => {
      /* empty */
    },
  },
  parameters: {
    docs: {
      description: {
        story: '커스텀 제목과 설명이 있는 섹션',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    title: '추천 기록',
    description: '동일한 태그 또는 인접한 장소',
    records: [],
    emptyMessage: '추천 기록이 없습니다',
    onRecordClick: () => {
      /* empty */
    },
  },
  parameters: {
    docs: {
      description: {
        story: '추천 기록이 없는 상태',
      },
    },
  },
};

// 긴 리스트로 스크롤 확인용
const manyRecords: RecordConnectionItem[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: String(i + 1),
    title: `기록 ${i + 1}: ${['남산타워', '강남역', '광화문', '이태원', '홍대'][i % 5]}`,
    location: {
      name: ['남산', '강남역', '광화문', '이태원', '홍대'][i % 5],
      address: `서울특별시 ${['용산구', '강남구', '종로구', '용산구', '마포구'][i % 5]}`,
    },
    date: new Date(`2025-12-${15 - i}`),
    tags: [
      ['명소', '자연'],
      ['쇼핑', '음식'],
      ['역사', '문화'],
      ['음식', '문화'],
      ['문화', '예술'],
    ][i % 5],
    imageUrl: '/record-placehold.webp',
    isRelated: i % 3 === 0,
  }),
);

export const WithScrollFullHeight: Story = {
  args: {
    title: '추천 기록',
    description: '동일한 태그 또는 인접한 장소',
    records: manyRecords,
    scrollHeight: 'flex-1',
    onRecordClick: () => {
      /* empty */
    },
  },
  render: () => (
    <div className="h-screen flex flex-col">
      <RecommendedRecordsSection
        title="추천 기록"
        description="동일한 태그 또는 인접한 장소"
        records={manyRecords}
        scrollHeight="flex-1"
        className="flex-1 flex flex-col min-h-0"
        onRecordClick={() => {
          /* empty */
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '전체 화면 높이에서 헤더는 고정되고 리스트 부분만 스크롤되는 것을 확인할 수 있습니다.',
      },
    },
  },
};
