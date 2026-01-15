import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ConnectActionButton from './ConnectActionButton';

const meta = {
  title: 'Features/Connection/ConnectActionButton',
  component: ConnectActionButton,
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
    onClick: {
      action: 'button clicked',
      description: '버튼 클릭 핸들러',
    },
  },
} satisfies Meta<typeof ConnectActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disabled: Story = {
  args: {
    isEnabled: false,
    onClick: fn(),
    disabledText: '도착 기록을 선택하세요',
  },
  parameters: {
    docs: {
      description: {
        story: '비활성화된 버튼 (출발 또는 도착 기록이 선택되지 않음)',
      },
    },
  },
};

export const Enabled: Story = {
  args: {
    isEnabled: true,
    onClick: fn(),
    enabledText: '연결하기',
  },
  parameters: {
    docs: {
      description: {
        story: '활성화된 버튼 (출발과 도착 기록이 모두 선택됨)',
      },
    },
  },
};

export const CustomTexts: Story = {
  args: {
    isEnabled: false,
    onClick: fn(),
    disabledText: '출발과 도착을 모두 선택해주세요',
    enabledText: '기록 연결하기',
  },
  parameters: {
    docs: {
      description: {
        story: '커스텀 텍스트가 있는 버튼',
      },
    },
  },
};

function InteractiveButton() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div className="relative h-screen flex flex-col">
      <div className="flex-1 p-4 space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            버튼 상태를 변경하려면 아래 체크박스를 클릭하세요:
          </p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span>출발과 도착 모두 선택됨 (버튼 활성화)</span>
          </label>
        </div>
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-2">현재 상태:</p>
          <p className="text-base font-medium text-gray-900">
            {isEnabled ? '연결 가능' : '연결 불가 (기록 선택 필요)'}
          </p>
        </div>
      </div>
      <ConnectActionButton
        isEnabled={isEnabled}
        onClick={() => {
          alert('연결하기 버튼 클릭됨!');
        }}
      />
    </div>
  );
}

export const Interactive: Story = {
  args: {
    isEnabled: false,
    onClick: () => {
      /* empty */
    },
  },
  render: () => <InteractiveButton />,
  parameters: {
    docs: {
      description: {
        story:
          '체크박스를 클릭하여 버튼 활성화 상태를 변경할 수 있습니다. 버튼을 클릭하면 알림이 표시됩니다. 실제 동작을 확인할 수 있습니다.',
      },
    },
  },
};
