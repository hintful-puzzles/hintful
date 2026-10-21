# Tasks — add-path-ts-port

## 0. Decide, and de-risk the crux first

- [x] 0.1 The owner asked for the change to be taken on (2026-10-21,
      design D0). Rules: every square filled (design D1).
- [x] 0.2 Solver spike: a deductive ladder proves uniqueness on every dealt
      board; SAT not needed (design D2).

## 1. The solver

- [x] 1.1 `solver.ts`: the Easy rungs (forced, pair) and the Normal
      lookahead, run to a fixpoint and one firing at a time.
- [x] 1.2 `count-answers.ts`, a brute-force counter sharing no code with the
      ladder; tests on hand-authored and dealt boards.

## 2. The generator

- [x] 2.1 `path.c`'s growing (join pieces end to end, no self-touching).
- [x] 2.2 Mend where the ladder stalls, strip what it does not need, keep
      only the exact tier; no straight path of four squares or more.
- [x] 2.3 No tree234: arrays and Sets.
- [x] 2.4 Params (size, tier), desc codec, `validateParams`.

## 3. The game

- [x] 3.1 State: a mark on every edge.
- [x] 3.2 Input: drag, click, right-button crosses and sweep, keyboard.
- [x] 3.3 `newUi`, the move model, undo through the midend.

## 4. Render and present

- [x] 4.1 Lines, numbers, crosses, errors, drag preview, cursor, win flash;
      frame tests.
- [x] 4.2 Solve, the mistake check, and the hint, with its look-ahead walk
      numbered on the board.

## 5. Tests and registration

- [x] 5.1 Own, generation and hint tests; the census; the chain pin.
- [x] 5.2 Registered in `src/games/index.ts` and the catalog, with icons and
      its help page and row.
- [x] 5.3 `npm run game -- path` green; played in the app with pointer,
      keyboard and touch; a fresh subagent read the hint against the board,
      and its findings are fixed (design D5).

## 6. Close-out

- [x] 6.1 Findings recorded in `design.md`; guides updated with what the
      build taught.
- [ ] 6.2 Commit and push; bring to the owner for acceptance, then archive.
