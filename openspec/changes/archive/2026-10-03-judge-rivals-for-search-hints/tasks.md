## 0. On the trigger

- [x] 0.1 With the second search game's hint designed, compare its rival
      judging with Pegs' line by line, and write down what really is shared
      before extracting anything (`design.md` D0). Sokoban, by the owner's
      choice (2026-10-03).

## 1. Extract

- [x] 1.1 The helper: verdicts for every rival within one counted allowance,
      deterministic for a given position (`engine/rival-judging.ts`), and the
      relation that says "so" made only there.
- [x] 1.2 Pegs moved onto it with its sentences unchanged (its pinned tests in
      `pegs-hint.test.ts` are the net). Black Box, Guess and Inertia, which
      wrote the relation by hand, judge their rivals through it too.
- [x] 1.3 The second game's hint written on it: Sokoban's solver, hint, Solve,
      marks and help (`design.md` D1–D5).

## 2. Docs

- [x] 2.1 docs/games/hints.md § "Find with one search, prove with another
      (Pegs)": point at the helper, and record what each game kept; §
      "Judge the rivals of a searched move" for what Sokoban added.
- [x] 2.2 docs/games/engine-catalog.md: the new module, and `drawMoveArrow`.
- [x] 2.3 Sokoban leaves `hintless-games-in-reserve`.
