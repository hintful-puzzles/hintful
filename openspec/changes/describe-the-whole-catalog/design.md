# Design: describing the whole catalog

The survey of task 1 and the plan of task 2. Read 2026-11-01 at `2e1e0a6a`,
by five read-only surveys, one per answer shape, each over a game's non-test
sources, its help and its write-up in
`archive/2026-10-29-investigate-a-language-for-puzzle-games/collection/`.
Line counts are `wc -l`, or a function's span read off its neighbors' start
lines (`~`); they size the work and are not a count of what a change will
delete. Every figure is dated: re-check one before designing against it.

## Sections

| Section | What it holds |
| --- | --- |
| What the compiler says today | the baseline every "lacks" is measured from |
| The constructs | each missing construct, keyed, with the games that need it |
| The catalog, game by game | each game's ladder as written, its needs, what retires |
| The engine's code for the hand-written way | what task 4 retires |
| Further refactoring a description makes possible | the proposal's candidates and the survey's, each measured |
| Decisions made here | internal decisions every step inherits |
| Games with no deduction ladder | task 3: what each would describe, and the question |
| The plan | the steps in order, each with its games and what it retires |
| Corrections | facts the survey found wrong elsewhere |

## What the compiler says today

`src/describe/compile.ts` compiles **techniques only**. A description's
`rules` (its `space`, `answer`, `shape`, `clues` blocks) are read by the
soundness checker and the research interpreter, and by nothing in `src/`: the
eight described games check their answers with hand-written code beside a
rules block that states the same thing.

The runtime (`src/engine/describe-runtime.ts`) is one rectangular grid whose
**cells** hold a **candidate bitmask** (`Marks`), with lines, boxes,
diagonals, slots and sightlines from the border, interior corners, the edges
between cells as places a clue sits (never as something marked), dealt
partitions and clue lists. A conclusion is `strike` or `place` on a cell. The
only spaces exported are `latinSpace(o)` and `sudokuSpace`; the rectangular
`gridSpace(w, h)` they share is private. A compiled ladder runs on
`LatinSolver` through `compiledRung` (`engine/latin.ts`), or on Solo's own
`Marks` through Solo's own wrapper.

Already there, though the research listed them missing: a clue's value as a
term anywhere (`clue(kind, x)`, research C1 for Singles), `nth(L, i)` (L13),
fillings (`exists fill f of S`), complete clue kinds, `until`/`from` tiers and
grading scales. The soundness checker is TypeScript over `z3-solver`'s
WebAssembly build, run by hand, with its verdicts fingerprinted into
`src/describe/soundness.json` for the gate: the proposal's "still Python"
was stale.

## The constructs

Each key is used in the catalog's table. A construct named by one game only
is listed there by name.

| Key | Construct | Games (count) |
| --- | --- | --- |
| R | A rectangular space with its units declared (rows and columns, a partition's parts, the whole board, or none), a domain per part, and the runtime that runs a compiled ladder on it (an engine-owned marks store, caps per scale, the library's rows paired by the engine) | every fill game not yet described (39) |
| C | Connectivity over the marks, kept by an incremental union-find: connected, components (their size, contents and count), acyclic, one loop, a chain along the answer, cut vertices; and its encoding in the checker | Singles, Range, Boats, Rome, Slant, Sticks, Filling, Ascent, and every edge and division game below (about 25) |
| E | Edge variables with their own marks (a second marks array), a cell's or vertex's degree, cell–edge–corner incidence | Path, Pearl, Tracks, Spokes, Bridges, Loopy, Net, Tents, Separate, Palisade, Dominosa, Rect, Galaxies (13) |
| L | A `look` premise: the rules checked once on the marks with one or two facts added, no propagation (a Check, `docs/solver-and-generator.md` § "Check, Tactic, Search") | Path, Spokes, Sticks, Bridges, Tracks, Singles, Light Up, Boats, Range, Bricks, Clusters, Star Battle (12; the last three restate without it) |
| W | Cells outside the answer: walls, trees, mirrors, holes | Light Up, Tents, Bricks, Range, Crossing, Undead, Ascent (7) |
| D | A division answer (regions of an edge answer, or an owner per cell), a region's size and shape | Separate, Palisade, Dominosa, Rect, Galaxies, Filling (6) |
| M | Marks the answer does not record, with a stated meaning: same/opposite relations, tile marks, a projection the player marks, bounds | Slant, Loopy, Bridges, Signpost, Magnets, Subsets, Crossing (7) |
| N8 | The king's-move neighborhood and the 3×3 block | Mosaic, Tents, Boats, Star Battle, ABCD's modifier (5) |
| Q | Segments (the maximal runs of a set along a line) and beams (from a cell until a wall or a mark) | ABCD, Magnets, Crossing, Sticks, Light Up, Range (6) |
| G | A space that is a graph: dealt (Map's regions), derived (Bridges' spans, Spokes' links) or a tiling (Loopy's 18) | Map, Bridges, Spokes, Loopy (4) |
| X | Clues revealed during play, rebuilt into the dealt clues from the state on each hint | Mines, Guess, Black Box (3), and Wordle |
| V | A value domain wider than 31, the bitmask's width | Ascent, Signpost, Crossing's run numbers (3) |
| P | Propagation when a candidate is struck, not only when a value is placed | Magnets, Subsets (2) |
| S | A dealt count the grid is not measured in (stars per unit, a fleet) | Star Battle, Boats (2) |

