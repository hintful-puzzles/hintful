# Design: cover-hints-in-help-and-guard-tile-flags

## D1. The help guard is a vitest file, and the scaffold's reason against it was false

The scaffold worried that "a doc-only commit skips vitest, and a help edit that
deletes the section is exactly a doc-only commit". It is not: `scripts/gate.sh`'s
documentation-only shortcut lists `docs/`, `openspec/` and the root agent files,
and `help/` is deliberately absent because it is a `vite build` input. The test
selector's own `--verify` holds the coupling "a help page selects help-coverage
through its glob". And the guard needs `HINT_GAMES` and each game's
`paramConfig`, which only a loaded registry can give; a node script cannot load
the engine. So it sits in `src/help-coverage.test.ts`.

## D2. One skeleton for every page, owed by the game

Widened on the owner's word ("feel free to make this change bigger in scope, e.g.
to standardize the help pages more fully"). The thirteen pages from
puzzles-unreleased already had a shape — rules, `## Controls`, `## Hints`,
`## <Name> parameters` — and the forty-four adopted from upstream's short
overview fragments had rules and controls in one unheaded run and no parameters
at all, their parameters having lived in the deleted manual. Every page now has
the first shape, and what it owes is read off the game: `hint()` decides the Hints
section, `paramConfig` decides what the parameters section names.

The parameters half is a **content** check, and a sound one: it keys on the
labels the Custom dialog renders, which is what a player picks from. A choice is
held too when it is a word ("Adjacent", "Penrose (rhombs)") rather than a value
("5%"). Tier names are exempt through the difficulty item the game already
declares (`difficultyTiers` returns that item's own array, compared by
reference), because `features.md` explains them once. The Hints half is
presence only.

Writing the sections from each game's own hint text and a rendered hint found
defects in the hints themselves, fixed here with tests: Boats called a column
"striped" and ringed it; Spokes drew a rule-out exactly as a finished mark;
Solo said "highlighted" for outlines; Rome's `opposite` sentence dropped the
premise that makes it follow; Group said "a element". It also found help
sentences wrong about this app (Guess's hint marks, Crossing's and Undead's
pencil marks, Magnets' click cycle, Signpost's right-drag, Same Game's column
collapse, Inertia's "Game menu", the whole collection's "‘Custom…’" for a menu
item called "Custom type…"), each corrected against the code.

## D3. The tile-flag guard is a repaint differential, not a flag list

The scaffold proposed checking each module's packed flags for collisions,
deriving the flags from source. A census of every game's keys (52 games, ~118
keys, ~710 items) found **three real collisions and none of them was two named
flags sharing a bit**:

- Solo and Unequal: `hintMarkBit(n) = 1 << (2 + n)` shares a word with the two
  role bits, and a shift counts mod 32, so values 30 and 31 packed as "target"
  and "evidence" (and Unequal's 32 as nothing that is read).
- Subsets: the inspect badge read `ui.highlightCell`, which no key named.

A disjointness check over the named flags would have passed over all three and
reported health — the guard measuring a neighbor, AGENTS.md's most repeated
defect. What a collision *does* is make a warm frame differ from a fresh paint of
the same state, and that is directly checkable:
`engine/testing/repaint-differential.ts` drives a real `Midend` through seeded
input and compares every frame with its fresh-draw-state twin on a raster where
each op claims only pixels it surely paints (the first cut claimed bounding boxes
and convicted 27 games of pixels the canvas never had). It catches every cause at
once — collision, overflow, missing key term — and needs no declaration from any
game. `warm-repaint.test.ts` runs it for every registered game.

## D4. The engine owns the candidate encoding

The census's two overflows are one convention written out by hand: value `n` at
bit `n`, the full set as `(1 << (n + 1)) - (1 << 1)` (which is -1, bit 0
included, at 31), and marks decoded out of the sidecar word as `>> 2`, `>> 3`,
`(>> 2) & 7` in twelve renderers. So:

- `engine/candidate-bits.ts`: `valueBit`, `valuesOneTo`, `MAX_CANDIDATE_VALUE`,
  range-checked so nothing wraps silently.
- `OverlaySidecar` gains a `struck` lane beside its order, outline and hatch
  lanes; `stale`/`commit` cover it; `hintMarkBit` is deleted. The twelve
  renderers read the lane. Every existing snapshot passed unchanged — the
  migration is exact below value 30.
- `applyNoteMove` in `candidate-hint.ts` applies the three note moves the engine
  already defines, for the six square Latin games that applied them by hand.
  The five games with their own note encoding or emptiness keep their arms.
- Unequal's order is capped at 31 (owner's choice, asked before: an order-32 id
  is now rejected cleanly; 32 values cannot fit the encoding, and the
  alternative re-encoded every Latin mask).

## D5. What the repaint differential found on its first run

Twenty-seven games failed the first cut, and the count was the instrument's
before it was the games'. Each approximation convicted someone innocent once:
bounding boxes spilled into neighbors; polygons claiming only their centroid,
and outline-only polygons claiming nothing, left older claims standing under
pixels the canvas repainted; blitters were not replayed; a line end and a 1×1
rect of one ink read as different. The raster is now a raster of inks, exact for
rects, polygons, circles and one-pixel strokes because production draws at
`+ 0.5`, and it replays blitters.

What remained was real, fixed in each game with a test that reuses one draw
state and was seen red first: `HintMarks` erasing a removed band after the tile
loop over cells that had just repainted (Clusters, Group; Keen and Solo, whose
tiles widen under the band, now erase through `HintMarks.eraseBeforeTiles`
before the loop); Clusters and Group not keying tiles on a mark's outline
sides; Bricks' target ring and Netslide's ring drawn over borders shared with
neighbors; Magnets painting a domino half into its partner; Unequal's outline
one pixel wide into the gap; Netslide's sliding line painting over its
neighbors' border; Sixteen's hint erase dropping the cursor's lowlight; Subsets'
frames crossing grid gaps only the first frame paints; Towers' 3D faces
spilling into cells that checked only their own overlays. Sweep: 58 of 58.

## Not done here

- Group's `findMistakes` ignores a mark that has crossed out the answer while
  its siblings flag it: `share-the-note-mistake-check`.
