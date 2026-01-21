import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import OnboardingFlow from './OnboardingFlow';

const meta = {
  title: 'Features/Onboarding/OnboardingFlow',
  component: OnboardingFlow,
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
} satisfies Meta<typeof OnboardingFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '온보딩 플로우 전체 컴포넌트: 4개의 온보딩 페이지를 순차적으로 보여주며, 페이지 인디케이터와 네비게이션 버튼을 제공합니다.',
      },
    },
  },
};

export const WithOnComplete: Story = {
  args: {
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'onComplete 콜백이 제공되면 마지막 페이지에서 "첫 기록 남기기" 버튼 클릭 시 호출됩니다.',
      },
    },
  },
};

export const WithOnSkip: Story = {
  args: {
    onComplete: fn(),
    onSkip: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'onSkip 콜백이 제공되면 상단 우측에 "건너뛰기" 버튼이 표시되며, 클릭 시 호출됩니다.',
      },
    },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const LargeScreen: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile3',
    },
  },
};
