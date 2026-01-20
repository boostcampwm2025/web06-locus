import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import RecordConnectionPage from './RecordConnectionPage';

const meta = {
  title: 'Features/Connection/RecordConnectionPage',
  component: RecordConnectionPage,
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
        mobile4: {
          name: 'Samsung Galaxy S20',
          styles: {
            width: '360px',
            height: '800px',
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
    onConnect: {
      action: 'connect clicked',
      description: '연결하기 버튼 클릭 핸들러',
    },
  },
} satisfies Meta<typeof RecordConnectionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onBack: fn(),
    onConnect: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '기본 기록 연결 페이지 (idle 상태 - 출발/도착 미선택)',
      },
    },
  },
};

function InteractivePage() {
  const [connectionHistory, setConnectionHistory] = useState<
    { departureId: string; arrivalId: string }[]
  >([]);

  return (
    <div className="space-y-4">
      <RecordConnectionPage
        onBack={() => {
          alert('뒤로 가기');
        }}
        onConnect={(departureId, arrivalId) => {
          setConnectionHistory((prev) => [...prev, { departureId, arrivalId }]);
          alert(`연결 완료!\n출발: ${departureId}\n도착: ${arrivalId}`);
        }}
      />
      {connectionHistory.length > 0 && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs z-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            연결 기록
          </h3>
          <div className="space-y-1 text-xs text-gray-600">
            {connectionHistory.map((conn, index) => (
              <div key={index}>
                {index + 1}. {conn.departureId} → {conn.arrivalId}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractivePage />,
  parameters: {
    docs: {
      description: {
        story:
          '전체 페이지의 인터랙션을 테스트할 수 있습니다:\n' +
          '1. 첫 번째 기록 클릭 시 출발/도착 선택 컨텍스트 메뉴 표시\n' +
          '2. 두 번째 기록 클릭 시 자동으로 남은 항목에 채워짐\n' +
          '3. 검색어를 입력하여 기록 필터링\n' +
          '4. 출발과 도착이 모두 선택되면 연결하기 버튼 활성화\n' +
          '5. 연결하기 버튼 클릭 시 연결 완료',
      },
    },
  },
};

export const WithInitialSelection: Story = {
  args: {
    onBack: fn(),
    onConnect: fn(),
  },
  render: (args) => {
    // 초기 선택 상태를 시뮬레이션하기 위해 페이지를 래핑
    return (
      <div>
        <RecordConnectionPage {...args} />
        <div className="fixed top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 z-50">
          <p className="font-semibold mb-1">초기 상태 시뮬레이션:</p>
          <p>페이지 로드 후 기록을 클릭하여 출발/도착을 선택하세요.</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '초기 선택 상태가 있는 페이지 (사용자가 기록을 선택한 후)',
      },
    },
  },
};
