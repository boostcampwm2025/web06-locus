import type { Meta, StoryObj } from '@storybook/react-vite';
import ToastErrorMessage from './ToastErrorMessage';

const meta = {
  title: 'Shared/UI/Alert/ToastErrorMessage',
  component: ToastErrorMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: '표시할 메시지',
    },
    variant: {
      control: 'select',
      options: ['error', 'warning', 'info', 'success'],
      description: '토스트 타입 (색상)',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
} satisfies Meta<typeof ToastErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: {
    message: '로그인 정보를 다시 확인해주세요',
    variant: 'error',
  },
};

export const Warning: Story = {
  args: {
    message: '입력한 정보를 다시 확인해주세요',
    variant: 'warning',
  },
};

export const Info: Story = {
  args: {
    message: '정보가 성공적으로 저장되었습니다',
    variant: 'info',
  },
};

export const Success: Story = {
  args: {
    message: '회원가입이 완료되었습니다',
    variant: 'success',
  },
};

export const AllVariants: Story = {
  args: {
    message: '로그인 정보를 다시 확인해주세요',
    variant: 'error',
  },
  render: () => (
    <div className="w-full max-w-md space-y-3 p-4">
      <ToastErrorMessage
        message="로그인 정보를 다시 확인해주세요"
        variant="error"
      />
      <ToastErrorMessage
        message="입력한 정보를 다시 확인해주세요"
        variant="warning"
      />
      <ToastErrorMessage
        message="정보가 성공적으로 저장되었습니다"
        variant="info"
      />
      <ToastErrorMessage
        message="회원가입이 완료되었습니다"
        variant="success"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story: '모든 variant를 한 화면에서 비교합니다.',
      },
    },
  },
};
