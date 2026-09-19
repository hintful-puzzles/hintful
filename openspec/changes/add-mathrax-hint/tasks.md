# add-mathrax-hint — tasks

Gated on `candidate-plan-kit`, which it exists to test.

- [x] 1.1 Read Mathrax's solver and its three `usersolvers`; confirm the recorder
      reaches them. It did not — `applyOptions` wrote straight into the cube and
      `mathraxSolve` took no recorder. Threading one raised the real question,
      `design.md` D1: the body intersects up to four clues per cell, so a firing
      had to be split per clue before anything could narrate it.
- [x] 1.2 `hint-text.ts` for the clue rungs, to the Palisade bar
      (`docs/games/hints.md`). Three sentences, not the four the reason shapes
      suggested: the partner's state is read off the working board (D2).
- [x] 1.3 The plan through `runCandidatePlan`. Findings on the kit: `design.md`
      § 4, scaffolded as `share-the-latin-candidate-plan`.
- [x] 1.4 Render scenarios and the cross-game guards; ran the app. Running it
      caught a mark leak no tier reaches (`design.md` § 3).
