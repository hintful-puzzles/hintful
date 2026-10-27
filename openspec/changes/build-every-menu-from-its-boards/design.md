# Design: build-every-menu-from-its-boards

## Context

`presetGrid(paramConfig, boards, opts)` returns a `PresetMenu`, and
`Game.presets()` returns one too, so a game may call the builder or write the
list itself and nothing tells the two apart. `presetMenu`
(`engine/param-label.ts`) post-processes whatever `presets()` returns: it
titles the leaves and, for a game with a ruleset field, splits a flat list
into one section per ruleset.

## Decisions

- **Prefer a declaration the engine consumes over a convention a scan
  checks.** If `Game` names its boards (and `tiers` and `variants`) and the
  midend calls `presetGrid` itself, a hand-built menu cannot be written. A
  source scan for `presetGrid(` would key on a name and rot
  (`docs/method.md`). Task 1.2 confirms this once the hand-built menus are
  sorted: a menu the builder cannot express is what would argue for keeping
  `presets()`.
- **The menus do not change.** The `params-stability` snapshot is the guard;
  a moved line is read and fixed, never re-baselined.

## Open questions

- Do the three games with sectioned menus (Loopy, Solo, Singles) fit
  `presetMenu`'s per-ruleset split, or do they hold sections of another kind?
