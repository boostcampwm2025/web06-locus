import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RecordWritePage from '@/features/record/ui/RecordWritePage';
import type { Record, Location, Coordinates } from '@/features/record/types';
import LoadingPage from '@/shared/ui/loading';
import { getRandomLoadingVersion } from '@/shared/utils/loadingUtils';
import { ROUTES } from './routes';

/**
 * React Router location state의 타입 정의
 * TODO: zod로 타입 검증
 */
interface LocationState {
  location?: {
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
}

/**
 * RecordWritePage를 라우터에 연결하기 위한 래퍼 컴포넌트
 * 하이브리드 방식으로 위치 정보를 가져옵니다:
 * 1. state에서 가져오기 (우선순위, 즉시 사용 가능)
 * 2. locationId로 API 호출 (새로고침/북마크 대비, 현재는 미구현)
 * 3. 쿼리 파라미터 (하위 호환성)
 */
export default function RecordWritePageRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const loadingVersionRef = useRef(getRandomLoadingVersion());

  const locationId = searchParams.get('locationId');

  const stateLocation = (location.state as LocationState | null)?.location;
  const locationFromState = getLocationFromState(stateLocation);

  const locationFromQuery = getLocationFromQueryParams(searchParams);

  // 위치 정보가 전혀 없으면 홈으로 리다이렉트
  const hasAnyLocationInfo = Boolean(locationFromState ?? locationFromQuery);
  const shouldRedirect = !locationId && !hasAnyLocationInfo;

  useEffect(() => {
    if (shouldRedirect) {
      void navigate(ROUTES.HOME, { replace: true });
    }
  }, [navigate, shouldRedirect]);

  // locationId로 위치 정보 가져오기 (현재는 미구현)
  // locationId가 있는데 state가 없으면 로딩 페이지 표시 (API 호출 대기)
  if (locationId && !locationFromState) {
    // TODO: locationId로 API 호출하여 위치 정보 가져오기
    return <LoadingPage version={loadingVersionRef.current} />;
  }

  if (shouldRedirect) {
    return <LoadingPage version={loadingVersionRef.current} />;
  }

  const initialLocation: Location = locationFromState ??
    locationFromQuery ?? {
      name: '현재 위치',
      address: '',
    };

  const coordinatesFromState = getCoordinatesFromState(stateLocation);
  const coordinatesFromQuery = getCoordinatesFromQueryParams(
    searchParams,
    locationId,
  );

  const initialCoordinates: Coordinates | undefined =
    coordinatesFromState ?? coordinatesFromQuery ?? undefined;

  const handleSave = (record: Record) => {
    // 저장 후 메인 페이지로 이동 (저장된 record를 state로 전달)
    void navigate(ROUTES.HOME, {
      replace: true,
      state: { savedRecord: record },
    });
  };

  const handleCancel = () => {
    void navigate(ROUTES.HOME, { replace: true });
  };

  const handleTakePhoto = () => {
    // TODO: 카메라 기능 구현
  };

  const handleSelectFromLibrary = () => {
    // TODO: 이미지 라이브러리 기능 구현
  };

  return (
    <RecordWritePage
      initialLocation={initialLocation}
      initialCoordinates={initialCoordinates}
      onSave={handleSave}
      onCancel={handleCancel}
      onTakePhoto={handleTakePhoto}
      onSelectFromLibrary={handleSelectFromLibrary}
    />
  );
}

/**
 * state에서 가져오기
 */
function getLocationFromState(
  stateLocation: LocationState['location'],
): Location | null {
  if (!stateLocation) {
    return null;
  }

  return {
    name: stateLocation.name,
    address: stateLocation.address,
  };
}

function getCoordinatesFromState(
  stateLocation: LocationState['location'],
): Coordinates | null {
  if (!stateLocation?.coordinates) {
    return null;
  }

  const { lat, lng } = stateLocation.coordinates;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }

  return null;
}

/**
 * 2순위: locationId로 API 호출하여 위치 정보 가져오기
 * TODO: BE API 스펙 확인 후 수정 예정
 * 현재는 컴포넌트 내에서 직접 처리 (로딩 상태 표시)
 */

/**
 * 쿼리 파라미터에서 가져오기
 */
function getLocationFromQueryParams(
  searchParams: URLSearchParams,
): Location | null {
  const nameParam = searchParams.get('name');
  const addressParam = searchParams.get('address');

  if (nameParam || addressParam) {
    return {
      name: nameParam ?? '현재 위치',
      address: addressParam ?? '',
    };
  }

  return null;
}

/**
 * 3순위: 쿼리 파라미터에서 좌표 가져오기
 * locationId가 있으면 쿼리 좌표 무시
 */
function getCoordinatesFromQueryParams(
  searchParams: URLSearchParams,
  locationId: string | null,
): Coordinates | null {
  if (locationId) {
    return null;
  }

  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  if (!latParam || !lngParam) {
    return null;
  }

  const lat = parseFloat(latParam);
  const lng = parseFloat(lngParam);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }

  return null;
}
