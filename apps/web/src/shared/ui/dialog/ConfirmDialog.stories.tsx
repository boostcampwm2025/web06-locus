import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

const meta = {
  title: 'Shared/UI/Dialog/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function ConfirmDialogWrapper({
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg"
      >
        확인 다이얼로그 열기
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        variant={variant}
        onConfirm={fn()}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    title: '확인',
    message: '이 작업을 진행하시겠습니까?',
    confirmLabel: '확인',
    cancelLabel: '취소',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConfirm: () => {},
    variant: 'default',
  },
  render: () => (
    <ConfirmDialogWrapper
      title="확인"
      message="이 작업을 진행하시겠습니까?"
      confirmLabel="확인"
      cancelLabel="취소"
      variant="default"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '기본 확인 다이얼로그입니다.',
      },
    },
  },
};

export const DeleteConfirm: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    title: '삭제하기',
    message: '정말 삭제하시겠습니까?',
    confirmLabel: '삭제',
    cancelLabel: '취소',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConfirm: () => {},
    variant: 'danger',
  },
  render: () => (
    <ConfirmDialogWrapper
      title="삭제하기"
      message="정말 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다."
      confirmLabel="삭제"
      cancelLabel="취소"
      variant="danger"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          '삭제 확인 다이얼로그입니다. 위험한 작업임을 나타내기 위해 빨간색 버튼을 사용합니다.',
      },
    },
  },
};

export const CustomLabels: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    title: '저장하기',
    message: '변경사항을 저장하시겠습니까?',
    confirmLabel: '저장',
    cancelLabel: '취소',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConfirm: () => {},
    variant: 'default',
  },
  render: () => (
    <ConfirmDialogWrapper
      title="저장하기"
      message="변경사항을 저장하시겠습니까?"
      confirmLabel="저장"
      cancelLabel="취소"
      variant="default"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '커스텀 라벨을 사용하는 확인 다이얼로그입니다.',
      },
    },
  },
};
