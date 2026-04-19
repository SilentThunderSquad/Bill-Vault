# Technology Stack

**Analysis Date:** 2026-04-20

## Languages

**Primary:**
- TypeScript 5.9 - All application code and configuration
- JSX/TSX - UI components and layout

**Secondary:**
- JavaScript (ES Modules) - Build scripts and service workers (`sw-warranty-handler.js`)
- SQL - Supabase migrations and database schema (`supabase/admin.sql`)

## Runtime

**Environment:**
- Browser - Modern browser environment (PWA support required)
- Node.js >=18.x - Development and build environment

**Package Manager:**
- npm >=9.0.0
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2 - UI library
- React Router 7.1 - Routing and navigation

**Styling:**
- Tailwind CSS 4.2 - Utility-first styling engine
- Framer Motion 12.3 - Interaction and animation

**Build/Dev:**
- Vite 7.3 - Build tool and development server
- TypeScript Compiler - Static type checking

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.99 - Database, Auth, and Storage integration
- tesseract.js 7.0 - OCR for bill parsing
- pdfjs-dist 4.0 - PDF processing and viewing
- shadcn 4.0 - UI component system (base-ui/react)
- workbox-window 7.4 - PWA service worker management

**Infrastructure:**
- date-fns 4.1 - Date manipulation and formatting
- recharts 3.8 - Data visualization for dashboard
- lucide-react 0.577 - Icon library

## Configuration

**Environment:**
- `.env` files for environment variables
- Key configs: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

**Build:**
- `vite.config.ts` - Main build and PWA configuration
- `tsconfig.json` - TypeScript compiler settings
- `vercel.json` - Vercel deployment configuration

## Platform Requirements

**Development:**
- Any platform with Node.js support
- Supabase project for backend services

**Production:**
- Vercel (likely deployment target based on `vercel.json`)
- Supabase (Backend as a Service)

---

*Stack analysis: 2026-04-20*
*Update after major dependency changes*
