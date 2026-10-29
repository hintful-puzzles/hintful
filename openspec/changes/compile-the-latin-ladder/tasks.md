# Tasks

## 1. Design

- [x] 1.1 Decide where descriptions and the compiler live in `src/`, and how a build step emits the compiled techniques (design.md § 3: committed `*.compiled.ts`, held current by a gate test)
- [x] 1.2 Decide how a compiled firing records for the hint, and how Unequal's words read its bindings (design.md § 5)

## 2. The checker

- [x] 2.1 Port `research/technique-check/` to TypeScript with `z3-solver`; its validate and planted cases pass (2026-10-29: `planted` 7 of 7, `planning`, `symarea`, `run_a` 68 lines and `run_c` 108 checks agree with the Python's verdicts; `validate` 34 of 34 without its Range 6x6 checks, which settle in neither version. Two of the Python `validate`'s planted fillings could never come out unsound, so the archived cut report's "every plant caught" was not so; the port plants ones that hold where they should not, and both are caught. Open: drop 6x6 from `validate` or move it to a run of its own, and say so in the report)
- [ ] 2.2 Check every technique of `latin.description.json` and Unequal's descriptions sound against their rules on small boards, from the descriptions themselves
- [ ] 2.3 Record each verdict under a hash of what was checked; the compiler refuses an unchecked technique and the gate's test checks the hashes (design.md § 9)

## 3. Compile

- [x] 3.1 The compiler (`src/describe/compile.ts`), its runtime, `npm run describe`, and the gate test that holds the compiled modules to their descriptions
- [x] 3.2 Restate the library and Unequal's descriptions in the engine's scan order, with the engine's contradiction checks (design.md §§ 1, 2)
- [x] 3.3 Run the compiled ladder beside the hand-written one on every Latin game's generator and hint walks, comparing returns, grids, cubes and records exactly; report the counts (`research/describe/compare-compiled.test.ts`, 2026-10-29: Unequal 64,656 solver calls, Towers 37,782, Keen 58,823, Group 65,728, Mathrax 43,219, Salad 168,160 (mostly its repeat path, hand-written on both sides), no difference. Its first run found one, in Adjacent mode: the hand-written `set` refuses a cell with no candidate left, placed or not, and the first statement did not, so a recursion accepted a broken grid as a second answer; `set` and `fish` now check it on their empty subset)
- [x] 3.4 See the comparison fail on a planted defect (`single` scanning rows before columns: caught in Towers' records on the first board)
- [ ] 3.4a Rerun the Latin games' and the engine's own suites with `CHECK.selfCheck` on (started 2026-10-29, stopped when the owner reported the machine overloaded; no failure in what ran)
- [ ] 3.5 Remove the hand-written layer it replaces (`set`, `confinedSet`, the non-repeat strikes in `place`, Unequal's `solverLinks`, `solverAdjacent`, `solverAdjacentSet`); every existing test and hint guard passes unchanged
- [ ] 3.6 Rerun the pilot's comparisons (closures, grades, firings, planted defects) against the restated descriptions
- [ ] 3.7 Measure the generator's time per deal against today's, and run the app

## 4. Close

- [ ] 4.1 Guides: `docs/descriptions.md`, the Latin family in `docs/solver-and-generator.md`, the engine catalog, the research READMEs
- [ ] 4.2 Write the report
- [ ] 4.3 File the next Latin game in the order of fit, and archive
