/**
 * 온보딩 페이지에서 사용하는 이미지 경로 상수
 */
import cafeInterior from '@/assets/images/onboarding/cafe-interior.webp';
import parkWalk from '@/assets/images/onboarding/park-walk.webp';
import citySunset from '@/assets/images/onboarding/city-sunset.webp';
import beachView from '@/assets/images/onboarding/beach-view.webp';
import bookstoreShelves from '@/assets/images/onboarding/bookstore-shelves.webp';
import mountainLandscape from '@/assets/images/onboarding/mountain-landscape.webp';

export const ONBOARDING_IMAGES = {
  /** 카페 인테리어 */
  cafe: cafeInterior,

  /** 공원 산책 */
  park: parkWalk,

  /** 도시 석양 */
  citySunset: citySunset,

  /** 바다 해변 */
  beach: beachView,

  /** 서점 선반 */
  bookstore: bookstoreShelves,

  /** 산 풍경 */
  mountain: mountainLandscape,
} as const;
