# Design: the position runtime

Read 2026-11-01 at `7d67b1a8`. Figures are dated; re-check one before
designing against it.

## Sections

| Section | What it holds |
| --- | --- |
| The split | which games this change describes, and the two it files |
| What a description states | the blocks a planning game's description adds |
| What it compiles to | the module, and what the engine and a game call |
| Dead-end claims checked sound | the checker, its universe, its verdicts |
| The games | what each of the three keeps and why |

## The split

The fourteen games have five move shapes, and the runtime each needs grows
with the shape: a fixed permutation of the cells, a move guarded by the
position, a move run until it stops, a move over a component, and a domain
that is not finite. This change builds the runtime and proves it on the two
shapes the rest stand on, a permutation and a guarded move:

- **Sixteen and Twiddle**, whose moves are permutations, and the two planners
  that already take moves as data (`slide-planner`, `permutation-planner`).
- **Fifteen**, whose move is guarded by where the gap is. It is the smallest
  game with a guard, and its dead-end claim is a parity, as Sixteen's is.

It files two changes for the rest, each on this runtime:

- **`describe-guarded-moves`**: Pegs, Inertia, Slide, Sokoban, Cube, Flip.
  Moves run until stopped, jumps, pushes and a rolling solid; a lose state;
  `finish-search` fed the compiled moves; the checker's backward search for
  moves that cannot be undone.
- **`describe-components-and-open-domains`**: Netslide, Flood, Same Game,
  Numgame, Untangle. A finish or a move over a component (Netslide's powered
  tiles, Flood's recolored region, Same Game's groups), and the two domains
  that are not finite. Netslide's moves are permutations, but its finish is a
  reach over its wires, which no construct here states. It files step 4,
  `describe-the-king-move-games`, when archived.

## What a description states

A planning game's description has `position` in place of `answer`, and
`freedom.kind` is `permute` (every move is a fixed permutation of the cells,
legal everywhere) or `transition` (a move is guarded, or depends on the
position).

- **`position`**: its layers, each a value a cell, by name. A layer is read
  in a formula as a function of a cell (`value(c)`, `turn(c)`). Its `domain`
  says the values it may hold; `arranged: t` says it is an arrangement, each
  value of its domain on `t` cells. The checker reads both (§ "Dead-end
  claims checked sound"); the app reads neither, and a desc parser keeps its
  own errors.
- **`moves`**: each by name, `for` (its arguments, as a technique's binders),
  an optional `when` (its guard), and `set`: entries of `for` (the cells it
  assigns) and a term for each layer it assigns, read on the position before
  the move. The assignments are simultaneous: a slide reads the line as it
  was.
- **`finish`**: formulas, all true of a finished position.
- **`lose`**: formulas, any true of a lost position. None of the three games
  here has one; the guarded-moves change needs it, and it is compiled now so
  the runtime's shape is whole.
- **`deadEnds`**: claims by id, each a formula true only of a position from
  which no line of moves finishes. The engine consumes them as
  `Game.hasNoSolution`.

A variation adds `finish` formulas, `deadEnds` claims and `set` entries to a
named move, and replaces `position` layers: Twiddle's `orientable` adds its
turns to the move and the finish, and its `Rows only` replaces the layer's
arrangement.

**Why structured YAML, and no assignment syntax.** A `set` entry is binders
and terms, both of which the parser reads already; an `:=` would be a second
grammar for one use.

## What it compiles to

`npm run describe` writes the module beside the description, as for a
ladder (`src/describe/compile-position.ts`, sharing the expression compiler
of `compile.ts`). The module exports:

- `Position` (one `Int32Array` a layer), `Move` (a union of each move's
  binding, tagged by its name), and `Dealt` (the sizes the grid is not
  measured in, Twiddle's `n`);
- `rules(sp, cl, variations): PositionRules<Position, Move>`: `moves(p)`
  (every legal move, in binding order), `legal(p, m)`, `play(p, m)`,
  `finished(p)`, `lost(p)` and `deadEnd(p)` (the first claim that holds, by
  id, or `null`).

`PositionRules` is the engine's (`engine/position-runtime.ts`), so a
consumer that does not know the game takes one: the checker, and the
engine's `moveEffect`, which reads a permutation move's `Effect` for
`permutation-planner` by playing it on a position whose pieces are their own
cells.

**One signature for every game.** `isAnswer` takes only what it reads; the
rules take `sp`, `cl` and `variations` always, because their consumers are
generic, and a game with nothing dealt passes `{}`.

**What the game keeps.** `executeMove` keeps its move counter, its animation
fields and its Solve move, and calls `play` for the position; `status` calls
`finished`; `hasNoSolution` calls `deadEnd`. A game's move type stays its
own, converted to the compiled `Move` in one function: the save format is a
list of the game's moves, so nothing a player has saved changes.

## Dead-end claims checked sound

A claim is sound when no position it holds of can reach a finished one.
`research/technique-check/dead-end-check.test.ts` checks it by exhaustive
search on small boards, as `planning.test.ts` checked the investigation's
prunes, and records each verdict in `src/describe/soundness.json` under a
fingerprint of the claim, the rules it was checked under (position, moves,
finish, definitions, variations) and the cap. `compile.test.ts` fails on a
compiled claim with no verdict, as it does on a technique.

- **The universe** is every position the layers allow: an arranged layer's
  arrangements, times every filling of the others. Every world of sizes in
  the description's ranges whose universe is under the cap is checked, each
  with no variation, each ruleset, and each modifier on.
- **Backward reachability, not an invertibility argument.** The checker
  plays every move from every position, refuses a move whose result leaves
  the universe, and walks the edges backward from the finished positions. So
  it assumes nothing of the moves, and the guarded-moves change can use it
  for jumps that cannot be undone.
- **`permute` is a claim the checker checks**: every move is legal on every
  position of the universe and moves the pieces the same way on each.
- **It runs the compiled module**, which is what the app runs, so a claim is
  checked against the moves and finish the app plays. A compiler defect that
  bent the moves and the claim alike would pass; each game's comparison with
  the code it replaced (`report.md`) covers that.
- **Power is counted.** A claim that holds of no position checked is
  reported as never firing, and the results say how many unfinishable
  positions each claim misses. A planted unsound claim beside each game's
  must come out unsound.

## The games

- **Sixteen.** Its slide, finish and parity are compiled. `slide-planner`
  takes its move list from the compiled `moves`, and keeps its own
  application of a slide, which its pruning (same-line composition, the
  endgame keyed by line) is built on; its agreement with the compiled `play`
  is tested, and the speed of the two is measured in `report.md`.
- **Twiddle.** Its turns, finish and three invariants are compiled.
  `permutation-planner`'s generators are the compiled anticlockwise turns'
  effects, and the hint plays the compiled moves. The turns are tracked only
  where orientation matters, as now.
- **Fifteen.** Its slide (the gap's row or column, any distance), finish and
  parity are compiled. Its solver keeps upstream's greedy method and 3×2
  table, which read directions and no move relation.
