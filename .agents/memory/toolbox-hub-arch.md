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

## Export / html2canvas capture pattern
- `captureRef` div must live **outside** any `animate-in` wrapper (as a React Fragment sibling, `position: fixed; left: -9999px`)
- Never place captureRef inside the animated wrapper — html2canvas will silently fail

## Gold Standard — every tool page must include (in order)
1. Hero card: blue gradient (`bg-gradient-to-r from-blue-700 to-blue-500`)
2. Two-column layout (`lg:grid-cols-5`, left=`lg:col-span-2` controls, right=`lg:col-span-3` preview)
3. Drag-and-drop upload zone with dashed border + hover tint
4. Pro Tips card (blue-50 bg, Lightbulb icon, 4–6 tips)
5. FAQ section (4–6 Q&A pairs)
6. Related Tools (3–4 `<Link>` cards to sibling tools)
7. Feedback section (👍/👎 stored in localStorage)

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

## Category types (Home.tsx)
`'Text Tools' | 'Calculators' | 'Utility Tools' | 'Developer Tools' | 'PDF Tools' | 'Image Tools'`

## Current tool count
33+ tools (13 original + 10 PDF + 10 Image)

**Why:** Any future tool addition must follow this checklist or the tool will be unreachable (no route) and invisible (not in homepage grid).
