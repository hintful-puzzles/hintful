## 1. Census

- [ ] 1.1 Re-run the counts (`dealtOf`, `clueList(at, v`, `<game>Ladder`,
      `spaceOf`, `new WeakMap<`) and sort the adapters by shape. Record each
      with its query.

## 2. Helpers

- [ ] 2.1 The clue-list helper; migrate the games of that shape.
- [ ] 2.2 The default ladder; remove the one-line wrappers.
- [ ] 2.3 Memoize givens and space in the runtime; remove the games' caches.
      Measure a hint walk's time against HEAD, back to back.
- [ ] 2.4 Hints and boards byte-identical: hint-walk fingerprints and deal
      snapshots unmoved.

## 3. The declared form

- [ ] 3.1 Decide, on what is left after 2, whether a description declares
      its givens. Record the decision and the reason here; if yes, pilot on
      a game with a margin of clues, then migrate.

## 4. Finish

- [ ] 4.1 Skeletons and `docs/descriptions.md` show only the one way. Run
      `npm run test:hint-sweeps`; commit, push, archive.
