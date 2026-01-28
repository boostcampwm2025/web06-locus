import { useEffect, useRef } from 'react';
import type { UseIntersectionObserverProps } from '@/shared/types';

/**
 * Intersection Observer를 활용한 무한 스크롤 훅
 *
 * 특정 요소가 뷰포트에 들어올 때 콜백 함수를 실행합니다.
 * 무한 스크롤, 지연 로딩 등에 활용할 수 있습니다.
 *
 * @param onIntersect - 요소가 화면에 보일 때 실행할 함수
 * @param rootMargin - 얼마나 미리 감지할지 (예: '200px', '0px 0px 100px 0px')
 * @param threshold - 요소가 얼마나 보여야 호출할지 (0~1, 예: 0.5는 50%, 기본값: 0)
 * @param enabled - 활성화 여부 (데이터 로딩 중엔 잠시 꺼두기 위함)
 * @returns targetRef - 관찰할 DOM 요소에 연결할 ref
 *
 * @example
 * ```tsx
 * function InfiniteScrollList() {
 *   const [items, setItems] = useState([]);
 *   const [hasMore, setHasMore] = useState(true);
 *   const [isLoading, setIsLoading] = useState(false);
 *
 *   const loadMore = useCallback(async () => {
 *     if (isLoading || !hasMore) return;
 *     setIsLoading(true);
 *     const newItems = await fetchItems();
 *     setItems(prev => [...prev, ...newItems]);
 *     setIsLoading(false);
 *   }, [isLoading, hasMore]);
 *
 *   const { targetRef } = useIntersectionObserver({
 *     onIntersect: loadMore,
 *     rootMargin: '200px',
 *     threshold: 0.1, // 요소의 10%가 보이면 호출
 *     enabled: hasMore && !isLoading,
 *   });
 *
 *   return (
 *     <div>
 *       {items.map(item => <div key={item.id}>{item.name}</div>)}
 *       {hasMore && <div ref={targetRef} style={{ height: '1px' }} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIntersectionObserver({
  onIntersect,
  rootMargin = '0px',
  threshold = 0,
  enabled = true,
}: UseIntersectionObserverProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  // observer 재생성을 방지하고 항상 최신 함수를 참조하도록 함
  const onIntersectRef = useRef(onIntersect);

  // onIntersect가 변경될 때마다 ref 업데이트
  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    if (!enabled || !targetRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 요소가 화면에 들어오면(isIntersecting) 실행
        if (entries[0]?.isIntersecting) {
          onIntersectRef.current();
        }
      },
      { rootMargin, threshold },
    );

    const currentTarget = targetRef.current;
    observer.observe(currentTarget);

    return () => observer.unobserve(currentTarget);
  }, [rootMargin, threshold, enabled]); // onIntersect는 의존성에서 제거

  return { targetRef };
}
