import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/react-vite';
import RecordListPage from './RecordListPage';
import { RecordListPageMobile } from './mobile/RecordListPage.mobile';
import FilterBottomSheet from './FilterBottomSheet';
import type { SortOrder } from '@/features/record/types';
import type { RecordWithoutCoords } from '@locus/shared';

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

// 모킹 데이터 헬퍼 함수
function createMockRecord(
  id: string,
  title: string,
  locationName: string,
  locationAddress: string,
  createdAt: string,
  tags: string[],
  connectionCount: number,
  hasImage = false,
  isFavorite = false,
): RecordWithoutCoords {
  return {
    publicId: id,
    title,
    location: {
      name: locationName || null,
      address: locationAddress || null,
    },
    createdAt,
    updatedAt: createdAt,
    tags: tags.map((name) => ({ publicId: `tag-${name}`, name })),
    connectionCount,
    isFavorite,
    images: hasImage
      ? [
          {
            publicId: `img-${id}`,
            thumbnail: {
              url: 'https://placehold.co/80',
              width: 80,
              height: 80,
              size: 5000,
            },
            medium: {
              url: 'https://placehold.co/400',
              width: 400,
              height: 400,
              size: 50000,
            },
            original: {
              url: 'https://placehold.co/400',
              width: 400,
              height: 400,
              size: 50000,
            },
            order: 0,
          },
        ]
      : [],
  };
}

// Mock 데이터를 설정하는 컴포넌트
function RecordListPageWithMockData({
  records,
}: {
  records: RecordWithoutCoords[];
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(['records', 'all'], {
      records,
      totalCount: records.length,
    });
  }, [queryClient, records]);

  return <RecordListPage />;
}

export const Default: Story = {
  render: () => <RecordListPageWithMockData records={[]} />,
  parameters: {
    docs: {
      description: {
        story: '기본 기록 리스트 페이지 (idle 상태)',
      },
    },
  },
};

export const WithImages: Story = {
  render: () => (
    <RecordListPageWithMockData
      records={[
        createMockRecord(
          '1',
          '경복궁 나들이',
          '경복궁',
          '서울특별시 종로구 사직로 161',
          '2025-12-15T10:00:00Z',
          ['역사', '명소'],
          3,
          true,
        ),
        createMockRecord(
          '2',
          '한옥의 고즈넉한 분위기와 골목길이 인상적인',
          '북촌 한옥마을',
          '서울특별시 종로구 계동길',
          '2025-12-14T10:00:00Z',
          ['문화', '명소'],
          2,
          true,
        ),
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '이미지가 있는 기록들',
      },
    },
  },
};

export const WithoutImages: Story = {
  render: () => (
    <RecordListPageWithMockData
      records={[
        createMockRecord(
          '3',
          '서울숲 산책',
          '서울숲',
          '서울특별시 성동구 뚝섬로 273',
          '2025-12-13T10:00:00Z',
          ['자연', '공원'],
          5,
          false,
        ),
        createMockRecord(
          '4',
          '이태원 맛집 탐방',
          '이태원',
          '서울특별시 용산구 이태원로',
          '2025-12-12T10:00:00Z',
          ['음식', '문화'],
          1,
          false,
        ),
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '이미지가 없는 기록들',
      },
    },
  },
};

export const Empty: Story = {
  render: () => <RecordListPageWithMockData records={[]} />,
  parameters: {
    docs: {
      description: {
        story: '기록이 없는 상태',
      },
    },
  },
};

export const Mixed: Story = {
  render: () => (
    <RecordListPageWithMockData
      records={[
        createMockRecord(
          '1',
          '경복궁 나들이',
          '경복궁',
          '서울특별시 종로구 사직로 161',
          '2025-12-15T10:00:00Z',
          ['역사', '명소'],
          3,
          true,
        ),
        createMockRecord(
          '2',
          '한옥의 고즈넉한 분위기와 골목길이 인상적인',
          '북촌 한옥마을',
          '서울특별시 종로구 계동길',
          '2025-12-14T10:00:00Z',
          ['문화', '명소'],
          2,
          true,
        ),
        createMockRecord(
          '3',
          '서울숲 산책',
          '서울숲',
          '서울특별시 성동구 뚝섬로 273',
          '2025-12-13T10:00:00Z',
          ['자연', '공원'],
          5,
          false,
        ),
        createMockRecord(
          '4',
          '이태원 맛집 탐방',
          '이태원',
          '서울특별시 용산구 이태원로',
          '2025-12-12T10:00:00Z',
          ['음식', '문화'],
          1,
          false,
        ),
        createMockRecord(
          '5',
          '명동 쇼핑',
          '명동',
          '서울특별시 중구 명동길',
          '2025-12-10T10:00:00Z',
          ['쇼핑', '명소'],
          4,
          false,
        ),
      ]}
    />
  ),
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
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(['records', 'all'], {
      records: [
        createMockRecord(
          '1',
          '경복궁 나들이',
          '경복궁',
          '서울특별시 종로구 사직로 161',
          '2025-12-15T10:00:00Z',
          ['역사', '명소'],
          3,
          true,
        ),
        createMockRecord(
          '2',
          '서울숲 산책',
          '서울숲',
          '서울특별시 성동구 뚝섬로 273',
          '2025-12-13T10:00:00Z',
          ['자연', '공원'],
          5,
          false,
        ),
      ],
      totalCount: 2,
    });
  }, [queryClient]);

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

// Mock 데이터를 설정하는 모바일 컴포넌트
function RecordListPageMobileWithMockData({
  records,
}: {
  records: RecordWithoutCoords[];
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(['records', 'all'], {
      records,
      totalCount: records.length,
    });
  }, [queryClient, records]);

  return <RecordListPageMobile />;
}

/**
 * 모바일 버전
 */
export const Mobile: Story = {
  render: () => (
    <RecordListPageMobileWithMockData
      records={[
        createMockRecord(
          '1',
          '경복궁 나들이',
          '경복궁',
          '서울특별시 종로구 사직로 161',
          '2025-12-15T10:00:00Z',
          ['역사', '명소'],
          3,
          true,
        ),
        createMockRecord(
          '2',
          '한옥의 고즈넉한 분위기와 골목길이 인상적인',
          '북촌 한옥마을',
          '서울특별시 종로구 계동길',
          '2025-12-14T10:00:00Z',
          ['문화', '명소'],
          2,
          true,
        ),
      ]}
    />
  ),
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
