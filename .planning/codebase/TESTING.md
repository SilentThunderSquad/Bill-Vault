# Testing Patterns

**Analysis Date:** 2026-04-20

## Test Framework

**Runner:**
- No standard automated test runner (Vitest/Jest) is currently configured in `package.json`.
- Manual/In-browser testing is the primary verification method.

**Assertion Library:**
- Custom assertion logic within in-browser testing scripts.

**Run Commands:**
```bash
npm run check                         # Runs type-check and lint
npm run type-check                    # Static type verification
```

## Test File Organization

**Location:**
- Custom testing utilities are located in `src/utils/`.
- No separate `tests/` directory or `*.test.ts` files.

**Key Files:**
- `src/utils/warrantyE2ETester.ts`: End-to-end testing script for the warranty notification system.
- `src/utils/warrantyTestingUtils.ts`: Helper utilities for warranty system verification.

## In-Browser Testing

**Warranty Notification E2E:**
- The `WarrantyNotificationE2ETester` class (exported as `warrantyE2ETester`) allows running a suite of 10 tests directly from the browser console in development mode.
- Access: `window.warrantyE2ETester.runCompleteTestSuite()`

**Test Suite Coverage:**
1. System Prerequisites
2. Service Worker Registration
3. PWA Service Initialization
4. Permission Request Flow
5. Warranty Handler Integration
6. Notification Display
7. Notification Click Handling
8. Development Testing Utils
9. Error Handling and Fallbacks
10. Performance and Memory

## Mocking

**Patterns:**
- No mocking framework (like Vitest `vi` or Jest `jest.fn()`) is used.
- Instead, the codebase uses conditional logic (e.g., `if (import.meta.env.DEV)`) to enable testing features and bypass certain production constraints.

## Coverage

**Requirements:**
- No automated coverage tracking is configured.
- Critical paths like OCR parsing and warranty alerts are manually verified using the developer tools and the provided testing scripts.

## Test Types

**Manual Verification:**
- **OCR Accuracy:** Verified by uploading sample bills and checking the extracted fields in the UI.
- **PWA Functionality:** Verified using Chrome DevTools (Application tab) to check Service Worker status and cache.

**Custom E2E:**
- **Warranty Flow:** Automated within the browser via `warrantyE2ETester.ts`.

## Common Patterns

**Development-Only Testing Hooks:**
```typescript
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).warrantyE2ETester = warrantyE2ETester;
  console.log('💡 E2E tester available at: window.warrantyE2ETester');
}
```

---

*Testing analysis: 2026-04-20*
*Update when test patterns change*
