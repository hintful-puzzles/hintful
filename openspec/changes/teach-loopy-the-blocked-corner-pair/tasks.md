# teach-loopy-the-blocked-corner-pair — tasks

Read `proposal.md`, then `findings.md` for what §1 measured, then
`docs/games/solver-and-generator.md` § "Divergence and what it costs" and
`docs/games/hints.md` § "A firing is not always a technique, so check the boundary
too" — the rule this change added.

> **§1 was a stopping condition, stated before the instrument.** It did not stop:
> 0 of 57 boards changed tier, so §2 happened and §4 did not.

## 1. Measure the re-grading first

- [x] 1.1 Frequency over a corpus of square boards at every tier: 24 of 57 boards,
      32 firings, 0.6 per board — and on four non-square tilings too, which is what
      earns 2.3. Clear of the "twice a corpus" floor the proposal set in advance.
- [x] 1.2 Graded every board with the current solver and with the pattern added:
      **0 change tier**. The frozen differential says it harder and on a corpus this
      change did not choose — every desc byte-identical across all 18 grid types,
      and every board still needing the tier it was recorded at.
- [x] 1.3 Known positive: a clue planted by hand with a line outside each of two
      adjacent dots. Fires exactly once and settles the face. Kept as a permanent
      test rather than left in the deleted instrument.
- [x] 1.4 **Decision: proceed with the rung** (`findings.md`).

## 2. The rung

- [x] 2.1 `findBlockedCornerPair` recognizes it and fires once, settling the whole
      face: the edge between the two blocked dots ruled out, every other open edge
      a line.
- [x] 2.2 Tier: **Easy**, inside `trivialDeductions` beside the one-dot deduction it
      strengthens — which is what it replaces. The proposal traced the owner's board
      through `dlineDeductions`, but that board was Easy, where `dlines` is `null`
      and the rung never runs; the three firings were rung 0's (`findings.md`).
- [x] 2.3 Generalized past the square. It needed no new arithmetic: the existing
      guard `f.order - clue === currentNo + 1` already *is* `clue = order − 1` over
      the edges still open. Seen firing on a triangle clued 2.

## 3. The narration

- [x] 3.1 `say.clueBlockedPair`. The wording settled before implementation (239
      characters, "the long way around") was reworked after the owner saw it on a 2
      whose fourth edge was already out, where the loop goes round nothing. It now
      uses the owner's shorter shape with the dots' existing lines restored as the
      premise: 115 characters, under the limit and off the `LONG_NARRATIONS`
      ledger (`findings.md` § "The wording, reworked after the owner saw it").
- [x] 3.2 The clue is the only part that varies, and the face ends with exactly the
      clue's number of lines whether or not an edge was already out. Guarded by
      `say.clueBlockedPair(2) === say.clueBlockedPair(3).replaceAll(…)`.
- [x] 3.3 Both dots ringed, the clue outlined, every edge the step settles banded —
      asserted on where the pixels land, not on the marks the step carries. The
      deictic guard gained the plural case, and its `kinds` census the entry, so a
      recognizer that stopped firing would be caught.

## 4. The fallback, if 1.4 said stop

- [x] 4.1 Not taken. §1.4 chose the rung; the reason the recognizer is the worse
      trade — two descriptions of one technique, which drift — is recorded in
      `docs/games/hints.md` rather than lost with the branch.

## 5. Docs

- [x] 5.1 `help/games/loopy.md` — the technique, by name, in the "Most steps are the
      rules at work" list.
- [x] 5.2 `docs/games/hints.md` § "A firing is not always a technique, so check the
      boundary too" — the general lesson, beside § "A rung is not a premise", whose
      inverse it is.
- [x] 5.3 `loopy` spec delta: the deduction, its generality, and the requirement
      that it regrade nothing.

## 6. Report and accept

- [x] 6.1 Ran the app on 7×7 Easy `7x7t0de:a32a32a22a2c302122b2b21a3e3323b3b22d`,
      firing 46 of 88. The frame composites correctly: both dots ringed, the clue
      outlined, the edge between them banded broken and the two it draws banded
      solid. `findings.md` § "What the app showed".
- [ ] 6.2 Owner acceptance of the reworked sentence and its marks on a rendered
      frame.
