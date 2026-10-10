# Tasks

The method is that of `2026-10-09-regroup-the-specs`: read its `design.md`
§ "How it was carried out" and its `doubts-brief.md` first. A rule that is
written or reworded is read by a second agent, old against new and against
the code. `design.md` says how this change carried it out, and `brief.md` is
what each agent was given.

## 1. The list

- [x] 1.1 From `found.md` of the archived change and the `note` entries it
  names, the rules by family (`design.md`), each settled into
  `rules/<family>.md`: the games that state it today, found by searching the
  specs, the capability it goes in, and whether the code makes it true of
  every game in the population. A rule stated by one game only is a
  `not-shared` entry.
- [x] 1.2 For each rule, the population it is true of, derived from the code.
  A rule false of one member is a departure the shared requirement names, or
  is not shared.

## 2. The shared requirements

- [x] 2.1 Each shared requirement as an `add`, a `reword` or an `edit` entry
  of its capability.
- [x] 2.2 The shared requirements that read wider or narrower than the code,
  corrected.
- [x] 2.3 A second agent read each against the code, and corrected the file.

## 3. The games

- [x] 3.1 Each game's copy cut, or its requirement shortened to what is its
  own, with the shared requirement named in the reason.
- [x] 3.2 A second agent read each cut and rewording, old against new.
- [x] 3.3 The deltas derived from the entries, and
  `openspec validate state-once-what-several-games-each-state --strict`.

## 4. The guard

- [x] 4.1 `src/module-layering.test.ts`: no non-test module under
  `src/games/` imports `src/engine/midend.ts`. Seen to fail on a type import
  planted in `src/games/flip/index.ts`.

## 5. What the settling found in the tree

- [x] 5.1 The line of reason the `COL_SOLID` assignment owed
  (`src/games/cube/render.ts`), two comments that cited the wrong cursor
  requirement (`src/engine/pointer.ts`, `src/games/sixteen/index.ts`), a
  hand-kept list of callers in a comment (`src/engine/candidate-hint.ts`),
  and the line of `docs/games/hints.md` that said Seismic alone records
  nothing.

## 6. Close

- [x] 6.1 `node scripts/checks/spec-census.mjs` before and after, recorded in
  `design.md`.
- [x] 6.2 `skip_specs` removed, validate, the gate, commit, archive, the
  requirements with no delta form put into the specs, push.
