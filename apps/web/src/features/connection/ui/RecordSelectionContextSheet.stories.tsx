import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import RecordSelectionContextSheet from './RecordSelectionContextSheet';
import type { RecordConnectionItem } from '../types/recordConnection';

const meta = {
  title: 'Features/Connection/RecordSelectionContextSheet',
  component: RecordSelectionContextSheet,
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
      },
      defaultViewport: 'mobile2',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSelectDeparture: {
      action: 'departure selected',
      description: '출발로 선택 핸들러',
    },
    onSelectArrival: {
      action: 'arrival selected',
      description: '도착으로 선택 핸들러',
    },
    onClose: {
      action: 'closed',
      description: '바텀시트 닫기 핸들러',
    },
  },
} satisfies Meta<typeof RecordSelectionContextSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRecord: RecordConnectionItem = {
  id: '1',
  title: '남산타워 전망',
  location: { name: '남산', address: '서울특별시 용산구 남산공원길' },
  date: new Date('2025-12-15'),
  tags: ['명소', '자연'],
  imageUrl: 'https://placehold.co/80',
  isRelated: false,
};

export const Default: Story = {
  args: {
    isOpen: true,
    record: mockRecord,
    onClose: fn(),
    onSelectDeparture: fn(),
    onSelectArrival: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '기본 기록 선택 컨텍스트 바텀시트',
      },
    },
  },
};

export const WithLongTitle: Story = {
  args: {
    isOpen: true,
    record: {
      ...mockRecord,
      title: '한옥의 고즈넉한 분위기와 골목길이 인상적인 북촌 한옥마을',
    },
    onClose: fn(),
    onSelectDeparture: fn(),
    onSelectArrival: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '긴 제목이 있는 기록 (말줄임 처리)',
      },
    },
  },
};

function InteractiveContextSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<
    'departure' | 'arrival' | null
  >(null);

  return (
    <div className="relative h-screen bg-gray-100 p-4">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          기록 선택 메뉴 열기
        </button>

        {selectedType && (
          <div className="p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600">
              선택된 타입:{' '}
              <span className="font-medium text-gray-900">
                {selectedType === 'departure' ? '출발' : '도착'}
              </span>
            </p>
          </div>
        )}
      </div>

      <RecordSelectionContextSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        record={mockRecord}
        onSelectDeparture={(record) => {
          setSelectedType('departure');
          setIsOpen(false);
          alert(`출발로 선택됨: ${record.title}`);
        }}
        onSelectArrival={(record) => {
          setSelectedType('arrival');
          setIsOpen(false);
          alert(`도착으로 선택됨: ${record.title}`);
        }}
      />
    </div>
  );
}

export const Interactive: Story = {
  args: {
    isOpen: true,
    record: mockRecord,
    onClose: fn(),
    onSelectDeparture: fn(),
    onSelectArrival: fn(),
  },
  render: () => <InteractiveContextSheet />,
  parameters: {
    docs: {
      description: {
        story:
          '버튼을 클릭하여 바텀시트를 열고, 출발/도착 중 하나를 선택할 수 있습니다. 실제 동작을 확인할 수 있습니다.',
      },
    },
  },
};
