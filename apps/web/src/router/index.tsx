import { Suspense, lazy } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  generatePath,
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
const ConnectionManagementPage = lazy(
  () => import('@/features/connection/ui/ConnectionManagementPage'),
);
const RecordWritePageRoute = lazy(() => import('./RecordWritePageRoute'));
const OnboardingPage = lazy(
  () => import('@/features/onboarding/pages/OnboardingPage'),
);

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
  const { id } = useParams<{ id: string }>();
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
        // onMenuClick을 전달하지 않으면 내부에서 ActionSheet를 열도록 함
        onConnectionManage={() => {
          if (id) {
            void navigate(generatePath(ROUTES.CONNECTION_MANAGEMENT, { id }));
          }
        }}
        onConnectionMode={() => void navigate(ROUTES.CONNECTION)}
        onEdit={() => {
          // TODO: API 연동 후 구현 예정
        }}
        onDelete={() => {
          // TODO: API 연동 후 구현 예정
        }}
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

function ConnectionManagementPageRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: API 연동 후 실제 데이터 가져오기
  const mockBaseRecord = {
    id: id ?? '1',
    title: '서울숲 산책',
    location: {
      name: '서울숲',
      address: '서울특별시 성동구 뚝섬로 273',
    },
    date: new Date('2025-12-13'),
    tags: ['자연', '공원'],
    connectionCount: 5,
  };

  const mockConnectedRecords = [
    {
      id: '2',
      title: '경복궁 나들이',
      location: {
        name: '경복궁',
        address: '서울특별시 종로구 사직로 161',
      },
      date: new Date('2025-12-15'),
      tags: ['역사', '명소'],
      imageUrl: undefined,
    },
    {
      id: '3',
      title: '한옥의 고즈넉한 분위기와 골목길이 인',
      location: {
        name: '북촌 한옥마을',
        address: '서울특별시 종로구 계동길 37',
      },
      date: new Date('2025-12-14'),
      tags: ['문화', '전통'],
      imageUrl: undefined,
    },
    {
      id: '4',
      title: '이태원 맛집 탐방',
      location: {
        name: '이태원',
        address: '서울특별시 용산구 이태원로27길 26',
      },
      date: new Date('2025-12-12'),
      tags: ['음식', '맛집'],
      imageUrl: undefined,
    },
    {
      id: '5',
      title: '명동 스피',
      location: {
        name: '명동',
        address: '서울특별시 중구 명동길 26',
      },
      date: new Date('2025-12-11'),
      tags: ['쇼핑', '관광'],
      imageUrl: undefined,
    },
    {
      id: '6',
      title: '남산 타워 전망',
      location: {
        name: '남산타워',
        address: '서울특별시 용산구 남산공원길 105',
      },
      date: new Date('2025-12-10'),
      tags: ['전망', '관광'],
      imageUrl: undefined,
    },
  ];

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ConnectionManagementPage
        baseRecord={mockBaseRecord}
        connectedRecords={mockConnectedRecords}
        onBack={() => {
          if (id) {
            void navigate(generatePath(ROUTES.RECORD_DETAIL, { id }));
          } else {
            void navigate(-1);
          }
        }}
        onRecordClick={(recordId) => {
          void navigate(generatePath(ROUTES.RECORD_DETAIL, { id: recordId }));
        }}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onRecordRemove={(_recordId) => {
          // TODO: API 연동 후 구현
          void undefined;
        }}
      />
    </Suspense>
  );
}

function OnboardingPageRoute() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <OnboardingPage />
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
          path={ROUTES.ONBOARDING}
          element={
            <ProtectedRoute>
              <OnboardingPageRoute />
            </ProtectedRoute>
          }
        />
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
        <Route
          path={ROUTES.CONNECTION_MANAGEMENT}
          element={
            <ProtectedRoute>
              <ConnectionManagementPageRoute />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Suspense>
  );
}
