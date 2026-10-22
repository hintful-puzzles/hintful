# Design — add-edges-skeleton

## D1 — The skeleton's puzzle

A skeleton's puzzle is only there to make the concerns run (`src/skeleton/
README.md`), so it is the smallest edges puzzle that needs every one: a line
drawn through squares under a rule a Check rung reads, connectivity (no loop,
or one loop), and boards where a bounded look-ahead is needed for its harder
tier. Choose it in this change; Path's rules cut down are one candidate, a
single-loop puzzle with count clues another. It must not be a game of the
collection.

**Chosen (2026-10-22): one loop through every square, never crossing a
wall.** The desc is the walls, as `engine/wall-runs.ts` writes them, in the
order `square-edges.ts` numbers edges. Every square takes two lines, so the
Check rung is Path's degree count with nothing else; the connectivity is a
loop that may close only through every square, which runs the line drag
with `loops: true` (Path runs it with `false`, Pearl with `true`). The
Normal rung is Path's bounded look-ahead. The generator is the grid
skeleton's shape: an answer at random, every clue it allows (a wall on
every edge the loop does not use), and clues taken away while the ladder
still finishes the board at the tier.

Why not the two candidates: a count clue on a loop that need not pass every
square makes a square's degree unknown (0 or 2), which needs a rung that
decides a square is on or off the loop, a fact the player has no mark for
(`hints-marks.md` § "Give the facts a notation"); and Path cut down keeps
Path's generator, which lays, mends and strips paths, about 235 lines, where
a wall puzzle strips clues the way the grid skeleton does. A clue on a
square, which most edge games have, is the grid skeleton's codec already.

The answer is a loop from a random spanning tree of 2 × 2 blocks: each
block's four squares make a small loop, and each tree edge joins two of them.
That needs an even width and height, which `validateParams` refuses
otherwise. A copy whose puzzle has its own answers drops it with the rest of
the generator.

## D2 — What it owns versus what the engine owns

Everything the three earlier changes made shared is a declaration here, not
code: if the skeleton writes a helper, the earlier change missed it, and it
goes back to the engine. Write down each one found.

**Found, and moved to the engine with Path on them (2026-10-22).** Each was
written word for word in Path and the skeleton, and a copy would be a third:

- `edgeMistakes` and `EdgeMistake` (`line-drawing.ts`): the mistake check of
  a game that stores a mark per edge, the rule of `solver-and-generator.md`
  § "Edge games flag set edges only".
- `hintGesture` on what `lineDrawing` returns: a click on each edge a step
  sets, the left button for a line and the right for a cross.
- `stepEdgeHints` and `EdgeChainLink` (`edge-hint.ts`): a step's edges as
  `EdgeHint`s, read from its words, its move and its chain. The earlier
  change shared what an edge mark is and how it is drawn, but left each
  render to read a step into them.
- `trackEdgeStep` (`edge-hint.ts`): `hintKeepTrack` for a step that sets
  edges, which shrinks the move and the words' rings together.
- `pieceThrough` (`square-edges.ts`): the squares on one piece of line.

**Kept the game's, and why:**

- **The supposition walk** (`suppose`, `findLookahead`, `pruned`,
  `stillHolds`) is word for word Path's too. It is the ladder's, not the
  edges': it runs the game's Easy rungs on a trial board and reads the
  game's clashes, and Clusters walks one of its own over cells. A shared
  one is a deduction-engine change over every game with a bounded
  look-ahead, which this change is not; the skeleton is now where the next
  game copies it from, and the case for it is recorded here.
- **The line and cross shapes** in `render.ts` are Path's: the earlier
  change decided how a line and a cross look is the game's (`EdgeShapes`),
  and Pearl's and Tracks' do look different.
- **`withChanges`** in `moves.ts` is three lines, and the skeleton's skips
  walls.

## D3 — Proving it

Stamp a copy, register it, run `npm run game -- <copy>` and the source-scan
guards against it, then delete the copy (`src/skeleton/README.md` §
"Changing one"). Then time a stamp-to-playing build of a toy edge game from
it against Path's findings, and record the comparison in this change.

**The verdict on a copy (2026-10-22, `edgetrial`).** The stamp compiled,
linted and passed its own 63 tests. Registered as the checklist says, its
first `npm run game` refused three things: the spec and the icons, which
the checklist names and a copy cannot hold, and `CHAIN_PINS` in
`testing/hint-chain-pins.ts`, a record kept by hand that every edges copy
meets at Normal, as its look-ahead numbers a chain. The checklist now names
it, with the way in: the ordinal scan walks only games already listed, so
the hint test's `lookahead` pin is listed first and the scan finds one
again. With it the verdict refused only the spec and the icons. In the app
the copy dealt, drew its walls, laid and lifted lines by drag, click and
keys, swept crosses up to a wall, refused a wall with no move recorded,
showed mistakes, walked the hint through both rungs, and finished.

`drag-marks.test.ts` names each line-drawing game's `crossDrag` by hand, and
nothing asks a new game to join it. The skeleton's own test runs the same
probe on its `crossDrag` instead, so every copy checks its cross drag
without joining a list. (The gate's unused-exports check found it first:
the skeleton exported `crossDrag` for that list and nothing read it.) A
copy's `hint-ordinal.test.ts` snapshot entry is written by vitest on the
first run.

**Path's look-ahead sentence could run past 120 characters.** "A line here
would force the numbered edges and close a loop round the outlined squares,
so this edge must be crossed out." is 121; the skeleton's hint test dealt
it at once. Both now say "make a loop of the outlined squares", which is
also true of the picture: the outlined squares are on the loop, not inside
it.
