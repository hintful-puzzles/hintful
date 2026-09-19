# strike-before-forced-singles — tasks

- [ ] 1.1 Pin a Group 8x8 Tricky identity-hidden board that reaches `forcedSingle`,
      and find which solver elimination went unplaced.
- [ ] 1.2 Place it as a strike step.
- [ ] 1.3 Add a cross-game guard: no hint step in a Latin-family game is a
      `forcedSingle`, `forcedCross` or `forcedCircle`. Take the population from the
      games that call `singlePlacementReason` or its Salad twin, by reference
      (`npm run refs`), not by name. Prove the guard fails before the fix.
- [ ] 1.4 Delete the arms and their sentences if the guard shows them unreachable.
