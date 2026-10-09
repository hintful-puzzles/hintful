# Tasks

The lists are in
`openspec/changes/archive/2026-10-09-turn-the-specs-into-a-reference/rewrite-report.md`.
Nothing in them was reproduced when they were written.

## 1. Sort

- [x] 1.1 Every entry of § "Where the code looks wrong and the spec right" and
      of § "Left unresolved by a reviewer" has a row in `triage.md` in this
      directory: the capability, the finding in a line, and its kind (a
      duplicate of which row, a stale comment, a weak guard, the spec is
      wrong, a suspected defect, nothing). Check: the row count equals the
      two sections' entry counts, taken by the query in `proposal.md`.
- [x] 1.2 The suspected defects are ordered by who meets them: a player, then
      a session relying on the gate, then nobody yet. (`triage.md` § "What a
      player would have met"; each row's kind names who.)

## 2. The suspected defects a player could meet

Each is reproduced in the running app before it is touched
(`AGENTS.md`: "Bring a question with everything you could find out").

- [x] 2.1 Galaxies: a canceled press on an arrowed tile, and a bare right
      click on a dot on an edge or a vertex.
- [x] 2.2 Guess: a right-click or a long press on an answer slot; Submit in
      notes mode with every peg held.
- [x] 2.3 App shell: Share offered in two places; the name button and the
      Menu both opening the quick-switch; the "first four" on the Bar for a
      game with no hint. For each, whether the code or the requirement is
      what should change.
- [x] 2.4 Netslide: `solve` refusing on a board with no aux.
- [x] 2.5 Every other row 1.2 put in this group.
- [x] 2.6 `help/games/ascent.md` § Hints no longer says that every step
      places one number. Check: the page read in the app.

## 3. What holds the tree

- [x] 3.1 The documentation-only shortcut and `README.md`, `LICENSE.md`,
      `CREDITS.md`: the shortcut's list and the guard over it agree, and a
      file a test or the build reads is not skipped. Check: the guard seen to
      fail with one of them back on the list.
- [x] 3.2 `scripts/metrics.sh` and knip; `scripts/deal-walk.ts` and a
      TypeScript project.
- [x] 3.3 The guards the lists call weaker than their rule, each seen to fail
      on a planted defect once strengthened.
- [x] 3.4 `metrics/2026-08-05/`.

## 4. The rest

- [x] 4.1 The stale comments are corrected.
- [x] 4.2 Where the spec is what is wrong, a delta corrects it.
- [x] 4.3 Every investigated finding leaves its requirement agreeing with the
      code, so that reading the two side by side does not raise it again:
      the requirement corrected, or the code fixed to it, or the deliberate
      difference written into the requirement as the rule (`proposal.md`,
      "Every finding ends with its requirement saying what was found").
      Check: a fresh agent given the requirement and the code for a sample of
      twenty investigated rows, and asked only whether they disagree, raises
      none of them. (The first twenty raised six, so every requirement in
      the deltas was read, and what that found was fixed: `triage.md` § "What
      the closing check found that neither list held". The corrections made
      after it were not read again by a fresh agent.)
- [x] 4.4 `triage.md` says of every row what was done and which requirement
      now carries it, or why nothing was needed.

## 5. Close

- [ ] 5.1 Committed, pushed and archived; anything put to the owner is asked
      with the change archived, unless it blocks.
