# add-pearl-hint — tasks

Read `docs/games/hints.md` (§ "Give the facts a notation (Loopy)" first) and
`docs/games/solver-and-generator.md`, and keep them current.

## 1. Before narrating

- [x] 1.1 `certify-the-tents-and-pearl-ladders` is done: Pearl is on the
      runner, and every rung is reached.
- [x] 1.2 Census the premises one level finer than the rungs: the four
      `pearl-clues` rules and the two halves of `shortcut-loop` (design D1;
      the reason-kind census in `pearl-hint.test.ts`).
- [x] 1.3 The shape-set question. Measured: the only shape strikes that never
      settle an edge are `shortcut-loop`'s several-states-left case, and a
      solver that forgets them agrees on all 11,568 verdicts. No notation, no
      `Unreasonable` tier (design D1).
- [x] 1.4 Loopy's hint and notation code read, per piece: nothing to share
      beyond what is already shared (design D6).

## 2. The hint

- [x] 2.1 A recording projection (`pearlRecordingPass`, `singleFirings`), one
      premise per firing, a shape strike settled at its own square in the same
      firing, every square re-read from its edges before each firing.
- [x] 2.2 Narration to the Palisade bar in `hint-text.ts`, each sentence under
      120 characters; crosses beside a full square are never asked for (D3).

## 3. Tests and close out

- [x] 3.1 Enrollment by declaring `hint()`; `hint-mark.test.ts`'s count bumped,
      the capability snapshot re-recorded, and Pearl's stale entry in the
      shortcut ledger removed (`H` no longer autosolves).
- [x] 3.2 Tier-2.5 frames: a line target and a cross target.
- [x] 3.3 Help page: a Hints section.
- [x] 3.4 Spec delta for `pearl`; `hints.md` updated; ran the app (Chromium):
      line and cross targets, outlines, and following the hint to a finished
      board.
