# Design: Light Up described

## Sections

| Section | What it holds |
| --- | --- |
| The split | why this change takes Light Up alone |
| What Light Up needed of the language | nothing new: walls and sightlines |
| The ladder | upstream's scan and its discount sets, stated as four techniques |
| Unreasonable is the engine's search | the recursion retired, and what it costs |
| What else retired | `combi/`, and the checker's reading of none |
| Against HEAD | the boards, the walks, the deals |

## The split

Read at the start (2026-11-02), Magnets and Light Up share nothing the
language lacks: Magnets reads P (propagation when a candidate is struck) and
tile marks, Light Up walls and a sightline. Each is a solver and hint to
rewire (Magnets 597 + 894 lines, Light Up 679), and Bricks alone was a
session. So this change takes Light Up, the one whose sightline the language
already reads, and files Magnets as `describe-tiles`, which files step 8,
`describe-connectivity`.

## What Light Up needed of the language

Nothing new, as the proposal guessed of its walls:

- **A wall is a clue whose meaning places a value**, as Sticks' blocks and
  Bricks' holes are (`descriptions.md` § "The runtime a ladder runs on"):
  `wall` and `number`, each placing 2, the value of a square with no bulb,
  which the domain keeps out of every other square only where a player could
  put a bulb.
- **A bulb's light is `stretch` along its row and its column**, over the
  squares that are not walls: `lights(c)`. A technique binds it once per
  square (`L = lights(c)`), and the discounts once per candidate, since the
  compiler computes a definition each time it is read; on 12×16 boards the
  two cut a deal by a quarter to a third (Easy 103 to 66 ms median, Normal
  285 to 186, Unreasonable 1,445 to 1,042).
- **A bulb's light is a technique run on placing** (`shine`): it places 2 in
  every square the bulb lights, so a lit square and a crossed one are the
  same to every technique, as upstream's `couldPlaceLight` reads them both,
  and a board whose every square is decided is one the answer check judges.

## The ladder

Upstream's Easy is one scan, a column at a time: at each square, the forced
light, and at a number, the full clue and then the clue with just enough
room. That interleaving is one technique bound by the square (`square`), its
conclusion the dark square's reading or the number's, since a square is never
both. Each reading also holds its rule on the marks as they stand (a bulb lit
by another, a dark square nothing can light, a number with too many bulbs or
too little room), so a broken position is a contradiction, as upstream's
overlap and correctness checks found it.

Upstream's Normal is its discount sets: a set one of whose squares must hold
a bulb, and a square whose bulb would spoil every one of them, which then
holds none. A set comes from a dark square (`darkSet`) or from each `f - m +
1` of a number's `f` free squares when it owes `m` (`clueSet`, a `subsets`
binder, where upstream ran `combi`). The candidates are the squares that
could spoil the set's first member, `rivals`, as upstream drew them from its
best member; any square that spoils the whole set is among them. Upstream ran
a discount only until the first square or clue whose sets ruled one out; the
ladder runs a technique over all its bindings, so a pass may rule out more
before the scan starts again. A set's reading is not monotone in the marks
(a number one bulb short spoils its other squares only while it is one
short), so the closure can move with the order; on every board measured the
grade did not (§ "Against HEAD").

All four are sound at orders 3 and 4, and each plant unsound
(`research/technique-check/results-describe-lightup.txt`).

**What retires**: `solveSub`, `dosolve`, `trySolveLight`,
`trySolveNumber`, the discount machinery (`tryRuleOut`, `discountSet`,
`discountUnlit`, `discountClue`), the recursion and its flags,
`solveUnique`, the hint's `SweepOffers` and `singleFirings` wiring, and the
state's `gridCorrect`. The hint walks the compiled firings with `ladderWalk`;
a discount firing rules out every square that spoils its set, and the plan
takes each as a step of its own, as the hint's words and its tests have it.
`status` is the compiled answer check. The generator keeps upstream's
shortcut of stripping every number no count acted on, read off the recorded
firings with `wholePasses`, as Mosaic's deal reads its numbers.

The fixpoint header's exception for Light Up retires: its solve is a
ladder.

## Unreasonable is the engine's search

