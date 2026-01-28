import { MainMapPageMobile } from './mobile/MainMapPage.mobile';
import { MainMapPageDesktop } from './desktop/MainMapPage.desktop';
import { useDeviceType } from '@/shared/hooks/useDeviceType';

/**
 * MainMapPage 진입점
 * 기기 타입에 따라 모바일/데스크톱 버전을 분기합니다.
 */
export default function MainMapPage() {
  const { isMobile } = useDeviceType();

  return isMobile ? <MainMapPageMobile /> : <MainMapPageDesktop />;
}
