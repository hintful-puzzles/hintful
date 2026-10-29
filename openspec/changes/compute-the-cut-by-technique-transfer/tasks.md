# Tasks

## 1. Fix the test

- [x] 1.1 List the pairs: the corpus's 15 wrong pairs and its 24 right ones in families A and B, `taxonomy.md`'s 23 measured pairs, and every declared ruleset and modifier of the catalog
- [x] 1.2 For each, write the expected word and where it comes from (a solver's judgment, or the rung overlap), and the number of misses that fails the computed cut; commit before stating any technique

## 2. State the techniques

- [x] 2.1 For each pair, state in the language the techniques of the plain game that the variation's rules could break, from the game's rungs (ours) or the corpus write-up (outside)
- [x] 2.2 Say for each pair how many techniques were stated and why that is enough to decide it

## 3. Extend the checker

- [x] 3.1 Move the checker from the archived change to its home outside `src/`, with a way to run it
- [x] 3.2 Compile bounded fillings and least fixed points; see each fail on a planted unsound technique before trusting it
- [x] 3.3 Quantify the binding inside one query, and measure the board sizes now in reach
- [x] 3.4 Add the planning rows: an added move, an added finish, a guard that only removes moves

## 4. Run and report

- [ ] 4.1 Run every pair on at least two board sizes; tally against the test
- [ ] 4.2 Report: pass or fail, the misses and why, and if it passes, the catalog moves to propose and what each would cost to saves and links; the owner's decision recorded
