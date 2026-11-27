# EduCore — Greenwood International Academy (School Management System)

Production-grade, 100% responsive School Management System built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **TanStack Table**, **Recharts**, **React Hook Form + Zod**, **Supabase** (Postgres, Auth, RLS, Private Storage), and **Playwright + axe-core**.

## Architecture
- **110 Figma Screens** across 6 portals: Public & Auth (`01–06`), Super Admin (`07–73`), Teacher Portal (`74–84`), Student Portal (`85–96`), Parent Portal (`97–105`), and Common / Utility (`106–110`).
- **Service-Layer Separation:** `src/services/*.ts` expose typed interfaces backed by Supabase (`src/lib/supabase/*`), validated with `src/schemas/*.ts`, and typed with generated `src/types/db.ts`.
- **Design Tokens:** All colors, typography (`Plus Jakarta Sans`), radii, and shadows live in `src/app/globals.css` and are enforced by `pnpm check:tokens`.

## Seeded Portal Accounts (`pnpm seed`)
Set `SEED_DEFAULT_PASSWORD` in `.env.local` (or enter interactively when prompted) and run `pnpm seed` to provision pre-confirmed accounts for all 5 roles:

| Role | Code | Email | Home Route |
| --- | --- | --- | --- |
| `admin` | `ADM-001` | `priya.lakkad@greenwood.edu` | `/admin` |
| `teacher` | `TCH-042` | `kavita.nair@greenwood.edu` | `/teacher` |
| `student` | `ADM-2026-0142` | `aarav.sharma@student.greenwood.edu` | `/student` |
| `parent` | `PAR-1042` | `rajesh.sharma@gmail.com` | `/parent` |
| `staff` | `STF-011` | `mohan.joshi@greenwood.edu` | `/admin/staff` |

## Getting Started
```bash
pnpm install
pnpm seed
pnpm dev
```

## Quality Gates
```bash
pnpm typecheck
pnpm lint --max-warnings 0
pnpm check:tokens
pnpm check:mocks
pnpm test:rls
pnpm build
pnpm test:e2e
```
