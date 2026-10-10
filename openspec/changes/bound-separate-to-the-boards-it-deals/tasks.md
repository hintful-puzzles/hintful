# Tasks

## 1. Measure

- [x] 1.1 Count what a thrown-away division is thrown away for, before any
  bound (`design.md` § "What a division was thrown away for").
- [x] 1.2 Try a generator that reaches further: a division with no ringed
  region, and letters placed for the solver (`design.md` § "Letters placed
  for the solver").
- [x] 1.3 Sweep the new generator: each letter count from 2 to 12, on boards
  from 1 to 20 on the shorter side, with a time cap a size so that one that
  never deals costs seconds; then the sizes it cut short at two minutes
  each, and thirteen to twenty-six letters. A run with no cap a size was
  tried first and told nothing in ten minutes.
- [x] 1.4 Choose from the sweep what is refused (`design.md` § "Where it
  stops").

## 2. Build

- [x] 2.1 `engine/redivide.ts`, from Palisade's generator, with a `ringless`
  flag; Palisade's tests pass unchanged, so it deals the boards it did.
- [x] 2.2 `separate/generator.ts`: `ringlessDivision`, `placedLetters`, and
  the cap on divisions sized to the sweep.
- [x] 2.3 The refusal in `validateParams`, for a board that is to be dealt
  only.
- [x] 2.4 Tests: boards the old generator never dealt are dealt at both
  tiers; a size at the line is admitted and one past it refused with the
  reason; a pasted 3x6 board in nines opens; the frozen C boards are kept as
  a check on the solver; the ladder census runs on dealt boards.
- [x] 2.5 In the running app: an 8x8 board with eight letters dealt, a 12x14
  with eight refused in the Custom dialog, and a 20x20 with two dealt from
  it and hinted.

## 3. Close

- [x] 3.1 The spec delta, and `skip_specs` removed from `.openspec.yaml`.
- [x] 3.2 `help/differences.md`. `help/games/separate.md` takes its
  parameters from the params' own words, which say the limits.
- [x] 3.3 `docs/games/solver-and-generator.md` and
  `docs/games/engine-catalog.md`.
- [ ] 3.4 Commit, push, archive.
