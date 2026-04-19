# Architecture

**Analysis Date:** 2026-04-20

## Pattern Overview

**Overall:** Service-Oriented React SPA (Single Page Application)

**Key Characteristics:**
- **Hooks-Driven Logic:** Business logic is encapsulated in custom React hooks.
- **Service-Oriented Infrastructure:** External service integrations (Supabase, OCR, Notifications) are isolated in a dedicated service layer.
- **PWA-First Design:** Heavy reliance on Service Workers for background tasks and offline capabilities.
- **Client-Side Heavy Processing:** OCR and PDF processing occur entirely on the client to ensure privacy and reduce server costs.

## Layers

**UI Layer (Components & Pages):**
- Purpose: Render interface and handle user interactions.
- Contains: Shadcn UI components, layout components, and feature-specific pages.
- Location: `src/components/`, `src/pages/`
- Depends on: Hooks layer for state and logic.
- Used by: React entry point (`src/main.tsx`).

**Hooks Layer (Business Logic):**
- Purpose: Bridge between UI and Services; handle state management.
- Contains: `useBills`, `useNotifications`, `useOCR`, `useProfile`.
- Location: `src/hooks/`
- Depends on: Service layer for external operations.
- Used by: UI layer.

**Service Layer (Infrastructure):**
- Purpose: Interface with external APIs and system capabilities.
- Contains: `supabase.ts`, `ocr.ts`, `pwaNotificationService.ts`, `warrantyBackgroundService.ts`.
- Location: `src/services/`
- Depends on: External SDKs and Browser APIs.
- Used by: Hooks layer.

**Utility Layer (Shared Helpers):**
- Purpose: Common functional helpers and constants.
- Contains: `validators.ts`, `formatters.ts`, `fileHelpers.ts`.
- Location: `src/utils/`, `src/lib/`
- Depends on: Pure functions and standard libraries.
- Used by: All layers.

## Data Flow

**Bill Upload & OCR Flow:**

1. User selects a file in `AddBill.tsx`.
2. UI calls `useOCR` hook.
3. `useOCR` invokes `ocr.ts` service (Tesseract.js/PDF.js).
4. OCR service extracts text and parses fields (date, amount, vendor).
5. Results returned to `AddBill.tsx` for user review/editing.
6. User saves, calling `useBills` hook which interacts with `supabase.ts`.
7. Data is persisted to Supabase DB, and file is uploaded to Supabase Storage.

**State Management:**
- **Local State:** React `useState` for component-level state.
- **Global State:** `AuthContext` for authentication state.
- **Persistence:** Supabase (Database/Storage) for all user data.
- **Cache:** `queryCache.ts` and Workbox caching for offline access.

## Key Abstractions

**Service:**
- Purpose: Encapsulate external service logic as singletons.
- Examples: `src/services/supabase.ts`, `src/services/ocr.ts`.
- Pattern: Modular exports (singleton-like).

**Hook:**
- Purpose: Reusable stateful logic.
- Examples: `src/hooks/useBills.ts`, `src/hooks/useWarrantyNotifications.ts`.
- Pattern: React Custom Hooks.

**Validator/Formatter:**
- Purpose: Ensure data integrity and consistent display.
- Examples: `src/utils/validators.ts`, `src/utils/formatters.ts`.
- Pattern: Pure utility functions.

## Entry Points

**Frontend Entry:**
- Location: `src/main.tsx`
- Triggers: Browser page load.
- Responsibilities: Initialize React, set up routing, wrap app in `AuthProvider`.

**Service Worker:**
- Location: `public/sw-warranty-handler.js`
- Triggers: Push notifications, Periodic Sync (if enabled), Service Worker lifecycle events.
- Responsibilities: Handle background notifications and warranty expiry alerts.

## Error Handling

**Strategy:** Global `sonner` notifications for user feedback, combined with try/catch blocks in hooks and services.

**Patterns:**
- Services return error results or throw.
- Hooks catch errors and expose them to UI.
- UI displays toast notifications via `sonner`.

## Cross-Cutting Concerns

**Authentication:**
- Approach: `AuthContext` provides user session to the entire app; Supabase RLS protects data at the DB level.

**Validation:**
- Approach: `validators.ts` for form input and data integrity checks before DB writes.

**Notifications:**
- Approach: Centralized `pwaNotificationService.ts` and `warrantyNotificationService.ts` for consistent alert handling.

---

*Architecture analysis: 2026-04-20*
*Update when major patterns change*
