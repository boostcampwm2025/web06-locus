import type { Meta, StoryObj } from '@storybook/react-vite';
import RecordDetailPage from './RecordDetailPage';
import { RecordDetailPageMobile } from './mobile/RecordDetailPage.mobile';
import { RecordDetailPageDesktop } from './desktop/RecordDetailPage.desktop';

const meta = {
  title: 'Features/Record/RecordDetailPage',
  component: RecordDetailPage,
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
    isFavorite: {
      control: 'boolean',
      description: '즐겨찾기 여부',
    },
    onBack: {
      action: 'back clicked',
      description: '뒤로가기 버튼 클릭 핸들러',
    },
    onFavoriteToggle: {
      action: 'favorite toggled',
      description: '즐겨찾기 토글 핸들러',
    },
    onMenuClick: {
      action: 'menu clicked',
      description: '메뉴 버튼 클릭 핸들러',
    },
    onConnectionManage: {
      action: 'connection manage clicked',
      description: '연결 관리 버튼 클릭 핸들러',
    },
    onConnectionMode: {
      action: 'connection mode clicked',
      description: '연결 모드 버튼 클릭 핸들러',
    },
  },
} satisfies Meta<typeof RecordDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  title: '명동 쇼핑',
  date: new Date('2025-12-10'),
  location: {
    name: '명동',
    address: '서울특별시 중구 명동길',
  },
  tags: ['쇼핑', '명소'],
  description: `주말 명동은 역시 사람이 많다. 쇼핑하기 좋은 곳.

화장품과 옷을 사러 명동에 갔다. 사람이 많긴 했지만 구경할 게 많아서 좋았다.`,
  connectionCount: 5,
  isFavorite: false,
};

export const WithImage: Story = {
  args: {
    ...defaultArgs,
    imageUrl: 'https://placehold.co/400x300',
  },
  parameters: {
    docs: {
      description: {
        story: '이미지가 있는 기록 상세 페이지 (part-image.png 참고)',
      },
    },
  },
};

export const WithoutImage: Story = {
  args: {
    ...defaultArgs,
    title: '서울숲 산책',
    date: new Date('2025-12-13'),
    location: {
      name: '서울숲',
      address: '서울특별시 성동구 뚝섬로 273',
    },
    tags: ['자연', '공원'],
    description: `가을 단풍이 아름다운 서울숲. 사슴도 보고 여유로운 시간을 보냈다.

주말 오후에 서울숲을 찾았다. 단풍이 절정이어서 사진 찍기 좋았고, 사슴우리에서 사슴들에게 먹이도 주었다. 가족 단위 방문객들이 많았고, 피크닉을 즐기는 사람들도 보였다.`,
    connectionCount: 5,
  },
  parameters: {
    docs: {
      description: {
        story: '이미지가 없는 기록 상세 페이지 (part-text.png 참고)',
      },
    },
  },
};

export const WithFavorite: Story = {
  args: {
    ...defaultArgs,
    imageUrl: 'https://placehold.co/400x300',
    isFavorite: true,
  },
  parameters: {
    docs: {
      description: {
        story: '즐겨찾기가 활성화된 상태',
      },
    },
  },
};

export const LongDescription: Story = {
  args: {
    ...defaultArgs,
    title: '경복궁 나들이',
    date: new Date('2025-12-15'),
    location: {
      name: '경복궁',
      address: '서울특별시 종로구 사직로 161',
    },
    tags: ['역사', '명소', '문화'],
    description: `경복궁은 조선 왕조 제1의 법궁으로 태조 4년(1395)에 창건되었다. '경복(景福)'은 시경에 나오는 말로 왕과 그 자손, 그리고 모든 백성들이 태평성대의 큰 복을 누리기를 축원한다는 의미다.

이번 방문에서는 특히 근정전의 웅장함과 경회루의 아름다움에 감탄했다. 가을 단풍이 한창이라 궁궐의 고즈넉한 분위기와 잘 어울렸다. 많은 관광객들이 있었지만, 각 전각을 천천히 둘러보며 조선시대의 역사를 느낄 수 있어 좋았다.

특히 수문장 교대식이 인상적이었고, 궁궐 내부의 정원도 잘 관리되어 있어 산책하기 좋았다. 다음에는 봄에 벚꽃이 필 때 다시 방문하고 싶다.`,
    connectionCount: 3,
    imageUrl: 'https://placehold.co/400x300',
  },
  parameters: {
    docs: {
      description: {
        story: '긴 설명 텍스트가 있는 경우 (이미지와 설명 부분만 스크롤)',
      },
    },
  },
};

