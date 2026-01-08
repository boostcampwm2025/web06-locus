/**
 * Window 전역 타입 확장
 */
declare global {
  interface Window {
    naver?: {
      maps?: typeof naver.maps;
    };
    navermap_authFailure?: () => void;
  }
}
