# derive-verb-gestures-from-the-declaration

**Status: scaffolded, not started (2026-09-30).** Follows
`declare-drag-games-click-half`.

## Why

A game declaring `targetVerbs` has told the engine which verb each button
applies and where a press addresses each target. Two places in those games
still work both out again by hand. Measured 2026-09-30, at `6f55ee57`; re-take
each population by the query given, not from these figures.

**Hint gestures.** `hintGesture` of a declaring game asks the pointer for the
step's clicks. Where it calls `verbGesture`, the point comes from the
geometry's `pointAt`, which `target-verb.test.ts` holds to `pointerTarget`.
Where it does not, the game recomputes a cell's center with its own
arithmetic, and picks the button by re-asking its own transform. Pattern's is
the shape: `clickBlack(state.grid[i]) === m.value ? "primary" : "secondary"`
beside a hand-built `toCoord(…) + half`. Query: declaring games whose sources
mention `hintGesture` and neither `verbGesture` nor `routeGesture`. That was
twelve: Boats, Bricks, Clusters, Galaxies, Loopy, Palisade, Pattern, Separate,
Spokes, Sticks, Tents, Tracks. Some of their steps are drags (Tents' link,
Galaxies' arrow), which stay the game's; the question is only the clicks.

**Press and release arms.** The nine drag games and Mines each write, in
their own press arm, `geometry.parkCursor(ui, t); ui.cursor.visible = false`,
which is the model's press. On a one-cell release they write
`(left ? primary : secondary).apply(…) ?? UI_UPDATE`, which is the model's
private `pointerVerb`. Query: `parkCursor(` and `.apply(` … `?? UI_UPDATE` under
`src/games/`.

## What changes

- The engine derives a click step's gesture from the declaration: which
  target, which verb and how many presses make the step's move. It finds them
  by applying the verbs, never through a hint-side table, so it cannot
  disagree with what the buttons do. A game's `hintGesture` keeps only the
  steps no click makes.
- `target-verb.ts` exports the press (park and hide) and the button's verb for
  an arm to call, so a drag game's arm no longer spells either.

Open question for the design, not to be decided here: whether a
derived click gesture needs the game to split a multi-target move into
per-target results (Pattern's `fillCells`), or can compare boards after
`executeMove`. That is the difference between a small hook and none.

## Hints to pull in

**Mosaic** (from `hintless-games-in-reserve`). It is a click-and-drag game with
a hand-written Enter/Space branch that has not declared `targetVerbs`, so it is
the tenth drag game's conversion and then a new hint whose click steps are
derived from the start. Whether Mosaic's Space agrees with its right button is
not measured: its `CURSOR_SELECT2` sets a `double` flag. Measure it with
`boardsReached` before assuming it fits, and treat a misfit as a question
about the model first (AGENTS.md § "Convention over configuration").
