export interface UseIntersectionObserverProps {
  onIntersect: () => void /* 화면에 보일 때 실행할 함수 */;
  rootMargin?: string /* 얼마나 미리 감지할지 (예: '200px') */;
  threshold?:
    | number
    | number[] /* 요소가 얼마나 보여야 호출할지 (0~1, 예: 0.5는 50%) */;
  enabled?: boolean /* 활성화 여부 (데이터 로딩 중엔 잠시 꺼두기 위함) */;
}
