import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { RecordListView } from './RecordListView';
import type {
  RecordListItem,
  RecordListMainRecord,
} from '@/features/record/types';

const meta = {
  title: 'Features/Record/Mobile/RecordListView',
  component: RecordListView,
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
  argTypes: {
    isVisible: { control: 'boolean' },
    currentTab: { control: 'select', options: ['records', 'connections'] },
    onBack: { action: 'back' },
    onTabChange: { action: 'tabChange' },
    onRecordSelect: { action: 'recordSelect' },
    onViewDetail: { action: 'viewDetail' },
  },
} satisfies Meta<typeof RecordListView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mainRecord: RecordListMainRecord = {
  title: '북한산 우이동 산책',
  location: '서울 강북구 우이동',
  date: '2025.01.15',
  tags: ['등산', '산책', '북한산'],
};

const sampleRecords: RecordListItem[] = [
  {
    title: '북한산 우이동 산책',
    description: '오늘 날씨가 좋아서 우이동에서 잠시 산책했다.',
    date: '2025.01.15',
    location: '서울 강북구 우이동',
    tags: ['등산', '산책'],
    connections: 2,
  },
  {
    title: '우이동 맛집 탐방',
    description: '산책 후 근처 맛집에서 점심.',
    date: '2025.01.10',
    location: '서울 강북구 우이동',
    tags: ['맛집'],
  },
];

const sampleConnections: RecordListItem[] = [
  {
    title: '연결된 기록 A',
    description: '다른 장소에서 이곳과 연결한 기록.',
    date: '2025.01.12',
    location: '서울 노원구',
    tags: ['연결'],
  },
];

function RecordListViewInteractive() {
  const [currentTab, setCurrentTab] = useState<'records' | 'connections'>(
    'records',
  );
  const [activeRecordIndex, setActiveRecordIndex] = useState(0);
  const [activeConnectionIndex, setActiveConnectionIndex] = useState(0);

  const recordsWithHandler = sampleRecords;
  const connectionsWithHandler = sampleConnections;

  return (
    <div className="relative w-full min-h-[600px]">
      <RecordListView
        isVisible
        currentMainRecord={mainRecord}
        currentTab={currentTab}
        bukhansanRecords={recordsWithHandler}
        connectionRecords={connectionsWithHandler}
        activeRecordIndex={activeRecordIndex}
        activeConnectionIndex={activeConnectionIndex}
        onBack={fn()}
        onTabChange={(tab) => setCurrentTab(tab)}
        onRecordSelect={(index) => {
          if (currentTab === 'records') setActiveRecordIndex(index);
          else setActiveConnectionIndex(index);
        }}
        onViewDetail={fn()}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    isVisible: true,
    currentMainRecord: mainRecord,
    currentTab: 'records',
    bukhansanRecords: sampleRecords,
    connectionRecords: sampleConnections,
    activeRecordIndex: 0,
    activeConnectionIndex: 0,
    onBack: fn(),
    onTabChange: fn(),
    onRecordSelect: fn(),
    onViewDetail: fn(),
  },
  render: () => <RecordListViewInteractive />,
};
