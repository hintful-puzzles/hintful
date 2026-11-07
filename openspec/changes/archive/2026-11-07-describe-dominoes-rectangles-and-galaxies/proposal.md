# describe-dominoes-rectangles-and-galaxies

**Status: filed by `describe-dominoes-rectangles-galaxies-and-fills`
(2026-11-07); split at its start (2026-11-07) and took Dominosa.** Rect and
Galaxies are filed as `describe-rectangles-and-galaxies`, the rest of step 9
of `describe-the-whole-catalog`'s plan (`design.md` § "The plan"), which
files step 10 when it is archived.

## Why

Dominosa ran a hand-written ladder (`DominosaSolver`), and a second copy of
its order for the hint (`firstFiring`); its Unreasonable tier graded on
forcing chains, which no hint narrates. A description states the rules and
the reasoning once, and the checker proves each technique sound.

## What Changes

- **Dominosa described** (`dominosa.description.yaml`): the answer on the
  spots between squares side by side, a domino or none; the rules as every
  square covered once and no domino twice, with a number's clue meaning that
  every pair of numbers side by side is a domino of the set, which with the
  other two uses the set whole. Ten techniques: `placed` (run as a domino is
  placed), `onlySpot` and `squareOnly` at Easy; `squareSingleDomino`,
  `mustOverlap`, `localDuplicate`, `localDuplicate2` and `parity` at Normal;
  `set` at Tricky and `setDoubles` at Unreasonable.
- **The forcing chains retired.** Unreasonable is dealt where the ladder at
  Tricky stops and the search beneath the ladder finds one answer, as
  Filling's is. The search assumes a domino on each spot left round the
  square with the fewest, within 2,000 positions.
- **`DominosaSolver`, `firstFiring` and the second hint ladder retired**; the
  hint walks the compiled ladder from the player's dominoes. The answer
  check is the compiled rules.
- **The compiler**: a binder over the cells pinned by a clue's value
  (`x in cells where clue(k, x) = t`) loops over those cells alone, from an
  index of the board's clues (`cluesValued`); a mask union over a subset's
  members is kept for each member and made again once a value is placed
  (`memberUnion`); a `subsets` size filter is read off the counter for `>=`
  and `>` too; a subset is built into one array a site; and a definition's
  binder named as the variable an argument is held in no longer captures it.
- **The checker**: a planted defect for each technique, and the
  multiplicity plants (`ONCE`) planted only on a library's techniques, where
  they applied to any game technique of the same name.
- **The checker is bounded: ten minutes a technique, plants included**
  (`CHECK_BUDGET_MS`), at the owner's direction after `parity`'s whole
  proof passed 70 minutes unfinished. The proof over every board runs to
  0.4 of the budget, then the question is asked of sampled boards, answer
  and clues fixed, in fresh batches to 0.6; a technique on which no defect
  turned up is recorded `held`, which the gate takes as checked. A plant must
  be caught within the rest, or the run fails. The clues of a sampled board
  are dealt as constants, without which `set`'s query ran the JavaScript heap
  out while being built; a query holding most of the heap stops as at its
  deadline. Under it, seven techniques are proved and `parity`, `set` and
  `setDoubles` held, `set`'s and `setDoubles`' on every answer of the
  4×4 board, in 3 to 6 minutes each, every plant caught. `parity`'s first
  plant, the second part's count dropped, planted nothing (a group of spots
  left is the answer's dominoes, so even) and went uncaught; its plant
  reads a spot as cutting its group where it does not.
- **The generator** keeps upstream's allocator; its swappable-block test
  reads a neighbor in the first row and column too, where upstream's bounds
  missed it.

## What the comparison with HEAD found

Measured 2026-11-07.

- **Tiers**: of 120 boards HEAD dealt (orders 6 and 7, 40 each at Easy and
  Normal, 20 each at Tricky and Unreasonable), every one grades at its tier
  here, the Unreasonable ones by the search. Of the 120 dealt here, HEAD's
  solver grades every Easy, Normal and Tricky one at its tier, and none of
  the 40 Unreasonable ones: they are past HEAD's forcing chains, which dealt
  only boards the chains finish. Unreasonable boards now need trial and
  error.
- **Upstream's boards**: the nine frozen C fixtures each grade at upstream's
  tier, the Unreasonable one by the search.
- **Boards**: a seed deals another board, since the grading and the
  allocator's bounds changed; the app hands out boards, never seeds.
- **Hint walks**, from the empty board to the end on 32 boards HEAD dealt at
  order 6, eight a tier: every walk ends where HEAD's does (31 solved, one
  Unreasonable refused). Easy is step for step the same (224 steps). Normal
  263, HEAD 260: one `parity` and one `localDuplicate` more. Tricky 331,
  HEAD 367: `set` 39, HEAD 74, a set's firing ruling out a domino's spots in
  a different order. Unreasonable 379, HEAD 383, `set` and `setDoubles`
  together 68, HEAD's 72.
- **Saves and links**: the desc format is unchanged, so every save and link
  loads. A pasted board with several answers is now refused as having more
  than one, where it was refused as having no single answer that could be
  found.
- **Deal time**, mean ms over six seeds, back to back in one run:

  | Board | HEAD | Now |
  | --- | --- | --- |
  | order 6 Easy | 12 | 38 |
  | order 6 Normal | 8 | 70 |
  | order 6 Tricky | 26 | 167 |
  | order 6 Unreasonable | 174 | 73 |
  | order 9 Easy | 15 | 70 |
  | order 9 Normal | 32 | 217 |
  | order 9 Tricky | 1,617 | 3,303 |
  | order 9 Unreasonable | 5,304, one of six gave up | 705 |

  Order 6 is the menu's largest; order 9 is a Custom size. The first
  statement dealt order 9 Tricky in 14 s: the `set` rung read each subset's
  partners afresh (`memberUnion` cut it to a quarter), `parity` walked a
  group for every spot (a ring of four read first cut it by seven eighths),
  and `onlySpot` and `mustOverlap` read every spot's domino's spots (bound
  per domino, a third). Unreasonable is faster, the search replacing the
  forcing chains; HEAD's generator gave up on one seed.

## Acceptance

Dominosa runs its compiled ladder for its hint and its generator's grading;
the hand-written rungs removed; every technique checked sound, each with a
planted defect that comes out unsound; the boards dealt, their tiers and
the hint walks compared with HEAD and each difference reported, with which
saves or links no longer load; large boards timed back to back with HEAD;
the guides updated; the running app checked; the rest of the step filed.
