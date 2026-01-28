import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import RecordCreateBottomSheet from './RecordCreateBottomSheet';

const meta = {
  title: 'Features/Home/RecordCreateBottomSheet',
  component: RecordCreateBottomSheet,
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
        mobile4: {
          name: 'Samsung Galaxy S20',
          styles: {
            width: '360px',
            height: '800px',
          },
        },
      },
      defaultViewport: 'mobile2',
    },
  },
  argTypes: {
    onConfirm: {
      action: '기록 작성하기 클릭',
      description: '기록 작성하기 버튼 클릭 핸들러',
    },
    onClose: {
      action: '취소 클릭',
      description: '취소 버튼 클릭 핸들러',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RecordCreateBottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function RecordCreateBottomSheetWrapper(
  args: Parameters<typeof RecordCreateBottomSheet>[0],
) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative h-screen bg-gray-100">
      <div className="flex h-full items-center justify-center">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
          }}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          기록 생성 바텀시트 열기
        </button>
      </div>
      <RecordCreateBottomSheet
        {...args}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        locationName="경복궁"
        address="서울시 종로구 사직로 161"
        onConfirm={() => {
          args.onConfirm();
          setIsOpen(false);
        }}
      />
    </div>
  );
}

function WithDifferentLocationWrapper(
  args: Parameters<typeof RecordCreateBottomSheet>[0],
) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative h-screen bg-gray-100">
      <div className="flex h-full items-center justify-center">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
          }}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          기록 생성 바텀시트 열기
        </button>
      </div>
      <RecordCreateBottomSheet
        {...args}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        locationName="서울숲"
        address="서울특별시 성동구 뚝섬로 273"
        onConfirm={() => {
          args.onConfirm();
          setIsOpen(false);
        }}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    locationName: '',
    address: '',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConfirm: () => {},
  },
  render: (args) => <RecordCreateBottomSheetWrapper {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          '핀 클릭 시 표시되는 기록 생성 바텀시트입니다. 위치 확인 후 기록을 작성할 수 있습니다.',
      },
    },
  },
};

export const WithDifferentLocation: Story = {
  args: {
    isOpen: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClose: () => {},
    locationName: '',
    address: '',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConfirm: () => {},
  },
  render: (args) => <WithDifferentLocationWrapper {...args} />,
  parameters: {
    docs: {
      description: {
        story: '다른 위치 정보를 표시하는 예시입니다.',
      },
    },
  },
};
