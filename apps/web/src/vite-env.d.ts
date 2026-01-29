/// <reference types="vite/client" />

/**
 * Vite 환경 변수 타입 정의
 * Firebase/VITE_* 값은 .env에서만 로드하며 코드에 하드코딩하지 않음.
 */
interface ImportMetaEnv {
  readonly VITE_NAVER_CLIENT_ID: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FCM_VAPID_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Window 전역 타입 확장
 */
declare global {
  interface Window {
    navermap_authFailure?: () => void;
  }
}
