import { RecordWritePageMobile } from './mobile/RecordWritePage.mobile';
import { RecordWritePageDesktop } from './desktop/RecordWritePage.desktop';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import type { RecordWritePageProps } from '../types';

/**
 * RecordWritePage 진입점
 * 기기 타입에 따라 모바일/데스크톱 버전을 분기합니다.
 */
export default function RecordWritePage(props: RecordWritePageProps) {
  const { isMobile } = useDeviceType();

  return isMobile ? (
    <RecordWritePageMobile {...props} />
  ) : (
    <RecordWritePageDesktop {...props} />
  );
}
