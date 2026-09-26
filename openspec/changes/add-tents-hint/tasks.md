# add-tents-hint — tasks

Read `docs/games/hints.md` (§ "Give the facts a notation (Loopy)" first) and
`docs/games/solver-and-generator.md`, and keep them current.

## 1. Before narrating

- [x] 1.1 `certify-the-tents-and-pearl-ladders` is done: every rung is reached
      (its design.md § "What the plants showed").
- [x] 1.2 Census the premises one level finer than the rungs
      (§ "Census the reasons, not only the rungs"): every reason kind and every
      line case is reached (`tents-hint.test.ts`); the general line case is
      unreachable by argument (design D4).
- [x] 1.3 The link question: measured (design D1), the owner chose a link
      notation. A link-only firing is a step that draws the link, taken only
      when a stalled rung fires once it is drawn.
- [x] 1.4 Classify `line-count` and `line-neighbors`: both direct (design D4).
- [x] 1.5 `tree-diagonal-pair` stays before the line counts (design D4).

## 2. The notation

- [x] 2.1 `links` in the state, the set-not-toggle `link` move, placing a tent
      when a tree is joined to a blank square.
- [x] 2.2 The link drag and `L` then an arrow; the drag previews the tent.
- [x] 2.3 A thin ink line across the grid line; the mistake color for a wrong one.
- [x] 2.4 `findMistakes` vouches for links against every pairing of the solution.

## 3. The hint

- [x] 3.1 A recording projection over the certified ladder (`singleFirings`),
      one premise per firing, links read afresh before each.
- [x] 3.2 Narration to the Palisade bar; the no-spare-room count as one journey
      of a tent leg and a grass leg, its line hatched and its count in the
      action color.
- [x] 3.3 `hint-text.ts` holds every sentence; each at most 120 characters.
- [x] 3.4 A tree's single open square placed joined, by the link gesture's move.

## 4. Tests and close out

- [x] 4.1 Enrollment by declaring `hint()`; `hint-mark.test.ts`'s renderer
      count moved to 39.
- [x] 4.2 Tier-2.5 frames for `line-count`, `line-neighbors`, a link step and a
      player's link, right and wrong.
- [x] 4.3 Each new guard proved to fail: the per-firing link reading, the
      link-only-when-needed rule, and `findMistakes`' link half.
- [x] 4.4 `engine/hint-track.ts`, with Pearl and Pattern moved onto it (design D6).
- [x] 4.5 Help page: the link notation and a Hints section.
- [x] 4.6 Spec delta for `tents`; guides updated; run the app.
