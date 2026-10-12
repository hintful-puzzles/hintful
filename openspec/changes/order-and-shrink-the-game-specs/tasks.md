# Tasks

**Where this stands (2026-10-12): the order is done, held by the gate and
pushed. Task 3, the cut, waits for the owner's answer to `design.md` § "The
question for the owner". The change is not archived until that is answered.**

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

- [ ] 3.0 **The owner answers A, B or C** (`design.md` § "The question for
      the owner"). On A: strike 3.1 and 3.2, delete `sample/`, archive.
- [ ] 3.1 Remove or rewrite the requirements the rule names, by delta. The
      three sentences with no other home become engine requirements first
      (`design.md` § "The sample", last bullet).
- [ ] 3.2 Where a removed requirement held the only test of a promise to a
      player (a save or link format), say what holds the promise now.

## 4. Hold it

- [x] 4.1 The gate check: what a spec owes, derived from each registered
      game, and the order. See it fail on a spec with a subject removed and
      on one out of order. `scripts/checks/spec-subjects.mjs`; the three
      planted failures are in `design.md`.
- [x] 4.2 `docs/new-game.md` § "What a game's spec holds" states the
      rule and the order.
- [ ] 4.3 Gate, commit, archive, push. Committed and pushed; the archive
      waits for 3.0.
