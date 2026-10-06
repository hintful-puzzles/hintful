# keep-a-board-ready-for-the-next-deal

**Status: built 2026-10-06.** The owner's idea, raised while
`deal-the-tier-a-custom-size-asks-for` was refusing three Group cells for
being too slow to deal. `design.md` holds what was decided; the sections below
are the proposal as scaffolded on 2026-10-05.

## Why

Some boards take seconds to find, and the player waits for each one. Measured
2026-10-05:

- **Group, identity shown.** A 6x6 at Tricky is found once in about 48,000
  tries: ten seconds a board on average, 28 at worst over eight boards. An 8x8
  at Hard is found once in about 6,400 tries: nine seconds on average, 17 at
  worst over ten. Both are refused today for that reason alone
  (`group/state.ts`, `tierTooRare`), with a 6x6 at Hard, where 290,000 tries
  found none.
- **Group 12x12** at Hard took 11 to 16 seconds over three deals and is
  dealt, because nothing bounds a Custom size by its deal
  (`bound-custom-sizes-by-their-deal`).
- The tier walk (`scripts/checks/tier-walk.test.ts`) lists every cell whose
  deal passed three seconds, under "left out" and beside the cell that was
  slow.

A deal is slow once per board, and nothing here keeps a board: every New game
starts the generator from nothing. Nothing in `src/puzzle/`, `src/screens/` or
the midend deals ahead (read 2026-10-05).

## What Changes

To be designed. Two mechanisms, which combine:

- **Deal ahead.** After a board is dealt, the worker generates the next one
  for the same params and keeps it, so the wait is paid once per type and not
  once per board. Boards stay endless and nothing is committed to the repo.
- **Bank what a search throws away.** A generator rejects a board for being
  too easy, and that board is a real one of some lower tier. Graded and kept
  under the tier it needs, it is a board the next deal at that tier does not
  have to find. Upstream's Unequal did this without the grading: after fifty
  tries it handed over the reject under the label asked for.

What is known about the second, so the design does not have to find it again:

- **Rejects only fall downward.** A search at Hard yields Tricky and Normal
  boards and never the reverse, so it mostly fills tiers that are already
  instant: a 6x6 Tricky search throws away about 48,000 boards per hit, every
  one of them Normal or Easy.
- **It pays for a rare middle tier under a search for a higher one.** A 6x6
  Hard search strips each board at the Hard cap and rejects it where the
  Tricky cap solves it, and some of those rejects need exactly Tricky.
- **The sample is biased.** A reject was stripped against a stronger solver
  than its tier's own, so it may carry fewer clues than a board dealt at that
  tier directly. Whether a player can tell has not been looked at.
- **Grading costs solver runs**, so bank a tier only where it is scarce.

A shipped pool of descs was considered and is the weaker form: the first deal
is instant, but the pool is finite, so boards repeat, and a solver change can
move a pooled board to another tier.

## What it would reopen

`tierTooRare` in Group, and the spec clause that allows it (`ts-migration`,
"An unbindable tier is refused, not silently downgraded": a tier too rare to
deal may be refused). With a board kept ready, a ten-second deal is paid once,
and the two Group cells that have boards could be dealt. Lifting a refusal
breaks nothing a player has.

## Open questions

- Where a kept board lives (IndexedDB beside saved games, or the worker's
  memory), and what invalidates it: a new app version may grade it
  differently, and the midend already grades a board that arrives by desc.
- Whether dealing ahead should run for every type or only where a deal is
  slow, given a phone's battery.
- What the player sees during the first, slow deal.

## Hints to pull in

None.

## What would show it worked

The second and later deals of a slow type arrive at once, measured on the
cells above, and the two Group cells deal a board of their tier.
