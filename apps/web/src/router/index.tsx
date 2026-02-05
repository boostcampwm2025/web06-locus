import { Suspense, lazy, useMemo, useState, useCallback } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/shared/utils/logger';
import { useToast } from '@/shared/ui/toast';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
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

/** 1-depth 노드/엣지 빌드 (graph/details + 기준 기록) */
function buildDetailGraph(
  baseId: string,
  baseRecord: {
    title: string;
    location?: { latitude?: number; longitude?: number };
  },
  detailsRecords: GraphRecordDetail[],
): {
  nodes: {
    publicId: string;
    location: { latitude: number; longitude: number };
    title?: string;
  }[];
  edges: { fromRecordPublicId: string; toRecordPublicId: string }[];
} {
  const baseLat = baseRecord.location?.latitude ?? 0;
  const baseLng = baseRecord.location?.longitude ?? 0;
  const nodes = [
    {
      publicId: baseId,
      location: { latitude: baseLat, longitude: baseLng },
      title: baseRecord.title,
    },
    ...detailsRecords.map((r) => ({
      publicId: r.publicId,
      location: {
        latitude: r.location?.latitude ?? 0,
        longitude: r.location?.longitude ?? 0,
      },
      title: r.title,
    })),
  ];
  const edges = detailsRecords.map((r) => ({
    fromRecordPublicId: baseId,
    toRecordPublicId: r.publicId,
  }));
  return { nodes, edges };
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

  const queryClient = useQueryClient();

  // 기록 상세 조회
  const {
    data: recordDetail,
    isLoading,
    isError,
  } = useGetRecordDetail(id ?? null);

  // 초기엔 1-depth(Details)만 사용, "더 넓게 탐색" 시 전체 Graph 조회
  const [graphScope, setGraphScope] = useState<'detail' | 'full'>('detail');
  const { data: graphData } = useRecordGraph(id ?? null, {
    enabled: !!id && graphScope === 'full',
  });

  // 연결된 기록 상세 (1-depth, D3 초기 뷰·connectedRecords·제목 병합용)
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

  // 1-depth D3용 노드/엣지 (초기 진입)
  const detailGraph = useMemo(() => {
    const records = getGraphDetailsRecords(graphDetailsData);
    if (!id || !recordDetail) return { nodes: [], edges: [] };
    return buildDetailGraph(id, recordDetail, records ?? []);
  }, [id, recordDetail, graphDetailsData]);

  // 전체 Graph D3용: 노드에 제목 병합 ("더 넓게 탐색" 후)
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

  const handleToggleGraphScope = useCallback(() => {
    setGraphScope((prev) => {
      const next = prev === 'detail' ? 'full' : 'detail';
      if (next === 'full' && id) {
        void queryClient.invalidateQueries({ queryKey: ['record-graph', id] });
      }
      return next;
    });
  }, [id, queryClient]);

  // 전체 그래프 로딩 중에는 1-depth 유지
  const graphNodes =
    graphScope === 'full'
      ? (enrichedGraphNodes ?? graphData?.data?.nodes ?? detailGraph.nodes)
      : detailGraph.nodes;
  const graphEdges =
    graphScope === 'full'
      ? (graphData?.data?.edges ?? detailGraph.edges)
      : detailGraph.edges;

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

  // 연결 개수 (1-depth details 기준)
  const connectionCount = connectedRecordsFromApi.length;

  // API 응답을 RecordDetailPageProps로 변환
  // 이미지 URL 목록 (슬라이더용). medium 사이즈 사용
  const imageUrls =
    detail.images?.map((img) => img.medium?.url).filter(Boolean) ?? [];
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
        graphNodes={graphNodes?.length ? graphNodes : undefined}
        graphEdges={graphEdges?.length ? graphEdges : undefined}
        baseRecordPublicId={id}
        onExpandGraph={handleToggleGraphScope}
        isGraphExpanded={graphScope === 'full'}
        onBack={() => void navigate(ROUTES.RECORD_LIST)}
        onFavoriteToggle={handleFavoriteToggle}
        // onMenuClick을 전달하지 않으면 내부에서 ActionSheet를 열도록 함
        onConnectionManage={() => {
          if (id) {
            void navigate(generatePath(ROUTES.CONNECTION_MANAGEMENT, { id }));
          }
        }}
        onConnectionMode={() =>
          void navigate(ROUTES.CONNECTION, {
            state: {
              fromRecord: {
                id,
                title: recordProps.title,
                location: recordProps.location,
              },
            },
          })
        }
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
  const { isMobile } = useDeviceType();

  // 연결 모드는 모바일 전용. 데스크톱에서는 홈(지도)으로 이동
  if (!isMobile) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

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
  const queryClient = useQueryClient();
  const { isMobile } = useDeviceType();

  // 기록 상세 조회 (baseRecord 정보용)
  const { data: recordDetail, isLoading: isRecordDetailLoading } =
    useGetRecordDetail(id ?? null);

  // 초기엔 1-depth(Details)만 사용, "더 넓게 탐색" 시 전체 Graph 조회
  const [graphScope, setGraphScope] = useState<'detail' | 'full'>('detail');
  const {
    data: graphData,
    isLoading: isGraphLoading,
    isError: isGraphError,
  } = useRecordGraph(id ?? null, {
    enabled: !!id && graphScope === 'full',
  });

  // 연결된 기록 상세 조회 (1-depth, 목록·D3 초기 뷰용)
  const { data: graphDetailsData } = useRecordGraphDetails(id ?? null, {
    enabled: !!id,
  });

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

  // 1-depth D3용 노드/엣지 (초기 진입)
  const detailGraph = useMemo(() => {
    const records = getGraphDetailsRecords(graphDetailsData);
    if (!id || !recordDetail) return { nodes: [], edges: [] };
    return buildDetailGraph(id, recordDetail, records ?? []);
  }, [id, recordDetail, graphDetailsData]);

  // 전체 Graph D3용 ("더 넓게 탐색" 후)
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

  const handleToggleGraphScope = useCallback(() => {
    setGraphScope((prev) => {
      const next = prev === 'detail' ? 'full' : 'detail';
      if (next === 'full' && id) {
        void queryClient.invalidateQueries({ queryKey: ['record-graph', id] });
      }
      return next;
    });
  }, [id, queryClient]);

  // 전체 그래프 로딩 중에는 1-depth 유지
  const graphNodes =
    graphScope === 'full'
      ? (enrichedGraphNodes ?? graphData?.data?.nodes ?? detailGraph.nodes)
      : detailGraph.nodes;
  const graphEdges =
    graphScope === 'full'
      ? (graphData?.data?.edges ?? detailGraph.edges)
      : detailGraph.edges;

  const hasGraphData = graphNodes?.length && graphEdges?.length;

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">기록 ID가 없습니다.</p>
      </div>
    );
  }

  // 연결 관리 페이지는 모바일 전용. 데스크톱에서는 기록 상세로 이동
  if (!isMobile) {
    return <Navigate to={generatePath(ROUTES.RECORD_DETAIL, { id })} replace />;
  }

  // 로딩 중 (details만 기다림; full graph는 확장 시 로딩)
  if (isRecordDetailLoading) {
    return <RouteLoadingFallback />;
  }

  // 전체 그래프 로딩 중 (확장 후)
  if (graphScope === 'full' && isGraphLoading) {
    return <RouteLoadingFallback />;
  }

  // 에러 처리 (전체 그래프 확장 후 실패 시)
  if (graphScope === 'full' && isGraphError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">연결된 기록을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // baseRecord 정보 구성 (연결 개수 = details 기준)
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
        connectionCount: connectedRecords.length,
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
        graphNodes={hasGraphData ? graphNodes : undefined}
        graphEdges={hasGraphData ? graphEdges : undefined}
        baseRecordPublicId={id}
        onExpandGraph={handleToggleGraphScope}
        isGraphExpanded={graphScope === 'full'}
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
