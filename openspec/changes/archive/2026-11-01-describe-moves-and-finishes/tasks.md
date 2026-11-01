# Tasks

## 1. The runtime

- [x] 1.1 Decide the split by move shape, and file it: `describe-guarded-moves` and `describe-components-and-open-domains` (`design.md` § "The split")
- [x] 1.2 A description's position, guarded moves, finish, lose state and dead-end claims compiled (`compile-position.ts`) and executed on concrete positions (`engine/position-runtime.ts`)
- [x] 1.3 Dead-end claims checked sound on small boards, verdicts fingerprinted and held by the gate, a planted unsound one seen to fail

## 2. The games

- [x] 2.1 Sixteen described: its slide, finish and parity compiled and called; `slide-planner` fed the compiled moves, its own slide kept with its measurement
- [x] 2.2 Twiddle described: its turns, finish and invariants compiled and called; `permutation-planner` fed the compiled turns' effects
- [x] 2.3 Fifteen described: its slide, finish and parity compiled and called

## 3. Close

- [x] 3.1 Every fixture, deal and hint walk of the three compared; the guides updated (`docs/descriptions.md`); the running app checked; archive
