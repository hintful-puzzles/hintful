# Tasks — add-numgame-ts-port

## 0. Decide whether to build it

- [x] 0.1 Confirm with the owner that the game belongs: yes, with Countdown
      rules (2026-10-15, design D1).
- [x] 0.2 Fix the rules: Countdown's numbers round (design D2).
- [x] 0.3 Fix the difficulty model: the fewest operations the target needs
      (design D4).

## 1. The solver

- [x] 1.1 `solver.ts`: the values each subset of the numbers makes, with one
      derivation each, and the fewest operations to a target (design D3).
- [x] 1.2 The oracle: an independent multiset search in the tests agrees on
      every reachable value and its fewest operations; every derivation
      replays through `executeMove` to its value.

## 2. The game

- [x] 2.1 Params (large numbers, tier), codec, presets, Custom dialog.
- [x] 2.2 Desc codec and state; `executeMove`; `status`.
- [x] 2.3 Generator: a target needing exactly the tier's operations.
- [x] 2.4 `difficulty`, `solve`, `hasNoSolution`, `notApplicable`.
- [x] 2.5 Input: taps, keyboard, the selection on the `Ui`.

## 3. Render and hint

- [x] 3.1 The board (design D5), its tile cache, the win flash, the
      animation; a tier-2.5 render test.
- [x] 3.2 The hint (design D7): plan, sentences, marks, gesture, pins.

## 4. Registration and close-out

- [x] 4.1 Register in `src/games/index.ts` and the catalog; the hand-kept
      records the scaffold lists.
- [x] 4.2 Help page; the spec delta rewritten for what was built.
- [x] 4.3 Icons, captured from the running game.
- [ ] 4.4 `npm run game -- numgame` green; play it in the app with pointer,
      keyboard and touch; a fresh subagent reads the hint against the board.
- [ ] 4.5 Findings recorded in `design.md`; commit, push; bring to the owner
      for acceptance, then archive.
