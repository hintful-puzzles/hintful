# a-middle-tier-for-the-games-that-search

**Filed 2026-10-11 as a draft for Mosaic, Net and Crossing, reviewed that day
at the owner's request, and taken up for Mosaic alone on the owner's word.
What it says of the code was true that day.**

## Why

Mosaic has a deduction its hint explains, the comparison of two numbers whose
blocks overlap, and dealt no board that needs it and that it finishes. Easy
is upstream's deal, which one number at a time finishes. Unreasonable is a
board the whole deduction stops on. The boards between were graded Easy when
pasted and never dealt
(`give-mosaic-the-deduction-its-unreasonable-boards-lack`, `design.md` D2).
They are the standard difficulty of the puzzle (Fill-a-Pix).

## What the review found

- **Nothing was broken.** No board a player had before 2026-10-10 was gone,
  and every board opened and was graded rightly. This is a tier added, on the
  owner's word, and not a mend.
- **Little of it is the engine's.** The engine already has a deductive tier
  under a search tier: Light Up and Spokes are
  `tierNames(3, { search: true })`, with their own codec letters and
  contract. What knew two tiers by constant was the bundle in
  `engine/answer-search.ts` that twelve games take.
- **The name was settled**: `tierNames` is positional by decision, and
  "Normal" already means another thing in each game that has it.
- **Saved boards were not at risk**: the codec writes a letter, so `du` stays
  Unreasonable beside `dn`, and a pin is kept or raised as it loads.
- **The menu was the real cost**: six sizes at three tiers are eighteen lines
  and a section holds twelve (`design.md`, D3).

## What Changes

- `engine/answer-search.ts`: the tiers of a game that searches take a count
  (`searchTiers`). The two-tier names, field, segment and contract are that
  at one deduction, and the eleven games that take them are not edited.
- Mosaic is `Easy · Normal · Unreasonable`. Normal is an Easy board with
  clues hidden again by the whole deduction, kept where one number at a time
  stops short. Its contract grades a rung a tier, so a pasted board that
  needs a comparison opens as Normal where it opened as Easy.
- Mosaic's menu offers 10x10, 15x15 and 25x25 at every tier and the other
  three sizes at Easy alone.

## Not taken up

- **Net**: the same shape, measured (of 150 networks a size that the solver
  stops on with one answer, the hint finishes 150 at 5x5, 123 at 7x7, 101 at
  9x9, 104 at 11x11, 92 at 11x13 and 50 at 7x7 wrapping, at 40 to 70 ms a
  board). Its case is weaker, since upstream's deal is the game people know.
  With `searchTiers(2)` it is the game's deal and menu and nothing of the
  engine's. It is not filed.
- **Crossing**: its boards of this kind are 3 to 15 in 100 of Easy and stay
  there.

## Capabilities

### Modified Capabilities

- `engine-difficulty`: the tiers of a game that searches.
- `mosaic`: a third tier, what it deals, the menu and what a pasted board
  opens as.

## Impact

- `src/engine/answer-search.ts` and its tests, the cross-game guard in
  `src/engine/difficulty-contract.test.ts`, `src/games/mosaic/`,
  `help/games/mosaic.md`, `help/differences.md`, and
  `docs/games/solver-and-generator.md` § "Giving a deductive game an
  Unreasonable tier".
