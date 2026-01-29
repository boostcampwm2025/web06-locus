import { lazy, Suspense } from 'react';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import LoadingPage from '@/shared/ui/loading/LoadingPage';
import { getRandomLoadingVersion } from '@/shared/utils/loadingUtils';
import type { SettingsPageProps } from '../types';

const SettingsPageDesktop = lazy(
  () => import('./desktop/SettingsPage.desktop'),
);
const SettingsPageMobile = lazy(() => import('./mobile/SettingsPage.mobile'));

/**
 * SettingsPage 진입점
 * 기기 타입에 따라 모바일/데스크톱 버전을 분기합니다.
 */
export default function SettingsPage(props: SettingsPageProps) {
  const { isMobile } = useDeviceType();

  return (
    <Suspense fallback={<LoadingPage version={getRandomLoadingVersion()} />}>
      {isMobile ? (
        <SettingsPageMobile {...props} notificationEditable />
      ) : (
        <SettingsPageDesktop {...props} />
      )}
    </Suspense>
  );
}
