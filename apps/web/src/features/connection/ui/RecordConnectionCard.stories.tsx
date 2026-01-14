import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RecordConnectionCard from './RecordConnectionCard';
import type { RecordConnectionItem } from '../types/recordConnection';

const meta = {
  title: 'Features/Connection/RecordConnectionCard',
  component: RecordConnectionCard,
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
} satisfies Meta<typeof RecordConnectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRecord: RecordConnectionItem = {
  id: '1',
  title: '남산타워 전망',
  location: {
    name: '남산',
    address: '서울특별시 용산구 남산공원길',
  },
  date: new Date('2025-12-15'),
  tags: ['명소', '자연'],
  imageUrl: 'https://placehold.co/80',
};

export const Default: Story = {
  args: {
    record: mockRecord,
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '기본 기록 연결 카드',
      },
    },
  },
};

export const WithRelatedTag: Story = {
  args: {
    record: {
      ...mockRecord,
      isRelated: true,
    },
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          '검색 결과에서 관련 기록으로 표시되는 카드 (초록색 "관련" 태그 표시)',
      },
    },
  },
};

export const WithoutImage: Story = {
  args: {
    record: {
      ...mockRecord,
      imageUrl: undefined,
    },
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '이미지가 없는 기록 카드',
      },
    },
  },
};

export const WithLongTitle: Story = {
  args: {
    record: {
      ...mockRecord,
      title: '한옥의 고즈넉한 분위기와 골목길이 인상적인 북촌 한옥마을',
      isRelated: true,
    },
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '긴 제목이 있는 기록 카드 (말줄임 처리)',
      },
    },
  },
};

export const WithManyTags: Story = {
  args: {
    record: {
      ...mockRecord,
      tags: ['명소', '자연', '역사', '문화', '관광'],
      isRelated: true,
    },
    onClick: fn(),
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
  args: {
    record: mockRecord,
    onClick: fn(),
  },
  render: () => (
    <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
      <RecordConnectionCard
        record={{
          id: '1',
          title: '남산타워 전망',
          location: { name: '남산', address: '서울특별시 용산구' },
          date: new Date('2025-12-15'),
          tags: ['명소', '자연'],
          imageUrl: 'https://placehold.co/80',
          isRelated: true,
        }}
      />
      <RecordConnectionCard
        record={{
          id: '2',
          title: '강남 카페거리',
          location: { name: '강남역', address: '서울특별시 강남구' },
          date: new Date('2025-12-14'),
          tags: ['쇼핑', '음식'],
          imageUrl: 'https://placehold.co/80',
        }}
      />
      <RecordConnectionCard
        record={{
          id: '3',
          title: '광화문 광장',
          location: { name: '광화문', address: '서울특별시 종로구' },
          date: new Date('2025-12-13'),
          tags: ['역사', '문화'],
        }}
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

function InteractiveCard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
      <RecordConnectionCard
        record={{
          id: '1',
          title: '남산타워 전망',
          location: { name: '남산', address: '서울특별시 용산구' },
          date: new Date('2025-12-15'),
          tags: ['명소', '자연'],
          imageUrl: 'https://placehold.co/80',
          isRelated: true,
        }}
        onClick={() => {
          setSelectedId(selectedId === '1' ? null : '1');
          alert('카드 클릭됨: 남산타워 전망');
        }}
        className={selectedId === '1' ? 'bg-blue-50' : ''}
      />
      <RecordConnectionCard
        record={{
          id: '2',
          title: '강남 카페거리',
          location: { name: '강남역', address: '서울특별시 강남구' },
          date: new Date('2025-12-14'),
          tags: ['쇼핑', '음식'],
          imageUrl: 'https://placehold.co/80',
        }}
        onClick={() => {
          setSelectedId(selectedId === '2' ? null : '2');
          alert('카드 클릭됨: 강남 카페거리');
        }}
        className={selectedId === '2' ? 'bg-blue-50' : ''}
      />
    </div>
  );
}

export const Interactive: Story = {
  args: {
    record: mockRecord,
    onClick: fn(),
  },
  render: () => <InteractiveCard />,
  parameters: {
    docs: {
      description: {
        story:
          '카드를 클릭하면 선택 상태가 변경됩니다. 실제 동작을 확인할 수 있습니다.',
      },
    },
  },
};