## The catalog, game by game

"Ladder today": FP is `DeductionTechnique` run by `runDeductionFixpoint`; SF
the `singleFirings` hint skeleton (with `findingTechniques` or `SweepOffers`);
own is a game-private loop. "Two" marks a game whose generator or solver and
whose hint run separate ladders, which a description makes one by
construction, and which can therefore change the boards dealt or the step
shown. "Retires" is the hand-written ladder code a description replaces.

### Described (8)

Adjacent, Group, Keen, Mathrax, Salad, Towers, Unequal compile their whole
ladder and run it on `LatinSolver`. Solo compiles every technique, and still
writes by hand (`solo/solver.ts`, 2026-11-01):

- the pairing table (`:644-755`, ~110) and its reason builders (`:534-625`),
  since `compiledRung` takes a `LatinSolver`;
- its fixpoint wrapper (`:756-893`), since the runner knows one cap and
  Solo grades on two scales;
- `reduceCages` (`:515-532`), which shrinks the dealt cages in place before
  each killer technique;
- `place()`'s propagation (`:376-410`), since the library's `placed` reads
  rows and columns only;
- the forcing chain and bounded recursion (`:411-500`, `:840-890`), which are
  suppositions, so a Search, and stay engine search over the ladder
  (§ "Decisions made here");
- its `Marks` over upstream's cube, which the engine-owned store of R
  replaces;
- copies of the generic single, set and wing sentences (`hint-text.ts:106-175`),
  because `narrateLatinReason` hard-codes "row and column". Towers keeps the
  same kind of copy (`towers/hint-text.ts:126-160`).

### Fill games on a rectangle

