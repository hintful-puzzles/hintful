# describe-ascent: design

Read 2026-11-09 at `ada5b13a`.

## What Ascent's solver reads

`solver.ts`' ladder, ten rungs over four tiers, reads two things the
player never marks:

- **A candidate bitmap of number by square** (`marks[i * s + n]`), which
  every rung but the path ones reads and strikes. A number runs to the
  board's square count: 42 on the smallest preset, and up to 999 on a
  Custom board (`validateParams`).
- **A set of possible path links a square** (`path[i]`, a bit a direction,
  with `FLAG_ENDPOINT` and `FLAG_COMPLETE`), which the Normal rungs
  `update-path`, `remove-path`, `adjacent-path` and `remove-endpoints`
  narrow and read, and `solverRemoveBlocks` seeds. A link runs in one of
  four, six or eight directions by the ruleset.

## Decisions

- **Ascent's answer stays a number a square; the `to` reading does not
  fit.** A link to the next square is a value of at most nine, as
  Signpost's is, but a link is a fact only where the number before is
  placed, and Ascent's reasoning places numbers alone: the hint's "within
  reach" places 10 between 8 and 13 with neither 9 nor 11 on the board, and
  the solver's `single-position` does the same. Read as links, none of that
  is a fact, so the ladder could not be stated.
- **A domain past 31 is a wide domain, declared** (`answer.value.wide`).
  The compiler reads the declaration rather than bounding the domain's
  formula, and compiles a wide description's candidate reads through the
  marks' methods: membership, a count, the least, and a binder over a
  cell's candidates. A wide description may not read `cand(c)` or its
  domain as a set otherwise, and the compiler says so. A set of numbers is
  a mask of 32 bits, so a wide description forms one only of constants
  under 32; `m in {n - 1, n + 1}` binds its members one by one, and a
  range, a gathered set or a literal of variables is refused. The first
  build missed this: Ascent's `{value(c) - 1, value(c) + 1}` wrapped past
  31 and its Easy ladder placed almost nothing. Every other description compiles as it did, byte for byte, so no other
  game's deals or speed move.
- **The runtime keeps a wide domain's candidates as words a cell**
  (`WideCellMarks`, a `CellMarks` whose candidate methods read them), and a
  value placed may be past 255 (`grid` an `Int16Array`). The candidate
  walk and the notes are not offered on it: Ascent's player marks no
  candidates.
- **A wall or an arrow square holds a value past the path**, `top + 1`,
  given by its clue, as Bricks' holes hold a clear square's: every square
  of the space then has a value, and the rules say the path's numbers
  1 to `top` are held once each, each beside the next.
- **The neighbors are by ruleset, a size of the board** (`moves`: 0, 1 or
  2 for four, six or eight), not a variation: the shapes and rulesets cross, and a hexagonal board
  stored sheared is `adj8` less the diagonal that runs with the shear
  (§ "The formula syntax", Bricks'). How far apart two squares are is
  stated from it.
- **The ladder holds no path links: it reasons only as the hint can
  teach.** HEAD's ladder narrowed a set of links a square
  (`update-path`, `remove-path`, `adjacent-path`, `remove-endpoints`),
  which the player has no way to mark. Its generator removed clues on one
  reused scratch whose never-reset `foundEndpoints` crippled those rungs,
  so the boards it dealt needed no link reasoning, and the hint, which
  reads only numbers, finished them all. Stated as techniques on a link
  mark (a king's-move edge mark, `of` whether two squares hold numbers
  one apart), the rungs ran whole, the generator dealt sparser boards, and
  the hint stalled on 30 of the boards its test deals, at Normal, Tricky
  and Hard, where the ladder went on by those two techniques alone. With
  them taken out the hint finishes every board. A link reading the hint
  can teach (its `deadEnd`) is weighed as a technique in
  `describe-ascents-hint`.
- **The two rungs HEAD guards by hand take the ladder's own words.**
  `single-number-simple` runs from Tricky `until: Hard`; `overlap` runs
  `from: Hard`, and an `Edges` variation states it again at Normal.
- **The hint keeps its readings in this change** and moves onto the
  compiled firings in the next (`describe-ascents-hint`, filed when this
  is archived). Its techniques are projections of the solver's rungs run
  on a fresh scratch with a focus, plus readings of its own (dead ends,
  the Edges lines and arrows, whole runs and their routes), so moving it is
  a change of its own size. Until then the hand-written rungs live on as
  the hint's, and the solver and the generator's grading run the compiled
  ladder.

## What will differ from HEAD

- The ladder lacks HEAD's path rungs, so it reaches less on some boards
  than HEAD's fresh-scratch ladder, and the generator keeps different
  clues: the boards a seed deals move. No desc is refused, so no save or
  link stops loading.

Measured 2026-11-09 against `ada5b13a`:

- **Deals** (`deal-compare`, 5 a preset, 80 boards): 2 boards differ, one
  6x8 Honeycomb Tricky and one 6x7 Classic Hard, each with a capped solve
  HEAD finished by its path rungs. Deals take 0.83× HEAD's time and solves
  0.60×.
- **Solves of HEAD's own boards** (120 boards, 5 rulesets, every tier,
  caps 0 to 4): all 120 are solved at their own tier, and 596 of the 600
  capped solves leave the same board; the other 4 stop on different cells
  with the same verdict.
- **Large boards**, back to back on the same seeds: 12x12 Classic Hard
  deals in 103 ms (HEAD 216), 15x15 Classic Normal 315 (415), 12x12
  Orthogonal Hard 259 (679), 12x12 Hex Hard 240 (645), 8x8 Edges Hard 157
  (126).
- **Hint walks**: the hint test's 30 dealt boards and its pinned ones are
  each finished by the hint. In the running app a 5x5 Edges Normal and a
  Size 7 Hexagon Hard board were hinted to the end.
