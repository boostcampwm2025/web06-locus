import type { Meta, StoryObj } from '@storybook/react-vite';
import SocialLoginButton from './SocialLoginButton';

const meta = {
  title: 'Shared/UI/Button/SocialLoginButton',
  component: SocialLoginButton,
  parameters: {
    layout: 'centered',
    actions: { argTypesRegex: undefined },
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: {
      action: 'clicked',
      description: '버튼 클릭 핸들러 (Storybook Actions 패널에 기록)',
    },
    text: {
      control: 'text',
      description: '버튼 텍스트',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
} satisfies Meta<typeof SocialLoginButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: '소셜 계정으로 로그인',
  },
};

export const CustomText: Story = {
  args: {
    text: '소셜 로그인',
  },
};

export const InForm: Story = {
  render: (args) => (
    <div className="w-full max-w-md space-y-4 p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            type="email"
            placeholder="user@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <button
          type="button"
          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          로그인
        </button>
      </div>

      <div className="relative flex items-center py-3">
        <div className="grow border-t border-gray-300"></div>
        <span className="shrink mx-3 sm:mx-4 text-xs sm:text-sm text-gray-500 bg-white">
          또는
        </span>
        <div className="grow border-t border-gray-300"></div>
      </div>

      <SocialLoginButton {...args} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '로그인 폼에서 사용되는 소셜 로그인 버튼 예시입니다.',
      },
    },
  },
};