| Game | Family | Ladder today | Needs | Retires | Notes |
| --- | --- | --- | --- | --- | --- |
| Unruly | shading | FP + SF | R | `solver.ts` ~520 | every technique states with R alone; tier-ordered |
| Seismic | numbers | FP; hint re-derives its rungs | R (partition units, a domain per area) | `solver.ts` ~200, `hint.ts` ~60 | `attempt` is starve plus a hidden single by the hint's own argument (`hint.ts:236-249`, unverified) |
| Star Battle | shading | FP + SF | R, N8, S | `solver.ts` ~480 | crowded and starved restate without L; region units as a plain partition, or hint order moves |
| Mosaic | shading | own worklist; upstream `solveCheck` gates Easy (two) | R, N8 | `deduce.ts` 247, `solver.ts` ~170 | all four rungs state once N8 exists |
| Clusters | shading | FP + SF | R; L or a restatement | ~155 + ~170 | the generator's prune reads an `F_ERROR` bit the validator writes |
| ABCD | numbers | FP; hint re-derives | R, Q, a clue at a (line, letter) pair | ~110 + ~70 | Unreasonable by `answer-search` |
| Sticks | lines | own loop; hint a parallel copy (two) | R, Q, L | ~360 + ~190 | Easy generation gates on the solver's exact power |
| Magnets | numbers | FP + SF | R, Q, P, M (tile marks) | `solver.ts` ~300 | upstream's `ndom` counter bug is not statable |
| Light Up | shading | not a ladder: a scan interleaving two rungs, then discount sets, then depth-5 recursion | R, W, Q (beams), L | `solver.ts` ~600 | the fixpoint header's named exception; a description makes it a ladder |
| Bricks | shading | own loop + SF | brick-wall space with holes, L or five local rules | ~95 + ~210 | the one hexagonal shading game |
| Singles | shading | once-only rules, then FP; the generator adds an unsound `solveSneaky` | R, C (clear cells connected, cut vertices), L | `solver.ts` ~680 | `solveSneaky` stays a generator hook: the checker would rightly refuse it |
| Range | shading | own loop + SF | R, Q (beams), C (cut vertices) | ~430 | a cut-vertex primitive, not a `look` flooding once per cell |
| Rome | lines | FP; hint on the candidate plan | R (areas as units with a size premise), C (chain along the arrows), a direction step | ~415 + ~140 | answer and marks fit today's `Marks`; the dsf root choice is a byte-match quirk |
| Slant | lines | own loop + SF | R with border vertices, C (acyclic on vertices), M (alike, v-shapes) | ~570 + ~140; `hint.ts` 802 rebuilds evidence | answer fits `Marks` (two slashes) |
| Boats | shading | own loop with latches; `hint-solver.ts` a second ladder (two) | R, N8, S, C (components, the fleet), L, a direction step | `solver.ts` ~890, `hint-solver.ts` 1407 | the largest deletion in the catalog |
| Tents | shading | FP, not in tier order; a separate hint ladder (two) | R, N8, W, E (links), a matching witness | most of `solver.ts` (866) | the link-drawing hint is a meta-rung over the others; the riskiest to player-visible behavior |
| Pattern | shading | upstream line solver + SF | list-valued clues, runs, a filling pruned on its prefix | ~250 + ~350 | the only list-clue game |
| Subsets | numbers | FP, plus a second hint ladder (two) | a whole-board unit, bitwise value relations, M (letter projection), P | ~300 + ~830 | upstream's letter/cube sync order is not statable |
| Undead | numbers | own escalating loop, capped by arc passes; hint on FP (two) | W (mirrors), dealt walks, a whole-board clue | ~400 + `index.ts` ~220 | the Easy/Normal split is a pass count, which no tier states |
| Crossing | numbers | own loop; `hint-solver.ts` a second engine (two) | W, Q (runs), a list clue, a matching, M (per-run marks) | `solver.ts` ~160, `hint-solver.ts` ~830 | |
| Filling | numbers | FP + SF with fallbacks | D (answer-defined components), C (reach), a set quantifier | ~550 | `bitmap-elimination` is not monotone; a monotone ladder retires the hint's fallbacks |
| Ascent | numbers | FP; hint a separate ladder (two) | V, hexagonal tilings, adjacency by ruleset, W, distance, C | ~360 + ~300 | the domain is the board's size, so it breaks the bitmask |

### Edge, line and division games

