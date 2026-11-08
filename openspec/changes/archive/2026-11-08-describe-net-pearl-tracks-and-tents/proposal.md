# describe-net-pearl-tracks-and-tents

**Status: filed by `describe-loopy-net-pearl-tracks-and-tents`
(2026-11-08)**, which took Loopy alone. It is the rest of step 10 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). Split at the
start by what each game adds to the language, and take the first group:

1. Net's rotations.
2. The line games on the square grid: Pearl, Tracks and Tents.

File the rest. The last of them files step 11,
`describe-the-remaining-number-games`, when it is archived.

## Why

Pearl, Tracks, Net and Tents each run a hand-written ladder, and Net orders
its rungs a second time for the hint (the survey, `design.md` § "Edge, line
and division games"). A description states the rules and the reasoning
once, and the checker proves each technique sound.

## What Changes

- **What these games read** is added to the description language, the
  ladder runtime and the checker: Net's rotations first.
- **Each game's ladder is stated**, with its tiers as it grades them. Its
  hand-written rungs and the hint's second order are retired.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's
grading, and its hand-written rungs are removed. Every technique is checked
sound, each with a planted defect that comes out unsound. The boards dealt,
their tiers and the hint walks are compared with HEAD, and each difference is
reported, with which saves or links no longer load. Large boards are timed
back to back with HEAD. The guides are updated and the running app is
checked.

## What was done (2026-11-08)

- **The split**: Net alone. Its rotations needed the square grid as a
  tiling (`src/engine/square-tiling.ts`) and an edge projection in the
  compiler; Pearl, Tracks and Tents are filed as
  `describe-pearl-tracks-and-tents`, which files step 11 when archived.
- **Net's ladder is `net.description.yaml`**: fit, loop, seal and strand,
  each a lock and a note. The hint, Solve and the generator's grading run
  it; the hand-written rungs and the hint's second order (`deduce.ts`) are
  gone, and `explain.ts` keeps only the narration. All eight techniques
  check sound, and each plant comes out unsound
  (`results-describe-net.txt`).
- **The seal is a directed reach**: a wire enters a square and leaves only
  across a side some way of that square fitting the known sides carries it
  on to, then crosses any side both squares could carry, to the dead ends
  beside. The hand-written rung tried every turning of the squares it
  entered. The help says it the new way, and the hint's sentence for a
  group reached only through open squares ("…which end its wire however they
  turn") is removed: the reach makes "would seal off the striped squares"
  true of every seal.
- **The hint locks a square its neighbors settled** (`lockIfSettled`), so
  an Easy plan ends with every square locked.
- **Dealing**: Easy perturbs with the whole ladder. Unreasonable perturbs and
  searches with the fit and loop techniques (`QUICK`), and asks the whole
  ladder once a draw. The compiler now joins a bound set of edges into
  groups once even where a filling's pair test reads it (`boundSets`), which
  took a fifth off Net's Unreasonable deals; `union` and `minus` switch to a
  `Set` past 16 elements.
- **Compared with HEAD** (deal-compare, 10 deals a preset): Easy boards are
  HEAD's but for one each at 11x11, 5x5w and 9x11w, and deal in 0.45–1.6×
  HEAD's time, under 105 ms. Unreasonable boards all differ, as the ladder
  differs; 7x7 deals in half HEAD's time, 9x11 and 11x13 in 2.3–2.6×, 7x9w
  in 7.8× (worst 572 ms), and **9x11w in 971 ms on average, 3.5 s at worst,
  against HEAD's 47 ms**: past the 1 s bar, and raised with the owner. Of 20
  HEAD Easy boards per preset, the ladder leaves 2 of 5x5w unfinished; they,
  the 3x4w board `8cec738e1432` and upstream's W5 board open as Unreasonable
  when pasted. Every HEAD Unreasonable board sampled still has one answer
  and none became Easy. Hint walks are within 1–4 steps of HEAD's. The desc
  format is unchanged, so every save and link loads.
- **In Chrome**: the seal step on `5x5wde:5196412d61c4dd89ee7392653` rings
  the straight and stripes both dead ends, one across the wrap; the plan
  finishes the board; a 9x11w Unreasonable board deals; the help reads the
  new seal paragraph.

## What Loopy learned that binds here

The lessons of the archived `describe-bridges-…`, `describe-pearl-…` (Spokes)
and `describe-loopy-…` changes bind here.

- **Run the ladder in place against a known answer.** The soundness check
  judges one binding on one position, and a hint walks one firing at a
  time, so neither sees a technique that places and then reads a set it
  bound before the placement. Deal boards from a known loop or answer, run
  the solve's fixpoint, and compare the marks after every technique's run
  (`docs/descriptions.md` § "A statement's order is behavior").
- **A reason is built per fact.** A technique that concludes two facts
  gets two reasons; a hint that reads only the first loses the second.
- **The fixpoint restarts from the top after every firing**, so cheap
  propagating techniques belong first in their tier, and the hint's own
  order can be kept apart (`ladderWalk` takes the entries in any order).
  A technique asking a fill per element is the cost to watch: guard it with
  the cheap count that decides most cases exactly. A solve skips the
  bindings no fact reached only where the footprint analysis follows the
  geometry (`rerun-only-what-a-firing-touched`), which is a tiling's alone so
  far; where one of these games is slow on the grid, teach the analysis the
  grid's steps (a cell's neighbors and edges) before anything else.
- **A fill reads its own values only at the pair** to prune pair by pair:
  `4 - g(x) - g(y)`, not `count(z in {x, y} where g(z) = 1)`.
- **The frozen differential is the strongest comparison** where a game has
  one: Loopy's matched upstream's C byte for byte on 48 boards.
