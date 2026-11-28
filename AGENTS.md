<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Rules (EduCore — Greenwood International Academy)

- **Master Spec:** Always follow [docs/PHASE5-V2.md](docs/PHASE5-V2.md).
- **Strict TypeScript:** TypeScript/TSX only (`strict: true`), no `any`, no `@ts-ignore`, no `eslint-disable`.
- **Token-Only Styling:** All colors must reference CSS variables / Tailwind `@theme` tokens defined in `src/app/globals.css`. Zero raw hex/rgb/hsl outside `src/app/globals.css` (`pnpm check:tokens`).
- **Next.js 16 Conventions:** Use `src/proxy.ts` (never deprecated `middleware.ts`), `next/font/google` (`Plus_Jakarta_Sans`), `next/image`, and App Router server/client separation.
- **Service Layer & Validation:** Pages call typed services/server actions backed by Supabase Postgres & Storage (no fake toasts, no runtime mock imports once each module completes). All entities have TypeScript types (`src/types/`) and Zod schemas (`src/schemas/`).
- **Reuse First:** Check `COMPONENTS.md` before building UI. Reuse `AppShell`, `DataTablePage`, `FormPage`, `DashboardPage`, `DetailPage`, `PrintView`, `InboxView`, `CalendarView`.
- **Quality Gates:** `pnpm typecheck`, `pnpm lint --max-warnings 0`, `pnpm check:tokens`, `pnpm check:mocks`, `pnpm check:toasts`, `pnpm test:rls`, `pnpm test:tenant`, `pnpm build`, and Playwright + axe-core (`390`, `768`, `1440`) with zero horizontal overflow or violations.

## Installed Versions
- `node`: `26.13.1`
- `pnpm`: `12.23.0`
- `next`: `16.4.6`
- `react` / `react-dom`: `19.3.1`
- `typescript`: `5.9.3` (Next.js 16 compatible)
- `tailwindcss` / `@tailwindcss/turbopack`: `4.3.5`
- `lucide-react`: `1.79.0`
- `react-hook-form`: `7.92.0`
- `zod`: `4.6.7`
- `@hookform/resolvers`: `7.0.9`
- `@tanstack/react-table`: `9.3.1`
- `@tanstack/react-query`: `5.108.4`
- `recharts`: `3.11.1`
- `date-fns`: `4.4.0`
- `@playwright/test`: `1.65.1`
- `@axe-core/playwright`: `4.14.0`
- `eslint`: `9.39.5` / `eslint-config-next`: `16.4.6`
- `prettier`: `3.10.1`
- `tsx`: `4.23.15`
