/**
 * Hook de Infinite Scroll
 * Carrega mais itens conforme usuário scrolla
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  threshold = 100
}: UseInfiniteScrollProps) {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onLoadMore, hasMore, isLoading]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: `${threshold}px` }
    );

    const currentObserver = observerRef.current;
    const currentRef = loadMoreRef.current;

    if (currentRef) {
      currentObserver.observe(currentRef);
    }

    return () => {
      if (currentRef && currentObserver) {
        currentObserver.unobserve(currentRef);
      }
    };
  }, [handleLoadMore, threshold]);

  return { isLoading, loadMoreRef };
}

// Exemplo de uso:
// const { isLoading, loadMoreRef } = useInfiniteScroll({
//   onLoadMore: async () => {
//     const newItems = await fetchMoreItems(page + 1);
//     setItems([...items, ...newItems]);
//     setPage(page + 1);
//   },
//   hasMore: hasMore
// });
//
// return (
//   <div>
//     {items.map(item => <ItemCard key={item.id} {...item} />)}
//     <div ref={loadMoreRef}>
//       {isLoading && <LoadingSpinner />}
//     </div>
//   </div>
// );

