# Codebase Concerns

**Analysis Date:** 2026-04-20

## Tech Debt

**Manual Chunking in Vite Config:**
- Issue: Manual Rollup chunking for large libraries (`tesseract.js`, `pdfjs-dist`).
- File: `vite.config.ts` (line 168)
- Why: Avoid circular dependencies and manage bundle size for PWA performance.
- Impact: Harder to maintain as more dependencies are added; could lead to brittle build configurations.
- Fix approach: Evaluate if Vite's automatic chunking or dynamic imports in components can replace manual config.

**Service Worker Complexity:**
- Issue: Multiple overlapping service worker files and notification services.
- Files: `public/sw-warranty-handler.js`, `public/sw-warranty.js`, `src/services/pwaNotificationService.ts`, `src/services/warrantyBackgroundService.ts`.
- Why: Evolved ad-hoc to handle complex PWA notification requirements.
- Impact: High risk of race conditions or inconsistent behavior during background tasks.
- Fix approach: Consolidate service worker logic into a single modular architecture.

## Known Bugs

**OCR Accuracy Limitations:**
- Symptoms: Occasional failure to extract dates or amounts from blurry or unconventional bill layouts.
- Trigger: Processing low-quality images or non-standard receipts.
- Workaround: Manual editing in `AddBill.tsx` before saving.
- Root cause: Client-side Tesseract.js limitations without pre-processing (sharpening/thresholding).
- Fix: Implement image pre-processing in `src/utils/fileHelpers.ts` before passing to OCR.

## Security Considerations

**Supabase Anon Key Usage:**
- Risk: Potential exposure of the anon key in client-side code (standard for Supabase but requires strict RLS).
- File: `src/services/supabase.ts`
- Current mitigation: Row Level Security (RLS) configured in `supabase/admin.sql`.
- Recommendations: Audit all RLS policies to ensure users can only access their own `bills` and `profiles`.

**Unvalidated File Uploads:**
- Risk: Users could potentially upload large files or malicious scripts to Supabase Storage.
- File: `src/hooks/useBills.ts` (upload logic)
- Current mitigation: Basic file extension checks in `fileHelpers.ts`.
- Recommendations: Add server-side size limits and stricter mime-type validation in Supabase Storage policies.

## Performance Bottlenecks

**OCR Processing Time:**
- Problem: Large PDF/Image processing can freeze the UI thread or take 5-10 seconds.
- Measurement: ~5-8s for complex bills on mobile devices.
- Cause: Synchronous-like heavy computation in Tesseract.js workers.
- Improvement path: Optimize worker initialization and use Offscreen Canvas for pre-processing.

## Fragile Areas

**Warranty Expiry Logic:**
- File: `src/utils/warrantyConfig.ts`, `src/services/warrantyNotificationService.ts`
- Why fragile: Relies on complex date math and consistent browser background sync/periodic sync.
- Common failures: Timezone discrepancies or browser-throttled service workers missing expiry windows.
- Safe modification: Use `date-fns` for all calculations and verify with `warrantyE2ETester.ts`.
- Test coverage: Covered by custom `warrantyE2ETester.ts` but lacks automated unit tests.

## Scaling Limits

**Supabase Free Tier:**
- Current capacity: 500MB DB, 1GB Storage.
- Limit: ~1000-2000 users with high-res bill images.
- Symptoms at limit: Storage full errors during upload.
- Scaling path: Enable Supabase Pro or implement client-side image compression.

## Missing Critical Features

**Bill Category Analytics:**
- Problem: Limited visualization of spending patterns by category.
- Current workaround: Users view raw list in `Bills.tsx`.
- Blocks: Comprehensive financial tracking.
- Implementation complexity: Medium (requires `recharts` integration in `Dashboard.tsx`).

## Test Coverage Gaps

**Supabase Integration:**
- What's not tested: DB connectivity and RLS policy enforcement.
- Risk: Policy changes could accidentally expose data or break app functionality.
- Priority: High
- Difficulty to test: Requires dedicated Supabase test environment or mocking.

---

*Concerns audit: 2026-04-20*
*Update as issues are fixed or new ones discovered*
