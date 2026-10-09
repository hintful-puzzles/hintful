# refuse-a-board-an-untiered-solver-cannot-finish

**Status: filed 2026-10-09 by the session that archived `regroup-the-specs`,
whose settling of the doubtful requirements found it. What it says of the
code was true that day; re-check before relying on it.**

## Why

A game ID nobody's generator wrote can open a board the game's own solver
cannot finish, and the app then crashes or lies about it.

- **Seen in Chrome:** opening Palisade with the game ID `5x5n5:a` (a link
  `…/palisade?id=5x5n5:a`, or the Enter game ID dialog) loads the board, and
  pressing Hint raises the "Something went wrong" dialog with "palisade: the
  hint ran out of deduction at move 0, but the game has no tier that allows
  trial and error". `4x4n4:2` does the same after two hinted moves.
- **Read in the code and not run:** Signpost, Crossing and Sticks load such a
  board too. Check & Save finds nothing wrong on it; Solve refuses, and in
  Sticks fills in a partial deduction as if it had succeeded; Sticks' hint
  ends in the same refusal Palisade's does. Crossing loads even a board whose
  clues contradict.
- **The cause** is one line: `solverVerdict` in `src/engine/desc-error.ts`
  reads a game with no difficulty contract and no `finishesByDeduction` as
  able to finish every board (`game.finishesByDeduction?.(state) ?? true`).
  Net, Mines, Range and Rectangles declare the hook. The untiered games that
  do not are the population this change is about, and it is to be derived
  and not taken from the four named here.
- **What the spec says:** `engine-params`, "A board loads only if the game's
  own solver solves it" and "An untiered game's board loads unless
  finishesByDeduction refuses it"; `engine-hints`, "Deduction runs out only
  where the tier permits search", which says a game with no difficulty
  contract cannot emit that refusal, and several can.

It is reached only through a hand-written game ID or a save holding one. What
it costs a player who gets there is a crash dialog on Hint, or a Solve that
leaves a wrong board.

The detail is in the archived change `2026-10-09-regroup-the-specs`:
`found.md`, and the notes of `verdicts/palisade.md`, `signpost.md`,
`crossing.md`, `sticks.md`, `range.md`, `filling.md` and `singles.md`.

## What Changes

- An untiered game whose hint or solver deduces refuses, at load, a board its
  deductions do not finish, in the collection's words for it.
- No such game can be registered without saying whether its deductions
  finish a board: the absence of the answer stops meaning yes.
- The hint of such a game cannot reach the throw in
  `Midend.computeHintPlan` on a board that loaded.
- A cross-game guard holds it, with its population derived from what each
  game is.

## Capabilities

### Modified Capabilities

- `engine-params`: the load verdict for an untiered game.
- `engine-hints`: only if the rule about which games can emit the
  deduction-exhausted refusal has to be restated.
- A game's own capability, where its spec says what loads.

## Impact

- `src/engine/desc-error.ts`, `src/engine/game.ts`, the untiered games that
  gain the hook, their tests, and one cross-game guard.
- **A compatibility question to settle before the code:** a save or a shared
  link holding a board this change would refuse stops opening. No generator
  writes one, so by `AGENTS.md` ("A change that would refuse a desc
  upstream's generator writes is a compatibility break") this is not a
  break, but the claim rests on each game's generator dealing only boards
  its own deductions finish, and `design.md` says how to check that first.
