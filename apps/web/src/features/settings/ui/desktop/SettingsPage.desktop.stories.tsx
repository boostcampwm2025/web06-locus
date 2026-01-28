import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import SettingsPageDesktop from './SettingsPage.desktop';

const meta = {
  title: 'Features/Settings/Desktop/SettingsPage',
  component: SettingsPageDesktop,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '데스크톱용 설정 페이지. 프로필 정보, 알림 설정, 태그 관리를 포함합니다.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SettingsPageDesktop>;

export default meta;

/**
 * 기본 설정 페이지
 * 모든 탭과 기능이 포함된 전체 설정 페이지입니다.
 */
export const Default: StoryObj = {
  render: () => {
    return <SettingsPageDesktop onClose={fn()} onLogout={fn()} />;
  },
};
