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
import { useDeleteRecord } from '@/features/record/hooks/useDeleteRecord';
import { useGetRecordsByBounds } from '@/features/record/hooks/useGetRecordsByBounds';
import { useRecordGraph } from '@/features/connection/hooks/useRecordGraph';
import type { Record as ApiRecord } from '@locus/shared';

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

// 한국 전체를 커버하는 넓은 bounds (기록 상세 조회용)
const KOREA_WIDE_BOUNDS = {
  neLat: 38.6,
  neLng: 131.9,
  swLat: 33.1,
  swLng: 124.6,
  page: 1,
  limit: 100,
  sortOrder: 'desc' as const,
};

/**
 * 페이지별 래퍼 컴포넌트들
 * 내부에서 lazy 컴포넌트를 사용하므로 Suspense로 감쌈
 */
function RecordDetailPageRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deleteRecordMutation = useDeleteRecord();

  // 전체 기록 목록 가져오기 (bounds 기반 조회)
  const {
    data: recordsByBoundsData,
    isLoading,
    isError,
  } = useGetRecordsByBounds(KOREA_WIDE_BOUNDS);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">기록 ID가 없습니다.</p>
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return <RouteLoadingFallback />;
  }

  // 에러 또는 데이터 없음
  if (isError || !recordsByBoundsData?.records) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">기록을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 해당 기록 찾기
  const record = recordsByBoundsData.records.find(
    (r: ApiRecord) => r.publicId === id,
  );

  if (!record) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">기록을 찾을 수 없습니다.</p>
      </div>
    );
  }

  // API 응답을 RecordDetailPageProps로 변환
  // 이미지가 있는 경우 첫 번째 이미지의 medium URL 사용
  const recordWithImages = record as ApiRecord & {
    images?: {
      thumbnail: { url: string };
      medium: { url: string };
      original: { url: string };
    }[];
    isFavorite?: boolean;
  };
  const mediumImageUrl =
    recordWithImages.images && recordWithImages.images.length > 0
      ? recordWithImages.images[0].medium.url
      : undefined;

  const recordProps = {
    title: record.title,
    date: new Date(record.createdAt),
    location: {
      name: record.location.name ?? '',
      address: record.location.address ?? '',
    },
    tags: record.tags,
    description: record.content ?? '',
    imageUrl: mediumImageUrl,
    connectionCount: 0, // TODO: 그래프 API로 연결 개수 가져오기
    isFavorite: recordWithImages.isFavorite ?? false,
  };

  const handleDelete = () => {
    if (!id) return;

    void (async () => {
      try {
        await deleteRecordMutation.mutateAsync(id);
        // 삭제 성공 시 기록 목록으로 이동
        void navigate(ROUTES.RECORD_LIST);
      } catch (error) {
        console.error('기록 삭제 실패:', error);
        // TODO: 에러 토스트 표시
      }
    })();
  };

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <RecordDetailPage
        {...recordProps}
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
          void handleDelete();
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

  // 연결 그래프 조회
  const {
    data: graphData,
    isLoading: isGraphLoading,
    isError: isGraphError,
  } = useRecordGraph(id ?? null);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">기록 ID가 없습니다.</p>
      </div>
    );
  }

  // 그래프 데이터 로딩 중
  if (isGraphLoading) {
    return <RouteLoadingFallback />;
  }

  // 그래프 데이터 에러
  if (isGraphError || !graphData?.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">연결된 기록을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 시작 노드 찾기
  const startNode = graphData.data.nodes.find((node) => node.publicId === id);

  // 연결된 기록 목록 (시작 노드 제외)
  const connectedNodeIds = new Set(
    graphData.data.edges.flatMap((edge) => {
      const ids: string[] = [];
      if (edge.fromRecordPublicId === id) {
        ids.push(edge.toRecordPublicId);
      }
      if (edge.toRecordPublicId === id) {
        ids.push(edge.fromRecordPublicId);
      }
      return ids;
    }),
  );

  const connectedNodes = graphData.data.nodes.filter(
    (node) => node.publicId !== id && connectedNodeIds.has(node.publicId),
  );

  // TODO: 각 연결된 기록의 상세 정보(제목, 태그 등)를 가져오는 API 호출 필요
  // 현재는 위치 정보만 사용
  const baseRecord = {
    id,
    title: '', // TODO: GET /records/:id로 상세 정보 가져오기
    location: startNode
      ? {
          name: '', // TODO: 역지오코딩 또는 상세 정보에서 가져오기
          address: '', // TODO: 역지오코딩 또는 상세 정보에서 가져오기
        }
      : {
          name: '',
          address: '',
        },
    date: new Date(), // TODO: 상세 정보에서 가져오기
    tags: [], // TODO: 상세 정보에서 가져오기
    connectionCount: connectedNodes.length,
  };

  const connectedRecords: {
    id: string;
    title: string;
    location: { name: string; address: string };
    date: Date;
    tags: string[];
    imageUrl?: string;
  }[] = []; // TODO: API에서 가져올 데이터

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ConnectionManagementPage
        baseRecord={baseRecord}
        connectedRecords={connectedRecords}
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
        <Route
          path={ROUTES.AUTH_CALLBACK}
          element={
            <PublicRoute>
              <OAuthCallbackPage />
            </PublicRoute>
          }
        />
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
          path={ROUTES.RECORD}
          element={
            <ProtectedRoute>
              <RecordWritePageRoute />
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
        <Route
          path={ROUTES.ONBOARDING}
          element={
            <ProtectedRoute>
              <OnboardingPageRoute />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Suspense>
  );
}