| Game | Family | Ladder today | Needs | Retires | Notes |
| --- | --- | --- | --- | --- | --- |
| Separate | regions | FP + SF | E, D, C | ~400 | the cheapest division game |
| Palisade | regions | own sweep, not restart-on-fire | E, D, C, a cell's edge count | ~300 | the hint narrates the sweep's discovery order; a compiled ladder reorders it |
| Dominosa | regions | own class; `firstFiring` a hand copy of the order (two) | E (domino or barrier), subsets of elements, D (parity) | `solver.ts` ~700 | Extreme grades on `forcingChain`, which no hint narrates |
| Rect | regions | upstream solver gates; SF rungs grade (two) | E, D, a derived sort of rectangles, an unmarked intermediate | `hint.ts` ~400, `solver.ts` ~440 | `TIER_RUNGS` (`hint.ts:79-82`) is the tiers a description states |
| Galaxies | regions | FP; hint ladder differs (two) | E, D, point reflection over a half-grid, C | `solver.ts` ~700, `hint.ts` ~120 | the private recursion moves to the engine's search |
| Path | lines | FP + SF | E, C, L, two clues' values in one formula | ~670 | its rungs are already ours (2026-10-28), so cheap to compare |
| Pearl | lines | FP + SF | E (or a shape per cell), C (one loop), a direction step | ~580 | the solver already keeps a shape bitmask per cell |
| Tracks | lines | FP + SF | E with cell marks, border edges, C (a path between two slots), L | ~990 | `prerequisite` and `fallback` runner options |
| Spokes | lines | FP; a reordered hint ladder (two) | G (king links), E, C, L | ~130 + ~395 | the hint is deliberately goal-first |
| Bridges | lines | FP + SF | G (spans), E (integer with bounds), M, C, L | `Solver` ~880 | |
| Signpost | lines | own loop; hint restates it (two) | V, a bijection answer, eight-direction rays, M | ~75 + ~85 | |
| Net | regions | `netSolver` gates; `deduce.ts` ranks the hint (two) | E, rotations, a torus, C (spanning tree), L | `deduce.ts` 536, `solver.ts` ~280 | the hint's global rank is not a technique order |
| Loopy | lines | own loop with a threshold skip; the hint wraps each rung per tier | G (18 tilings), E, C (one loop), M (dlines, identical/opposite) | rungs ~1230, `record.ts` 317 | the most expensive; the threshold skip decides which boards exist |

### Query games

| Game | Ladder today | Needs | Retires | Notes |
| --- | --- | --- | --- | --- |
| Guess | `Rules` class to a fixpoint | X, a whole-board clue | `hint.ts` ~200, the brute-force soundness half of its test | fits the bitmask runtime almost as it stands |
| Mines | `deduce.ts` for the hint; `minesolve` certifies boards (two) | X, a binder over sets of clues | `deduce.ts` ~250; `minesolve` 433 if the generator certifies with the compiled ladder | the hint finishing every certified board is measured (980 boards), not proved; one ladder makes it true by construction |
| Black Box | `settle`, ~25 lines | X, a library term that runs a ray over partial marks | ~30 | its uniqueness test already exists (`answer.ts`) |

### Games with no ladder (14)

Flip (a GF(2) solve), Untangle (a search in the plane), and twelve planning
games: Netslide, Fifteen, Sixteen, Twiddle, Cube, Pegs, Inertia, Slide, Flood,
Same Game, Numgame, Sokoban. § "Games with no deduction ladder".

## The engine's code for the hand-written way

What task 4 retires once no game uses it (2026-11-01):

- `singleFirings` and `SingleFiringOptions` (`deduction-fixpoint.ts:415-481`),
  27 games; `findingTechniques` and `FindingRung` (`:134-185`), 11 games;
  `engine/sweep-offers.ts` (114), 13 games.
- The runner options only a hand-written ladder uses: `prerequisite` and
  `fallback` (Tracks), `available` and `continuing` (with `SweepOffers`), a
  board flag for impossibility (Tracks).
- `engine/testing/ladder-census.ts` (103) and `ladder-continuity.ts` (185):
  a census certifies the rungs a corpus fires, which a soundness check and a
  description's technique list replace.
- `engine/wing.ts`'s solver half (~90), whose last solver caller is Map.
- `engine/firing-replay.ts` (380), used by Rome and Solo: kept if the
  compiled runtime's premise audit uses it, retired otherwise.

