# Tasks

**Where this stands (2026-10-12): the order is done, held by the gate and
pushed. The owner answered the question of the cut: option C, amended
(`design.md` § "The owner's answer: C, amended"). Task 3 is that cut, and it
is the next session's, starting at 3.1.**

## 1. Decide, on a sample

- [x] 1.1 Read `state-what-a-games-spec-never-did` in the archive: its
      `brief.md`, `design.md`, `found.md` and three `census/` files. Its six
      kinds of row are the starting list of what a spec owes.
- [x] 1.2 Take six specs of different kinds (a Latin game, a cell-state
      game, an edge game, a search game, the largest and the smallest) and
      sort every requirement into: states what the code cannot; restates a
      declaration; states a rule of the collection. Count each. For
      "restates a declaration", name the declaration and say whether a check
      could read the spec against it or whether the requirement should go.
      Keen, Clusters, Palisade, Inertia, Loopy, Flood: `design.md` § "The
      sample".
- [x] 1.3 Write `design.md` with the count, the rule for what goes, the
      order of subjects and the form of a title, and how the order is held
      without a pattern over prose (a closed list of subject words leading
      the title is one candidate; say what would make it fail silently).
      **Put the cut to the owner with the sample's before and after**, as
      bytes and as two specs they can read: `sample/clusters.after.md` and
      `sample/palisade.after.md`, each with a ledger.

## 2. Reorder

- [x] 2.1 Reorder all 57, one reader per batch of games, classifying each
      requirement by subject. Verify by the shape of the diff: the multiset
      of requirement bodies is unchanged, by a script. Commit 13a4d7e4.
- [x] 2.2 Repoint citations of a retitled requirement
      (`node scripts/checks/spec-citations.mjs`). None cites a game's
      requirement, so there was nothing to repoint.

## 3. Shrink, once the owner has accepted the rule

- [x] 3.0 **The owner answers A, B or C** (`design.md` § "The question for
      the owner"). Answered 2026-10-12: C, amended (`design.md` § "The
      owner's answer: C, amended", which every task below follows).
- [ ] 3.1 Write the brief for a batch's writer and the one for its reviewer
      from that section, the guide, and the two ledgers in `sample/` (what
      the first draft did badly is the list of traps). Batch the 57 by kind,
      so a batch leans on the same engine capabilities.
- [ ] 3.2 The engine amendments of rule 1, as deltas, before any batch that
      leans on them: the three homeless sentences, `border-grid` (what each
      button does, the sweep drag, how under-size is measured and reddened,
      the keep-track verdict on a wrong-button click). Each read against the
      engine code and reviewed. Add to this list as the batches report a
      sentence several games state of themselves.
- [ ] 3.3 Redo Clusters and Palisade under the three rules, as deltas, and
      read the two results whole as specs before starting the rest: they are
      the proof the rules give a spec a new game's author can copy.
- [ ] 3.4 The other 55, a writer then a reviewer a batch. Each game: its
      delta, and its ledger rows (requirement, what happens, where it is
      stated instead).
- [ ] 3.5 Where a removed requirement held the only statement of a promise
      to a player (a save or link format), the ledger names the test that
      holds the promise now, or the requirement stays.
- [ ] 3.6 `repo-layout` gains the rule as a requirement ("A game's spec does
      not restate what its game declares or what the collection states"),
      with the hollow-subject rule; `docs/new-game.md` § "What a game's spec
      holds" gains the hollow-subject rule and names one spec of each kind
      as the example to copy.
- [ ] 3.7 Measure: bytes, requirements and scenarios of the 57 before and
      after, by subject; `sample/` deleted; `spec-subjects.mjs`, the
      validator and `spec-form.mjs` green; `spec-subjects.mjs --fix` after
      the archive.

## 4. Hold it

- [x] 4.1 The gate check: what a spec owes, derived from each registered
      game, and the order. See it fail on a spec with a subject removed and
      on one out of order. `scripts/checks/spec-subjects.mjs`; the three
      planted failures are in `design.md`.
- [x] 4.2 `docs/new-game.md` § "What a game's spec holds" states the
      rule and the order.
- [ ] 4.3 Gate, commit, archive, push. Tasks 1, 2 and 4 are committed and
      pushed; the archive follows task 3.
