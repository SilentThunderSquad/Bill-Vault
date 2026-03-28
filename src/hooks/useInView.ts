import { useEffect, useRef, useState } from 'react';

/**
 * Hook to detect when an element enters the viewport
 * Used for lazy loading off-screen components for better performance
 * 
 * @param threshold - Percentage of element visibility (0-1) to trigger
 * @param rootMargin - Margin around root (e.g., '50px' to trigger 50px before visible)
 * @returns ref to attach to element and isInView boolean
 */
export function useInView(threshold = 0.1, rootMargin = '0px') {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Disconnect after first view for performance
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { ref, isInView };
}
