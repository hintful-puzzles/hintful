# Design — add-path-ts-port

## Context

Path is Nikoli's Numberlink. Upstream's `path.c` is a grid generator with no
`struct game`, no input, no rendering and no solver, whose header says its
grids "are not of suitable quality to be used directly as puzzles" and that
fixing them needs a solver it never wrote. This change built the game: the
solver, a generator over it, the frontend and the hint.

## D0 — Building it (owner, 2026-10-21)

The scaffold asked whether Numberlink belongs and whether a from-scratch
solver and generator is in scope. The owner asked for the change to be taken
on, which is the answer. Numberlink is among the app stores' puzzle games
(Flow Free), which is the collection's goal (`docs/doctrine.md` § "The
goal").

## D1 — The rules: every square is filled

A pair of like numbers is joined by a line through the middles of the squares;
lines never cross or branch; **every square is used**. That is Flow Free's
rule and the proposal's "standard ruleset". Nikoli's Numberlink leaves squares
empty, and that rule is what made upstream's dense grids ambiguous ("a solution
other than the intended one which leaves many grid squares unfilled"): under
the fill rule the question does not arise.

## D2 — The solver: a deductive ladder, no SAT

The spike (task 0.2) decided against SAT. Every board the generator deals is
finished by a deductive ladder, which proves it has one answer, so no separate
uniqueness engine is needed, and none was built.

- **An edge beside a square that has all its lines counts as closed**, as in
  Pearl. No rung asks the player to cross such an edge out, which removed a
  rung ("full") that only did that.
- **Easy rungs (Checks):** a square with as many open edges as lines it still
  needs takes a line on each (*forced*); an edge whose line would join two
  different numbers takes a cross (*pair*).
- **Normal rung (a Tactic):** suppose a line or a cross on an open edge, run
  the Easy rungs from there for at most `CHAIN_LIMIT` (6) firings, and if the
  board breaks (a square crowded or left a dead end, a loop closed, two numbers
  joined), the edge takes the other mark. The shortest chain is taken. The
  bound is what keeps it a walk and not a search; it is load-bearing for
  Normal's name (`docs/solver-and-generator.md` § "Check, Tactic, Search").
