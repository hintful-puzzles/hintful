# a-middle-tier-for-the-games-that-search

**Status: a draft for the owner to pick, filed 2026-10-11 by the session that
gave Mosaic its comparison of two numbers
(`give-mosaic-the-deduction-its-unreasonable-boards-lack`). What it says of
the code was true that day; re-check before relying on it. It has no
`tasks.md` until the owner takes it up.**

## Why

A game with an Unreasonable tier has two tiers, and `engine/answer-search.ts`
knows that by constant: `DIFF_EASY` and `DIFF_UNREASONABLE`, the two names,
the `eu` codec segment and a contract that asks the deduction at one cap and
the search at the other. Eleven games' `state.ts` take all of it from there.

Two games have now gained a deduction that finishes most of what their
Unreasonable tier dealt, and each had to decide where those boards go with
no middle to put them in:

- **Crossing** dealt them as Easy (its archived change, `design.md` D1). They
  are 3 to 15 boards in 100 of the wider Easy, and the hint writes notes
  before the new step on most of them.
- **Mosaic** could not. Its generator hides every clue the solver can spare,
  so with the comparison in the Easy deal 98 of 100 10x10 boards needed it, a
  median of nine times. Easy is dealt as before, and the boards between,
  which one number at a time does not finish and which need no trial and
  error, are graded Easy when pasted and never dealt. They are the standard
  difficulty of the puzzle (Fill-a-Pix).
- **Net** has the same choice open
  (`give-net-the-deduction-its-unreasonable-boards-lack`).

## What Changes

- The search tiers take a count: a game with one deduction ladder of two
  rungs declares `Easy · Normal · Unreasonable`, from
  `tierNames(3, { search: true })`, with a codec segment and a contract cap
  for the middle one. A game with two tiers is unchanged.
- Mosaic deals the middle tier by its whole deduction: an Easy board with
  every clue tried again, kept where upstream's rule stops short. Measured
  2026-10-11, that hiding takes 3 ms a board at 10x10, 32 ms at 15x15 and
  half a second at 25x25, and every board it leaves needs the comparison
  from 15x15 up.
- Crossing's choice is the owner's to turn round or keep.

## What to settle first

- **The menu.** A section holds twelve lines (`MENU_SECTION_LINES`). Mosaic's
  six sizes at three tiers are eighteen.
- **What a board saved before loads as.** A pinned tier is kept where the
  board solves at it and raised where it does not, so an Easy pin on a board
  that needs the comparison rises to the middle tier, and an Unreasonable pin
  stays. The codec letter for Unreasonable is `u` and must stay.
- **Whether the middle tier is one name in every game.** `tierNames` gives
  "Normal". In Mosaic it would mean "compare two numbers", in Crossing "look
  for a number's only run".

## Capabilities

### Modified Capabilities

- `engine-difficulty`: the tiers of a game that searches.
- `mosaic`: a third tier and what it deals.

## Impact

- `src/engine/answer-search.ts`, the eleven games that take two tiers from
  it, `src/games/mosaic/solver.ts` and `state.ts`, the params snapshot, and
  `docs/games/solver-and-generator.md` § "Giving a deductive game an
  Unreasonable tier".
