# share-the-latin-candidate-plan — tasks

`design.md` holds the per-field verdicts, the sequencing and the two conditions
under which this change should be killed rather than finished. Read § 5 first.

## 1. Re-measure before designing against the counts

- [ ] 1.1 Take each population **by reference, not by grep** — `npm run refs --
      src/engine/latin-hint.ts rowColRegions`, then `singleReasonOf`, then
      `hiddenSingleLine`. Read the call sites and classify them; expect more
      references than the proposal's grep counts, because the mark-all arm calls
      `rowColRegions` too and that is not a plan field (`design.md` § 3).
- [ ] 1.2 Check the kill conditions in `design.md` § 5 against what 1.1 found,
      and stop here if either holds, recording the no-go with its reason.

## 2. The walk passes the firing's cell (design D3)

- [ ] 2.1 Add the acted-on cell to `StepWords`/`strikeWords` in
      `candidate-plan.ts`, taking it from the `cellsOf(marks)` the walk already
      computes for `targets`.
- [ ] 2.2 Delete every `marks[0]` dig in the candidate games. **Check Solo
      first**: its `intersect` firings span several cells, so it may already be
      shading by its first mark where it means the region — if so, that is a bug
      this change fixes, and its moved snapshot is evidence, not drift.
- [ ] 2.3 Prove the new shape fails: give a game a `strikeAxis` that lets a
      firing span cells and watch the evidence follow the move rather than the
      first mark. Restore.
- [ ] 2.4 Verify by shape: every changed line either deletes a `marks[0]` dig or
      threads the new parameter. Read the exceptions.

## 3. Derive the obvious-clean region phrase (design D4)

- [ ] 3.1 Move `noRepeatRegionNames`' derivation beside `rowColRegions` and have
      the plan call it where the regions can name themselves; keep the placed
      verb and the noun as parameters, which are genuine per-game words.
- [ ] 3.2 Confirm the three games that typed "row or column" now produce the
      identical string — this one really should be byte-identical.

## 4. The row/column preset (design D1, D2)

- [ ] 4.1 `runLatinCandidatePlan` supplying `regionsOf`, `singleReason` and the
      hidden-single placement area, over `runCandidatePlan` rather than beside
      it. No `latin: true` flag — a function a game calls, not a statement about
      the game for a mechanism to read (D2).
- [ ] 4.2 Convert the row/column games; leave Solo and Salad on the general
      entry, and leave the explicit form first-class for anyone who wants it.
- [ ] 4.3 Prove the preset fails: have it supply the wrong region set and watch
      the hidden-single narration go wrong.

## 5. Close out

- [ ] 5.1 Per game, say whether its plan is byte-identical and explain every
      snapshot that moved (`design.md` D5 — "the refactor drifted" and "a real
      bug is fixed" are different sentences; write which).
- [ ] 5.2 `npm run test:slow -- <each game touched>`, targeted, not the bare
      command.
- [ ] 5.3 Update `docs/games/hints.md` § "The shared candidate-hint machinery" —
      it currently lists `regionsOf` and `singleReason` among what a game
      "genuinely decides", which this change makes false for the row/column
      family. Repoint, don't leave a stale sentence beside a true one.
