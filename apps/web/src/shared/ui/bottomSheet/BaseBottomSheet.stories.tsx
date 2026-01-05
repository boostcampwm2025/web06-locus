import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import BaseBottomSheet from './BaseBottomSheet';

const meta = {
  title: 'Shared/UI/BottomSheet/BaseBottomSheet',
  component: BaseBottomSheet,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BaseBottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function BottomSheetWrapper({
  height,
}: {
  height?: 'small' | 'medium' | 'full';
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
        바텀시트 열기
      </button>
      <BaseBottomSheet
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        height={height}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">바텀시트 내용</h2>
          <p className="text-gray-600 mb-4">
            이것은 바텀시트의 내용입니다. 높이는 {height ?? 'medium'}입니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            닫기
          </button>
        </div>
      </BaseBottomSheet>
    </div>
  );
}

export const Small: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    children: null,
  },
  render: () => <BottomSheetWrapper height="small" />,
  parameters: {
    docs: {
      description: {
        story: '작은 높이의 바텀시트입니다 (40vh).',
      },
    },
  },
};

export const Medium: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    children: null,
  },
  render: () => <BottomSheetWrapper height="medium" />,
  parameters: {
    docs: {
      description: {
        story: '중간 높이의 바텀시트입니다 (60vh). 기본값입니다.',
      },
    },
  },
};

export const Full: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    children: null,
  },
  render: () => <BottomSheetWrapper height="full" />,
  parameters: {
    docs: {
      description: {
        story: '전체 높이의 바텀시트입니다 (90vh).',
      },
    },
  },
};

function WithoutHandleWrapper() {
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
        바텀시트 열기 (핸들 없음)
      </button>
      <BaseBottomSheet
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        showHandle={false}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">핸들이 없는 바텀시트</h2>
          <p className="text-gray-600 mb-4">드래그 핸들이 표시되지 않습니다.</p>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            닫기
          </button>
        </div>
      </BaseBottomSheet>
    </div>
  );
}

export const WithoutHandle: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    children: null,
  },
  render: () => <WithoutHandleWrapper />,
  parameters: {
    docs: {
      description: {
        story: '드래그 핸들이 없는 바텀시트입니다.',
      },
    },
  },
};
