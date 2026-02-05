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
import { useRecordGraphDetails } from '@/features/connection/hooks/useRecordGraphDetails';
import { useBlobPreviewStore } from '@/features/record/domain/blobPreviewStore';
import { logger } from '@/shared/utils/logger';
import { useToast } from '@/shared/ui/toast';
import { RECORD_PLACEHOLDER_IMAGE } from '@/shared/constants/record';
import type { RecordDetail, GraphDetailsResponse } from '@locus/shared';

/** GET /records/{publicId}/graph/details 응답의 data.records 배열 요소 타입 */
type GraphRecordDetail = GraphDetailsResponse['data']['records'][number];

function getGraphDetailsRecords(
  value: unknown,
): GraphRecordDetail[] | undefined {
  if (value == null || typeof value !== 'object') return undefined;
  const v = value as {
    status?: string;
    data?: { records?: GraphRecordDetail[] };
  };
  if (v.status === 'success' && Array.isArray(v.data?.records))
    return v.data.records;
  return undefined;
}

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

  // Blob URL 조회 (기록 생성 직후 첫 번째 이미지)
  const getBlobUrl = useBlobPreviewStore((state) => state.getBlobUrl);

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

  // 연결된 기록 상세 (제목·장소 등, D3 노드 제목·connectedRecords용)
  const { data: graphDetailsData } = useRecordGraphDetails(id ?? null, {
    enabled: !!id,
  });

  // 연결된 기록 목록 (graph/details → RecordDetailPage connectedRecords)
  const connectedRecordsFromApi = useMemo((): {
    id: string;
    title: string;
    location: { name: string; address: string };
    date: Date;
    tags: string[];
    imageUrl?: string;
  }[] => {
    const records = getGraphDetailsRecords(graphDetailsData);
    if (!records?.length) return [];

    return records.map((record: GraphRecordDetail) => ({
      id: record.publicId,
      title: record.title,
      location: {
        name: record.location?.name ?? '',
        address: record.location?.address ?? '',
      },
      date: new Date(record.createdAt),
      tags: (record.tags ?? []).map((tag: { name: string }) => tag.name),
      imageUrl: record.thumbnail?.url ?? RECORD_PLACEHOLDER_IMAGE,
    }));
  }, [graphDetailsData]);

  // D3 네트워크 뷰용: 노드에 제목 병합 (기준 기록 = recordDetail, 연결 = graph/details)
  const enrichedGraphNodes = useMemo(() => {
    const nodes = graphData?.data?.nodes;
    if (!nodes?.length) return undefined;

    const titleByPublicId = new Map<string, string>();
    if (id && recordDetail) titleByPublicId.set(id, recordDetail.title);

    for (const r of connectedRecordsFromApi) titleByPublicId.set(r.id, r.title);

    return nodes.map(
      (node: {
        publicId: string;
        location: { latitude: number; longitude: number };
      }) => ({
        ...node,
        title: titleByPublicId.get(node.publicId) ?? '제목 없음',
      }),
    );
  }, [graphData?.data?.nodes, id, recordDetail, connectedRecordsFromApi]);

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

  // Blob URL 사용
  const blobUrl = getBlobUrl(id ?? '');

  // API 응답을 RecordDetailPageProps로 변환
  // 이미지 URL 목록 (슬라이더용). Blob URL → medium 순으로 fallback
  const imageUrls =
    detail.images
      ?.map((img, index) => {
        // 첫 번째 이미지는 Blob URL 우선
        if (index === 0 && blobUrl) return blobUrl;

        // 나머지는 medium 사이즈
        return img.medium?.url;
      })
      .filter((url): url is string => Boolean(url)) ?? [];
  const thumbnailImageUrl =
    imageUrls.length > 0 ? imageUrls[0] : RECORD_PLACEHOLDER_IMAGE;

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
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
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

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <RecordDetailPage
        {...recordProps}
        connectedRecords={connectedRecordsFromApi}
        graphNodes={enrichedGraphNodes ?? graphData?.data?.nodes}
        graphEdges={graphData?.data?.edges}
        baseRecordPublicId={id}
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

  // 연결 그래프 조회 (D3 네트워크 뷰용 nodes/edges)
  const {
    data: graphData,
    isLoading: isGraphLoading,
    isError: isGraphError,
  } = useRecordGraph(id ?? null, {
    enabled: !!id,
  });

  // 연결된 기록 상세 조회 (제목·장소·태그·썸네일 등 목록용)
  const { data: graphDetailsData } = useRecordGraphDetails(id ?? null, {
    enabled: !!id,
  });

  // 연결된 기록 publicId 추출 (baseRecord.connectionCount, D3용)
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

  // 연결된 기록 목록: GET /records/{publicId}/graph/details 응답으로 변환
  const connectedRecords = useMemo((): {
    id: string;
    title: string;
    location: { name: string; address: string };
    date: Date;
    tags: string[];
    imageUrl?: string;
  }[] => {
    const records = getGraphDetailsRecords(graphDetailsData);
    if (!records?.length) return [];

    return records.map((record: GraphRecordDetail) => ({
      id: record.publicId,
      title: record.title,
      location: {
        name: record.location?.name ?? '',
        address: record.location?.address ?? '',
      },
      date: new Date(record.createdAt),
      tags: (record.tags ?? []).map((tag: { name: string }) => tag.name),
      imageUrl: record.thumbnail?.url ?? RECORD_PLACEHOLDER_IMAGE,
    }));
  }, [graphDetailsData]);

  // D3 네트워크 뷰용: graph API nodes에는 title 없음 → graph/details·기준 기록에서 병합
  const enrichedGraphNodes = useMemo(() => {
    const nodes = graphData?.data?.nodes;
    if (!nodes?.length) return undefined;
    const titleByPublicId = new Map<string, string>();
    if (id && recordDetail) titleByPublicId.set(id, recordDetail.title);
    for (const r of connectedRecords) titleByPublicId.set(r.id, r.title);
    return nodes.map(
      (node: {
        publicId: string;
        location: { latitude: number; longitude: number };
      }) => ({
        ...node,
        title: titleByPublicId.get(node.publicId) ?? '제목 없음',
      }),
    );
  }, [graphData?.data?.nodes, id, recordDetail, connectedRecords]);

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
        graphNodes={enrichedGraphNodes}
        graphEdges={graphData?.data?.edges}
        baseRecordPublicId={id}
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
