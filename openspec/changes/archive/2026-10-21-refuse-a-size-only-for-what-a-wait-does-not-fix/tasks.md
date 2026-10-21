# Tasks

## 1. The owner's answers

- [x] 1.1 The owner chose (a), 2026-10-20, and to bring every game's wait
      refusal into this change.
- [x] 1.2 The owner chose, 2026-10-21, to drop every refusal drawn on time,
      with an estimate of the wait for the player (proposal § "The second
      answer").

## 2. The engine

- [x] 2.1 `DEAL_DEADLINE_MS` lives in `retry-limit.ts`, for the page too.
- [x] 2.2 `DealAhead` ends a deal at `PAGE_DEADLINE_MS` as one that found
      no board; tested, and seen to fail without it.
- [x] 2.3 The pending-deal words show the wait so far, and the last
      board's time or the deadline (`Puzzle.dealWait`); tested.
- [x] 2.4 `tooRareToDeal` is removed once no game calls it.
- [x] 2.5 Spec deltas: `engine-difficulty`, `engine-params`, `dealing`.
- [x] 2.6 `docs/solver-and-generator.md` and `docs/engine-catalog.md` state
      the rule.
- [x] 2.7 `npm run deal-walk` deals a named cell under the deadline.
- [x] 2.8 A sweep that writes a value onto a preset passes over a size whose
      boards are too rare to deal promptly (`dealsPromptly`), since an
      accepted size no longer promises a quick board; `docs/testing.md`
      § "How a cross-game guard finds its population" says so.

## 3. The games

Each: remove every refusal drawn from deal times or acceptance rates; keep
a `noSuchTier` resting on a count or a proof, and a structural limit;
update help strings, tests and the game's spec.

- [x] 3.1 Keen, Light Up, Spokes, Net, Signpost, Sticks.
- [x] 3.2 Sokoban keeps its line, a level the hint cannot open, and says so.
- [x] 3.3 Crossing, Filling, Mosaic, Seismic.
- [x] 3.4 ABCD, Map, Salad, Group.
- [x] 3.5 Blackbox, Rect, Separate, Bridges, Star Battle.

## 4. Close

- [x] 4.1 Run the app: a slow Custom size shows the wait and Stop; a size
      no longer refused deals; the deadline's sentence appears.
- [x] 4.2 Gate, commit, archive, push.
