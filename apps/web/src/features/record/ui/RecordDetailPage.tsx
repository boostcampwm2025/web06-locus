import { RecordDetailPageMobile } from './mobile/RecordDetailPage.mobile';
import { RecordDetailPageDesktop } from './desktop/RecordDetailPage.desktop';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import type { RecordDetailPageProps } from '@/features/record/types';

/**
 * RecordDetailPage 진입점
 * 기기 타입에 따라 모바일/데스크톱 버전을 분기합니다.
 */
export default function RecordDetailPage(props: RecordDetailPageProps) {
  const { isMobile } = useDeviceType();

  return isMobile ? (
    <RecordDetailPageMobile {...props} />
  ) : (
    <RecordDetailPageDesktop {...props} />
  );
}
