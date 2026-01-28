import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/react-vite';
import MainMapPage from './MainMapPage';
import { MainMapPageMobile } from './mobile/MainMapPage.mobile';
import { MainMapPageDesktop } from './desktop/MainMapPage.desktop';
import type { Record, RecordDetail } from '@locus/shared';
import { roundBoundsToGrid } from '@/features/home/utils/boundsUtils';

const meta: Meta<typeof MainMapPage> = {
  title: 'Features/Home/MainMapPage',
  component: MainMapPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MainMapPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 자동 분기 버전
 * useDeviceType 훅에 따라 모바일/데스크톱이 자동으로 선택됩니다.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기기 타입에 따라 자동으로 모바일/데스크톱 버전이 선택됩니다.',
      },
    },
  },
};

/**
 * 모바일 버전
 */
export const Mobile: Story = {
  render: () => <MainMapPageMobile />,
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
        story:
          '모바일 버전 UI입니다. AppHeader, CategoryChips, MapViewport, BottomTabBar가 포함되어 있습니다.',
      },
    },
  },
};

/**
 * 데스크톱 버전
 */
export const Desktop: Story = {
  render: () => <MainMapPageDesktop />,
  parameters: {
    viewport: {
      viewports: {
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
        laptop: {
          name: 'Laptop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story:
          '데스크톱 버전 UI입니다. 좌측 사이드바와 메인 지도 영역으로 구성되어 있습니다. 기록 리스트에서 기록을 클릭하면 사이드바가 기록 요약 패널로 전환됩니다.',
      },
    },
  },
};

// Mock 데이터
const mockRecords: Record[] = [
  {
    publicId: 'record-1',
    title: '경복궁 나들이',
    content: '경복궁에서 보낸 평화로운 오후. 단풍이 예쁘게 물들어 있었다.',
    location: {
      name: '경복궁',
      address: '서울특별시 종로구 사직로 161',
      latitude: 37.5796,
      longitude: 126.977,
    },
    createdAt: new Date('2025-12-15T14:30:00').toISOString(),
    updatedAt: new Date('2025-12-15T14:30:00').toISOString(),
    tags: [
      { publicId: 'tag-1', name: '역사' },
      { publicId: 'tag-2', name: '명소' },
    ],
  },
  {
    publicId: 'record-2',
    title: '북촌 한옥마을',
    content: '한국의 전통미를 느낄 수 있는 골목길 산책.',
    location: {
      name: '북촌 한옥마을',
      address: '서울특별시 종로구 계동길',
      latitude: 37.5821,
      longitude: 126.982,
    },
    createdAt: new Date('2025-12-14T11:00:00').toISOString(),
    updatedAt: new Date('2025-12-14T11:00:00').toISOString(),
    tags: [
      { publicId: 'tag-3', name: '문화' },
      { publicId: 'tag-4', name: '전통' },
    ],
  },
  {
    publicId: 'record-3',
    title: '서울숲 산책',
    content:
      '서울숲에서 보낸 평화로운 오후. 도심 속 대규모 녹지 공간은 언제나 힐링이 된다.',
    location: {
      name: '서울숲',
      address: '서울특별시 성동구 뚝섬로 273',
      latitude: 37.5446,
      longitude: 127.039,
    },
    createdAt: new Date('2025-12-13T09:00:00').toISOString(),
    updatedAt: new Date('2025-12-13T09:00:00').toISOString(),
    tags: [
      { publicId: 'tag-5', name: '자연' },
      { publicId: 'tag-6', name: '공원' },
    ],
  },
] as unknown as Record[];

const mockRecordDetail = {
  publicId: 'record-1',
  title: '경복궁 나들이',
  content:
    '경복궁에서 보낸 평화로운 오후. 단풍이 예쁘게 물들어 있었다. 도심 속 대규모 녹지 공간은 언제나 힐링이 된다.',
  location: {
    name: '경복궁',
    address: '서울특별시 종로구 사직로 161',
    latitude: 37.5796,
    longitude: 126.977,
  },
  createdAt: new Date('2025-12-15T14:30:00').toISOString(),
  updatedAt: new Date('2025-12-15T14:30:00').toISOString(),
  tags: [
    { publicId: 'tag-1', name: '역사' },
    { publicId: 'tag-2', name: '명소' },
  ],
  images: [
    {
      thumbnail: {
        url: 'https://images.unsplash.com/photo-1649709352876-1c594f16445c?q=80&w=600',
        width: 600,
        height: 400,
        size: 50000,
      },
      medium: {
        url: 'https://images.unsplash.com/photo-1649709352876-1c594f16445c?q=80&w=1200',
        width: 1200,
        height: 800,
        size: 150000,
      },
      original: {
        url: 'https://images.unsplash.com/photo-1649709352876-1c594f16445c?q=80&w=2400',
        width: 2400,
        height: 1600,
        size: 500000,
      },
    },
  ],
  connectionCount: 3,
} as unknown as RecordDetail;

// Mock 데이터를 설정하는 컴포넌트
function MainMapPageDesktopWithMockData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // KOREA_WIDE_BOUNDS를 roundBoundsToGrid로 반올림한 값으로 queryKey 생성
    const koreaBounds = {
      neLat: 38.6,
      neLng: 131.9,
      swLat: 33.1,
      swLng: 124.6,
    };
    const gridBounds = roundBoundsToGrid(koreaBounds);

    // 기록 목록 mock 데이터 설정 (여러 가능한 queryKey 형식에 대해 설정)
    const mockData = {
      records: mockRecords,
      totalCount: mockRecords.length,
    };

    // 정확한 gridBounds로 설정
    queryClient.setQueryData(['records', 'bounds', gridBounds], mockData);

    // 원본 bounds로도 설정 (혹시 모를 경우를 대비)
    queryClient.setQueryData(['records', 'bounds', koreaBounds], mockData);

    // null인 경우도 대비
    queryClient.setQueryData(['records', 'bounds', null], mockData);

    // 기록 상세 mock 데이터 설정
    queryClient.setQueryData(
      ['record', 'detail', 'record-1'],
      mockRecordDetail,
    );
    queryClient.setQueryData(['record', 'detail', 'record-2'], {
      ...mockRecordDetail,
      publicId: 'record-2',
      title: '북촌 한옥마을',
      content: '한국의 전통미를 느낄 수 있는 골목길 산책.',
    });
    queryClient.setQueryData(['record', 'detail', 'record-3'], {
      ...mockRecordDetail,
      publicId: 'record-3',
      title: '서울숲 산책',
      content:
        '서울숲에서 보낸 평화로운 오후. 도심 속 대규모 녹지 공간은 언제나 힐링이 된다.',
    });
  }, [queryClient]);

  return <MainMapPageDesktop />;
}

