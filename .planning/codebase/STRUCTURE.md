# Codebase Structure

**Analysis Date:** 2026-04-20

## Directory Layout

```
Bill-Vault/
├── .planning/          # GSD planning and codebase map
├── public/             # Static assets and service workers
│   └── icons/          # PWA icons
├── scripts/            # Build and utility scripts
├── src/                # Application source code
│   ├── assets/         # UI assets (images, fonts)
│   ├── components/     # React components (UI, layout, features)
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks (business logic)
│   ├── lib/            # External library configurations
│   ├── pages/          # Page-level components
│   ├── services/       # External service integrations
│   ├── types/          # TypeScript definitions
│   └── utils/          # Shared utility functions
├── supabase/           # Supabase schema and functions
└── index.html          # SPA entry HTML
```

## Directory Purposes

**src/components/:**
- Purpose: Reusable UI elements and feature-specific components.
- Contains: `*.tsx` files, subdirectories like `ui/` (Shadcn), `layout/`, `dashboard/`.
- Key files: `src/components/ui/` (base components).

**src/hooks/:**
- Purpose: Stateful business logic and data fetching wrappers.
- Contains: `useBills.ts`, `useNotifications.ts`, `useOCR.ts`.
- Key files: `useBills.ts` - core bill management logic.

**src/services/:**
- Purpose: Infrastructure and external service clients.
- Contains: `supabase.ts`, `ocr.ts`, `pwaNotificationService.ts`.
- Key files: `ocr.ts` - Tesseract/PDF.js logic; `supabase.ts` - client initialization.

**src/pages/:**
- Purpose: Routed view components.
- Contains: `Dashboard.tsx`, `AddBill.tsx`, `Bills.tsx`, `Settings.tsx`.
- Key files: `Dashboard.tsx` - main user landing.

**src/utils/:**
- Purpose: Stateless helper functions.
- Contains: `validators.ts`, `formatters.ts`, `fileHelpers.ts`.
- Key files: `validators.ts` - schema/input validation.

**public/:**
- Purpose: Static files served at root.
- Contains: `favicon.svg`, `robots.txt`, `sw-warranty-handler.js`.
- Key files: `sw-warranty-handler.js` - background warranty service worker.

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React application mount point.
- `index.html`: Web page entry point.

**Configuration:**
- `vite.config.ts`: Vite build and PWA plugin config.
- `tsconfig.json`: TypeScript compiler options.
- `package.json`: Project dependencies and scripts.
- `vercel.json`: Deployment configuration for Vercel.

**Core Logic:**
- `src/services/ocr.ts`: Document parsing engine.
- `src/services/supabase.ts`: Database client.
- `src/hooks/useBills.ts`: Main state management for bills.

**Database:**
- `supabase/admin.sql`: Main database schema and RLS policies.
- `supabase/user.sql`: User-specific database setup.

## Naming Conventions

**Files:**
- `PascalCase.tsx`: React components and pages.
- `camelCase.ts`: Hooks, services, and utility modules.
- `kebab-case.js`: Scripts and public JS files.

**Directories:**
- `kebab-case`: All directories.
- Plural names for collections: `components/`, `hooks/`, `services/`, `pages/`.

## Where to Add New Code

**New Feature:**
- Logic: `src/hooks/useFeatureName.ts`
- View: `src/pages/FeatureName.tsx` or `src/components/features/`
- Service: `src/services/featureName.ts` (if external integration)

**New UI Component:**
- Implementation: `src/components/ui/` (if primitive) or `src/components/`

**New Utility:**
- Implementation: `src/utils/`

**New Type:**
- Implementation: `src/types/index.ts` or a new file in `src/types/`

---

*Structure analysis: 2026-04-20*
*Update when directory structure changes*
