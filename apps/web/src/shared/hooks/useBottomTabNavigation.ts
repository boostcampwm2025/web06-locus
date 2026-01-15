import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import type { TabId } from '@/shared/types/navigation';

/**
 * 바텀 탭 네비게이션을 처리하는 커스텀 훅
 * 홈/기록 탭 간 이동 로직을 중앙화
 */
export function useBottomTabNavigation() {
  const navigate = useNavigate();

  const handleTabChange = (tabId: TabId) => {
    if (tabId === 'home') {
      void navigate(ROUTES.HOME);
    } else if (tabId === 'record') {
      void navigate(ROUTES.RECORD_LIST);
    }
  };

  return { handleTabChange };
}
