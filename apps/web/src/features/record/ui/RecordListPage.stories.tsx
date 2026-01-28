import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import RecordListPage from './RecordListPage';
import { RecordListPageMobile } from './mobile/RecordListPage.mobile';
import FilterBottomSheet from './FilterBottomSheet';
import type { SortOrder } from '@/features/record/types';

const meta = {
  title: 'Features/Record/RecordListPage',
  component: RecordListPage,
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
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
      defaultViewport: 'mobile2',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onRecordClick: {
      action: 'record clicked',
      description: '기록 카드 클릭 핸들러',
    },
    onFilterClick: {
      action: 'filter clicked',
      description: '필터 버튼 클릭 핸들러',
    },
    onSearchClick: {
      action: 'search clicked',
      description: '검색 버튼 클릭 핸들러',
    },
    onSearchCancel: {
      action: 'search cancelled',
      description: '검색 취소 핸들러',
    },
    onTabChange: {
      action: 'tab changed',
      description: '탭 변경 핸들러',
    },
  },
} satisfies Meta<typeof RecordListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: '기본 기록 리스트 페이지 (idle 상태)',
      },
    },
  },
};

export const WithImages: Story = {
  args: {
    records: [
      {
        id: '1',
        title: '경복궁 나들이',
        location: {
          name: '경복궁',
          address: '서울특별시 종로구 사직로 161',
        },
        date: new Date('2025-12-15'),
        tags: ['역사', '명소'],
        connectionCount: 3,
        imageUrl: 'https://placehold.co/80',
      },
      {
        id: '2',
        title: '한옥의 고즈넉한 분위기와 골목길이 인상적인',
        location: {
          name: '북촌 한옥마을',
          address: '서울특별시 종로구 계동길',
        },
        date: new Date('2025-12-14'),
        tags: ['문화', '명소'],
        connectionCount: 2,
        imageUrl: 'https://placehold.co/80',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: '이미지가 있는 기록들',
      },
    },
  },
};

export const WithoutImages: Story = {
  args: {
    records: [
      {
        id: '3',
        title: '서울숲 산책',
        location: {
          name: '서울숲',
          address: '서울특별시 성동구 뚝섬로 273',
        },
        date: new Date('2025-12-13'),
        tags: ['자연', '공원'],
        connectionCount: 5,
      },
      {
        id: '4',
        title: '이태원 맛집 탐방',
        location: { name: '이태원', address: '서울특별시 용산구 이태원로' },
        date: new Date('2025-12-12'),
        tags: ['음식', '문화'],
        connectionCount: 1,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: '이미지가 없는 기록들',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    records: [],
  },
  parameters: {
    docs: {
      description: {
        story: '기록이 없는 상태',
      },
    },
  },
};

export const Mixed: Story = {
  args: {
    records: [
      {
        id: '1',
        title: '경복궁 나들이',
        location: {
          name: '경복궁',
          address: '서울특별시 종로구 사직로 161',
        },
        date: new Date('2025-12-15'),
        tags: ['역사', '명소'],
        connectionCount: 3,
        imageUrl: 'https://placehold.co/80',
      },
      {
        id: '2',
        title: '한옥의 고즈넉한 분위기와 골목길이 인상적인',
        location: {
          name: '북촌 한옥마을',
          address: '서울특별시 종로구 계동길',
        },
        date: new Date('2025-12-14'),
        tags: ['문화', '명소'],
        connectionCount: 2,
        imageUrl: 'https://placehold.co/80',
      },
      {
        id: '3',
        title: '서울숲 산책',
        location: {
          name: '서울숲',
          address: '서울특별시 성동구 뚝섬로 273',
        },
        date: new Date('2025-12-13'),
        tags: ['자연', '공원'],
        connectionCount: 5,
      },
      {
        id: '4',
        title: '이태원 맛집 탐방',
        location: { name: '이태원', address: '서울특별시 용산구 이태원로' },
        date: new Date('2025-12-12'),
        tags: ['음식', '문화'],
        connectionCount: 1,
      },
      {
        id: '5',
        title: '명동 쇼핑',
        location: { name: '명동', address: '서울특별시 중구 명동길' },
        date: new Date('2025-12-10'),
        tags: ['쇼핑', '명소'],
        connectionCount: 4,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: '이미지가 있는 기록과 없는 기록이 섞인 상태',
      },
    },
  },
};

function InteractiveRecordListPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [includeImages, setIncludeImages] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  return (
    <>
      <RecordListPage
        onFilterClick={() => setIsFilterOpen(true)}
        onRecordClick={() => {
          /* record clicked */
        }}
      />
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
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
    </>
  );
}

export const WithFilter: Story = {
  render: () => <InteractiveRecordListPage />,
  parameters: {
    docs: {
      description: {
        story:
          '필터 버튼을 클릭하면 바텀시트가 열립니다. 실제 동작을 확인할 수 있습니다.',
      },
    },
  },
};

/**
 * 모바일 버전
 */
export const Mobile: Story = {
  render: (args) => <RecordListPageMobile {...args} />,
  parameters: {
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
    docs: {
      description: {
        story: '모바일 버전 UI입니다.',
      },
    },
  },
};