Upstream's Unreasonable recursed five deep on the free square that lights
the most dark squares. It is now `searchAnswers` over the compiled marks at
Normal, assuming on that same square no bulb and then a bulb, and
`dealUnreasonable` with the shared strip budget. The tiers are
`searchTiers(2)`, so the difficulty contract is the engine's and Solve, the
hint's refusal and the mistake check go by the search at every tier.

**The budget**, 2,000 positions as Bricks' and Sticks', against what boards
need (2026-11-02): HEAD's preset Unreasonable boards 16 at most (60 boards),
HEAD's 15×15 and 20×20 boards 16 at most (30 boards, dealt in a scratchpad
worktree of HEAD), and boards dealt now 32 at most. No lookahead was needed
as the assumption: the Normal ladder's sets already do what Bricks' lookahead
did.

**Solve on a board with more than one answer** now says so, as every
search-tier game's does, where upstream's Solve returned the first answer
its recursion found. Only a desc typed by hand can have two.

## What else retired

- **`combi/`**: its one caller was Light Up's `discountClue`, which a
  `subsets` binder replaces. Its spec goes with it, and `agent-diagnostics`,
  which planted its type error there, plants it in `line-drawing.ts`'
  `linesAt`, its three expected errors read off `npm run typecheck`.
- **The checker reads a line of none as none, and the cells, neighbors and
  stretch of none as empty**, as it already read a value or a partition of
  none; and an empty comprehension, which it builds as a set of values, as
  empty where a set of cells is read (`stretch`, `+`, `-`). `darkSet` reads
  `rivals(first(S))` behind `|S| > 0`, and the checker reads both sides of a
  guard. Each path threw before, so no recorded verdict rested on it; ABCD,
  Bricks and Sticks, which read `stretch`, were checked again with
  `CHECK_AGAIN=1`, all as recorded.

## Against HEAD

Measured on every preset at each tier, 20 seeds each (180 boards,
2026-11-02, HEAD `e053f15b` against this change, back to back):

- **Every Easy desc is HEAD's** (60 of 60), and every Easy hint walk, played
  to the end by its first step, decides the same squares with the same marks
  by the same rules (1,930 squares).
- **56 of 60 Normal descs are HEAD's**; the other four strip in another
  order, the discount scan running on past its first find. On the boards
  that are HEAD's, every walk ends solved and no square is given the other
  mark; of the 2,100 squares both walks mark, 48 are decided by another
  rule, and 32 squares HEAD crossed are lit in the new walk (12 the other
  way round), since a walk that takes its steps in another order lights a
  square it would otherwise have crossed.
- **Unreasonable descs differ** (11 of 60 are HEAD's): the search strips
  where the recursion did. On the 11, every walk stops at the hint's
  refusal; one of 232 squares is decided by another rule, and four HEAD
  crossed are lit.
- **Every board HEAD dealt grades at its tier now** (180 presets and the 30
  larger boards above), so no save or link stops loading, and none changes
  tier.
- **Deals cost 1.3× to 3× HEAD's**: median and worst, in ms,

| Preset | HEAD | now |
| --- | --- | --- |
| 7×7 Easy | 2.4 / 5.5 | 4.1 / 7.6 |
| 10×10 Easy | 5.8 / 15.6 | 14.9 / 22.0 |
| 12×16 Easy | 20.9 / 27.0 | 65.6 / 93.4 |
| 7×7 Normal | 11.7 / 18.0 | 15.1 / 28.5 |
| 10×10 Normal | 39.9 / 74.0 | 58.4 / 96.8 |
| 12×16 Normal | 118.5 / 205.5 | 185.9 / 348.1 |
| 7×7 Unreasonable | 48.7 / 85.7 | 62.1 / 278.9 |
| 10×10 Unreasonable | 161.6 / 286.9 | 249.7 / 469.3 |
| 12×16 Unreasonable | 573.1 / 1,198.5 | 1,042.4 / 1,872.5 |

The cost is the sightline, which every reading computes from the clue lists
where upstream walked its flags; a definition that reads only what the board
deals is computed again at each read. Computing such a term once a board is
a compiler change for every game that reads one, not Light Up's, and is not
made here.