`runDeductionFixpoint` and `DeductionTechnique` stay: compiled ladders run on
them (`latinSolverTop`). The guard of task 4 is structural: the runner takes
only a ladder built from a compiled module (a branded type the compiled
module's `ladder` produces), so a hand-written ladder is a type error.

## Further refactoring a description makes possible

Measured 2026-11-01. A candidate a step takes on is named in its row.

| Candidate | Measured | Verdict |
| --- | --- | --- |
| **Rules stated once: the answer check compiled from the rules** | Every game checks its answer by hand, beside a rules block where it has one: Rome's `validateGame` 113 lines, Unruly's validators 155, Boats' `validate.ts` 518, Singles 112, Clusters 97, Seismic 67 | Taken, as step 2. This is the owner's "rules stated once" read literally; today the eight described games keep two copies |
| **One ladder for generation and hint** | 15 games run two (the "two" rows above) | Taken by construction in each step: the reason for most of the deletion |
| **The compiled-ladder runtime over any board** (`compiledRung` generalized off `LatinSolver`, caps per scale) | Solo's wrapper ~250 lines; every non-Latin game needs it | Taken, as step 1 |
| **The library's rows paired by the engine** | 7 tables each repeat the same 5 `latin.* → LATIN_RUNGS[…]` rows (35 lines) | Taken, in step 1 |
| **The hint sentence carried by the technique's statement** | Solo and Towers each copy the generic single, set and wing sentences (~60 and ~35 lines) because `narrateLatinReason` hard-codes "row and column"; every other sentence is a game's own words | Declined as stated: the language says nothing about presentation (`language.md` § "What is ready"), and a sentence quotes the board in game words. Taken narrowly in step 1: the Latin sentences name a reason's unit, so the two copies go |
| **A technique's tier stated in the description** | Done: every compiled ladder entry carries its tier. Rect's `TIER_RUNGS` is a hand list of the same thing | Retires with Rect, in step 9 |
| **The soundness checker ported to TypeScript** | Done before this change | Nothing to do |
| **The hint's step kinds derived** | Each described game keeps a `*_RUNGS` list for `Game.hintRungs` beside the compiled `LadderId`; they differ where a technique narrates two ways (Unequal's `sign` is `greater` and `lesser`) | Step 1 measures whether the reason kinds a pairing table builds can give the list; declined if a reason kind is not a technique's |
| **`Game.rulesOut` from the rules** | Light Up, Star Battle and Tents declare what a placement rules out for the auto-cross aid; their rules imply it | Declined in step 4: on Star Battle the compiled `around`, `fullLine` and `fullRegion` give what the hand rule crosses on every consistent board, but stop at an inconsistent one, where the hand rule still crosses round a star placed beside another (`describe-the-king-move-games/design.md`) |
| **`placed` over every unit** | Solo writes its own because the library's reads rows and columns | Taken, in step 1 |

## Decisions made here

Each binds every step. All are internal but the hint's order, which is the
owner's.

- **A saved game or shared board may break where that simplifies** (the
  owner, 2026-11-01: there are few players yet, so take the chance). A step
  states the simplest sound ladder, rules and moves it can, and need not
  match the hand-written ladder's power at a tier, nor keep an old save, game
  ID or shared link opening. It measures and reports what changed: which
  boards no longer solve at their tier, and which saves or links no longer
  load. Keeping power is a reason to add a technique only where a tier would
  otherwise lose its boards (Path's `ANSWER_BUDGET`, kept so saved boards
  solve, is one such choice to revisit).
- **Boards and grades may move.** The app hands out boards, not seeds. A
  byte-match fixture whose quirk no sound statement reproduces (Filling's
  non-monotone bitmap, Magnets' `ndom`, Subsets' sync order, Rome's dsf root,
  Clusters' `F_ERROR` prune, Mosaic's `solveCheck`, Singles' cascade queue,
  Loopy's threshold skip, Boats' latches) is re-founded, and the step reports
  which games deal different boards and how the tier mix moved.
- **A search tier stays engine search over the compiled ladder.**
  `engine/answer-search.ts` takes the compiled ladder as its deduction
  (Filling, ABCD, Crossing, Path, Sticks, Rect, Separate, Palisade, Net,
  Mosaic, Clusters, Range, Pattern); Light Up's, Bricks' and Galaxies' private
  recursions move onto it; Solo's forcing chain and recursion stay as they
  are, a Search. A supposition is never a stated technique; a `look` (one
  step, no propagation) is a Check and is.
- **An unsound generation step stays a generator hook** (Singles'
  `solveSneaky`), outside the description, saying why.
- **A hint's order may move, accepted once for the plan** (the owner,
  2026-11-01). A compiled ladder fires in rung order, then binding order, so
  a hint that interleaves today shows its steps in another order once
  described: Light Up's per-cell scan, Mosaic's worklist, Singles' cascade
  queue, Range's sweep, Palisade's discovery order, Net's global rank,
  Spokes' goal-first ladder, Galaxies' demoted `mirrorWall`, Tents' link
  rungs. `docs/descriptions.md` § "A statement's order is behavior" allows
  a restatement with a record-for-record comparison or the owner's
  acceptance, and a comparison cannot pass where the order is the change.
  The owner accepts, for every step, an order change that keeps the game's
  deductions and the step's words; each step reports what moved and shows
  it in the running app. A step that changes what a player is told still
  asks on its own.
