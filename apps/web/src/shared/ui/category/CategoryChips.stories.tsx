import type { Meta, StoryObj } from '@storybook/react-vite';
import CategoryChips from './CategoryChips';

const meta = {
  title: 'Shared/UI/Category/CategoryChips',
  component: CategoryChips,
  parameters: {
    layout: 'padded',
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
    categories: {
      control: 'object',
      description: '카테고리 목록',
    },
    defaultSelectedId: {
      control: 'text',
      description: '기본 선택된 카테고리 ID',
    },
    onCategoryChange: {
      action: 'category changed',
      description: '카테고리 변경 핸들러',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
} satisfies Meta<typeof CategoryChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ManyCategories: Story = {
  args: {
    categories: [
      { id: 'all', label: '전체' },
      { id: 'food', label: '음식' },
      { id: 'cafe', label: '카페' },
      { id: 'place', label: '장소' },
      { id: 'thought', label: '생각' },
      { id: 'travel', label: '여행' },
      { id: 'work', label: '업무' },
      { id: 'hobby', label: '취미' },
      { id: 'shopping', label: '쇼핑' },
      { id: 'exercise', label: '운동' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: '많은 카테고리가 있을 때 가로 스크롤이 가능합니다.',
      },
    },
  },
};
