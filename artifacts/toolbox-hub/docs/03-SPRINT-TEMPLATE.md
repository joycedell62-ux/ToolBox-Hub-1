# 📙 ToolBox Hub — Sprint Prompt Template

> Use this format to request each sprint. Keep sprints to **10–20 tools**. The sprint
> prompt lists ONLY the tools — all standards come from `01-MASTER-BLUEPRINT.md` and
> `02-UI-UX-STANDARDS.md`, which are always in force and never repeated here.

---

## How to send a sprint

Copy the block below, fill in the tools, and send it. Nothing else is needed — I already
hold the Blueprint and UI/UX Standards.

```
Sprint: <name / number>

Build these tools (each following the Master Blueprint + UI/UX Standards + Gold Standard):

Category: <Category name>
1. <Tool name> — <one-line what it does> — route: /<kebab-name>
2. <Tool name> — <one-line what it does> — route: /<kebab-name>
...

Category: <another category>
...

Notes (optional): <any special behavior, packages, or data for specific tools>
```

## What I will do for every sprint tool (automatically)

- Build the page in `src/pages/<Name>.tsx` following the **Gold Standard** exactly.
- Apply the **3-file rule**: wire `App.tsx` route, add to `Home.tsx` TOOLS array + bump
  counts, and add the `Layout.tsx` breadcrumb title.
- Keep it **pure frontend, offline-capable, mobile-first, accessible**.
- Match an existing reference tool visually (`UuidGenerator.tsx`).
- Verify the app compiles, screenshot-check a sample of the new tools, and report counts.

## What you do NOT need to restate each sprint

Vision, design system, colors, buttons, cards, animations, responsiveness, accessibility,
offline behavior, search, dashboard, branding, categories, platform rules, Gold Standard —
all permanent. Just give me the tool list.

## Example sprint

```
Sprint: Sprint 6 — Conversions

Build these tools:

Category: Utility Tools
1. Unit Converter — length/weight/volume/temperature — route: /unit-converter
2. Time Zone Converter — convert a time across zones — route: /timezone-converter
3. Roman Numeral Converter — number ↔ roman numerals — route: /roman-numeral-converter

Category: Developer Tools
4. Color Converter — HEX ↔ RGB ↔ HSL — route: /color-converter
5. Cron Expression Builder — build & explain cron strings — route: /cron-builder

Notes: Unit Converter should support metric + imperial and remember the last unit in localStorage.
```
