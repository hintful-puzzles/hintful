# share-the-latin-candidate-plan — tasks

- [ ] 1.1 Re-measure the three idioms against the tree as it then stands; the
      counts in `proposal.md` are from 2026-09-19 and a new hint moves them.
      Take the population by reference (`npm run refs`), not by grep — a copy is
      never called by the name of the thing it copies.
- [ ] 1.2 The row/column preset. Per field, answer "can a plain Latin game
      legitimately want this different?" before folding it in, and leave the
      explicit form first-class for the ones that can.
- [ ] 1.3 Pass the firing's cell to `strikeWords`; delete every `marks[0]` dig.
      Prove the new shape fails: give a game a `strikeAxis` letting a firing span
      cells and watch the evidence follow the move rather than the first mark.
- [ ] 1.4 Derive `cleanObviousText`'s region phrase from `regionsOf`, the way
      Solo already does.
- [ ] 1.5 Verify by shape, not by a green suite: every changed line is one of
      the three intended kinds, and every render snapshot that moved is
      explained. Then the slow tier for the games touched.