- **Tried and dropped, by measurement.** A cut rung (crossing an edge would
  shut squares off from the numbers they need, by bridge-finding) and a reach
  rung (which numbers' paths can reach each square) fired on **no** board at
  either tier, over hundreds of boards: the Easy rungs settle corridors before
  a cut can matter, and where the Easy rungs stall the open area is too wide
  for either. A loop rung fires on no dealt board, because no path of a dealt
  answer touches itself (D3); inside a supposition a loop is a clash.
- **What stands in for an oracle** (D6): `count-answers.ts`, a brute-force
  counter sharing no code with the ladder, finds exactly one answer on every
  dealt board up to 7x7 in the generation test.

## D3 — The generator: path.c's growing, then mend and strip

- **Lay** a random cover of paths as `path.c` sketched, by joining pieces end
  to end from single squares, with `path.c`'s rule that a path never touches
  itself except along its own line, and paths of three squares or more.
- **Mend**: run the ladder at the tier asked; where it stalls, cut a path in
  two at an edge it left open, which adds a pair of numbers. Repeat until the
  ladder finishes.
- **Strip**: join paths again, in a random order, wherever the ladder still
  finishes without the two numbers the join removes. Without this, boards
  carried a third more numbers than they need.
- **Exactly the tier**: keep the board only where it needs its tier
  (`solvableAtExactlyTier`).
- **Boring paths** (upstream's "the entire bottom row of the grid being taken
  up by a single path"): no path is a straight run of four squares or more.

Measured (2026-10-21, 10 boards a cell): 5x5 Easy 4–5 pairs at 3 ms, Normal
3–4 pairs at 40 ms; 7x7 Easy 7–11 pairs at 19 ms, Normal 7–10 at 0.2 s;
9x9 Easy 12–15 at 0.14 s, Normal 12–14 at 0.9 s (worst 2.2 s). The presets are
5x5, 7x7 and 9x9 at each tier. Lookahead chains on dealt Normal boards ran
1 to 6 firings.

## D4 — The game, from upstream's sketch

- **Data model** as upstream sketched: a mark on every edge (nothing, line,
  cross), so a player can lay a piece of path before it reaches a number.
- **Input**, following Pearl's, the collection's other loop-drawing game: a
  drag draws along the edges it passes a rook move at a time, backing up
  takes the line back, a drag starting along a line erases, and the UI never
  lets a square take more lines than it takes (upstream's sketch). A click by
  an edge toggles its line; the right button crosses, and drags crosses
  through the engine's sweep. Keyboard: Enter starts a line, arrows carry it,
  Enter draws; Ctrl+arrow draws, Shift+arrow crosses.
- **Look**: lines in ink, numbers in discs that gray when joined, a line red
  where its piece joins two numbers or closes a loop.
- **The name** a player sees is *Path*, upstream's, with the aliases
  Numberlink, Arukone and Flow.

## D5 — The hint

- **A step is one firing.** Forced and pair steps outline what they read: the
  square, or the lines and numbers a line would join (the numbers alone,
  when side by side, drew the eye to their own edge and not the ringed one).
- **A look-ahead is walked statically** (`docs/hints-marks.md` § "Show the
  what-if walk statically"): the ringed edge drawn as asked, the edges the
  supposition forces drawn thin and numbered, the break outlined. The
  recorded chain is **cut down to the firings the break needs**, each
  dropped where the rest still follow and still break: the ladder records
  every Easy firing in the order it found them, and numbering a corner the
  break never reads claimed an order of consequence that was not there (a
  subagent's read of the running hint, 2026-10-21). A join or a loop is
  named before a square short of edges, because it is what the numbered
  edges show.
- **An ordinal sits in a corner of the edge's first square**, beside the
  edge, where no line goes and no outline covers it.
- **Reviewed**: a fresh subagent played four boards through the hint and
  checked 17 look-aheads by hand; all were sound. Its findings on the
  picture are fixed above.

## D6 — No differential; assurance is behavioral

There is no C game or solver. The generation test holds every dealt board to
one answer by the independent counter, to its tier, and to the no-boring-path
rule; the ladder census holds that every rung fires on dealt boards.

## Findings: what building it cost (the baseline measurement)

Every question this build stopped to answer that was not about the puzzle,
kept as it happened (proposal § "Also: this is a baseline measurement").
Measured 2026-10-21, one session. Most costly first.

1. **The skeleton is a grid of cells; Path is a game of edges.** As for
   Target, every file of the copy was replaced; what it gave was the file
   names, the test shapes and the closing checklist. Two greenfield games of
   two other kinds now confirm it: a skeleton per kind of the route table
   (`docs/new-game.md` § "The route by kind of game") is the engine's next
   candidate, an edges-and-loops one first.
2. **Square-grid edges are written per game.** Numbering the edges, a
   square's four, the edge between two squares: Path wrote `Geometry`, Pearl
   holds direction bits per square, Tracks its own; `border-grid.ts` serves
   walls between regions only.
3. **The line-drawing drag is written per game.** Rook-move steps, cutting
   back, erase-first-leg, refusing an over-full square: Pearl's and Tracks'
   are each their own, and Path's is a third (`moves.ts`).
4. **A hint mark on an edge is written per game.** Pearl and Path each
   declare an `EDGE` mark kind and pack per-side hint bits into the tile key;
   about a third of `render.ts` is edges and their marks.
5. **The skeleton taught a sentence the guard refuses.** Its `mustBe` names
   the ringed squares "it"/"they", which `hint-quality.test.ts` rejects as a
   bare pronoun; the skeleton is unregistered, so no guard reads it. Path met
   the refusal at its first verdict. Fixed in the skeleton in this change.
6. **The chain-pin scan could not be run.** `hint-chain-pins.ts` says
   `npm run hint-scan -- src/engine/hint-ordinal.test.ts` prints the pins;
   the script refused a call in a loop, and the scan crashed when a later
   seed of a rare cell (Group 8x8 Hard) ran out of tries. Both fixed in this
   change.
7. **A desc refusal needs an engine edit.** `descError` is private, so
   "a number not on two squares" became `DESC_UNPAIRED` in `desc-error.ts`.
   Cheap, and the design: the sentence is the collection's.
8. **Measuring before building rungs paid.** Two plausible rungs fired on no
   board; the throw-from-a-temp-vitest-file trick was the instrument each
   time, as no census script takes a game's own candidate rung.
