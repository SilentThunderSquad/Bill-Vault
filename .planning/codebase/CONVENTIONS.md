# Coding Conventions

**Analysis Date:** 2026-04-20

## Naming Patterns

**Files:**
- `PascalCase.tsx` for React components and pages (e.g., `AddBill.tsx`, `Dashboard.tsx`).
- `camelCase.ts` for hooks, services, and utilities (e.g., `useBills.ts`, `supabase.ts`).
- `kebab-case.js` for public scripts and configuration files.

**Functions:**
- `camelCase` for all functions.
- `handleEventName` for event handlers in components (e.g., `handleSubmit`, `handleFileChange`).
- `useHookName` for custom React hooks.

**Variables:**
- `camelCase` for general variables and state.
- `UPPER_SNAKE_CASE` for configuration constants (e.g., `VITE_SUPABASE_URL`).

**Types:**
- `PascalCase` for interfaces and type aliases.
- Interfaces are preferred for object definitions, no `I` prefix.

## Code Style

**Formatting:**
- Vite defaults with 2-space indentation.
- Single quotes preferred for strings.
- Semicolons used (implied by standard Prettier/Vite defaults).

**Linting:**
- ESLint with `eslint.config.js`.
- Extends: `js.recommended`, `tseslint.recommended`, `react-hooks.recommended`.
- Run: `npm run lint`.

## Import Organization

**Order:**
1. React and core libraries (`react`, `react-router-dom`).
2. External packages (`@supabase/supabase-js`, `lucide-react`).
3. Path aliases (`@/components`, `@/hooks`, `@/services`).
4. Relative imports (`./utils`, `../types`).
5. Styles/Assets (`import './index.css'`).

**Path Aliases:**
- `@/` maps to `src/` (configured in `vite.config.ts`).

## Error Handling

**Patterns:**
- Try/catch blocks in services and hooks.
- Asynchronous operations (Supabase calls, OCR) are wrapped to handle network or processing failures.
- `sonner` toast notifications for user-facing errors.

**Strategy:**
- Failures in services should return a consistent result object or throw descriptive errors.
- Hooks should catch service errors and update component state or show notifications.

## Logging

**Framework:**
- `console` used for development logging (Vite build drops console in production per `vite.config.ts`).

**Patterns:**
- Errors logged with `console.error` before being surfaced to users.
- Debug info logged in development for OCR results and DB operations.

## Comments

**When to Comment:**
- Explain complex business logic, especially around warranty calculations and OCR parsing.
- Document PWA service worker lifecycle handling.
- TODOs for future optimizations or known limitations.

**JSDoc/TSDoc:**
- Encouraged for shared utility functions in `src/utils/`.

## Function Design

**Size:**
- Aim for small, focused functions in services and utilities.
- Extract complex component logic into custom hooks.

**Parameters:**
- Destructuring preferred for object-based parameters.
- Default parameters used for optional configuration.

## Module Design

**Exports:**
- Named exports preferred for utilities and services.
- Default exports for React components and pages.

**Barrel Files:**
- `src/types/index.ts` acts as a barrel for type definitions.

---

*Convention analysis: 2026-04-20*
*Update when patterns change*
