# Tasks

## 1. Design

- [x] 1.1 Decide where descriptions and the compiler live in `src/`, and how a build step emits the compiled techniques (design.md § 3: committed `*.compiled.ts`, held current by a gate test)
- [x] 1.2 Decide how a compiled firing records for the hint, and how Unequal's words read its bindings (design.md § 5)

## 2. The checker

- [x] 2.1 Port `research/technique-check/` to TypeScript with `z3-solver`; its validate and planted cases pass (report.md § "Soundness": every check that finishes agrees with the Python; `validate`'s 6x6 checks, which settle in neither, are left to move to a run of their own)
- [x] 2.2 Check every technique of `latin.description.json` and Unequal's descriptions sound against their rules on small boards, from the descriptions themselves (`research/technique-check/describe-check.ts`; 9 techniques sound, 9 plants unsound)
- [x] 2.3 Record each verdict under a fingerprint of what was checked; the gate's test fails on a compiled technique with none (design.md § 9; seen to fail on an edited `sign`)

## 3. Compile

- [x] 3.1 The compiler (`src/describe/compile.ts`), its runtime, `npm run describe`, and the gate test that holds the compiled modules to their descriptions
- [x] 3.2 Restate the library and Unequal's descriptions in the engine's scan order, with the engine's contradiction checks (design.md §§ 1, 2)
- [x] 3.3 Run the compiled ladder beside the hand-written one on every Latin game's generator and hint walks, comparing returns, grids, cubes and records exactly; report the counts (report.md § "The comparison": 438,368 solver calls, no difference after the one it found)
- [x] 3.4 See the comparison fail on a planted defect (`single` scanning rows before columns: caught in Towers' records on the first board)
- [x] 3.5 Remove the hand-written layer it replaces; every existing test and hint guard passes (two unit tests that named removed methods call the compiled techniques, report.md § "The comparison")
- [x] 3.6 Rerun the pilot's comparisons against the restated descriptions (report.md § "The pilot's comparisons")
- [x] 3.7 Measure the generator's time per deal against today's, and run the app (report.md §§ "Speed", "The app")

## 4. Close

- [x] 4.1 Guides: `docs/descriptions.md`, the Latin family in `docs/solver-and-generator.md`, the engine catalog, the research READMEs
- [x] 4.2 Write the report
- [x] 4.3 File the next Latin game in the order of fit (`describe-group`, after `describe-games-in-yaml-with-their-help`), and archive
