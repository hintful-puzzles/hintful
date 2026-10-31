# Tasks

## 1. The compiler

- [x] 1.1 Compile a grid's interior corners (a corner as an element, its cells, a cell's corners, the cell across one) and clues at a corner, and read them in the interpreter and the soundness checker, `mod` among them (design § 1)

## 2. Describe and compare

- [x] 2.1 State Mathrax's rules, a clue kind a sign and `parity` for E and O (design § 2), and check them with the answer check, which now counts the clues of each kind its boards deal and fails on a kind none deals; boards of a quotient and a parity alone, which every-kind boards all but never deal; a planted defect in the parity's meaning
- [x] 2.2 State Mathrax's techniques in the order `mathrax/solver.ts` scans: `clueEasy`, `clue`, `clueTricky`, three statements over shared definitions (design § 3)
- [x] 2.3 Check each sound at orders 3 and 4, with a planted defect each; the checker now names each clue kind no board of an order can hold, which leaves a quotient checked at neither
- [x] 2.4 Run the compiled ladder beside the hand-written one on every deal and hint walk; see the comparison fail on a plant that changes the deductions and on one that changes only their order
- [x] 2.5 Remove `applyOptions`, its mirror and its callers, and `mathraxOptions`'s Easy gate, which only it read; every Mathrax test and hint guard passes, and the Mathrax trace is byte-identical to the hand-written one's

## 3. Close

- [ ] 3.1 Measure the speed per deal, run the app, write the report, update the guides, archive, file the next Latin game
