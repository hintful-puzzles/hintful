# a-middle-tier-for-the-games-that-search

**Status: a draft, reviewed 2026-10-11 at the owner's request, and waiting on
the owner's answer at the foot. It was filed that day by the session that
gave Mosaic its comparison of two numbers
(`give-mosaic-the-deduction-its-unreasonable-boards-lack`). What it says of
the code was true that day; re-check before relying on it. It has no
`tasks.md` until the owner takes it up.**

## Why

Mosaic and Net each have a deduction their hint explains and no dealt board
that needs it and that it finishes. Easy in both is upstream's deal.
Unreasonable is a board the whole deduction stops on. The boards between are
graded Easy when pasted and never dealt (the two archived changes, `design.md`
D2 and D4).

- **Mosaic**: a board one number at a time does not finish and comparing two
  numbers does. It is the standard difficulty of the puzzle (Fill-a-Pix).
- **Net**: a network upstream's solver stops on and the hint finishes, by
  looking at a square as turned one way.
- **Crossing** dealt its own as Easy (its archived change, `design.md` D1),
  where they are 3 to 15 boards in 100. Nothing here moves it.

## What the review found

**Nothing is wrong today.** No board a player had before 2026-10-10 is gone:
the tier these boards were dealt under was a day old, and named them
Unreasonable, which they were not. Every one of them still opens and is
graded rightly.

**It is two games' work, and little of it is the engine's.** The engine
already has a deductive tier under a search tier:
`tierNames(3, { search: true })` is Light Up's and Spokes', with their own
codec letters and contract, and Dominosa, Keen, Map and Solo have more. What
knows two tiers by constant is the bundle in `engine/answer-search.ts` (the
two names, the `eu` segment, `searchTierContract`), which twelve games take
and two would take at three. Giving it a count is small. The rest is a deal,
a menu, a help page and a run of the app in each of two games, which is what
`docs/work-management.md` § "New work is the engine's" stopped being
proposed, and the three changes this came from were picked as the last of
the kind.

**Two of the three things to settle were settled already.**

- The name: `tierNames` is positional by decision, and "Normal" already means
  another thing in each game that has it.
- Saved boards: the codec writes a letter, so `du` stays Unreasonable under
  `enu`. An Easy pin on a pasted board that needs the comparison rises to
  Normal as it loads, which the midend does today. Nothing a player holds
  stops opening.

**The menu is a real cost.** A section holds twelve lines
(`MENU_SECTION_LINES`). Mosaic's six sizes with a middle tier where it can be
dealt are fifteen lines, and Net's five sizes are fourteen and its wrapping
board. Either the bound rises for every game or each game gives up sizes.

**The numbers hold**, measured again 2026-10-11 through the solvers.

Mosaic, an Easy board with every clue tried again by the whole deduction:

| Board | Need the comparison | Clues shown, Easy to middle | Comparing steps | Hiding |
| --- | --- | --- | --- | --- |
| 3x3 | 2 of 200 | 3 to 3 | 0 | under 1 ms |
| 5x5 | 40 of 200 | 10 to 9 | 0 | under 1 ms |
| 10x10 | 98 of 100 | 42 to 39 | 7 | 3 ms |
| 15x15 | 40 of 40 | 97 to 87 | 25 | 29 ms |
| 25x25 | 10 of 10 | 279 to 241 | 75 | 0.3 s |

So the tier is dealt from 10x10 up, and a middle board is an Easy one with a
tenth fewer numbers and a comparison every dozen squares or so.

Net, of 150 networks a size that the solver stops on with one answer, how
many the hint finishes, and the time to deal one: 150 at 5x5 (40 ms), 123 at
7x7 (42 ms), 101 at 9x9 (41 ms), 104 at 11x11 (60 ms), 92 at 11x13 (70 ms),
50 at 7x7 wrapping (33 ms).

## What Changes, if it is taken up

- `engine/answer-search.ts` takes a count: a game with a second deduction
  declares `Easy · Normal · Unreasonable`, with `enu` and a contract cap for
  the middle one. A game with two tiers is unchanged.
- Mosaic deals Normal from 10x10 up: an Easy board with every clue tried
  again by the whole deduction, kept where upstream's rule stops short.
- Net deals Normal from its Unreasonable deal, which passes these boards on
  its way: a network the solver stops on with one answer, kept where the hint
  finishes it.
- The menu's bound or the two games' sizes, as the owner chooses.

## For the owner

The review's recommendation is **not to take this up now, and never as
written**.

- Nothing a player has is broken or lost, and waiting costs nothing: a tier
  added later raises boards as they load.
- It is a feature for two games under an engine's name, against the drain
  and against "new work is the engine's".
- If any of it is wanted once the drain is over, it is **Mosaic alone**: the
  middle board is the puzzle's standard difficulty, its hint is written and
  has no dealt board to finish, and its deal is measured. Net's case is the
  same shape and weaker, since upstream's deal is already the game people
  know. The engine's count comes with whichever game is first and is not
  worth making without one.

The answers: close this draft; keep it as a draft for Mosaic after the drain;
or take Mosaic up now.

## Capabilities

### Modified Capabilities

- `engine-difficulty`: the tiers of a game that searches.
- `mosaic`: a third tier and what it deals.
- `net`: a third tier and what it deals, if Net is taken.

## Impact

- `src/engine/answer-search.ts`, `src/engine/preset-grid.ts` if the bound
  moves, `src/games/mosaic/solver.ts` and `state.ts`,
  `src/games/net/generator.ts` and `state.ts`, the params snapshot, the two
  help pages, and `docs/games/solver-and-generator.md` § "Giving a deductive
  game an Unreasonable tier".
