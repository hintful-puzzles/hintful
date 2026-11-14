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
- [ ] 2.2 The Latin games, a commit each (design § "Unequal, moved", § "Adjacent, moved")
  - [x] 2.2a Unequal
  - [x] 2.2b Adjacent (the edge-clue recorder goes with it, and `research/describe/firings.test.ts`, which compared that recorder's firings against the stated techniques the hint now runs)
  - [x] 2.2c Keen
  - [x] 2.2d Towers
  - [x] 2.2e Mathrax
  - [ ] 2.2f Group, Solo
- [ ] 2.3 Undead, Crossing
- [ ] 2.4 With the last recorder gone, retire what only recording needs: `docs/hints-candidates.md` § "The recorder and the soundness boundary" and § "Record off a bespoke solver" (or what of them a game still uses), `CandidatePlan.record`, `strikeAxis` and the replay audit (`firing-replay.ts`), each checked for a remaining caller first
