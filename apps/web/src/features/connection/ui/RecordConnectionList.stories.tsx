import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RecordConnectionList from './RecordConnectionList';
import type { RecordConnectionItem } from '../types/recordConnection';

const meta = {
  title: 'Features/Connection/RecordConnectionList',
  component: RecordConnectionList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onRecordClick: {
      action: 'record clicked',
      description: '기록 카드 클릭 핸들러',
    },
  },
} satisfies Meta<typeof RecordConnectionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRecords: RecordConnectionItem[] = [
  {
    id: '1',
    title: '남산타워 전망',
    location: { name: '남산', address: '서울특별시 용산구' },
    date: new Date('2025-12-15'),
    tags: ['명소', '자연'],
    imageUrl: 'https://placehold.co/80',
    isRelated: true,
  },
  {
    id: '2',
    title: '강남 카페거리',
    location: { name: '강남역', address: '서울특별시 강남구' },
    date: new Date('2025-12-14'),
    tags: ['쇼핑', '음식'],
    imageUrl: 'https://placehold.co/80',
  },
  {
    id: '3',
    title: '광화문 광장',
    location: { name: '광화문', address: '서울특별시 종로구' },
    date: new Date('2025-12-13'),
    tags: ['역사', '문화'],
  },
  {
    id: '4',
    title: '이태원 맛집',
    location: { name: '이태원', address: '서울특별시 용산구' },
    date: new Date('2025-12-12'),
    tags: ['음식', '문화'],
    imageUrl: 'https://placehold.co/80',
  },
];

export const Default: Story = {
  args: {
    records: mockRecords,
    onRecordClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '기록 목록이 있는 리스트',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    records: [],
    onRecordClick: fn(),
    emptyMessage: '기록이 없습니다',
  },
  parameters: {
    docs: {
      description: {
        story: '기록이 없는 빈 상태',
      },
    },
  },
};

export const WithRelatedTags: Story = {
  args: {
    records: mockRecords.map((record, index) => ({
      ...record,
      isRelated: index % 2 === 0, // 짝수 인덱스만 관련 태그 표시
    })),
    onRecordClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '일부 기록에 "관련" 태그가 표시되는 리스트',
      },
    },
  },
};

export const SingleRecord: Story = {
  args: {
    records: [mockRecords[0]],
    onRecordClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '기록이 하나만 있는 리스트',
      },
    },
  },
};

function InteractiveList() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleRecordClick = (record: RecordConnectionItem) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(record.id)) {
      newSelectedIds.delete(record.id);
    } else {
      newSelectedIds.add(record.id);
    }
    setSelectedIds(newSelectedIds);
    alert(`기록 클릭됨: ${record.title}`);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <p className="mb-2">기록을 클릭하면 선택 상태가 변경됩니다:</p>
        <p className="text-xs text-gray-500">
          선택된 기록:{' '}
          {selectedIds.size > 0 ? Array.from(selectedIds).join(', ') : '(없음)'}
        </p>
      </div>
      <RecordConnectionList
        records={mockRecords}
        onRecordClick={handleRecordClick}
      />
    </div>
  );
}

export const Interactive: Story = {
  args: {
    records: mockRecords,
    onRecordClick: fn(),
  },
  render: () => <InteractiveList />,
  parameters: {
    docs: {
      description: {
        story:
          '기록을 클릭하면 선택 상태가 변경됩니다. 실제 동작을 확인할 수 있습니다.',
      },
    },
  },
};
