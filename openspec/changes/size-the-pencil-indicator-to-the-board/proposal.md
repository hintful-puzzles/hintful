# size-the-pencil-indicator-to-the-board

**Status: scaffolded, not started.** Found while running the app for
`own-the-select-or-drag-gesture` (2026-09-22): Map's pencil-mode indicator is a
speck. Nothing in that change touches the indicator; this is the engine's
sizing rule meeting the collection's finest-grained board.

## Why

`pencilIndicatorSize(tileSize)` is `max(8, round(tileSize / 2) - 2 * inset)`, so
the glyph is **half a tile** — and the indicator's job is to say *the mode is
on*, which is a fact about the whole board rather than about a cell. On the
games whose tile is large that reads fine. On a fine-grained board it collapses
onto the floor.

Measured 2026-09-22, each game's own frame at a 682×556 viewport, glyph box:

| game | canvas | glyph |
| --- | --- | --- |
| Map | 417×547 | **9×9** |
| Rome | 556×556 | 30×30 |
| Keen | 552×552 | 30×30 |

Map's `preferredTileSize` is 20, the smallest in the collection, so it lands on
the `max(8, …)` floor. The floor's own comment says it exists so the pencil is
"never so small that [it] stops reading as one on a tiny board" — and at 9px on
a 417px canvas it does not read as one. The floor is protecting the wrong
quantity: it bounds the glyph against the *tile* when what makes a cue legible
is its size against the *canvas* and against the viewer.

**Not a color problem.** Map draws the glyph in the grid ink rather than a
region color, deliberately and with its reason at the site — one of its four
colors "would read as a fifth region". That stays.

## What a fix has to weigh

- **The canvas margin comes from the same number.** `pencilIndicatorReach`
  sizes the border every member reserves, and `pencilIndicatorCanvas` grows the
  canvas on all four sides by it. Growing the glyph grows every member's margin
  and moves every board, so this is a **player-visible change across the whole
  note-taking family** and wants the owner's eye, not just a green suite.
- **`pencil-indicator-placement.test.ts` passes today**, because it asserts the
  corner and the reservation rather than legibility. Whatever replaces the rule
  needs an assertion with a *lower bound relative to the canvas* in it, or the
  next fine-grained game lands on the floor again in silence.
- **The obvious shape** is a size with both bounds — a fraction of the canvas's
  short side, clamped into a range — so a coarse board's glyph stops growing
  and a fine board's stops shrinking. Check it against the whole family before
  picking the constants; `AGENTS.md` § "An optimized artifact needs its bounds
  asserted" is the warning that applies.

## Tasks

- [ ] 1.1 Measure the glyph and the canvas for every member, not the three
      above, and say which of them the current rule serves.
- [ ] 1.2 Decide the rule (canvas-relative with both bounds, or a raised floor)
      and state what it costs each member's margin.
- [ ] 1.3 Give `pencil-indicator-placement.test.ts` the bound it lacks.
- [ ] 1.4 Run the app across the family; this moves boards, so the owner sees it.
