# bridges-hint-cites-an-unwritable-cap — tasks

## 1. Before designing

- [ ] 1.1 Re-run the census against the current tree (it is dated 2026-09-21):
      for each shown step, rebuild the board as the player sees it (maxima
      reset to `maxb`, `mapUpdatePossibles`) and re-check the premise.
      Extend it past `exactSpace` and `everyNeighbor` to every stage-3 premise.
- [ ] 1.2 Open a pinned desc in the app and confirm the sentence and the
      picture disagree with what the player sees.
- [ ] 1.3 Put the three shapes in proposal.md § "The decision" to the owner,
      with what each costs.

## 2. Implement

- [ ] 2.1 Commit the census as a test pinned on the descs, and prove it fails
      on the current hint.
- [ ] 2.2 Implement the chosen shape; update `help/games/bridges.md` if the
      player gains a notation.
- [ ] 2.3 Spec delta on `bridges` § "Bridges explains the next deduction".
