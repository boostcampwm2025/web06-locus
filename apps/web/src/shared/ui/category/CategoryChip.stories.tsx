import type { Meta, StoryObj } from '@storybook/react-vite';
import CategoryChip from './CategoryChip';

const meta = {
  title: 'Shared/UI/Category/CategoryChip',
  component: CategoryChip,
  parameters: {
    layout: 'centered',
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
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '카테고리 라벨',
    },
    isSelected: {
      control: 'boolean',
      description: '선택된 상태 여부',
    },
    onClick: {
      action: 'clicked',
      description: '클릭 핸들러',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
} satisfies Meta<typeof CategoryChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '전체',
    isSelected: false,
  },
};

export const Selected: Story = {
  args: {
    label: '음식',
    isSelected: true,
  },
};

export const AllStates: Story = {
  args: {
    label: '전체',
    isSelected: false,
  },
  render: () => (
    <div className="flex gap-3 items-center">
      <CategoryChip label="전체" isSelected={false} />
      <CategoryChip label="음식" isSelected={true} />
      <CategoryChip label="카페" isSelected={false} />
      <CategoryChip label="장소" isSelected={false} />
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '다양한 상태의 카테고리 칩을 비교할 수 있습니다.',
      },
    },
  },
};
