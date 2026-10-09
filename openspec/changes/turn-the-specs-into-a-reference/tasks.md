# Tasks

Written from `design.md` § "The order of work" when the change was taken up, on
the owner's word (2026-10-09). Each step's check is beside it.

## 1. Measure, and get the owner's word

- [ ] 1.1 The spec census is a script under `scripts/checks/`: per capability,
      its lines, requirements, body and scenario lines, and the shapes
      `proposal.md` § "Why" counts. Check: it reproduces that table, or the
      table is corrected.
      - Begun 2026-10-09: `scripts/checks/spec-parse.mjs` reads a `spec.md`
        into requirements, bodies and scenarios, and its totals agree with
        `wc -l` and a `grep -c` of the requirement headings (34,282 lines and
        931 requirements that day, 784 of them over 500 characters before the
        first scenario). The census that prints the table from it is not
        written, and the table in `proposal.md` is the day before's.
- [ ] 1.2 The use measurements are beside it: the archive's deltas by verb and
      month, and the requirements cited by title outside `openspec/`. Check: it
      reproduces `design.md` § "What the repository shows about use", or that
      section is corrected.
- [ ] 1.3 Every rule of `engine-difficulty` and of Ascent's spec is sorted by
      what already holds it: a type, a guard, a declaration the engine
      consumes, a guide, or nothing but the spec. Check: the counts are
      recorded in `design.md`.
- [ ] 1.4 The owner's answers to `design.md` § "Decisions the owner is asked to
      confirm" are recorded there, after 2.6. Nothing from 3 onward starts
      before them.

## 2. The pilot

- [ ] 2.1 The ledger checker (Decision 6). Check: it fails on a ledger with a
      row removed and on one naming a requirement that does not exist.
- [ ] 2.2 `engine-difficulty` is rewritten, with its ledger. Check: the checker
      passes, the `SHALL` count is accounted for, and
      `openspec validate --specs --strict` passes.
- [ ] 2.3 Ascent's spec is rewritten twice, in the two forms, each with a
      ledger.
- [ ] 2.4 Two fresh-context reviews of each pilot spec (Decision 6), with what
      each found recorded in `design.md`.
- [ ] 2.5 The bounds for a requirement and a capability are set from the pilot,
      and the measured ratio replaces the estimate.
- [ ] 2.6 The owner is shown the pilot: both capabilities before and after,
      with the counts from 1.3.

## 3. What keeps it

- [ ] 3.1 The size check, in the gate's fast prefix, with the list of
      capabilities not yet rewritten. Check: a planted over-long requirement
      and a planted date each fail.
- [ ] 3.2 `rules` for the `specs` artifact in `openspec/config.yaml`. Check:
      `openspec instructions specs` returns them.
- [ ] 3.3 `change-citations.mjs` resolves a requirement cited by title. Check:
      a planted citation of a title that does not exist fails.
- [ ] 3.4 `docs/work-management.md` § "Before archiving" says to re-read the
      merged requirement.

## 4. The engine

Each capability has a ledger and the two reviews, is checked as 2.2, and leaves
the exempt list.

- [ ] 4.1 `engine-hints` and `engine-candidate-hints`.
- [ ] 4.2 `ts-engine`, with its misfiled requirements moved (Decision 3).
- [ ] 4.3 `engine-input`, `engine-params`, `engine-colors`, `engine-notes`,
      `engine-drawing`, `engine-helpers`.
- [ ] 4.4 Every citation of a renamed engine requirement is repointed. Check:
      the citation check passes and `git grep` finds no old title.

## 5. The other capabilities

- [ ] 5.1 `repo-layout` and `build-pipeline`, divided by subject if their
      rewrite shows they should be.
- [ ] 5.2 `app-shell`, `ts-migration` and the nine small ones.

## 6. The games

- [ ] 6.1 The 57 game specs, in batches of about ten, in the form the owner
      chose for them. Each spec has a ledger and the first review; one spec a
      batch gets the second.
- [ ] 6.2 The guide for porting a game says what a game's spec holds, and the
      scaffolding script's spec skeleton matches.

## 7. Close

- [ ] 7.1 The exempt list is empty and removed, and the size check reads every
      capability.
- [ ] 7.2 `AGENTS.md`'s read-first table and each guide name the capability
      that binds the part of the tree, within the root brief's bound.
- [ ] 7.3 The pin moves to openspec 1.14.1 or whatever is latest then, and the
      gate's `validate --all --strict` passes under it with no requirement
      reported as too long.
- [ ] 7.4 The census is run again and before and after are recorded in
      `design.md`.
- [ ] 7.5 The owner's acceptance (`proposal.md` § "Acceptance").
