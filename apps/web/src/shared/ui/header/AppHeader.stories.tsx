import type { Meta, StoryObj } from '@storybook/react-vite';
import AppHeader from './AppHeader';

const meta = {
  title: 'Shared/UI/Header/AppHeader',
  component: AppHeader,
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
    onLogoClick: {
      action: 'logo clicked',
      description: '로고 버튼 클릭 핸들러',
    },
    onSearchClick: {
      action: 'search clicked',
      description: '검색 버튼 클릭 핸들러',
    },
    onFilterClick: {
      action: 'filter clicked',
      description: '필터 버튼 클릭 핸들러 (제공 시 필터 버튼 표시)',
      table: {
        type: { summary: '(() => void) | undefined' },
      },
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithSearchOnly: Story = {
  args: {
    onSearchClick: () => {
      /* empty */
    },
    onFilterClick: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: '검색 버튼만 있는 기본 헤더 (홈 페이지 등에서 사용)',
      },
    },
  },
};

export const WithActions: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          '로고 및 검색 버튼 클릭 이벤트는 Actions 패널에서 확인할 수 있습니다.',
      },
    },
  },
};
