import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import EmailVerifyPage from './EmailVerifyPage';

const meta = {
  title: 'Features/Auth/EmailVerifyPage',
  component: EmailVerifyPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const { email, password, nickname } = context.args as {
        email: string;
        password: string;
        nickname: string;
      };
      return (
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/auth/verify',
              state: { email, password, nickname },
            },
          ]}
        >
          <Story />
        </MemoryRouter>
      );
    },
  ],
  argTypes: {
    email: {
      control: 'text',
      description: '회원가입 시 입력한 이메일',
    },
    password: {
      control: 'text',
      description: '회원가입 시 입력한 비밀번호 (재전송용)',
    },
    nickname: {
      control: 'text',
      description: '회원가입 시 입력한 닉네임 (재전송용)',
    },
  },
} satisfies Meta<typeof EmailVerifyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    email: 'user@example.com',
    password: 'password123',
    nickname: '사용자',
  },
};

export const WithoutSignupData: Story = {
  args: {
    email: '',
    password: '',
    nickname: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          '회원가입 데이터가 없는 경우 (직접 URL로 접근한 경우). 재전송 버튼이 비활성화됩니다.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    email: 'user@example.com',
    password: 'password123',
    nickname: '사용자',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Tablet: Story = {
  args: {
    email: 'user@example.com',
    password: 'password123',
    nickname: '사용자',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const Desktop: Story = {
  args: {
    email: 'user@example.com',
    password: 'password123',
    nickname: '사용자',
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};
