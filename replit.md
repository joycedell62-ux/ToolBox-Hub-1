# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- **ToolBox Hub permanent build docs** (read before any tool sprint — these are the source of truth for how tools are built):
  - `artifacts/toolbox-hub/docs/01-MASTER-BLUEPRINT.md` — vision, navigation, branding, categories, platform rules, 3-file rule
  - `artifacts/toolbox-hub/docs/02-UI-UX-STANDARDS.md` — colors, buttons, cards, mobile, animations, accessibility, offline, search, dashboard, Gold Standard checklist
  - `artifacts/toolbox-hub/docs/03-SPRINT-TEMPLATE.md` — the per-sprint prompt format (tool list only)
- Tool pages: `artifacts/toolbox-hub/src/pages/`; reference Gold Standard tool: `UuidGenerator.tsx`
- Routing: `artifacts/toolbox-hub/src/App.tsx`; homepage/dashboard + TOOLS array: `src/pages/Home.tsx`; layout shell + breadcrumb titles: `src/components/Layout.tsx`

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

- **ToolBox Hub build workflow:** Three permanent prompts are stored as docs in `artifacts/toolbox-hub/docs/` (Master Blueprint, UI/UX Standards, Sprint Template). The Blueprint + UI/UX Standards are always in force and must be applied to every tool without being restated. The user sends sprints containing ONLY the tool list (10–20 tools at a time); build each tool against the permanent standards. Do not require the user to re-post standards each sprint.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
