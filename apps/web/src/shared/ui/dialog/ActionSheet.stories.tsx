import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { useState, useRef } from 'react';
import ActionSheet from './ActionSheet';
import type { ActionSheetItem } from '@/shared/types';

const meta = {
  title: 'Shared/UI/Dialog/ActionSheet',
  component: ActionSheet,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function ActionSheetWrapper({ items }: { items: ActionSheetItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="p-4 flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg"
      >
        액션 시트 열기
      </button>
      <ActionSheet
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        anchorElement={buttonRef.current}
        items={items}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    items: [],
  },
  render: () => (
    <ActionSheetWrapper
      items={[
        {
          label: '수정하기',
          onClick: fn(),
        },
        {
          label: '삭제하기',
          onClick: fn(),
          variant: 'danger',
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '기본 액션 시트입니다. 여러 옵션을 표시할 수 있습니다.',
      },
    },
  },
};

export const WithMultipleItems: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    items: [],
  },
  render: () => (
    <ActionSheetWrapper
      items={[
        {
          label: '공유하기',
          onClick: fn(),
        },
        {
          label: '복사하기',
          onClick: fn(),
        },
        {
          label: '수정하기',
          onClick: fn(),
        },
        {
          label: '삭제하기',
          onClick: fn(),
          variant: 'danger',
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '여러 항목이 있는 액션 시트입니다.',
      },
    },
  },
};

export const SingleItem: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    items: [],
  },
  render: () => (
    <ActionSheetWrapper
      items={[
        {
          label: '삭제하기',
          onClick: fn(),
          variant: 'danger',
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '단일 항목만 있는 액션 시트입니다.',
      },
    },
  },
};
