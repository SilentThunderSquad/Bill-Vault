import { lazy, Suspense } from 'react';

// Lazy load PWA prompt only in production
const PWAPrompt = lazy(() =>
  import('./PWAPrompt').then(module => ({ default: module.PWAPrompt }))
);

export function PWAWrapper() {
  // Only render PWA features in production
  if (import.meta.env.DEV) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <PWAPrompt />
    </Suspense>
  );
}