## 1. Decide

- [ ] 1.1 Which field gives way when a modifier and a tier exclude each
      other, and whether that is one answer for every modifier.
- [ ] 1.2 Whether Group's refusal needs to hold a written board, read at the
      commit that wrote it.

## 2. Build

- [ ] 2.1 `modifierItem` declares what it leaves, and a checkbox can be a
      deciding field of `ConfigDescription.narrowing`.
- [ ] 2.2 Group and Bridges declare theirs, and their two `validateParams`
      branches go.
- [ ] 2.3 `ruleset-only.test.ts` holds them: its population is already every
      game whose dialog narrows a field.
