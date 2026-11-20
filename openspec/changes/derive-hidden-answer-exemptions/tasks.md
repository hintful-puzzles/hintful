## 1. The kind, as a fact the engine reads

- [ ] 1.1 For each of the four ledgers, read its guard and say whether the
      exemption follows from the answer being hidden (`freedom: query`), from
      the working row, or from something only the game knows.
- [ ] 1.2 Write the derived test in each guard; keep a ledger entry only for
      a reason that is the game's own.
- [ ] 1.3 The same for each wider entry in the proposal (hidden answer
      elsewhere, `OWN_SOLVER`, `NARRATES_MOVES`, the beveled tiles,
      `color-dark-check`'s `SETS`, `LATIN`, `MOVED`). Settle each judgment
      call (`MOVED`, `LATIN`, the bevels) by reading the guard, and keep a
      ledger entry only where the reason is the game's own.

## 2. The guards still see

- [ ] 2.1 Plant, in a hidden-answer game, the defect each guard exists for and
      see the guard fail despite the exemption; un-plant.
- [ ] 2.2 Stamp `scripts/new-game.sh <id> code` and confirm its first verdict
      no longer names the four ledgers; delete the stamp.
- [ ] 2.3 Update `docs/testing.md` where it lists the ledgers.
