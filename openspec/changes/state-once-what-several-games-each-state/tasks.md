# Tasks

The method is that of `2026-10-09-regroup-the-specs`: read its `design.md`
§ "How it was carried out" and its `doubts-brief.md` first. A rule that is
written or reworded is read by a second agent, old against new and against
the code.

## 1. The list

- [ ] 1.1 From `found.md` of the archived change and the `note` entries it
  names, a table: the rule, the games that state it today (found by searching
  the specs, not taken from the notes), the capability it would go in, and
  whether the code makes it true of every game in the population. Check: a
  rule stated by one game only is dropped from the table.
- [ ] 1.2 For each rule, the population it is true of, derived from the code
  (every game, every game on the candidate walk, every member of the
  note-taking cell). A rule false of one member is a departure the shared
  requirement names, or is not shared.

## 2. The shared requirements

- [ ] 2.1 Write each shared requirement as an `ADDED` or `MODIFIED` delta of
  its capability, in the form `openspec/config.yaml` gives. Start with seed
  reproducibility and the no-op input, which have the most copies.
- [ ] 2.2 Correct the shared requirements that read wider or narrower than
  the code.
- [ ] 2.3 A second agent reads each against the code.

## 3. The games

- [ ] 3.1 Each game's copy cut, or its requirement shortened to what is its
  own, as a delta, with the shared requirement named in the reason. A
  rewording that drops a scenario cannot be a `MODIFIED` under the tool's
  validator; see how the archived change carried those.
- [ ] 3.2 A second agent reads each cut and rewording, old against new.

## 4. The guard

- [ ] 4.1 `src/module-layering.test.ts`: no non-test module under
  `src/games/` imports `src/engine/midend.ts`. See it fail on a planted
  import.

## 5. Close

- [ ] 5.1 `node scripts/checks/spec-census.mjs` before and after, recorded.
- [ ] 5.2 Remove `skip_specs`, validate, the gate, commit, push, archive.
