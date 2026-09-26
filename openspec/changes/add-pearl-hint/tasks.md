# add-pearl-hint — tasks

Read `docs/games/hints.md` (§ "Give the facts a notation (Loopy)" first) and
`docs/games/solver-and-generator.md`, and keep them current.

## 1. Before narrating

- [x] 1.1 `certify-the-tents-and-pearl-ladders` is done: Pearl is on the
      runner, and every rung is reached.
- [ ] 1.2 Census the premises one level finer than the rungs: the four
      `pearl-clues` rules and the two halves of `shortcut-loop`.
- [ ] 1.3 The shape-set question, for the shape strikes by `pearl-clues` and
      `shortcut-loop`: can each be restated as an edge fact the player can mark
      in the same journey? Measure; then a notation (owner-visible), or the
      `Unreasonable` fallback.
- [ ] 1.4 Read Loopy's hint and notation code and decide, per piece, share or
      keep separate. Record each no-go with its reason.

## 2. The hint

- [ ] 2.1 A recording projection (`singleFirings`), one pearl or square per
      firing, pairing a `shapes-from-edges` firing with the edges it lets
      `edges-from-shapes` nail.
- [ ] 2.2 Narration to the Palisade bar in `hint-text.ts`, each sentence under
      120 characters.

## 3. Tests and close out

- [ ] 3.1 Enrollment by declaring `hint()`; bump the census counts it moves.
- [ ] 3.2 Tier-2.5 frame for a pearl deduction.
- [ ] 3.3 Help page: a Hints section.
- [ ] 3.4 Spec delta for `pearl`; guides updated; run the app.
