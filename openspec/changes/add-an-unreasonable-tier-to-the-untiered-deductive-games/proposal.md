# add-an-unreasonable-tier-to-the-untiered-deductive-games

**Status: filed 2026-10-10 on the owner's word, by the session that archived
`refuse-a-board-an-untiered-solver-cannot-finish`. Pattern, the first game,
has its tier (2026-10-10), and `tasks.md` says where the rest stand. What
this file says of the code was true on its date; re-check before relying on
it.**

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
  and every save. Read in the code 2026-10-10, nothing run:
  - **No ID or save a player holds stops opening, whichever way it is
    written.** Eight of the nine build their codec from `paramsCodec`, whose
    segments leave a field at its default when their letter is absent, and
    Mosaic's hand-written decoder does the same. So `5x5n5` decodes to the
    lower tier, provided `defaultParams` names it. Lowercase `d` is free in
    all nine (ABCD's `D` is a different letter).
  - **A stored type is re-encoded before anything compares it.** The type
    menu and the settings read `encodeParams` of what the midend decoded, so
    an old stored string does not show as Custom.
  - **This file was wrong that the collection leaves the default tier out.**
    Every tiered game writes its tier with the `choice` segment, always, as
    `d` and a letter, in the full params: Seismic's default is `6x6de`. The
    app shares a board as full params and its desc, so a link shared today
    carries the tier.
  - **So the question is only how the new strings are spelled.** (a) Like
    every other tiered game: `5x5n5de` for today's boards and `5x5n5du` for
    Unreasonable. Old links open; a link shared from now on is two characters
    longer, and no longer equal to the ID upstream's app writes for the same
    board. (b) The lower tier written as nothing and Unreasonable as `du`:
    every string in use today stays exactly as it is, and these nine become
    the only tiered games whose tier may be absent.
  - **Answered by the owner, 2026-10-10: (a), always write it.** Each game
    takes the `choice` segment with `d`, in the full params, as the other
    tiered games do. Task 1.2 is then to show that every string in the params
    corpus still decodes to the lower tier, and to re-baseline
    `params-stability.test.ts` with the diff read: every changed line gains
    `de` and nothing else moves.
- **Which name the lower tier takes.** `tierNames(2, { search: true })` gives
  Easy and Unreasonable. ABCD already has an Easy/Hard switch that hides
  clues, which is a second axis and not a tier, and has to be reconciled.
- **Whether an Unreasonable board of each game is a good puzzle.** A tier is
  added where its boards are worth playing, and the answer may differ by
  game: measure how often a generator finds such a board, how long that
  takes on each preset, and look at what it deals.
- **The cost of the uniqueness search** on each game's largest preset, at
  load and at deal.

## Which games join

Decided 2026-10-10 by the session that did Pattern, from the code. Each game
still gets its own measurement (task 2) before its tier is offered.

- **The nine join**, in the order of task 3.2.
- **Net, Range and Rectangles join.** Each is what the nine are: no tiers, a
  mistake check against one answer, and a `finishesByDeduction` that refuses a
  pasted board its deductions do not finish with the "trial and error"
  sentence. The owner's reason covers them as it covers the nine. Range's
  Solve already searches and returns the first answer it meets, so its work is
  counting to two.
- **Mines does not.** Its answer is hidden. A board its deductions do not
  finish is not a puzzle with one answer that trial and error finds: several
  layouts of mines fit what is showing, and the one that is real is learned
  only by opening a square that may be a mine. Undo makes that a way to read
  the answer, not to work it out, and no search proves "exactly one answer"
  of a position whose point is that there are several. So Mines goes on
  dealing only boards deduction finishes and refusing a pasted one it does
  not. That leaves it the one game where a player meets the "trial and error"
  sentence without having asked for Unreasonable, and only from a pasted ID.

## What Pattern found

Measured 2026-10-10. The guide has what transfers
(`docs/games/solver-and-generator.md` § "Giving a deductive game an
Unreasonable tier").

- **The tier is cheap to deal and its boards are real.** A deal takes about
  10 ms at every preset. The search that proves one answer tries a median of
  3 positions at 10x10 and 17 at 30x30.
- **How much the hint does falls with the size.** The lines leave a median of
  21 squares of 100 undecided at 10x10 and 651 of 900 at 30x30, so on the
  largest preset the hint does about a quarter of the board and the player
  the rest by trial. That is what the tier's name says, and it is the thing
  to look at if the large Unreasonable presets are ever judged too much.
- **No picture up to 3x3, or one square wide, is Unreasonable**, and those
  sizes are refused at that tier when dealing.
- **Past the menu the deal slows**: about a second at 40x40 and tens of
  seconds at 50x50, where most draws fail and each failure can cost the
  search's whole budget.
- **The ledger's Pattern board was not what it said.** `untiered-load.test.ts`
  held `10x10:/7/1.4/…` as a board that parses and deduction does not finish.
  Its clues contradict each other, and it is now refused as that.

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