- **A per-game exception becomes a technique where it can**: Undead's pass
  bound, Ascent's mode-guarded `overlap` and Spokes' tier-exact look-ahead
  each go to their step to be stated or recorded as the game's, with the
  reason.

## Games with no deduction ladder

The proposal expected their rules to buy "the answer check and a small-board
uniqueness test". The survey found:

- **The twelve planning games have neither to buy.** Each declares
  `notApplicable.findMistakes`: there is no single answer, many lines finish,
  and every generator already guarantees a solvable board (by shuffling from
  the finish, by parity, by reverse play, or by its solver). A reachability
  test from a description would be a second copy only a check reads, which
  the doctrine refuses.
- **What the engine would consume** is a compiled move and finish. That
  needs a position runtime (a state, guarded moves, a finish, a lose state)
  the engine does not have, and retires 20 to 60 lines a game: `executeMove`
  also carries move counters, animation and Solve moves, and each solver
  keeps its own fast copy on packed positions. The exception is Sixteen,
  Twiddle and Netslide, whose shared planners already take their moves as
  data (`SlidePuzzle.moves`, `Effect`s), so a stated move set would be
  consumed (under 100 lines across the three).
- **Fifteen, Flood, Numgame and Cube** would consume nothing: one copy of the
  move is already shared by the game and its solver, or the solver reads no
  move relation.
- **Flip and Untangle** retire nothing. Neither has a unique answer, and
  Untangle's plane cannot be compiled or checked by z3.
- **Their dead-end claims** (`hasNoSolution`: Pegs' frozen pegs, Sokoban's
  deadlocks, the parity invariants) are consumed by the dead-end banner and
  the searches, and could be checked sound on small boards, but only on the
  same position runtime.

Measured by what the fourteen retire, a help-only description was the
recommendation.

**The owner's answer (2026-11-01): build the position runtime.** The
measure is not what a description retires in today's games but what it
makes cheaper when they are the exemplars for a catalog about 200% larger in
a year, with the engine's chances to serve these games looked for again as it
grows. Read that way:

- **A new planning game is written from its description.** Its moves,
  finish and lose state compile into what `executeMove` and `status` call, so
  a port writes no rules code; ball sort is the first such game.
- **Its hint gets a planner from the same statement.** `finish-search`,
  `slide-planner` and `permutation-planner` search a move relation; fed the
  compiled one, a new game's planner is configuration rather than a copy of
  its rules. Sixteen, Twiddle and Netslide prove it on the two planners that
  already take moves as data; Pegs, Inertia, Same Game and Sokoban on
  `finish-search` and their own prunes.
- **Its dead-end claims are checked sound** on small boards before the
  dead-end banner relies on them, as techniques are; the parity invariants,
  Pegs' frozen pegs and Same Game's last-of-a-color are the exemplars.
- **The runtime executes concrete positions**, so a domain that is not finite
  (Numgame's integers, Untangle's points) runs; only the checker's reach is
  bounded by it. Fifteen's table and Cube's roll stay data the description
  reads, as `language.md` § "The second version" said.
- **The exemplars cover the move shapes** the 200% will bring: permutations
  (Sixteen, Twiddle, Netslide), slides until stopped (Inertia, Slide),
  rewrites with gravity (Same Game), jumps (Pegs), pushes (Sokoban), a
  recolored component (Flood), arithmetic (Numgame), a rolling solid (Cube),
  toggles (Flip), and points in the plane (Untangle).

The fourteen are described on this runtime (step 3 of the plan), and the
cost is stated there: a solver keeps its fast packed copy where a generic
move is too slow, and says so.

## The plan

Each step is one change, filed by the step before it when that one is
archived, as the Latin games were (`describe-group` filed `describe-towers`).
Only the first is filed now: the open changes are kept few, because a scoped
change goes stale when the code moves under it (`docs/work-management.md`
§ "What a session files"), and every step after the first is designed on the
runtime the first builds. A step names its games and what it retires; its
proposal re-checks this survey's figures.

