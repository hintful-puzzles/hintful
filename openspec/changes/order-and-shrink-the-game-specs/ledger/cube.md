# cube

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Look: Cube's win flash sweeps the squares of the arena | title kept. Sentence 1 (the sweep is diagonal; a square's position is its center's; a lit square is filled with a flash color) cut to what is the game's, that the elements are the arena's squares on either grid. Sentence 2 (the solid is drawn over the arena) and the scenario untouched | the diagonal and the center: `ts-engine`, "A game gives each element a position, and the route is which position it gives" ("`sweepStep` of its center otherwise: a diagonal from the bottom left to the top right"); the fill: `engine-colors`, "A solved flash drawn as a color takes a shared color" ("The ground of a cell … SHALL be filled with the role's color"). `flash.win(sweepStep(cx, cy))`, `src/games/cube/render.ts:154` |

## Kept, and why

Cube declares little to the engine: its codec is written out, it has no
`targetVerbs`, no hint, no Solve, no tiers and no preferences, so all but one
of its requirements state a hand-written function and stand as they were.

- **Params: Cube params are a solid and two dimensions.** `encodeParams` and
  `decodeParams` are functions (`src/games/cube/state.ts:89`-`103`). "which
  keeps the default solid" and "`d2` SHALL default to `d1`" are what a
  missing piece decodes to.
- **Params: Cube refuses a grid too small for its solid.** All of it is
  `validateParams` (`state.ts:105`); the `bounds: { min: 0 }` of the two
  number items (`src/games/cube/index.ts:333`, `:341`) refuse only a negative
  number, which the spec does not restate.
- **Description: A Cube description loads only with exactly a solid's worth
  of paint**, "so a description painting more squares or fewer does not
  load". `engine-params`, "A board its game proves has no solution does not
  load" states the refusal; the clause is what ties `hasNoSolution` to a
  description, as in Fifteen's.
- **Controls: A click rolls the solid toward the pointer**, "The right button
  SHALL do nothing." `ignoresSecondaryButton` (`index.ts:316`) says a touch
  is never promoted to it (`engine-input`, "A game with no secondary meaning
  is not given a synthetic one"); that a mouse's right button is declined is
  `interpretMove`'s (`index.ts:239`).
- **Status bar.** `statusbarText` is hand-written, and the sentence does not
  restate the completion words.
- **Look: Cube draws the solid in projection and animates a roll**, "over the
  roll duration". `animLength` (`index.ts:372`) gives the length, which the
  sentence does not; the interpolation is `redraw`'s.
- **Look: Cube draws its arena…**, "the collection's color for a thing the
  player carries, the theme pair's first member". `engine-colors`, "The
  pair's hues carry what a player moves, seeks and finishes" says what the
  hue means; that Cube's painted square takes it is the requirement.

## Engine requests

None.

## Found

- **The spec does not say that trailing characters refuse a params string**
  (`endParams`, `state.ts:98`); `engine-params`, "A params string is read
  whole or refused" does, of every game. Nothing owed.
- **The spec does not give the labels of Cube's presets**, which name the
  solid and leave out a preset's own grid (`hasPresetSize`, `state.ts:72`,
  read by the `label` of `index.ts:335`). It is a declaration, and the
  `cube` entry of `src/engine/__snapshots__/params-stability.test.ts.snap`
  holds "Tetrahedron", "Octahedron" and "Icosahedron".
- **A painted square of the arena is never lit by the win flash**
  (`render.ts:156`-`161`: paint is tested before the tone). It cannot be seen:
  a solved board has every face painted and so no painted square left, since
  a roll never makes or loses paint. The spec is silent on it and loses
  nothing.
- **"Rules: Cube roll moves transform orientation and swap paint", scenario
  "Rolling tips the solid onto a new face"** says "the new state's resting
  face differs per the polyhedron's geometry", which names no case.
- **Cube has neither `hint` nor `solve`**, so by the doctrine it is a draft;
  the spec owes no `Hint` or `Solver` subject and has none.

## Review

1 row read, against the two requirements it names, read whole; 1 row
corrected, no sentence restored.

Changed:

- **"Look: Cube's win flash sweeps the squares of the arena"**: "each at the
  position the collection gives one (`ts-engine`, …)" was the copy with a
  citation attached, in a subject that says plenty of its own. Removed; the
  sentence keeps that the elements are the arena's squares on either grid.

Checked and found sound:

- `ts-engine`, "A game gives each element a position, and the route is which
  position it gives" states the diagonal and the center, and `engine-colors`,
  "A solved flash drawn as a color takes a shared color" the fill of a cell's
  ground; `flash.win(sweepStep(cx, cy))` is at `render.ts:154`.
- The 15 requirements left as they stood, read by sentence against the three
  classes: the codec is two functions (`state.ts:89`-`103`), every refusal
  is `validateParams`'s, and the game declares no `targetVerbs`, legend,
  tiers or preferences to restate. None is a copy, and no cut is forced.
  "The right button SHALL do nothing" stays: `engine-input`, "A game with no
  secondary meaning is not given a synthetic one" is about a touch's
  promotion and not a mouse's right button.

## Third pass

Nothing cut: the spec is as the review left it. 0 rows of the third-round
tables and their reviews name Cube, and this ledger filed no request.

Read for the round's rules in other words, and for the two sentences of the
brief's section 2: 0 found. What reads nearest, and stays, 1 clause: "The
solid SHALL be drawn over the arena as on any other frame", in "Look: Cube's
win flash sweeps the squares of the arena". `engine-colors`, "A lit beveled
tile is lit on its face and keeps its bevel" is of a tile the flash lights;
Cube's flash lights the arena's squares and never the solid, which is what
the sentence says. Cube declares no `targetVerbs`, so the geometry of a grid
of squares is not its, and it has no hint, mistake check or tiers for the
other rows to bind.

Each subject read alone: none hollow, no fragment, every title fits.
