# add-tents-hint — tasks

Read `docs/games/hints.md` (§ "Give the facts a notation (Loopy)" first) and
`docs/games/solver-and-generator.md`, and keep them current.

## 1. Before narrating

- [x] 1.1 `certify-the-tents-and-pearl-ladders` is done: every rung is reached
      (its design.md § "What the plants showed").
- [ ] 1.2 Census the premises one level finer than the rungs
      (§ "Census the reasons, not only the rungs").
- [ ] 1.3 The link question: for each premise that reads "unmatched" or
      "unattached", can the player see it on the board as drawn? Measure over a
      corpus; if not, propose a link notation (owner-visible) or the
      `Unreasonable` fallback. Decide what a `tent-link` firing is to the plan,
      since on its own it changes nothing visible.
- [ ] 1.4 Classify `line-count` and `line-neighbors` as Check, Tactic or
      Search.
- [ ] 1.5 Decide where `tree-diagonal-pair` sits relative to `line-count`, for
      the narration.

## 2. The hint

- [ ] 2.1 A recording projection over the certified ladder (`singleFirings`),
      one line or tree per firing.
- [ ] 2.2 Narration to the Palisade bar; each enumeration rung as one journey
      per line, its line hatched and its count in the action color.
- [ ] 2.3 `hint-text.ts` holds every sentence; each under 120 characters.

## 3. Tests and close out

- [ ] 3.1 Enrollment by declaring `hint()`; bump the census counts it moves.
- [ ] 3.2 Tier-2.5 frames for `line-count` and `line-neighbors`.
- [ ] 3.3 Help page: a Hints section.
- [ ] 3.4 Spec delta for `tents`; guides updated; run the app.
