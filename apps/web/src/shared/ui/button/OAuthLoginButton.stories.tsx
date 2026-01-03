import type { Meta, StoryObj } from '@storybook/react-vite';
import OAuthLoginButton from './OAuthLoginButton';

const meta = {
  title: 'Shared/UI/Button/OAuthLoginButton',
  component: OAuthLoginButton,
  parameters: {
    layout: 'centered',
    actions: { argTypesRegex: undefined },
  },
  tags: ['autodocs'],
  argTypes: {
    provider: {
      control: 'select',
      options: ['google', 'naver', 'kakao'],
      description: 'OAuth 제공자 선택',
    },
    onClick: {
      action: 'clicked',
      description: '버튼 클릭 핸들러 (Storybook Actions 패널에 기록)',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
} satisfies Meta<typeof OAuthLoginButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Google: Story = {
  args: {
    provider: 'google',
  },
};

export const Naver: Story = {
  args: {
    provider: 'naver',
  },
};

export const Kakao: Story = {
  args: {
    provider: 'kakao',
  },
};

export const AllProviders: Story = {
  args: {
    provider: 'google', // 타입 만족용 (render에서는 직접 provider 지정)
  },
  render: (args) => (
    <div className="w-full max-w-md mx-auto space-y-3 p-4">
      <OAuthLoginButton provider="google" onClick={args.onClick} />
      <OAuthLoginButton provider="naver" onClick={args.onClick} />
      <OAuthLoginButton provider="kakao" onClick={args.onClick} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Google / Naver / Kakao OAuth 버튼을 한 화면에서 비교합니다. 클릭 이벤트는 Actions 패널에 기록됩니다.',
      },
    },
  },
};
