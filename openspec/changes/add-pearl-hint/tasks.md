# add-pearl-hint — tasks

Read `docs/games/hints.md` (§ "Give the facts a notation (Loopy)" first) and
`docs/games/solver-and-generator.md`, and keep them current.

## 1. Before narrating

- [ ] 1.1 `certify-the-tents-and-pearl-ladders` is done: runner or no-go, and a
      census of the reached rungs.
- [ ] 1.2 Census the premises one level finer than the rungs.
- [ ] 1.3 The shape-set question: for each premise resting on a square's
      surviving shapes, can the player read it off the edges as drawn? Measure;
      then a notation (owner-visible), or the `Unreasonable` fallback.
- [ ] 1.4 Read Loopy's hint and notation code and decide, per piece, share or
      keep separate. Record each no-go with its reason.

## 2. The hint

- [ ] 2.1 A recording projection, one pearl or edge per firing.
- [ ] 2.2 Narration to the Palisade bar in `hint-text.ts`, each sentence under
      120 characters.

## 3. Tests and close out

- [ ] 3.1 Enrollment by declaring `hint()`; bump the census counts it moves.
- [ ] 3.2 Tier-2.5 frame for a pearl deduction.
- [ ] 3.3 Help page: a Hints section.
- [ ] 3.4 Spec delta for `pearl`; guides updated; run the app.
