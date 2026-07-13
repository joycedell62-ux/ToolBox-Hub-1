---
name: ToolBox Hub render-loop trap
description: The derived-object-in-callback-deps pattern that causes infinite re-renders in canvas tool pages, and how to audit for it.
---

# Infinite re-render trap (canvas/live-preview tool pages)

**The trap:** a value derived each render (e.g. `const x = ARR.find(...)` or an object/array literal) is put into a `useCallback`'s dependency array; that callback is then a dependency of a `useEffect` that calls `setState`. Because the derived value is a **new reference every render**, the callback is recreated every render, the effect re-runs every render, `setState` triggers another render → infinite loop ("Maximum update depth exceeded").

**Fix:** wrap the derived value in `useMemo` keyed on the stable primitive it depends on (e.g. `useMemo(() => ARR.find(l => l.id === id)!, [id])`). Then the callback and effect become stable.

**Why:** effect/callback deps are compared by reference. Primitives and unchanged state refs are stable; freshly-computed objects/arrays are not.

**How to apply / audit:**
- Safe patterns that look scary but are NOT loops: effect deps that are value-compared strings (a recomputed string with the same value is stable); empty-dep `ResizeObserver` effects that `setState` (only fire on real size change, and only if the observed element's size doesn't feed back); `useCallback`s triggered by user events (not auto-run); `useCallback`+`useEffect(() => fn(), [fn])` where the callback's deps are all primitives/stable state (e.g. PasswordGenerator, AgeCalculator).
- Quick sweep: `grep -rl useCallback src/pages` ∩ files with `useEffect` and derived `.find(`/object literals are the candidates. Also scan that every `useEffect` has a dependency array (a missing array = runs every render).
- Verified once across all 66 pages: only PhotoCollageMaker actually looped; everything else was one of the safe patterns above.
