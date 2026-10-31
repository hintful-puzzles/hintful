# Tasks

## 1. The compiler

- [x] 1.1 Compile `slots`, `sight(s)`, `opposite(s)`, `before(x, L)`, `index(x, L)` and `nth(L, i)`, and read them in the soundness checker, with clues at a slot
- [x] 1.2 Compile `fill f of S [from cand]` in a quantifier or aggregate, pruning a `distinct` and pinning an `f(x) = t` as each cell is assigned; read it in the soundness checker

## 2. Describe and compare

- [x] 2.1 State Towers' techniques in the order `towers/solver.ts` scans: `facing` (a technique, one firing for every pair; design § 4), `bounds` (`lineFull` and `lowerBound` as one, clue by clue; design § 3), `arrangement`
- [x] 2.2 Check each sound at orders 3 and 4, with a planted defect each; see all three unsound with the clue's meaning taken away, and a plant on `bounds`' run reading caught
- [x] 2.3 Run the compiled ladder beside the hand-written one on every deal and hint walk; see the comparison fail on a plant that changes the deductions and on one that changes only their order
- [x] 2.4 Remove `solverEasy` and `solverHard`; every Towers test and hint guard passes, the description's tiers are pinned to the difficulty constants, and the Towers trace is byte-identical to the hand-written one's

## 3. Close

- [ ] 3.1 Measure the speed per deal, run the app, write the report, update the guides, archive, file the next Latin game
