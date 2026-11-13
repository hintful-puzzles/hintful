# Tasks

## 1. Design

- [x] 1.1 Read Loopy's `record.ts`, Slant's `SlantTrace` and `engine/candidate-hint.ts` side by side, and write the one model (design.md)
- [x] 1.2 Sort the `exists fill` cases apart (Net, Pattern, Tents, Pearl): witness, or a specific technique stated ahead of the general one (design.md § "`exists fill`, sorted")
- [ ] 1.3 Measure the walk's cost with reads recorded, on the games whose walks are longest, against the commit before; and a solve's compiled output unchanged. Done for the witness (Path's `lineBreaks`, all firings over 80 boards: about 18 ms without, 19–30 ms with, on a busy machine); the reads' cost is measured in 3.1, where they exist

## 2. The witness

- [x] 2.1 `compile.ts`: on the hint path a compiled technique reports the held arm of an `or`, the member an `exists` held for, the `with` rule that broke and where; the solve path emits nothing extra (see it fail on a planted change). Opt-in by `says.witness`; planted: arms swapped (`path-witness.test.ts` fails), buffers hoisted out of the hint block (`compile.test.ts` fails). Path's `lineBreaks` is the exemplar. A refutation witness for `not exists fill` is step 4's
- [x] 2.2 The witness is named where the sentence is built (`witnessOfDef`, `witnessNodes`, a `member` record keyed by binder names), not in a yaml term: a term is an expression over the board, and what held is not a fact of the board. `docs/descriptions.md` says how
- [ ] 2.3 Move one game's `clashOf`-style reason callback onto it (Path, then Spokes), compared by the hint-walk fingerprint. Done: Path's `lineBreaks` and `pairBreaks` (`brokeOf`; fingerprint unchanged, fails when the stuck member or the closed/joined arms are planted wrong). Open: `weighed` (its `bothBreak`s are in aggregates, which have no witness: it keeps `clashOf`), Spokes

## 3. Reads and the fact graph

- [ ] 3.1 A firing carries what it read; the engine keeps each fact with its firing and parents
- [ ] 3.2 The engine answers "what does this fact rest on?" for any fact from any position (what `check-the-last-move` asks)
- [ ] 3.3 The engine places a note before its first consumer, as one journey, and nowhere where nothing cites it
- [ ] 3.4 Slant moves onto it (its `SlantTrace` goes), then Loopy (its `record.ts` goes); each compared by the fingerprint
- [ ] 3.5 Net (`explain.ts`), per 1.2; this unblocks `build-hint-steps-in-the-engine` for Slant and Net

## 4. Candidates a player cannot write

- [ ] 4.1 A technique that strikes states a clause; a step resting on a struck candidate says its parents' clauses
- [ ] 4.2 Magnets, Ascent, Filling, Salad drop their re-derivations
- [ ] 4.3 The candidate plan runs on any space; Map and Undead drop their own

## 5. Close

- [ ] 5.1 Update `docs/hints-marks.md`, `docs/hints-candidates.md`, `docs/descriptions.md`; every hint walk still finishes, words equal or accepted by the owner, a solve costs what it did
- [ ] 5.2 Note in `build-hint-steps-in-the-engine` that Slant and Net are unblocked
