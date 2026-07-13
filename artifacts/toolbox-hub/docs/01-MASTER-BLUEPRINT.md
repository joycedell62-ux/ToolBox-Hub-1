# 📘 ToolBox Hub — Master Blueprint (PERMANENT)

> This is the ToolBox Hub Master Blueprint. Every tool ever built must follow these
> standards. Read this before starting any sprint. This document is permanent — it does
> not change per sprint. Sprints only add tools; they never override this blueprint.

---

## 1. Vision

ToolBox Hub is a **free, no-sign-up collection of fast, single-purpose online tools**
that make everyday tasks faster and easier. The promise to the user:

- **No downloads, no accounts** — open a tool and use it immediately.
- **Instant & private** — everything runs in the browser; user data never leaves the device.
- **One job per tool, done well** — each tool is focused, fast, and obvious to use.
- **Scales to hundreds of tools** without ever feeling inconsistent or cluttered.

Success = a user lands on any tool, understands it in 3 seconds, and gets their result
without friction, ads, or confusion.

## 2. Product Scope

Tools are grouped into **categories** (see §6). Every tool is:
- **Pure frontend** — no backend, no server round-trips for the core function.
- **Self-contained** — one route, one page, one clear purpose.
- **Offline-capable** — works after first load with no network (see UI/UX Standards §7).

## 3. Design Philosophy

- **Calm, trustworthy, professional.** Blue-led palette, generous white space, soft shadows.
- **Content first.** The tool's controls and output are the hero — decoration never competes.
- **Consistency over novelty.** A user who learns one tool knows how to use all of them.
- Full visual detail lives in **📗 UI & UX Standards** (`02-UI-UX-STANDARDS.md`).

## 4. Navigation & Information Architecture

- **Home / Dashboard** (`/`) — hero + search + category-grouped tool grid + Favorites +
  Recently Used. This is the front door.
- **Tool pages** — one route per tool (kebab-case, e.g. `/uuid-generator`).
- **Layout shell** — persistent top bar (logo → Home, About link) wraps every page and
  shows a breadcrumb (`Home › Tool Name`).
- **Every tool is reachable three ways:** category grid, search, and Random Tool button.

### The 3-file rule (adding ANY tool)
Every new tool requires edits to exactly these three files, together:
1. `src/App.tsx` — import + `<Route path="/kebab-name" component={Tool} />`
2. `src/pages/Home.tsx` — entry in `TOOLS` array (title, description, icon, href,
   category, `isNew`); bump hero badge + STATS count; if new category, extend the
   `Category` type and `CATEGORIES` array.
3. `src/components/Layout.tsx` — `case '/kebab-name': return 'Tool Name';` in `getPageTitle()`.

Miss any one and the tool is either unreachable (no route), invisible (not in grid), or
mislabeled (no breadcrumb title).

## 5. Branding

- **Name:** ToolBox Hub. **Logo:** wrench icon in a rounded blue tile + "ToolBox Hub" wordmark.
- **Tagline:** "Free online tools to make everyday tasks faster and easier. No downloads,
  no accounts — just open and use."
- **Wordmark treatment:** "ToolBox" in white, "Hub" in a lighter blue/lavender gradient.
- **Voice:** friendly, plain-language, confident. No jargon in headings. A light emoji is
  acceptable in Pro Tips, never in headings or buttons.
- **Trust signals:** "63+ Free Tools — No sign-up required" badge; "runs in your browser"
  framing; never ask for personal data the tool doesn't need.

## 6. Categories

Canonical list and order (must match `CATEGORIES` in `Home.tsx`):

1. **Text Tools** — manipulate, analyze, transform text.
2. **Calculators** — math, health, finance, everyday calculations.
3. **Daily Life** — planners, lists, reminders, household organization.
4. **Utility Tools** — general-purpose helpers (QR, passwords, etc.).
5. **Developer Tools** — JSON, encoding, hashing, IDs for programmers.
6. **PDF Tools** — merge, split, compress, convert PDFs.
7. **Image Tools** — resize, crop, convert, compress images.

Adding a new category is a deliberate act: extend the `Category` union type and the
`CATEGORIES` array (with a distinct accent color), and confirm it earns its place — do
not fragment existing categories.

## 7. Platform Rules (non-negotiable)

1. **No backend for tool logic.** All processing is client-side. No user file or text is
   uploaded to a server.
2. **Privacy by default.** Persist only to `localStorage`, scoped per tool. Never collect PII.
3. **Follow the Gold Standard** (see `02-UI-UX-STANDARDS.md` §Gold Standard) for every tool
   page — no exceptions, no "quick" tools that skip sections.
4. **Mobile-first.** Every tool must be fully usable on a 375px-wide screen (see UI/UX §3).
5. **Graceful failure.** Tools state errors explicitly (invalid input, unsupported file) —
   never fail silently or with a blank screen.
6. **Accessibility is required, not optional** (UI/UX §6).
7. **Consistency check before shipping a sprint:** every new tool visually and structurally
   matches an existing Gold Standard tool (e.g. `UuidGenerator.tsx`).
8. **Keep files orderly.** One component per tool file in `src/pages/`; shared UI in
   `src/components/`. No giant catch-all files.

---

### Companion documents
- **📗 `02-UI-UX-STANDARDS.md`** — colors, buttons, cards, responsiveness, animations,
  accessibility, offline, search, dashboard.
- **📙 `03-SPRINT-TEMPLATE.md`** — the per-sprint prompt format (just the tool list).
