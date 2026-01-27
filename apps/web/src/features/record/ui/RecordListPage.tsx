import { RecordListPageMobile } from './mobile/RecordListPage.mobile';
import { RecordListPageDesktop } from './desktop/RecordListPage.desktop';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import type { RecordListPageProps } from './mobile/RecordListPage.mobile';

/**
 * RecordListPage 진입점
 * 기기 타입에 따라 모바일/데스크톱 버전을 분기합니다.
 */
export default function RecordListPage(props: RecordListPageProps) {
  const { isMobile } = useDeviceType();

  return isMobile ? (
    <RecordListPageMobile {...props} />
  ) : (
    <RecordListPageDesktop {...props} />
  );
}
