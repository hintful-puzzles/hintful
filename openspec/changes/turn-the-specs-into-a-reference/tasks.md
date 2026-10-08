## 1. Measure, and get the owner's word

- [ ] 1.1 Put the spec census in the tree as a script under `scripts/checks/`:
      per capability, its lines, requirements, body and scenario lines, and the
      shapes `proposal.md` § "Why" counts. Verify it reproduces that table, or
      correct the table.
- [ ] 1.2 The owner's answers to `design.md` § "Decisions the owner is asked to
      confirm", recorded in `design.md`. Nothing in § 3 onward starts before
      them.

## 2. The pilot

- [ ] 2.1 Write the ledger checker (`design.md` § "Decision 6"): every old
      requirement title has a row, every destination exists. Verify by seeing
      it fail on a ledger with a row removed and on one naming a requirement
      that does not exist.
- [ ] 2.2 Rewrite `engine-difficulty` with its ledger. Verify: the checker
      passes, the `SHALL` count is accounted for, and `openspec validate
      --specs --strict` passes.
- [ ] 2.3 Rewrite Ascent's spec twice, in the two forms of the owner's second
      decision, each with a ledger. Verify as 2.2.
- [ ] 2.4 Two fresh-context reviews of each pilot spec: one with old, new and
      ledger, hunting a lost rule; one with the new spec alone, answering
      questions drawn from the old. Record what each found in `design.md`.
- [ ] 2.5 Set the bounds for a requirement and a capability from the pilot, and
      record the measured ratio in `design.md` in place of the estimate.
- [ ] 2.6 Show the owner the pilot: both capabilities before and after, opened
      in the preview. Their word on the form settles the game specs' shape.

## 3. What keeps it

- [ ] 3.1 The size check, in the gate's fast prefix, with the list of
      capabilities not yet rewritten. Verify by planting an over-long
      requirement and a date in a rewritten spec and seeing each fail.
- [ ] 3.2 `rules` for the `specs` artifact in `openspec/config.yaml`. Verify
      `openspec instructions specs --change <id> --json` returns them.
- [ ] 3.3 `change-citations.mjs` resolves a requirement cited by title. Verify
      by planting a citation of a title that does not exist.
- [ ] 3.4 `docs/work-management.md` § "Before archiving" says to re-read the
      merged requirement. Verify the gate's documentation checks pass.

## 4. The engine

- [ ] 4.1 `engine-hints` and `engine-candidate-hints`, each with a ledger and
      the two reviews. Verify as 2.2, and each leaves the exempt list.
- [ ] 4.2 `ts-engine`, with its misfiled requirements moved
      (`design.md` § "Decision 3"). Verify as 2.2.
- [ ] 4.3 `engine-input`, `engine-params`, `engine-colors`, `engine-notes`,
      `engine-drawing`, `engine-helpers`. Verify as 2.2.
- [ ] 4.4 Repoint every citation of a renamed engine requirement. Verify the
      citation check passes and `git grep` finds no old title.

## 5. The other capabilities

- [ ] 5.1 `repo-layout` and `build-pipeline`, divided by subject if their
      rewrite shows they should be. Verify as 2.2.
- [ ] 5.2 `app-shell`, `ts-migration` and the nine small ones. Verify as 2.2.

## 6. The games

- [ ] 6.1 The 57 game specs, in batches of about ten, in the form the owner
      chose. Each spec has a ledger and the first review; one spec a batch
      gets the second. Verify as 2.2 per batch.
- [ ] 6.2 The guide for porting a game says what a game's spec holds. Verify
      the section exists and the scaffolding script's spec skeleton matches.

## 7. Close

- [ ] 7.1 The exempt list is empty and removed. Verify the size check reads
      all 80 capabilities and passes.
- [ ] 7.2 `AGENTS.md`'s read-first table and each guide name the capability
      that binds the part of the tree. Verify the root brief is within its
      bound.
- [ ] 7.3 Run the census again and record before and after in `design.md`.
- [ ] 7.4 The owner's acceptance (`proposal.md` § "Acceptance").
