import type { Meta, StoryObj } from '@storybook/react-vite';
import OAuthLoginButton from './OAuthLoginButton';

const meta = {
  title: 'Shared/UI/Button/OAuthLoginButton',
  component: OAuthLoginButton,
  parameters: {
    layout: 'centered',
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
      description: '버튼 클릭 핸들러',
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
    onClick: () => {
      console.log('Google 로그인 클릭');
    },
  },
};

export const Naver: Story = {
  args: {
    provider: 'naver',
    onClick: () => {
      console.log('Naver 로그인 클릭');
    },
  },
};

export const Kakao: Story = {
  args: {
    provider: 'kakao',
    onClick: () => {
      console.log('Kakao 로그인 클릭');
    },
  },
};

export const AllProviders: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-3 p-4">
      <OAuthLoginButton
        provider="google"
        onClick={() => {
          console.log('Google 로그인 클릭');
        }}
      />
      <OAuthLoginButton
        provider="naver"
        onClick={() => {
          console.log('Naver 로그인 클릭');
        }}
      />
      <OAuthLoginButton
        provider="kakao"
        onClick={() => {
          console.log('Kakao 로그인 클릭');
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const WithCustomWidth: Story = {
  render: () => (
    <div className="space-y-3">
      <OAuthLoginButton
        provider="google"
        className="w-64"
        onClick={() => {
          console.log('Google 로그인 클릭');
        }}
      />
      <OAuthLoginButton
        provider="naver"
        className="w-80"
        onClick={() => {
          console.log('Naver 로그인 클릭');
        }}
      />
      <OAuthLoginButton
        provider="kakao"
        className="w-full max-w-sm"
        onClick={() => {
          console.log('Kakao 로그인 클릭');
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
