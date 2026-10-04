## 1. Dominosa

- [x] 1.1 Remove the tier: `DIFF_NAMES` is `tierNames(4, { search: true })`,
      the generator's scatter branch and `trivial` are deleted.
- [x] 1.2 The codec reads `da` and bare `a` as no tier.
- [x] 1.3 Tests: the codec, a refused several-solution board under three IDs,
      the hint's refusal on that board built directly; the Ambiguous fixture
      retired.

## 2. Engine

- [x] 2.1 Delete `nonUniqueTiers` from the contract, `loadDesc`, the midend and
      `difficulty-contract.test.ts`'s three branches.
- [x] 2.2 `loadDesc` asks every tiered board whether some cap solves it,
      Unreasonable included; `DESC_NO_SINGLE_ANSWER` where the game has that
      tier.
- [x] 2.3 `upstream-descs.test.ts`: place Dominosa's fixtures on the wide
      board, and expect upstream's three several-answer Mathrax boards refused.

## 3. Words

- [x] 3.1 `help/differences.md`, Dominosa's help page and its difficulty doc.
- [x] 3.2 `AGENTS.md`'s override example; `solver-and-generator.md`,
      `mechanics.md`, `engine-catalog.md`.
- [x] 3.3 Spec deltas: `ts-engine`, `dominosa`, `ts-migration`.

## 4. Finish

- [x] 4.1 Full suite: one snapshot moved, `params-stability`'s Dominosa
      `tier:4` line.
- [x] 4.2 Run the app: the type menu and Custom dialog offer four tiers, a
      `?type=6tda` link deals at Normal, and upstream's Ambiguous board is
      refused under `6de` with the new sentence.
- [ ] 4.3 Owner acceptance of `DESC_NO_SINGLE_ANSWER`'s sentence and of
      upstream's Mathrax Recursive IDs no longer loading.
