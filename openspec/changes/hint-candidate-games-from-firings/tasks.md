# Tasks

## 1. The shape

- [x] 1.1 Read Abcd's `hint.ts` wrappers (`satisfied`, `packed`) against `RungContext`, and decide what the engine takes from them (design § "The engine takes the gate")
- [x] 1.2 Seismic's `starve`, moved from its recorder to the compiled firings, compared by a dump of every plan and by `seismic-hint.test.ts` (design § "Seismic, moved")
- [x] 1.3 Abcd onto `techniqueRung`, enrolled in `hint-walk-fingerprint.test.ts` first; the tier gate could not replace `packed`'s `nothingEarlier`, the ladder's order can (design § "The engine takes the gate")

## 2. The rest

Each game is enrolled in `hint-walk-fingerprint.test.ts` at the commit before it moves, so its move's diff is the snapshot's. Its `findMistakes` must pass the notes to `entryMistakes`, which is what lets the hint read them; as of 2026-11-14 every game below does (the Latin family through `edge-clue-latin/play.ts`, Salad per square through `entryMistake`), so re-check it before relying on it. Each game's ladder decides its gates by its order (`techniqueRung`): a technique the walk owns (a single) that sits after one the game moves is a reason to read that game's ladder first.

- [x] 2.0 Every game below enrolled in `hint-walk-fingerprint.test.ts`, pinned at HEAD before any moves
- [x] 2.1 Rome (design § "Rome, moved")
- [x] 2.1a The Latin library's `set`, `fish` and `wing` (`engine/latin.description.yaml`) say their terms, and a Latin `NotesLadder` builds `LatinSolver` marks from the notes (design § "The Latin library says"). The first game to move writes the legs of the library's three rungs; every Latin game's are the same, so they belong in the engine beside `latinNotesLadder`, not in the game
- [x] 2.1b Salad (its own `border` says as well; a cross or ball is a seeded marker, and the X note is the hole symbol's candidate)
- [x] 2.2 The Latin games, a commit each (design § "Unequal, moved", § "Adjacent, moved")
  - [x] 2.2a Unequal
  - [x] 2.2b Adjacent (the edge-clue recorder goes with it, and `research/describe/firings.test.ts`, which compared that recorder's firings against the stated techniques the hint now runs)
  - [x] 2.2c Keen
  - [x] 2.2d Towers
  - [x] 2.2e Mathrax
  - [x] 2.2f Group (design § "Group, moved: a placing technique leads")
  - [x] 2.2g Solo (design § "Solo, moved")
- [x] 2.3 Undead, Crossing (design § "Undead and Crossing keep their own walks")
- [x] 2.5 Spec deltas for every game moved so far, and the engine's rung over the notes (`specs/`); each later move updates its game's requirements that name a recording solver, and 2.4 the engine's that name `CandidatePlan.record`
- [ ] 2.4 With the last recorder gone, retire what only recording needs: `docs/hints-candidates.md` § "The recorder and the soundness boundary" and § "Record off a bespoke solver" (or what of them a game still uses), `CandidatePlan.record`, `strikeAxis` and the replay audit (`firing-replay.ts`), each checked for a remaining caller first. What a census found on 2026-11-14 (re-check before relying on it):
  - No `runCandidatePlan` caller passes `record`, and no game sets `strikeAxis` (only `candidate-plan.test.ts` does). So `CandidateWalk`'s `ops`, its `strikes` rung, `availableNow`, `audit`, `split`, `strikeFirings` and `RungContext.ops` carry nothing, and neither do `placed` and the `!plan.record` test in `singles()`.
  - `availablePlacements` (`engine/latin-hint.ts`) reads only the ops, so with none it returns nothing: the walk's `places` rung and `RungContext.placements()` are empty. Group's rung calls `placements()` in the note-free opening (design § "Group, moved"); find out what that call still gives Group before cutting it, and whether the opening's singles now come from the `singles` rung alone.
  - `availableFirings`, `nextPlace` and `AvailableFirings` (`engine/candidate-hint.ts`) are used only by that path and `candidate-hint.test.ts`.
  - Only the audit uses `firing-replay.ts`: `candidate-plan.ts` (`takeReplay`, `checkPremise`), `ladder-runtime.ts` (`replay` on the marks, the `FiringReplay` it builds) and `latin.ts` (`latinReplay`, behind `cfg.recorder`, which no caller sets any more; `latin.test.ts` sets `s.recorder` directly). Delete `firing-replay.test.ts` with it, along with its entries in `scripts/feedback-probe-cases.mjs` and `scripts/checks/deal-profile.test.ts`'s pattern.
  - The marks-level recorder (`CellMarks.recorder`, `DeductionRecord`) stays: Light Up, Mines, Filling, Guess, Black Box, Mosaic and Separate record through it.
  - The guides that name the audit or the recorder: `docs/hints-candidates.md` (the requirement table's "A premise names everything" row, § "The recorder…", § "Record off a bespoke solver", the audit's guard paragraph), `docs/engine-catalog.md` § "`firing-replay.ts` — the premise audit", `docs/descriptions.md` and `docs/testing.md` where they cite `firing-replay.test.ts`. The engine spec's requirements that name `CandidatePlan.record` get a delta (2.5).
