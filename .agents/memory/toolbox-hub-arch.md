---
name: ToolBox Hub Architecture
description: Routing conventions, export/capture pattern, Gold Standard checklist, installed packages, and integration steps for adding new tools.
---

# ToolBox Hub Architecture

## Stack
- React + Vite + Tailwind + shadcn/ui + Wouter routing
- All tools are pure frontend (no backend)
- Located at `artifacts/toolbox-hub/`; preview path = `/` (root)

## Files to update when adding any new tool (registry moved!)
1. `src/App.tsx` — import + `<Route path="..." component={...} />`
2. `src/lib/tools.ts` — CENTRAL REGISTRY (TOOLS array, Category type, CATEGORIES). Add the tool entry here; new categories go in the Category union + CATEGORIES array.
3. `src/pages/Home.tsx` — only bump the "N+ Free Tools" hero badge + STATS count (TOOLS now imported from lib).
Layout.tsx needs NO edit — breadcrumb titles come from `getToolByHref` (registry); static pages use its STATIC_TITLES map.

## CRITICAL: Icon import naming in Home.tsx
- **Never import lucide icons with names that conflict with the page component or existing imports.**
- `Home` (lucide) conflicts with `export default function Home()` — use a different icon or alias carefully.
- `Search` is already imported for the hero search bar — do NOT import it again as `Search as SearchIcon` (duplicate import from same module → Babel error "Duplicate declaration").
- Safe pattern: use a completely different icon rather than aliasing the same-named one.

## Export / html2canvas capture pattern
- `captureRef` div must live **outside** any `animate-in` wrapper (as a React Fragment sibling, `position: fixed; left: -9999px`)
- Never place captureRef inside the animated wrapper — html2canvas will silently fail

## Gold Standard — every tool page must include (in order)
1. Hero card: blue gradient (`linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)`)
2. Two-column layout (`lg:grid-cols-5`, left=`lg:col-span-2` controls, right=`lg:col-span-3` output)
3. Pro Tips card (blue-50 bg, Lightbulb icon, 4–6 tips)
4. FAQ section (4–6 Q&A pairs with ChevronDown accordion)
5. Related Tools (3–4 `<Link>` cards to sibling tools)
6. Feedback section (👍/👎 stored in localStorage key `feedback_<toolname>`)

## Installed packages (toolbox-hub)
`qrcode`, `@types/qrcode`, `html2canvas`, `@types/html2canvas`, `jspdf`,
`pdf-lib`, `pdfjs-dist`, `mammoth`, `jszip`

## pdf-lib notes
- `password` in LoadOptions and `userPassword`/`ownerPassword` in SaveOptions are not typed in v1.17.1 — use `as any` casts; the runtime supports them fine
- `Uint8Array` → `Blob`: use `outBytes.buffer as ArrayBuffer`

## pdfjs-dist worker setup (Vite)
```ts
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
```

## Category types (Home.tsx) — current
`Text Tools | Calculators | Utility Tools | Developer Tools | PDF Tools | Image Tools | Daily Life | Writing Generators | Fun & Lifestyle` (defined in src/lib/tools.ts)

CATEGORIES order: Text Tools, Calculators, Daily Life, Utility Tools, Developer Tools, PDF Tools, Image Tools

## Current tool count
82+ tools (63 prior + 19 Writing/Fun sprint; GiftIdeaGenerator was upgraded in place, stays in Daily Life)

## Shared cross-cutting layer (do NOT duplicate per page)
- Layout.tsx renders GlobalSearch (header), ToolActionBar (trust badges + favorite/copy/share/report) on every tool route, breadcrumbs, rich footer, and pushes recents.
- src/lib/toolPrefs.ts: useFavorites/useRecentlyUsed (localStorage + useSyncExternalStore; snapshots must stay stable raw strings).
- ToolCard uses a "stretched link" (absolute inset Link) so the favorite star is NOT nested inside the anchor — keep it that way (a11y).

## JSX generic trap (Vite metadata plugin)
Never use JSX type arguments like `<Segmented<AgeRange> ...>` — the replit metadata Babel plugin injects attrs and produces a parse error (500 on the page). Use plain props + `as` casts instead.

**Why:** Any future tool addition must follow this checklist or the tool will be unreachable (no route) and invisible (not in homepage grid).
