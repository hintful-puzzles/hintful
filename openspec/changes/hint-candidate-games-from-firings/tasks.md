# Tasks

## 1. The shape

- [x] 1.1 Read Abcd's `hint.ts` wrappers (`satisfied`, `packed`) against `RungContext`, and decide what the engine takes from them (design § "The engine takes the gate")
- [x] 1.2 Seismic's `starve`, moved from its recorder to the compiled firings, compared by a dump of every plan and by `seismic-hint.test.ts` (design § "Seismic, moved")
- [x] 1.3 Abcd onto `techniqueRung`, enrolled in `hint-walk-fingerprint.test.ts` first; the tier gate could not replace `packed`'s `nothingEarlier`, the ladder's order can (design § "The engine takes the gate")

## 2. The rest

Each game is enrolled in `hint-walk-fingerprint.test.ts` at the commit before it moves, so its move's diff is the snapshot's. Check first that its `findMistakes` passes the notes to `entryMistakes`, which is what lets the hint read them.

- [ ] 2.1 Rome, Salad
- [ ] 2.2 The Latin games (Unequal, Adjacent, Keen, Towers, Group, Solo, Mathrax)
- [ ] 2.3 Undead, Crossing
