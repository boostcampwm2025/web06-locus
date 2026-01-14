import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import FilterBottomSheet from './FilterBottomSheet';
import type { SortOrder } from '@/features/record/types';

const meta = {
  title: 'Features/Record/FilterBottomSheet',
  component: FilterBottomSheet,
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
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: '바텀시트 열림 여부',
    },
    onClose: {
      action: 'closed',
      description: '바텀시트 닫기 핸들러',
    },
    sortOrder: {
      control: 'select',
      options: ['newest', 'oldest'],
      description: '정렬 순서',
    },
    includeImages: {
      control: 'boolean',
      description: '이미지 포함 여부',
    },
    favoritesOnly: {
      control: 'boolean',
      description: '즐겨찾기만 보기 여부',
    },
    onApply: {
      action: 'filter applied',
      description: '필터 적용 핸들러',
    },
  },
} satisfies Meta<typeof FilterBottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {
      /* closed */
    },
    sortOrder: 'newest',
    includeImages: false,
    favoritesOnly: false,
  },
  parameters: {
    docs: {
      description: {
        story: '기본 필터 바텀시트 (최신순 선택됨)',
      },
    },
  },
};

export const OldestSelected: Story = {
  args: {
    isOpen: true,
    onClose: () => {
      /* closed */
    },
    sortOrder: 'oldest',
    includeImages: false,
    favoritesOnly: false,
  },
  parameters: {
    docs: {
      description: {
        story: '오래된순이 선택된 상태',
      },
    },
  },
};

export const WithOptions: Story = {
  args: {
    isOpen: true,
    onClose: () => {
      /* closed */
    },
    sortOrder: 'newest',
    includeImages: true,
    favoritesOnly: true,
  },
  parameters: {
    docs: {
      description: {
        story: '모든 옵션이 활성화된 상태',
      },
    },
  },
};

function InteractiveFilterBottomSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [includeImages, setIncludeImages] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  return (
    <div className="p-8">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg"
      >
        필터 열기
      </button>
      <FilterBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        sortOrder={sortOrder}
        includeImages={includeImages}
        favoritesOnly={favoritesOnly}
        onSortOrderChange={setSortOrder}
        onIncludeImagesChange={setIncludeImages}
        onFavoritesOnlyChange={setFavoritesOnly}
        onApply={() => {
          /* filter applied */
        }}
      />
    </div>
  );
}

export const Interactive: Story = {
  args: {
    isOpen: false,
    onClose: () => {
      /* closed */
    },
  },
  render: () => <InteractiveFilterBottomSheet />,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story:
          '필터 열기 버튼을 클릭하면 바텀시트가 슬라이드 애니메이션과 함께 나타납니다. 실제 동작을 확인할 수 있습니다.',
      },
    },
  },
};
