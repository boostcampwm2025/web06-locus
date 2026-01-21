import { Suspense, lazy } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import { ROUTES } from './routes';
import LoadingPage from '@/shared/ui/loading/LoadingPage';
import { getRandomLoadingVersion } from '@/shared/utils/loadingUtils';

// 라우트별 지연 로딩
const OAuthLoginPage = lazy(() => import('@/features/auth/ui/OAuthLoginPage'));
const OAuthCallbackPage = lazy(
  () => import('@/features/auth/ui/OAuthCallbackPage'),
);
const EmailLoginPage = lazy(() => import('@/features/auth/ui/EmailLoginPage'));
const EmailSignupPage = lazy(
  () => import('@/features/auth/ui/EmailSignupPage'),
);
const EmailVerifyPage = lazy(
  () => import('@/features/auth/ui/EmailVerifyPage'),
);
const MainMapPage = lazy(() => import('@/features/home/ui/MainMapPage'));
const RecordListPage = lazy(
  () => import('@/features/record/ui/RecordListPage'),
);
const RecordDetailPage = lazy(
  () => import('@/features/record/ui/RecordDetailPage'),
);
const RecordConnectionPage = lazy(
  () => import('@/features/connection/ui/RecordConnectionPage'),
);
const RecordWritePageRoute = lazy(() => import('./RecordWritePageRoute'));

// 로딩 폴백 컴포넌트
const RouteLoadingFallback = () => {
  const loadingVersion = getRandomLoadingVersion();
  return <LoadingPage version={loadingVersion} />;
};

/**
 * 페이지별 래퍼 컴포넌트들
 * 내부에서 lazy 컴포넌트를 사용하므로 Suspense로 감쌈
 */
function RecordDetailPageRoute() {
  useParams<{ id: string }>();
  const navigate = useNavigate();

  const mockRecord = {
    title: '경복궁 나들이',
    date: new Date('2025-12-15'),
    location: { name: '경복궁', address: '서울특별시 종로구 사직로 161' },
    tags: ['역사', '명소'],
    description: '경복궁 산책 기록...',
    imageUrl: 'https://placehold.co/400',
    connectionCount: 3,
    isFavorite: false,
  };

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <RecordDetailPage
        {...mockRecord}
        onBack={() => void navigate(ROUTES.RECORD_LIST)}
        // TODO: API 연동 후 구현 예정
        onFavoriteToggle={() => {
          void undefined;
        }}
        onMenuClick={() => {
          void undefined;
        }}
        onConnectionManage={() => {
          void undefined;
        }}
        onConnectionMode={() => void navigate(ROUTES.CONNECTION)}
      />
    </Suspense>
  );
}

function RecordConnectionPageRoute() {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <RecordConnectionPage
        onBack={() => void navigate(-1)}
        onConnect={(dep, arr) => {
          void navigate(ROUTES.HOME, {
            state: { connectedRecords: { fromId: dep, toId: arr } },
          });
        }}
      />
    </Suspense>
  );
}

/**
 * 최상위 Suspense를 활용한 전체 라우트 정의
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <OAuthLoginPage />
            </PublicRoute>
          }
        />
        <Route path={ROUTES.AUTH_CALLBACK} element={<OAuthCallbackPage />} />
        <Route
          path={ROUTES.EMAIL_LOGIN}
          element={
            <PublicRoute>
              <EmailLoginPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.EMAIL_SIGNUP}
          element={
            <PublicRoute>
              <EmailSignupPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.EMAIL_VERIFY}
          element={
            <PublicRoute>
              <EmailVerifyPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path={ROUTES.HOME}
          element={
            <ProtectedRoute>
              <MainMapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.RECORD}
          element={
            <ProtectedRoute>
              <RecordWritePageRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.RECORD_LIST}
          element={
            <ProtectedRoute>
              <RecordListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.RECORD_DETAIL}
          element={
            <ProtectedRoute>
              <RecordDetailPageRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CONNECTION}
          element={
            <ProtectedRoute>
              <RecordConnectionPageRoute />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Suspense>
  );
}
