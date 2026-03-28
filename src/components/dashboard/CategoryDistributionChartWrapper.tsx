import { lazy, Suspense } from 'react';
import { Bill } from '@/types';

const CategoryDistributionChartLazy = lazy(() => import('./CategoryDistributionChart'));

interface CategoryDistributionChartProps {
  bills: Bill[];
}

/**
 * Lazy-loaded wrapper for CategoryDistributionChart
 * Delays loading of Recharts library until needed
 */
export function CategoryDistributionChart({ bills }: CategoryDistributionChartProps) {
  return (
    <Suspense fallback={
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading chart...
        </div>
      </div>
    }>
      <CategoryDistributionChartLazy bills={bills} />
    </Suspense>
  );
}
