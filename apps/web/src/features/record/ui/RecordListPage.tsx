import { Navigate } from 'react-router-dom';
import { RecordListPageMobile } from './mobile/RecordListPage.mobile';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { ROUTES } from '@/router/routes';
import type { RecordListPageProps } from './mobile/RecordListPage.mobile';

/**
 * RecordListPage 진입점
 * 기기 타입에 따라 모바일/데스크톱 버전을 분기합니다.
 * Desktop에서는 MainMapPage로 리다이렉트합니다.
 */
export default function RecordListPage(props: RecordListPageProps) {
  const { isMobile } = useDeviceType();

  // Desktop에서는 MainMapPage로 리다이렉트
  if (!isMobile) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <RecordListPageMobile {...props} />;
}
