import { lazy, Suspense } from 'react';
import { Bill } from '@/types';

const MonthlyUploadsChartLazy = lazy(() => import('./MonthlyUploadsChart'));

interface MonthlyUploadsChartProps {
  bills: Bill[];
}

/**
 * Lazy-loaded wrapper for MonthlyUploadsChart
 * Delays loading of Recharts library until needed
 */
export function MonthlyUploadsChart({ bills }: MonthlyUploadsChartProps) {
  return (
    <Suspense fallback={
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading chart...
        </div>
      </div>
    }>
      <MonthlyUploadsChartLazy bills={bills} />
    </Suspense>
  );
}
