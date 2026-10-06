# deal-the-rare-tiers-other-games-refuse

**Status: scaffolded, not started (2026-10-06).** A follow-up from
`keep-a-board-ready-for-the-next-deal`.

## Why

The app now deals the next board ahead and keeps it
(`src/puzzle/deal-ahead.ts`), so a type whose boards take seconds to find is
waited for once. On that ground Group stopped refusing two cells at about ten
seconds a board and gave each a retry bound sized to its measured rate
(`group/state.ts`, `retryBudget`), and the spec now says a rare tier that
takes seconds should be dealt (`ts-migration`, "An unbindable tier is refused,
not silently downgraded").

Five other games still refuse cells with `tooRareToDeal`, each on a
measurement written beside the refusal (read 2026-10-06):

- **Keen**, multiplication only: above Tricky at 5x5, 7x7, 8x8 and 9x9, once
  in 20,000 to 300,000 tries, "ten to thirty seconds a board"; Tricky at 9x9,
  once in 47,000 (`keen/state.ts`).
- **Map**: 8 regions at Normal, once in 35,000 to 120,000, "which is seconds";
  up to 10 regions at Hard and above, once in 20,000 to 95,000, "a second at
  6x6 and seven at 15x20"; three squares wide at Hard, once in 60,000 to
  335,000 (`map/state.ts`).
- **Salad**, Number Ball of 2 symbols at Normal: a 5x5 once in 36,000, "which
  was 48 seconds" (`salad/state.ts`).
- **Spokes**, Unreasonable: once in 26,000 at 2x5, "a minute a board", and
  once in 4,100 at 2x6, "half a minute" (`spokes/state.ts`).
- **Light Up**, 4x4 with 4-way rotational symmetry: 8 boards in 170,000
  (`lightup/state.ts`).

Several of these are no slower than the Group cells now dealt. Whether each
should be dealt is a question per cell: the rate, the time a try takes, and
how the game's retry bound is counted (Map's and Bridges' are in work, not
tries).

## What Changes

For each cell above: re-measure it, then either deal it with a bound sized to
its rate, as Group does, or keep the refusal and say beside it why the first
wait is too long. A minute a board is a different answer from ten seconds.

Where a cell is dealt, the sentence in the size field's `doc` changes with it,
and so does the help page built from it.

## Hints to pull in

None.

## What would show it worked

Each `tooRareToDeal` call in `src/games/` either gone, with a bound and a
dealt-tier test in its place, or standing beside a wait that is stated and is
longer than Group's.
