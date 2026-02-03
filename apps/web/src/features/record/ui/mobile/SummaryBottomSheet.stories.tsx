import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { SummaryBottomSheet } from './SummaryBottomSheet';
import type { SummaryBottomSheetData } from '@/features/record/types';

const meta = {
  title: 'Features/Record/Mobile/SummaryBottomSheet',
  component: SummaryBottomSheet,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      viewports: {
        mobile1: {
          name: 'iPhone SE',
          styles: { width: '375px', height: '667px' },
        },
        mobile2: {
          name: 'iPhone 12/13',
          styles: { width: '390px', height: '844px' },
        },
      },
      defaultViewport: 'mobile2',
    },
  },
  tags: ['autodocs'],
  args: {
    isVisible: true,
    data: undefined as unknown as SummaryBottomSheetData,
    onExpand: fn(),
    onClose: fn(),
  },
  argTypes: {
    isVisible: { control: 'boolean', description: '바텀시트 표시 여부' },
    data: { description: '연결 요약 데이터' },
    onExpand: { action: 'expand', description: '전체 보기(슬라이드업) 클릭' },
    onClose: { action: 'close', description: '닫기 클릭' },
  },
} satisfies Meta<typeof SummaryBottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultData: SummaryBottomSheetData = {
  title: '북한산 우이동 산책',
  time: '2025년 1월 15일',
  tags: ['등산', '산책', '북한산'],
  connectedCount: 3,
};

function SummaryBottomSheetWithState(props: {
  initialVisible?: boolean;
  data?: SummaryBottomSheetData;
}) {
  const [isVisible, setIsVisible] = useState(props.initialVisible ?? true);
  return (
    <div className="relative min-h-[600px]">
      <SummaryBottomSheet
        isVisible={isVisible}
        data={props.data ?? defaultData}
        onExpand={fn(() => setIsVisible(false))}
        onClose={fn(() => setIsVisible(false))}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <SummaryBottomSheetWithState initialVisible={true} data={defaultData} />
  ),
};

export const ManyTags: Story = {
  render: () => (
    <SummaryBottomSheetWithState
      data={{
        ...defaultData,
        tags: ['등산', '산책', '북한산', '우이동', '주말'],
      }}
    />
  ),
};

export const ManyConnections: Story = {
  args: {
    data: { ...defaultData, connectedCount: 12 },
  },
};
