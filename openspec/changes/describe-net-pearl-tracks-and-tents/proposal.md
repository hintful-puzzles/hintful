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
  the cheap count that decides most cases exactly.
- **A fill reads its own values only at the pair** to prune pair by pair:
  `4 - g(x) - g(y)`, not `count(z in {x, y} where g(z) = 1)`.
- **The frozen differential is the strongest comparison** where a game has
  one: Loopy's matched upstream's C byte for byte on 48 boards.
