# EduCore — Greenwood International Academy (School Management System)

Production-grade, 100% responsive School Management System built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **TanStack Table**, **Recharts**, **React Hook Form + Zod**, and **Playwright + axe-core**.

## Architecture
- **110 Figma Screens** across 6 portals: Public & Auth (`01–06`), Super Admin (`07–73`), Teacher Portal (`74–84`), Student Portal (`85–96`), Parent Portal (`97–105`), and Common / Utility (`106–110`).
- **Service-Layer Separation:** `src/services/*.ts` expose typed interfaces backed by `src/mocks/*.ts` and validated with `src/schemas/*.ts`.
- **Design Tokens:** All colors, typography (`Plus Jakarta Sans`), radii, and shadows live in `src/app/globals.css` and are enforced by `pnpm check:tokens`.

## Getting Started
```bash
pnpm install
pnpm dev
```

## Quality Gates
```bash
pnpm typecheck
pnpm lint --max-warnings 0
pnpm check:tokens
pnpm build
pnpm test:e2e
```