/**
 * 데스크톱 버전 (Mock 데이터 포함)
 */
export const DesktopWithMockData: Story = {
  render: () => <MainMapPageDesktopWithMockData />,
  parameters: {
    viewport: {
      viewports: {
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
        laptop: {
          name: 'Laptop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story:
          'Mock 데이터가 포함된 데스크톱 버전입니다. 기록 리스트가 표시되며, 기록을 클릭하면 사이드바가 기록 요약 패널로 전환됩니다.',
      },
    },
  },
};

// 초기 상태로 선택된 기록을 보여주는 컴포넌트
function MainMapPageDesktopWithSelectedRecord() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // KOREA_WIDE_BOUNDS를 roundBoundsToGrid로 반올림한 값으로 queryKey 생성
    const koreaBounds = {
      neLat: 38.6,
      neLng: 131.9,
      swLat: 33.1,
      swLng: 124.6,
    };
    const gridBounds = roundBoundsToGrid(koreaBounds);

    // 기록 목록 mock 데이터 설정 (여러 가능한 queryKey 형식에 대해 설정)
    const mockData = {
      records: mockRecords,
      totalCount: mockRecords.length,
    };

    // 정확한 gridBounds로 설정
    queryClient.setQueryData(['records', 'bounds', gridBounds], mockData);

    // 원본 bounds로도 설정 (혹시 모를 경우를 대비)
    queryClient.setQueryData(['records', 'bounds', koreaBounds], mockData);

    // null인 경우도 대비
    queryClient.setQueryData(['records', 'bounds', null], mockData);

    // 기록 상세 mock 데이터 설정
    queryClient.setQueryData(
      ['record', 'detail', 'record-1'],
      mockRecordDetail,
    );
    queryClient.setQueryData(['record', 'detail', 'record-2'], {
      ...mockRecordDetail,
      publicId: 'record-2',
      title: '북촌 한옥마을',
      content: '한국의 전통미를 느낄 수 있는 골목길 산책.',
    });
    queryClient.setQueryData(['record', 'detail', 'record-3'], {
      ...mockRecordDetail,
      publicId: 'record-3',
      title: '서울숲 산책',
      content:
        '서울숲에서 보낸 평화로운 오후. 도심 속 대규모 녹지 공간은 언제나 힐링이 된다.',
    });
  }, [queryClient]);

  return <MainMapPageDesktop />;
}

/**
 * 데스크톱 버전 (요약 패널 표시)
 * 기록 리스트에서 기록을 클릭하면 요약 패널로 전환됩니다.
 */
export const DesktopWithSummaryPanel: Story = {
  render: () => <MainMapPageDesktopWithSelectedRecord />,
  parameters: {
    viewport: {
      viewports: {
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
        laptop: {
          name: 'Laptop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story:
          'Mock 데이터가 포함된 데스크톱 버전입니다. 기록 리스트에서 기록을 클릭하면 사이드바가 기록 요약 패널로 전환됩니다.',
      },
    },
  },
};
