# add-ascent-hint — tasks

Read `docs/games/hints.md` (§ "Give the facts a notation (Loopy)" first) and
keep it current.

## 1. Before narrating

- [x] 1.1 Measure what a forgetful solver keeps: one that re-reads everything
      from the numbers, walls, arrows and drawn lines before every step, in
      layers (design D1).
- [x] 1.2 Decide the techniques from the measurement, and census them over the
      presets and the custom options (hidden ends, symmetric clues, no
      diagonals, larger boards): no notation; a dead end added (design D1).
- [x] 1.3 Classify each technique under `solver-and-generator.md`
      § "Check, Tactic, Search" (design D2).

## 2. The hint

- [x] 2.1 A projection of the solver's own rungs over a fresh reading of the
      board, one placement per step, through `singleFirings` and
      `deduceHintPlan`; the placing rungs stop at their first placement on the
      hint path only.
- [x] 2.2 Narration to the Palisade bar in `hint-text.ts`, each sentence at most
      120 characters, the numbers named by value.
- [x] 2.3 The picture: the target ringed, the numbers and squares it reasons from
      outlined, in square and hexagonal cells; the diff key carries it.
- [x] 2.4 `hintKeepTrack`.

## 3. Tests and close out

- [x] 3.1 Following the hint finishes every board it deals, each step true, over
      presets and custom options; every premise re-derived from the board
      singles out its square; every reason kind reached.
- [x] 3.2 A step never uses a technique above the board's tier.
- [x] 3.3 Tier-2.5 frames in a square, a hexagonal and an Edges mode.
- [x] 3.4 Each new guard proved to fail: the tier order, the arrow in a sentence,
      the spill stop, a dead end's cause, and the last-number reach (pinned).
- [x] 3.5 Refactor: the shared inset-polygon stroke, with Loopy moved onto it
      and its outline newly covered (design D4).
- [x] 3.6 Help page Hints section; spec delta; guides updated; run the app.