export const VeryLongDescription: Story = {
  args: {
    ...defaultArgs,
    title: '한강 파크 나들이',
    date: new Date('2025-12-20'),
    location: {
      name: '여의도 한강공원',
      address: '서울특별시 영등포구 여의도동',
    },
    tags: ['자연', '공원', '피크닉', '산책'],
    description: `오늘은 한강 파크로 나들이를 갔다. 날씨가 정말 좋아서 많은 사람들이 나와 있었다.

한강공원은 서울에서 가장 인기 있는 휴식 공간 중 하나다. 넓은 잔디밭과 자전거 도로, 그리고 한강을 따라 이어지는 산책로가 있어 다양한 활동을 즐길 수 있다.

오늘은 특히 피크닉을 즐기는 사람들이 많았다. 대형 매트를 펼치고 도시락을 먹으며 대화를 나누는 모습이 평화로워 보였다. 아이들이 자유롭게 뛰어놀 수 있는 공간도 넉넉해서 가족 단위 방문객들이 많았다.

한강의 풍경도 정말 아름다웠다. 잔잔한 물결과 하늘에 떠 있는 구름, 그리고 멀리 보이는 다리들이 그림 같았다. 석양이 지기 시작할 무렵에는 노을이 한강에 비쳐 더욱 아름다운 풍경을 만들어냈다.

야외 공연도 진행되고 있어 많은 사람들이 모여 있었다. 바람에 흔들리는 깃발들과 함께 흘러나오는 음악이 분위기를 더욱 좋게 만들었다.

다음에는 자전거를 타고 한강을 따라 더 멀리 가보고 싶다. 봄이 오면 벚꽃이 만개하는 벚꽃길도 놓치지 않고 가봐야겠다. 한강은 정말 서울에서 가장 소중한 공간 중 하나인 것 같다.`,
    connectionCount: 7,
    imageUrl: 'https://placehold.co/400x600',
  },
  parameters: {
    docs: {
      description: {
        story: '매우 긴 설명 텍스트가 있는 경우 (스크롤 확인용)',
      },
    },
  },
};

export const ManyTags: Story = {
  args: {
    ...defaultArgs,
    tags: ['쇼핑', '명소', '음식', '문화', '관광', '도시'],
    imageUrl: 'https://placehold.co/400x300',
  },
  parameters: {
    docs: {
      description: {
        story: '태그가 많은 경우 (+N 표시)',
      },
    },
  },
};

/**
 * 모바일 버전
 */
export const Mobile: Story = {
  render: (args) => <RecordDetailPageMobile {...args} />,
  args: {
    ...defaultArgs,
    imageUrl: 'https://placehold.co/400x300',
  },
  parameters: {
    viewport: {
      viewports: {
        mobile2: {
          name: 'iPhone 12/13',
          styles: {
            width: '390px',
            height: '844px',
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

/**
 * 데스크톱 버전
 */
export const Desktop: Story = {
  render: (args) => <RecordDetailPageDesktop {...args} />,
  args: {
    ...defaultArgs,
    imageUrl: 'https://placehold.co/1200x500',
  },
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
      },
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: '데스크톱 버전 UI입니다. 전체 화면 오버레이 형태로 표시됩니다.',
      },
    },
  },
};
