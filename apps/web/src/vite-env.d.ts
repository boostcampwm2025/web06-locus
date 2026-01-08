/// <reference types="vite/client" />

/**
 * Vite 환경 변수 타입 정의
 */
interface ImportMetaEnv {
  readonly VITE_NAVER_CLIENT_ID: string;
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
