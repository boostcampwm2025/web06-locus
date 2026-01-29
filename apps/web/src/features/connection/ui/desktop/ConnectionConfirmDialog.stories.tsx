import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ConnectionConfirmDialog from './ConnectionConfirmDialog';

const meta = {
  title: 'Features/Connection/Desktop/ConnectionConfirmDialog',
  component: ConnectionConfirmDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '연결 확인 다이얼로그. 출발 기록과 도착 기록을 확인하고 연결을 최종 확인할 수 있습니다.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConnectionConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDeparture = {
  id: 'record-1',
  title: '한옥마을 방문',
  location: {
    name: '북촌',
    address: '서울특별시 종로구 계동길',
  },
  imageUrl:
    'https://images.unsplash.com/photo-1655910843284-68e2a2f37f47?q=80&w=600',
};

const mockArrival = {
  id: 'record-2',
  title: '강남 카페거리',
  location: {
    name: '강남역',
    address: '서울특별시 강남구 강남대로',
  },
  imageUrl:
    'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=600',
};

/**
 * 기본 상태
 * 다이얼로그가 열려있는 상태입니다.
 */
export const Default: Story = {
  args: {
    isOpen: true,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    departure: mockDeparture,
    arrival: mockArrival,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConfirm: () => {},
    isConnecting: false,
  },
  render: (args) => {
    const DefaultComponent = () => {
      const [isOpen, setIsOpen] = useState(true);
      const [isConnecting, setIsConnecting] = useState(false);

      return (
        <div className="h-screen bg-gray-100">
          <div className="p-8">
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              다이얼로그 열기
            </button>
          </div>
          <ConnectionConfirmDialog
            {...args}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            departure={mockDeparture}
            arrival={mockArrival}
            onConfirm={() => {
              void (async () => {
                setIsConnecting(true);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                setIsConnecting(false);
                setIsOpen(false);
              })();
            }}
            isConnecting={isConnecting}
          />
        </div>
      );
    };
    return <DefaultComponent />;
  },
};

/**
 * 연결 중 상태
 * 연결이 진행 중인 상태입니다.
 */
export const Connecting: Story = {
  args: {
    isOpen: true,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    departure: mockDeparture,
    arrival: mockArrival,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConfirm: () => {},
    isConnecting: true,
  },
  render: (args) => {
    const ConnectingComponent = () => {
      const [isOpen, setIsOpen] = useState(true);

      return (
        <div className="h-screen bg-gray-100">
          <ConnectionConfirmDialog
            {...args}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            departure={mockDeparture}
            arrival={mockArrival}
            onConfirm={() => {
              // 연결 중 상태에서는 아무 동작 없음
            }}
            isConnecting={true}
          />
        </div>
      );
    };
    return <ConnectingComponent />;
  },
};

/**
 * 닫힌 상태
 * 다이얼로그가 닫혀있는 상태입니다.
 */
export const Closed: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    departure: mockDeparture,
    arrival: mockArrival,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConfirm: () => {},
    isConnecting: false,
  },
  render: (args) => {
    const ClosedComponent = () => {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <div className="h-screen bg-gray-100">
          <div className="p-8">
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              다이얼로그 열기
            </button>
          </div>
          <ConnectionConfirmDialog
            {...args}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            departure={mockDeparture}
            arrival={mockArrival}
            onConfirm={() => setIsOpen(false)}
            isConnecting={false}
          />
        </div>
      );
    };
    return <ClosedComponent />;
  },
};
