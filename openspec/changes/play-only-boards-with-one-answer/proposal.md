# play-only-boards-with-one-answer

Scaffolded as `check-hidden-boards-against-what-they-prove` after
`give-a-hint-sentence-its-parts`, and redirected by the owner (2026-10-02)
before any of it was built. The scaffold proposed a check that finds only the
marks the visible board refutes; the owner chose a check against the answer,
*"That is what check&save already is, across all games"*, set the goal *"a
check&saved situation always would be solvable"*, and, on learning that a Black
Box board can have several answers, asked that its generator deal only boards
with one, *"reject non-unique solutions from upstream as incompatible with
Hintful"*, and *"to the extent possible, please implement this in the engine,
so that we don't need to relitigate this in other games in the future"*. The
owner also suggested building a board a ball at a time, which is how the
generator now deals.

## Why

Black Box and Mines excused `findMistakes` because their answer is hidden
(`Game.notApplicable`). Check & Save in every other game compares the player's
marks with the board's one answer and saves only a board that agrees, so a
saved board can always be finished. A hidden answer is no reason to treat these
two differently.

A check against the answer is only sound on a board with one answer. Mines'
mines are one layout. Black Box's are not: its own verify (`checkGuesses`)
accepts any balls that send every laser where the real ones do, and its
generator scattered balls at random, so some boards had several answers. On
such a board a check against the dealt balls would call a valid ball a mistake,
and the hint, which reads only the lasers, would lead the player into one.

## What Changes

- **The engine plays only boards with one answer, wherever a game can tell.**
  `loadDesc` asks the game's own `solve` about a board it loads, for every game
  with a mistake check: a board the solver proves has several answers does not
  load (`DESC_NOT_UNIQUE`, a new desc error), nor one it proves has none
  (`DESC_CONTRADICTORY`). A tier declared in `nonUniqueTiers` is not asked.
  Every game whose `solve` can say `MULTIPLE_SOLUTIONS` or `NO_SOLUTION` joins
  by having said it.
- **Compatibility break, approved:** a Black Box game ID with several answers,
  from upstream or from this app before this change, no longer loads.
- **Black Box deals only boards with one answer**, built a ball at a time
  (`answer.ts`). Its answers are counted by the hint's own search, run with
  every laser fired at the real balls, and its `solve` says
  `MULTIPLE_SOLUTIONS` for a board with several. Every Black Box seed deals a
  different board, which is not a compatibility break
  (`share-boards-not-seeds`).
- **Black Box's custom params gain a generation-only limit on the ball count**,
  past which counting the answers costs more than a deal can wait.
- **Black Box and Mines check marks against the answer**: a guess on an empty
  square or a known mark on a ball; a flag on a square with no mine. Each draws
  the mistake as a frame in its error color. The `notApplicable.findMistakes`
  excuses go.
- **Both hints lose the steps that undid a wrong mark**, which the midend's
  refusal now precedes: Black Box's two-move settle journeys, its "take the
  ball off" and "take the known mark off" steps, and Mines' "the flag must come
  off" leg. Black Box's layout search keeps the player's marks, so it only adds
  balls. Mines' hint still takes no unproved flag as a premise.
- **`upstream-descs.test.ts` loaded ten games' descs under params their
  fixtures do not state.** It laid fixture fields over the default params by
  name, so Boats' `fleetdata`, Keen's `mult` and Tracks' `single_ones` went
  nowhere, and nine games' tiers, numbered in the fixtures where the params name
  them, landed as a number in a string field. A parse alone cannot notice;
  asking the solver did, by refusing every Boats desc as contradictory. The test
  now places a numbered tier through `withTier`, translates the three renamed
  fields, and fails on a field it cannot place.
- The mistake invariant makes the first move a board needs before it can be
  solved, which it reads from Solve's `NOT_STARTED`.
- Help pages, `docs/games/hints.md` and `docs/games/solver-and-generator.md`
  follow.

## Hints to pull in

None: both games have hints, and this change is what lets their hints meet the
collection's ordinary contract.

## Not in scope

Counting a check as help, as Solve and a hint mark a board. The owner is open
to it if it is consistent across games (2026-10-02); it is filed as
`count-a-check-as-help`.