| Step | Change | Vocabulary | Games | Retires besides the games' ladders |
| --- | --- | --- | --- | --- |
| 1 | `describe-a-board-beyond-the-latin-square` | R; `placed` over every unit; the Latin sentences naming a reason's unit | Unruly, Seismic; Solo's residue | Solo's wrapper and pairing plumbing, the 35 library rows, Solo's and Towers' sentence copies |
| 2 | `check-the-answer-from-the-rules` | rules compiled to a completion check the engine calls | the eight described, and step 1's | each game's hand-written answer check |
| 3 | `describe-moves-and-finishes`, split by move shape into it, `describe-guarded-moves`, `describe-pushes-blocks-and-solids` and `describe-components-and-open-domains` | a position runtime: guarded moves, a finish, a lose state, dead-end claims checked sound, the compiled move relation fed to the planners | the twelve planning games, Flip, Untangle | each game's move legality and finish; the planners' hand-built move lists |
| 4 | `describe-the-king-move-games` | N8, S | Star Battle, Mosaic, Clusters | Mosaic's upstream `solveCheck` |
| 5 | `describe-revealed-clues` | X | Guess, Mines, Black Box | `minesolve`, if the measured deal cost allows |
| 6 | `describe-on-a-graph` | G (a dealt graph) | Map | `engine/wing.ts`'s solver half; the candidate walk indexes elements, not grid cells |
| 7 | `describe-runs-sightlines-and-looks`, split by game into it (ABCD), `describe-sightlines-and-looks` (Sticks, L), `describe-beams-tiles-and-bricks` (Bricks) and `describe-beams-and-tiles` | Q, L, P, W as a clue kind, tile marks, a brick-wall space | ABCD, Sticks, Magnets, Light Up, Bricks | Light Up's exception in the fixpoint header |
| 8 | `describe-connectivity` | C, a direction step, border vertices, relation marks | Singles, Range, Rome, Slant, Boats | `firing-replay.ts`, if Rome was its last reader |
| 9 | `describe-edges-and-divisions` | E, D | Separate, Palisade, Dominosa, Rect, Galaxies, Filling | Rect's `TIER_RUNGS`, Dominosa's `firstFiring` |
| 10 | `describe-lines-and-loops` | E on lines, G derived and tiled, M on edges | Path, Pearl, Tracks, Spokes, Bridges, Net, Tents, Loopy | the runner's `prerequisite` and `fallback` |
| 11 | `describe-the-remaining-number-games` | V, bijections, lists, matchings, walks, bitwise relations | Subsets, Undead, Crossing, Ascent, Signpost, Pattern | Crossing's second hint engine |

Then task 4 here: the engine's old layer, and the guard.

The order is by what each step unlocks for its cost. Step 1 comes first
because every later step runs on its runtime, and Unruly (R alone) and
Seismic (partition units) prove it on two answer shapes. Step 2 comes before
the vocabulary grows, so that each later game's rules are stated once from
its first day. Step 3 compiles rules too, the moves and the finish, so it
follows step 2's rules compiler, and it is early because it unblocks
`add-ball-sort`; it may split by move shape at its start. Steps 4 to 6 are
cheap and retire two second engines (Mosaic, Mines). Connectivity (8)
precedes edges (9, 10), which need it everywhere. Step 11 holds the
constructs only one game needs each; it splits at its start if the session
finds it too large.

**Words for new games.** Ball sort needs step 3; Wordle, in
`add-word-list-puzzles`, needs step 5; Wend needs D and C (step 9).

## Corrections

- `language.md` § "Sokoban" (archived) states the game without pits and deep
  pits, whose finish is two-sided (`sokoban/state.ts:369-378`). A
  description written from the sketch would be wrong; the archive stays as
  it was written.
- Same Game's `executeMove` checked a removal's indices but not that they
  were one whole group; fixed in passing with this survey.
- The rules are written twice inside Pegs, Inertia and Sokoban, and Same
  Game's finish and last-of-a-color tests three times each. Folding them
  needs no description; it is a cleanup a session in those games makes.
