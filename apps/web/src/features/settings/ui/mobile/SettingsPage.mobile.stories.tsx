import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import SettingsPageMobile from './SettingsPage.mobile';

const meta = {
  title: 'Features/Settings/Mobile/SettingsPage',
  component: SettingsPageMobile,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component:
          '모바일용 설정 페이지. 프로필 정보, 알림 설정, 태그 관리를 포함합니다.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SettingsPageMobile>;

export default meta;

/**
 * 기본 설정 페이지
 * 모든 탭과 기능이 포함된 전체 설정 페이지입니다.
 */
export const Default: StoryObj = {
  render: () => {
    return <SettingsPageMobile onClose={fn()} onLogout={fn()} />;
  },
};
