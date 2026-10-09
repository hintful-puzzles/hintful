# add-an-unreasonable-tier-to-the-untiered-deductive-games

**Status: filed 2026-10-10 on the owner's word, by the session that archived
`refuse-a-board-an-untiered-solver-cannot-finish`. What it says of the code
was true that day; re-check before relying on it. Nothing here has been
tried.**

## Why

Nine deductive games have no difficulty tiers: ABCD, Crossing, Filling,
Mosaic, Palisade, Pattern, Separate, Signpost and Sticks. Each deals only
boards its deductions finish, and since
`refuse-a-board-an-untiered-solver-cannot-finish` each refuses a pasted board
they do not, with "This game ID's puzzle needs trial and error, and only
puzzles that deduction alone solves can be played here."

The owner (2026-10-10) wants a player to meet "trial and error" only where
they asked for Unreasonable, and asked for the tier to be added properly:

> a new change please, to implement it properly with a generator. And
> continue to refuse games that have non-unique solutions

So each of these games gains an Unreasonable tier that its generator deals,
and a pasted board that has exactly one answer and needs search opens at that
tier, where the hint's "nothing further follows by deduction" is the
collection's honest sentence. Mines, Net, Range and Rectangles are untiered
and deductive too; whether they join is task 1.

## What Changes

- Each game gains a difficulty item with a tier below (what it deals today)
  and Unreasonable, a `difficulty` contract, and a generator that deals
  Unreasonable boards: one answer, not finished by the game's deductions.
- Each game gains a search that proves a board has exactly one answer. Its
  deductions alone cannot: a ladder that stops short has proved neither a
  second answer nor none.
- A pasted board with one answer that needs search loads as Unreasonable. A
  board with several answers or none is still refused, with
  `DESC_NO_SINGLE_ANSWER` or the answer check's own sentence.
- The game drops `finishesByDeduction`, since a tiered game is held to its
  tiers (`registerGame` refuses one that has both).

## What to settle first

- **For the owner, before any code: the params encoding.** A difficulty item
  adds a field to each game's params, which sit inside every shared game ID
  and every save. The collection's way is to leave the default tier out of
  the encoding, so every ID a player holds today would still decode, to the
  tier it was dealt at. That needs checking per game against the byte-stable
  params guard, and it is the owner's call if any game cannot keep its
  existing IDs unchanged.
- **Which name the lower tier takes.** `tierNames(2, { search: true })` gives
  Easy and Unreasonable. ABCD already has an Easy/Hard switch that hides
  clues, which is a second axis and not a tier, and has to be reconciled.
- **Whether an Unreasonable board of each game is a good puzzle.** A tier is
  added where its boards are worth playing, and the answer may differ by
  game: measure how often a generator finds such a board, how long that
  takes on each preset, and look at what it deals.
- **The cost of the uniqueness search** on each game's largest preset, at
  load and at deal.

## Capabilities

### Modified Capabilities

- Each game's own capability: its tiers, its generator, what loads.
- `engine-params`: only if what an untiered game owes changes once fewer
  games are untiered.

## Impact

- Each game's `state.ts` (params), `generator.ts`, `solver.ts`, `index.ts`,
  help page and tests, and `src/engine/untiered-load.test.ts`, whose ledger
  loses a game as it gains tiers.
- One game first, to the end, before the pattern is repeated: a framework
  shape needs a real game under it.
