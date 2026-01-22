import type { Meta, StoryObj } from '@storybook/react';
import ConnectionBadge from './ConnectionBadge';

const meta = {
  title: 'Shared/UI/Badge/ConnectionBadge',
  component: ConnectionBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConnectionBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 연결 배지
 */
export const Default: Story = {
  args: {},
};

/**
 * 다른 배지와 함께 사용 예시
 */
export const WithOtherBadges: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
        관련
      </span>
      <ConnectionBadge />
    </div>
  ),
};

/**
 * 기록 카드 내부 사용 예시
 */
export const InRecordCard: Story = {
  render: () => (
    <div className="w-80 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base font-medium text-gray-900 flex-1">
          카페에서 읽은 책
        </h3>
        <ConnectionBadge />
      </div>
      <p className="text-sm text-gray-500">이미 연결된 기록입니다</p>
    </div>
  ),
};
