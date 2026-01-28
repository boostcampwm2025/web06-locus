import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RecordSelectionHeader from './RecordSelectionHeader';
import type { RecordSelection } from '../types/recordConnection';

const meta = {
  title: 'Features/Connection/RecordSelectionHeader',
  component: RecordSelectionHeader,
  parameters: {
    layout: 'padded',
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
    onDepartureClick: {
      action: 'departure clicked',
      description: '출발 기록 선택 버튼 클릭 핸들러',
    },
    onArrivalClick: {
      action: 'arrival clicked',
      description: '도착 기록 선택 버튼 클릭 핸들러',
    },
    onDepartureClear: {
      action: 'departure cleared',
      description: '출발 기록 취소 핸들러',
    },
    onArrivalClear: {
      action: 'arrival cleared',
      description: '도착 기록 취소 핸들러',
    },
  },
} satisfies Meta<typeof RecordSelectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDeparture: RecordSelection = {
  id: '1',
  title: '서울숲 산책로',
  location: {
    name: '서울숲',
    address: '서울특별시 성동구 뚝섬로 273',
  },
};

const mockArrival: RecordSelection = {
  id: '2',
  title: '북촌',
  location: {
    name: '북촌 한옥마을',
    address: '서울특별시 종로구 계동길',
  },
};

export const Empty: Story = {
  args: {
    departure: undefined,
    arrival: undefined,
    onDepartureClick: fn() as () => void,
    onArrivalClick: fn() as () => void,
  },
  parameters: {
    docs: {
      description: {
        story: '출발과 도착이 모두 선택되지 않은 초기 상태',
      },
    },
  },
};

export const DepartureOnly: Story = {
  args: {
    departure: mockDeparture,
    arrival: undefined,
    onDepartureClick: fn() as () => void,
    onArrivalClick: fn() as () => void,
    onDepartureClear: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '출발 기록만 선택된 상태 (원형 점 색상으로 선택 상태 표시)',
      },
    },
  },
};

export const ArrivalOnly: Story = {
  args: {
    departure: undefined,
    arrival: mockArrival,
    onDepartureClick: fn(),
    onArrivalClick: fn(),
    onArrivalClear: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '도착 기록만 선택된 상태 (원형 점 색상으로 선택 상태 표시)',
      },
    },
  },
};

export const BothSelected: Story = {
  args: {
    departure: mockDeparture,
    arrival: mockArrival,
    onDepartureClick: fn() as () => void,
    onArrivalClick: fn() as () => void,
    onDepartureClear: fn(),
    onArrivalClear: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '출발과 도착이 모두 선택된 상태 (연결하기 버튼 활성화 가능)',
      },
    },
  },
};

export const WithLongTitles: Story = {
  args: {
    departure: {
      id: '1',
      title: '한옥의 고즈넉한 분위기와 골목길이 인상적인 북촌 한옥마을',
      location: {
        name: '북촌',
        address: '서울특별시 종로구 계동길',
      },
    },
    arrival: {
      id: '2',
      title: '서울의 랜드마크인 남산타워에서 바라보는 도시 전경',
      location: {
        name: '남산',
        address: '서울특별시 용산구 남산공원길',
      },
    },
    onDepartureClick: fn(),
    onArrivalClick: fn(),
    onDepartureClear: fn(),
    onArrivalClear: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '긴 제목이 있는 기록들 (말줄임 처리)',
      },
    },
  },
};

function InteractiveHeader() {
  const [departure, setDeparture] = useState<RecordSelection | undefined>(
    undefined,
  );
  const [arrival, setArrival] = useState<RecordSelection | undefined>(
    undefined,
  );

  const handleDepartureClick = () => {
    if (!departure) {
      setDeparture(mockDeparture);
      alert('출발 기록 선택: 서울숲 산책로');
    }
  };

  const handleArrivalClick = () => {
    if (!arrival) {
      setArrival(mockArrival);
      alert('도착 기록 선택: 북촌');
    }
  };

  return (
    <div className="space-y-4">
      <RecordSelectionHeader
        departure={departure}
        arrival={arrival}
        onDepartureClick={handleDepartureClick}
        onArrivalClick={handleArrivalClick}
        onDepartureClear={() => {
          setDeparture(undefined);
          alert('출발 기록 취소됨');
        }}
        onArrivalClear={() => {
          setArrival(undefined);
          alert('도착 기록 취소됨');
        }}
      />
      <div className="text-sm text-gray-500 space-y-1">
        <div>
          출발:{' '}
          <span className="font-medium text-gray-900">
            {departure?.title ?? '(선택 안됨)'}
          </span>
        </div>
        <div>
          도착:{' '}
          <span className="font-medium text-gray-900">
            {arrival?.title ?? '(선택 안됨)'}
          </span>
        </div>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  args: {
    onDepartureClick: fn() as () => void,
    onArrivalClick: fn() as () => void,
  },
  render: () => <InteractiveHeader />,
  parameters: {
    docs: {
      description: {
        story:
          '출발/도착 버튼을 클릭하면 기록이 선택되고, X 버튼을 클릭하면 취소됩니다. 실제 동작을 확인할 수 있습니다.',
      },
    },
  },
};
