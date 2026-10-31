# Tasks

## 1. The compiler

- [x] 1.1 Compile a dealt partition (a region as an element, its cells) and clues at a region, dealt with the clues as `Dealt`, and read them in the soundness checker; a cell's region is not compiled, since no technique reads it (design § 1)
- [x] 1.2 Keep a filling's pairwise condition, and a sum or product bounded by its clue, as each cell is assigned, a definition read as its body (design § 3)
- [x] 1.3 `until: <tier>`: a technique the ladder runs only at a cap below that tier (design § 4)

## 2. Describe and compare

- [x] 2.1 State Keen's rules, a clue kind a sign, and check them with the answer check, with a planted defect in a clue's meaning
- [x] 2.2 State Keen's techniques in the order `keen/solver.ts` scans: `cageEasy` (Easy, until Normal), `cage` (Normal), `cageLine` (Hard)
- [x] 2.3 Check each sound at orders 3 and 4, with a planted defect each; see all three unsound with the clues' meaning taken away
- [x] 2.4 Run the compiled ladder beside the hand-written one on every deal and hint walk; see the comparison fail on a plant that changes the deductions and on one that changes only their order
- [x] 2.5 Remove `solverCommon` and its callers; every Keen test and hint guard passes, and the Keen trace is byte-identical to the hand-written one's

## 3. Close

- [x] 3.1 Measure the speed per deal, run the app (and fix a cage-line step's words, which named one value of several), write the report, update the guides, archive, file the next Latin game (`describe-mathrax`)
