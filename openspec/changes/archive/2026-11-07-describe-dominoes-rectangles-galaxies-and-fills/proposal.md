# describe-dominoes-rectangles-galaxies-and-fills

**Status: filed by `describe-divisions` (2026-11-06); split at its start
(2026-11-07) and took Filling.** Dominosa, Rect and Galaxies are filed as
`describe-dominoes-rectangles-and-galaxies`, the rest of step 9 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"), which files
step 10 when it is archived.

## Why

Filling ran a hand-written ladder (`FillingSolver`), and its hint kept what
that solver deduced from the clues alone, falling back to it where its own
reading of a player's position stalled. A description states the rules and
the reasoning once, and the checker proves each technique sound.

## What Changes

- **Filling described** (`filling.description.yaml`): its rules as every
  group of equal numbers side by side holding as many squares as its number,
  the regions as `through(c, O)` over the pairs known alike, and six
  techniques at Easy: `mustGrow`, `onlyWay`, `tooBig`, `noRoom`, `tooFar`,
  `onlyNumber`. Unreasonable is the answer search over the same ladder.
- **`FillingSolver` and its rungs retired**; the hint walks the compiled
  ladder from the player's position, and the fallback to the clues' solve
  goes with them. The answer check is the compiled rules.
- **`reaches(c, S, t)`** in the language, the runtime and the checker: how
  many cells of `S` stay reachable from `c` with `t` taken out, one search
  answering every `t`. `mustGrow` places every square a region cannot reach
  its size without.
- **`edgeGroups` keeps several sets' groups** between runs, so a technique
  binding one set per number finds its groups kept.
- **The soundness check stops at the least order that catches each plant**
  (`docs/descriptions.md` § "Checking a technique sound"), where it ran every
  technique at orders 3 and 4: Filling's `mustGrow` took 8 hours at order 4
  with numbers to 5 and its plant was caught at order 3 in a second. Of 110
  plants recorded across the games, none tried at order 3 needed order 4.
  The names exempted from plants at order 3 (`set`, `fish`, `digitSet`) go:
  their plants survive order 3 and the check goes on to 4 by itself, seen
  for Latin's `set` and `fish`. Filling's six checked in 96 s.

## What the comparison with HEAD found

Measured 2026-11-07, three presets (7×9, 9×13, 13×17) × Easy and
Unreasonable × six seeds, and 1,500 random clue sets keeping 50–92% of a
board's clues:

- **Boards**: 6 of 36 descs are the same. A different ladder strips clues in
  a different order, so the same seed deals another board; the app hands
  out boards, never seeds. Grades, answers and where each hint walk ends
  (Easy solved, Unreasonable refused) are the same on all 36. Easy boards
  keep 52.6 clues on average, HEAD's 53.3.
- **The ladder's verdict** on the random clue sets is the same on all 1,500
  (298 solved). The search's differs on 66, each between several answers and
  out of reach of the budget of 2,000: the search assumes in another order.
- **Hint walks**: 1,441 steps (growth 1,300, blocked 100, bitmap 23, lonely
  18), HEAD's 1,457 (1,312, 106, 21, 18).
- **A player's position**: 2,160 mistake-free positions on 36 Easy boards,
  and the 80 in the hint test, all finish. HEAD fell back to the clues'
  solve where its reading stalled; `tooFar` is not monotone in principle,
  and none of these stalled.
- **Upstream's boards**: the twelve frozen C fixtures are all solved by the
  ladder.
- **Saves and links**: the desc format is unchanged, so every save and link
  loads.
- **Deal time**, mean ms over six seeds, back to back under the same load:

  | Board | HEAD | Now |
  | --- | --- | --- |
  | 7×9 Easy | 7 | 18 |
  | 7×9 Unreasonable | 39 | 66 |
  | 9×13 Easy | 29 | 63 |
  | 9×13 Unreasonable | 170 | 293 |
  | 13×17 Easy | 161 | 316 |
  | 13×17 Unreasonable | 627 | 1,308 |

  About twice HEAD's, in the generator's worker. The cost is the compiled
  ladder reading every number's room and every region afresh each pass,
  where `FillingSolver` updated its own; first measured at near three times
  HEAD's, and brought down by `reaches` and the kept groups.

## Acceptance

Filling runs its compiled ladder for its hint and its generator's grading;
the hand-written rungs removed; every technique checked sound, each with a
planted defect that comes out unsound; the boards dealt, their tiers and
the hint walks compared with HEAD and each difference reported, with which
saves or links no longer load; large boards timed back to back with HEAD;
the guides updated; the running app checked; the rest of the step filed.
