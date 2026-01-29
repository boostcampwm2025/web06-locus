import { useRef, useEffect, useCallback } from 'react';

/**
 * 스크롤 위치를 보존하는 커스텀 훅
 * 컴포넌트가 언마운트/마운트될 때 스크롤 위치를 기억하고 복원합니다.
 *
 * @param shouldRestore - 스크롤 위치를 복원해야 하는지 여부 (예: 특정 조건이 true일 때)
 * @param storageKey - sessionStorage에 저장할 키 (페이지별로 구분하기 위해, 선택적)
 * @returns scrollRef - 스크롤 컨테이너에 연결할 ref
 * @returns scrollProps - 스크롤 이벤트 핸들러가 포함된 props 객체
 */
export function useScrollPosition(shouldRestore = true, storageKey?: string) {
  const scrollPositionRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // sessionStorage에서 스크롤 위치 불러오기
  useEffect(() => {
    if (storageKey) {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          scrollPositionRef.current = Number.parseInt(saved, 10);
        }
      } catch (error) {
        // sessionStorage 접근 실패 시 무시
        console.warn('sessionStorage 로딩에 실패했습니다.', error);
      }
    }
  }, [storageKey]);

  // 스크롤 위치 저장 (메모리 + sessionStorage)
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      scrollPositionRef.current = scrollTop;

      // sessionStorage에도 저장 (페이지 언마운트 시에도 유지)
      if (storageKey) {
        try {
          sessionStorage.setItem(storageKey, String(scrollTop));
        } catch (error) {
          console.warn('sessionStorage 저장에 실패했습니다.', error);
        }
      }
    },
    [storageKey],
  );

  // 스크롤 위치 복원
  const restoreScroll = useCallback(() => {
    if (scrollContainerRef.current && scrollPositionRef.current > 0) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, []);

  // ref 콜백: ref가 설정될 때 스크롤 위치 복원
  const setScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollContainerRef.current = node;
      if (node && shouldRestore && scrollPositionRef.current > 0) {
        // DOM이 준비된 후 복원
        requestAnimationFrame(() => {
          if (node) {
            node.scrollTop = scrollPositionRef.current;
          }
        });
      }
    },
    [shouldRestore],
  );

  // shouldRestore가 true로 변경될 때 스크롤 위치 복원
  useEffect(() => {
    if (shouldRestore) {
      restoreScroll();
      // 여러 단계로 시도하여 확실하게 복원
      requestAnimationFrame(() => {
        restoreScroll();
        setTimeout(restoreScroll, 0);
        setTimeout(restoreScroll, 50);
      });
    }
  }, [shouldRestore, restoreScroll]);

  // 컴포넌트 언마운트 시 현재 스크롤 위치 저장
  useEffect(() => {
    return () => {
      if (storageKey && scrollContainerRef.current) {
        try {
          const currentScrollTop = scrollContainerRef.current.scrollTop;
          sessionStorage.setItem(storageKey, String(currentScrollTop));
        } catch (error) {
          // sessionStorage 접근 실패 시 무시
          console.warn('Failed to save scroll position on unmount', error);
        }
      }
    };
  }, [storageKey]);

  return {
    scrollRef: setScrollRef,
    scrollProps: {
      onScroll: handleScroll,
    },
  };
}
