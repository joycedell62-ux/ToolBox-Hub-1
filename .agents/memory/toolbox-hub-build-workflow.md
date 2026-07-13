---
name: ToolBox Hub Build Workflow
description: How the user wants ToolBox Hub built — three permanent prompt docs in the repo, plus tool-list-only sprints.
---

# ToolBox Hub Build Workflow

The user established a professional prompt structure for building ToolBox Hub at scale
(hundreds of tools) with consistency. Three permanent docs live in the repo:

- `artifacts/toolbox-hub/docs/01-MASTER-BLUEPRINT.md` — vision, navigation, branding,
  categories, platform rules, the 3-file rule.
- `artifacts/toolbox-hub/docs/02-UI-UX-STANDARDS.md` — colors, buttons, cards, mobile-first,
  animations, accessibility, offline, search, dashboard, and the Gold Standard checklist.
- `artifacts/toolbox-hub/docs/03-SPRINT-TEMPLATE.md` — the per-sprint prompt format.

**The rule:** Blueprint + UI/UX Standards are ALWAYS in force. The user sends sprints that
contain ONLY the tool list (10–20 tools). Build every tool against the permanent standards
without asking the user to restate them.

**Why:** The user explicitly prefers this over one giant prompt — it keeps hundreds of tools
consistent and easier to follow. Restating standards each sprint or ignoring the docs would
break the workflow they set up.

**How to apply:** Before any ToolBox Hub sprint, read the three docs (and
`toolbox-hub-arch.md`). Treat `src/pages/UuidGenerator.tsx` as the Gold Standard reference.
Apply the 3-file rule (App.tsx route, Home.tsx TOOLS entry + count bump, Layout.tsx title)
for every tool. Also noted in `replit.md` (Where things live + User preferences).
