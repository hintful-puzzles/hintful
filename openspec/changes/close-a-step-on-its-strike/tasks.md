## 1. The engine

- [ ] Re-derive the games that build a strike's closing (proposal's query).
- [ ] A step given `struck` closes on it in the engine's strike words, with
  where the notes are and "too" on a later leg; tests in
  `engine/stated.test.ts`, seen to fail first.

## 2. The games

- [ ] Crossing: its `noteStrike` closing goes. Dump before and after.
- [ ] Undead: `speak.ts`'s closings go, and `speak.ts` with them if nothing
  else is left in it. Dump before and after.
- [ ] Subsets: its rule-out move against the new closing; moved, or kept
  with its reason written beside it.

## 3. The exception

- [ ] Remove the exception from `docs/hints.md` § "The sentences live in
  the description" and, with a delta, from the engine-hints requirement
  "A game's hint sentences SHALL be stated in its description".
