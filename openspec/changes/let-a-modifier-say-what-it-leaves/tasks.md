## 1. Decide

- [ ] 1.1 Confirm in the app that the tier gives way to the modifier, as it
      does to a ruleset, and that it is one answer for both games.
- [ ] 1.2 Whether Group's refusal needs to hold a written board, read at the
      commit that wrote it.

## 2. Build

- [ ] 2.1 `modifierItem` declares what it leaves, and a checkbox can be a
      deciding field of `ConfigDescription.narrowing`.
- [ ] 2.2 Group and Bridges declare theirs, and their two `validateParams`
      branches go.
- [ ] 2.3 `ruleset-only.test.ts` holds them: its population is already every
      game whose dialog narrows a field.
