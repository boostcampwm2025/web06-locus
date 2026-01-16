import {
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from 'react-router-dom';
import OAuthLoginPage from '@/features/auth/ui/OAuthLoginPage';
import OAuthCallbackPage from '@/features/auth/ui/OAuthCallbackPage';
import EmailLoginPage from '@/features/auth/ui/EmailLoginPage';
import EmailSignupPage from '@/features/auth/ui/EmailSignupPage';
import EmailVerifyPage from '@/features/auth/ui/EmailVerifyPage';
import MainMapPage from '@/features/home/ui/MainMapPage';
import RecordListPage from '@/features/record/ui/RecordListPage';
import RecordDetailPage from '@/features/record/ui/RecordDetailPage';
import RecordConnectionPage from '@/features/connection/ui/RecordConnectionPage';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import RecordWritePageRoute from './RecordWritePageRoute';
import { ROUTES } from './routes';

/**
 * RecordDetailPage 라우트 래퍼
 * URL 파라미터에서 recordId를 가져와서 처리
 */
function RecordDetailPageRoute() {
  useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: 실제 API에서 기록 데이터를 가져와야 함
  // 현재는 mock 데이터 사용
  const mockRecord = {
    title: '경복궁 나들이',
    date: new Date('2025-12-15'),
    location: { name: '경복궁', address: '서울특별시 종로구 사직로 161' },
    tags: ['역사', '명소'],
    description:
      '경복궁에서 산책하며 느낀 생각들\n\n자연 속에서 걷다 보면 마음이 편안해진다.',
    imageUrl: 'https://placehold.co/400',
    connectionCount: 3,
    isFavorite: false,
  };

  return (
    <RecordDetailPage
      title={mockRecord.title}
      date={mockRecord.date}
      location={mockRecord.location}
      tags={mockRecord.tags}
      description={mockRecord.description}
      imageUrl={mockRecord.imageUrl}
      connectionCount={mockRecord.connectionCount}
      isFavorite={mockRecord.isFavorite}
      onBack={() => void navigate(ROUTES.RECORD_LIST)}
      onFavoriteToggle={() => {
        // TODO: 즐겨찾기 토글 구현
      }}
      onMenuClick={() => {
        // TODO: 메뉴 클릭 구현
      }}
      onConnectionManage={() => {
        // TODO: 연결 관리 구현
      }}
      onConnectionMode={() => void navigate(ROUTES.CONNECTION)}
    />
  );
}

/**
 * RecordConnectionPage 라우트 래퍼
 */
function RecordConnectionPageRoute() {
  const navigate = useNavigate();

  return (
    <RecordConnectionPage
      onBack={() => void navigate(-1)}
      onConnect={(departureId, arrivalId) => {
        // 연결 완료 후 홈으로 이동하며 연결된 기록 ID 전달
        void navigate(ROUTES.HOME, {
          state: {
            connectedRecords: {
              fromId: departureId,
              toId: arrivalId,
            },
          },
        });
      }}
    />
  );
}

/**
 * 애플리케이션의 모든 라우트를 정의합니다.
 */
export function AppRoutes() {
  return (
    <Routes>
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
  );
}
