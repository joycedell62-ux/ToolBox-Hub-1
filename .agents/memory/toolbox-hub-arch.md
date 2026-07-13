---
name: ToolBox Hub Architecture
description: Routing conventions, export/capture pattern, Gold Standard checklist, installed packages, and integration steps for adding new tools.
---

# ToolBox Hub Architecture

## Stack
- React + Vite + Tailwind + shadcn/ui + Wouter routing
- All tools are pure frontend (no backend)
- Located at `artifacts/toolbox-hub/`; preview path = `/` (root)

## Three files must be updated together when adding any new tool
1. `src/App.tsx` — import + `<Route path="..." component={...} />`
2. `src/pages/Home.tsx` — add to TOOLS array (title, description, icon, href, category, isNew); update hero badge count + STATS count; if new category, add to Category type and CATEGORIES array
3. `src/components/Layout.tsx` — add `case '/route': return 'Page Title';` to `getPageTitle()`

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
`'Text Tools' | 'Calculators' | 'Utility Tools' | 'Developer Tools' | 'PDF Tools' | 'Image Tools' | 'Daily Life'`

CATEGORIES order: Text Tools, Calculators, Daily Life, Utility Tools, Developer Tools, PDF Tools, Image Tools

## Current tool count
63+ tools (33 original + 9 Calc sprint5 + 10 Daily Life + 6 Text V2 + 5 Dev V2)

**Why:** Any future tool addition must follow this checklist or the tool will be unreachable (no route) and invisible (not in homepage grid).
