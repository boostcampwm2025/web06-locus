import { Suspense, lazy, useMemo } from 'react';
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
import { useGetRecordDetail } from '@/features/record/hooks/useGetRecordDetail';
import { useUpdateRecordFavorite } from '@/features/record/hooks/useUpdateRecordFavorite';
import { useRecordGraph } from '@/features/connection/hooks/useRecordGraph';
import { logger } from '@/shared/utils/logger';
import { useToast } from '@/shared/ui/toast';
import type { RecordDetail } from '@locus/shared';

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
const SettingsPage = lazy(() => import('@/features/settings/ui/SettingsPage'));

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
  const deleteRecordMutation = useDeleteRecord();
  const updateFavoriteMutation = useUpdateRecordFavorite();
  const { showToast } = useToast();

  // 기록 상세 조회
  const {
    data: recordDetail,
    isLoading,
    isError,
  } = useGetRecordDetail(id ?? null);

  // 연결 그래프 조회 (연결 개수 계산용)
  const { data: graphData } = useRecordGraph(id ?? null, {
    enabled: !!id,
  });

  if (!id) {
    logger.warn('기록 상세 페이지: ID가 없음');
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
  if (isError || !recordDetail) {
    logger.error(new Error('기록 상세 조회 실패'), {
      publicId: id,
      isError,
      hasData: !!recordDetail,
    });
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">기록을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 타입 단언 (useQuery의 타입 추론 문제 해결)
  const detail: RecordDetail = recordDetail;

  // 연결 개수 계산 (그래프 API의 edges에서 계산)
  const connectionCount =
    graphData?.data?.edges && id
      ? (() => {
          const connectedIds = new Set<string>();
          graphData.data.edges.forEach((edge) => {
            if (edge.fromRecordPublicId === id) {
              connectedIds.add(edge.toRecordPublicId);
            } else if (edge.toRecordPublicId === id) {
              connectedIds.add(edge.fromRecordPublicId);
            }
          });
          return connectedIds.size;
        })()
      : 0;

  // API 응답을 RecordDetailPageProps로 변환
  // 이미지가 있는 경우 첫 번째 이미지의 썸네일 URL 사용
  const thumbnailImageUrl =
    detail.images && detail.images.length > 0
      ? detail.images[0]?.medium.url
      : undefined;

  // 태그를 문자열 배열로 변환 (기존 타입 호환)
  const tags = (detail.tags ?? []).map((tag) => tag.name);

  const recordProps = {
    title: detail.title,
    date: new Date(detail.createdAt),
    location: {
      name: detail.location.name ?? '',
      address: detail.location.address ?? '',
    },
    tags,
    description: detail.content ?? '',
    imageUrl: thumbnailImageUrl,
    connectionCount,
    isFavorite: detail.isFavorite,
  };

  const handleDelete = () => {
    if (!id) return;

    void (async () => {
      try {
        await deleteRecordMutation.mutateAsync(id);
        // 삭제 성공 시 기록 목록으로 이동
        void navigate(ROUTES.RECORD_LIST);
      } catch (error) {
        logger.error(
          error instanceof Error ? error : new Error('기록 삭제 실패'),
          {
            publicId: id,
            component: 'RecordDetailPageRoute',
          },
        );
        showToast({
          variant: 'error',
          message: '기록 삭제에 실패했습니다.',
        });
      }
    })();
  };

  const handleFavoriteToggle = () => {
    if (!id || !recordDetail) return;

    const newFavoriteState = !recordDetail.isFavorite;

    void (async () => {
      try {
        await updateFavoriteMutation.mutateAsync({
          publicId: id,
          isFavorite: newFavoriteState,
        });
        showToast({
          variant: 'success',
          message: newFavoriteState
            ? '즐겨찾기에 추가되었습니다.'
            : '즐겨찾기에서 제거되었습니다.',
        });
      } catch (error) {
        logger.error(
          error instanceof Error ? error : new Error('즐겨찾기 변경 실패'),
          {
            publicId: id,
            isFavorite: newFavoriteState,
            component: 'RecordDetailPageRoute',
          },
        );
        showToast({
          variant: 'error',
          message: '즐겨찾기 변경에 실패했습니다.',
        });
      }
    })();
  };

  // 연결된 기록 목록 (API 연동 전이므로 빈 배열)
  // TODO: API 연동 후 graphData에서 연결된 기록 상세 정보를 가져와서 전달
  const connectedRecords: {
    id: string;
    title: string;
    location: { name: string; address: string };
    date: Date;
    tags: string[];
    imageUrl?: string;
  }[] = [];

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <RecordDetailPage
        {...recordProps}
        connectedRecords={connectedRecords}
        onBack={() => void navigate(ROUTES.RECORD_LIST)}
        onFavoriteToggle={handleFavoriteToggle}
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
        onRecordClick={(recordId) => {
          void navigate(generatePath(ROUTES.RECORD_DETAIL, { id: recordId }));
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

  // 기록 상세 조회 (baseRecord 정보용)
  const { data: recordDetail, isLoading: isRecordDetailLoading } =
    useGetRecordDetail(id ?? null);

  // 연결 그래프 조회
  const {
    data: graphData,
    isLoading: isGraphLoading,
    isError: isGraphError,
  } = useRecordGraph(id ?? null, {
    enabled: !!id,
  });

  // 연결된 기록 publicId 추출
  const connectedRecordIds = useMemo(() => {
    if (!graphData?.data?.edges || !id) return [];
    const connectedIds = new Set<string>();
    graphData.data.edges.forEach((edge) => {
      if (edge.fromRecordPublicId === id) {
        connectedIds.add(edge.toRecordPublicId);
      } else if (edge.toRecordPublicId === id) {
        connectedIds.add(edge.fromRecordPublicId);
      }
    });
    return Array.from(connectedIds);
  }, [graphData?.data?.edges, id]);

  // 연결된 기록 목록 변환 (그래프 API의 nodes에서 위치 정보만 사용)
  // TODO: 각 연결된 기록의 상세 정보를 개별 API로 가져와야 함.
  // 현재는 그래프 API의 nodes에서 위치 정보만 사용
  const connectedRecords = useMemo(() => {
    if (!graphData?.data?.nodes || connectedRecordIds.length === 0) return [];

    return connectedRecordIds
      .map((connectedId) => {
        const node = graphData.data.nodes.find(
          (n) => n.publicId === connectedId,
        );
        if (!node) return null;

        return {
          id: connectedId,
          title: '', // 그래프 API는 위치 정보만 제공
          location: {
            name: '', // 위치 정보는 있지만 name/address는 없음
            address: '',
          },
          date: new Date(), // 그래프 API에는 날짜 정보 없음
          tags: [], // 그래프 API에는 태그 정보 없음
          imageUrl: undefined,
        };
      })
      .filter(
        (record): record is NonNullable<typeof record> => record !== null,
      );
  }, [graphData?.data?.nodes, connectedRecordIds]);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">기록 ID가 없습니다.</p>
      </div>
    );
  }

  // 로딩 중
  if (isRecordDetailLoading || isGraphLoading) {
    return <RouteLoadingFallback />;
  }

  // 에러 처리
  if (isGraphError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">연결된 기록을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // baseRecord 정보 구성
  const baseRecord = recordDetail
    ? {
        id,
        title: recordDetail.title,
        location: {
          name: recordDetail.location.name ?? '',
          address: recordDetail.location.address ?? '',
        },
        date: new Date(recordDetail.createdAt),
        tags: (recordDetail.tags ?? []).map((tag) => tag.name),
        connectionCount: connectedRecordIds.length,
      }
    : {
        id,
        title: '',
        location: { name: '', address: '' },
        date: new Date(),
        tags: [],
        connectionCount: 0,
      };

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
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <SettingsPage />
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
