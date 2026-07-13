# 📗 ToolBox Hub — UI & UX Standards (PERMANENT)

> Visual and interaction contract for every ToolBox Hub tool. Pair with the Master
> Blueprint (`01-MASTER-BLUEPRINT.md`). When in doubt, copy an existing Gold Standard
> tool (`src/pages/UuidGenerator.tsx`) and change only the logic.

---

## 1. Colors

**Primary brand blue** drives everything.

| Token | Value | Use |
|---|---|---|
| Hero gradient | `linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)` | Every tool hero card |
| Primary blue | `#2563eb` (`blue-600`) | Buttons, active states, accents, `accent-blue-600` |
| Deep blue | `#1e3a8a` (`blue-900`) | Gradient anchor, strong text on light |
| Hero subtext | `text-blue-100` / `text-blue-200` | Descriptions inside hero |
| Page background | `#f8fafc` (`slate-50`/`gray-50`) | App canvas |
| Card surface | `#ffffff` with `border-gray-100 shadow-sm` | All content cards |
| Muted text | `text-gray-500` (labels), `text-gray-400` (hints) | Secondary info |
| Body text | `text-gray-900` / `text-gray-700` | Primary content |
| Success | `green-600` / `green-50` bg | Confirmations, "copied" |
| Warning/urgent | `orange-500` / `amber` | Time-sensitive states |
| Danger | `red-600` / `red-50` bg | Errors, destructive actions |

Each **category** has a distinct accent color used on its Home badge/pill — keep these
stable so users learn them.

## 2. Buttons

- **Primary:** `bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-3`,
  with icon + label; `transition-colors`. Full-width in control panels.
- **Secondary:** white bg, `border border-gray-200`, `text-gray-700`, same radius/padding.
- **Ghost/link:** blue text, no border, for "Copy All", Related Tools, etc.
- **Icon buttons** (copy, shuffle): square, `rounded-lg`, subtle gray hover tint.
- Buttons always show state feedback: e.g. copy → check icon + "Copied" for 2s.
- Minimum touch target **44×44px** on mobile.

## 3. Cards & Layout

- **Radius:** `rounded-2xl` for hero and major cards; `rounded-xl` for inner elements.
- **Elevation:** `shadow-sm` + `border border-gray-100`. No heavy drop shadows.
- **Spacing:** page uses `flex flex-col gap-10`; cards use `p-5` to `p-8`.
- **Standard tool layout:** two columns on desktop —
  `grid lg:grid-cols-5 gap-8`; **controls** = `lg:col-span-2`, **output** = `lg:col-span-3`.
- On mobile the columns stack (controls first, then output).

## 4. Mobile Responsiveness (mobile-first)

- **Design for 375px first**, enhance upward with `sm:` / `md:` / `lg:` breakpoints.
- All multi-column grids collapse to a single column on small screens.
- No horizontal scroll. Tables/wide output become scrollable containers or reflow.
- Hero text scales: `text-2xl` on mobile → larger on desktop.
- Inputs are full-width and comfortably tappable; sliders use `accent-blue-600`.
- Test every tool at **375px, 768px, and 1280px** before shipping.

## 5. Animations

- **Subtle and fast.** `transition-colors` / `transition-all` at ~150–200ms.
- Entrance: gentle fade/slide (`animate-in`) for page content — keep short, never blocking.
- Micro-feedback: copy checkmarks, button hover, accordion chevron rotate.
- **Never** animate anything that delays the user seeing their result.
- Respect `prefers-reduced-motion` — disable non-essential motion.

## 6. Accessibility

- Semantic HTML: real `<button>`, `<label htmlFor>`, headings in order (`h1` per page).
- All interactive elements keyboard-reachable with a visible focus ring.
- Color contrast ≥ WCAG AA (4.5:1 for text). Never convey meaning by color alone.
- Inputs have associated labels; icon-only buttons have `aria-label`.
- Accordions/toggles expose state (`aria-expanded`).
- Images have `alt`; decorative icons are `aria-hidden`.

## 7. Offline Behavior

- Core tool logic must work with **no network** after first load (pure client-side).
- Prefer native browser APIs (`crypto`, `Canvas`, `FileReader`, `Blob`) over remote calls.
- Any bundled data (e.g. currency rates, tax brackets) ships **in the app** and is labeled
  as static/offline so users know it isn't live.
- Persist user work to `localStorage` so a refresh or reconnect never loses data.
- If a tool genuinely needs the network, it must degrade gracefully and say so explicitly.

## 8. Search

- Prominent search bar in the Home hero: placeholder
  `Search tools — try "password" or "calculator"…`.
- **Autocomplete:** as the user types, show a dropdown of up to **5** matching tools
  (match on title + description + category), each navigable by keyboard and click.
- Empty query shows nothing; no results shows a friendly "no tools found" hint.
- Search is instant and client-side (filters the `TOOLS` array).

## 9. Dashboard (Home page)

The Home page is the dashboard and must contain, in order:
1. **Hero** — badge (tool count + "No sign-up required"), wordmark, tagline, search bar
   (with autocomplete), primary CTAs, and a **Random Tool** button.
2. **Favorites** — tools the user starred (⭐ on each ToolCard), from `localStorage`;
   hidden when empty.
3. **Recently Used** — last tools visited, tracked in `localStorage`; hidden when empty.
4. **Tools by category** — every tool grouped under its category heading with the
   category accent, each as a `ToolCard` (icon, title, description, `New` badge, ⭐).

---

## Gold Standard — every tool page, in this order

Copy `src/pages/UuidGenerator.tsx` as the reference implementation.

1. **Hero card** — `rounded-2xl text-white p-8`, background
   `linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)`; icon tile (`bg-white/20 p-2.5
   rounded-xl`) + `h1` (`text-2xl font-extrabold`) + one-line feature summary
   (`text-blue-200`) + a short description paragraph (`text-blue-100`).
2. **Two-column body** — `grid lg:grid-cols-5 gap-8`; controls `lg:col-span-2`, output
   `lg:col-span-3`; both stack on mobile.
3. **Controls card(s)** — white `rounded-2xl border border-gray-100 shadow-sm p-5`, with
   clearly labeled inputs (`text-xs font-semibold text-gray-500` labels).
4. **Output/result area** — obvious, copyable/downloadable where relevant, with instant
   state feedback and explicit empty/error states.
5. **Pro Tips card** — `bg-blue-50`, Lightbulb icon, 4–6 practical tips.
6. **FAQ section** — 4–6 Q&A pairs in a chevron accordion.
7. **Related Tools** — 3–4 `<Link>` cards to sibling tools in the same/adjacent category.
8. **Feedback** — 👍/👎 stored in `localStorage` (key `feedback_<toolname>`).

For file/image/PDF tools, also include a **drag-and-drop upload zone** (dashed border +
hover tint) and use the html2canvas capture pattern: the `captureRef` node lives **outside**
any `animate-in` wrapper (fixed, off-screen) or capture silently fails.

## Import hygiene (prevents build breaks)
- Never import a lucide icon whose name collides with the page component (`Home`) or with an
  already-imported icon (`Search`). Pick a different icon rather than aliasing the same one —
  duplicate imports from the same module throw Babel "Duplicate declaration".
