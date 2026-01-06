import type { Meta, StoryObj } from '@storybook/react-vite';
import RecordWritePage from './RecordWritePage';

const meta = {
  title: 'Features/Record/RecordWritePage',
  component: RecordWritePage,
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
        mobile3: {
          name: 'iPhone 14 Pro Max',
          styles: { width: '430px', height: '932px' },
        },
        mobile4: {
          name: 'Samsung Galaxy S20',
          styles: { width: '360px', height: '800px' },
        },
      },
      defaultViewport: 'mobile2',
    },
  },
  argTypes: {
    onSave: {
      action: '저장하기 클릭',
      description: '저장하기 버튼 클릭 핸들러',
    },
    onCancel: { action: '취소 클릭', description: '취소 버튼 클릭 핸들러' },
    onTakePhoto: {
      action: '사진 촬영 클릭',
      description: '사진 촬영 버튼 클릭 핸들러',
    },
    onSelectFromLibrary: {
      action: '라이브러리에서 선택 클릭',
      description: '라이브러리에서 선택 버튼 클릭 핸들러',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RecordWritePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialLocation: {
      name: '경복궁',
      address: '서울시 종로구 사직로 161',
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSave: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onTakePhoto: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSelectFromLibrary: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          '기록 작성 페이지입니다. 상단에는 지도가 표시되고, 하단에는 메모, 이미지, 태그 입력 폼이 있습니다.',
      },
    },
  },
};

export const WithDifferentLocation: Story = {
  args: {
    initialLocation: {
      name: '서울숲',
      address: '서울특별시 성동구 뚝섬로 273',
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSave: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onTakePhoto: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSelectFromLibrary: () => {},
  },
  parameters: {
    docs: { description: { story: '다른 위치 정보를 표시하는 예시입니다.' } },
  },
};

export const WithLongLocationName: Story = {
  args: {
    initialLocation: {
      name: '남산타워 (N서울타워)',
      address: '서울특별시 용산구 남산공원길 105',
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSave: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onTakePhoto: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSelectFromLibrary: () => {},
  },
  parameters: {
    docs: { description: { story: '긴 위치 이름을 표시하는 예시입니다.' } },
  },
};
