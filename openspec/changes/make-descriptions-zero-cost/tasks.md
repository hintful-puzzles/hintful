# Tasks

Done before the owner refocused the change on the engine and language
(2026-11-07):

- [x] 1. The census, from the archive's recorded timings and one profile at HEAD (`deal-profile`), not a re-timing of every game (proposal § "How the census is taken")
- [x] 1a. Check `rung`'s self time against the instrument: inlined technique work, not the wrapper (proposal § "What it found")
- [x] 2a. Read the marks in place in compiled code (`marksRead`): Boats about 9% faster, the rest within noise
- [x] 2b. Keep what the hand-written Slant solver kept: `linked` caught up from a placement log, and sums over a group kept at its root (`linkedAggregate`); same boards and verdicts, 30×30 solves halved

The engine and language (proposal § "What Changes"):

- [x] 3. The same-board comparison as a tool in the tree: boards and verdicts checked equal, deals and single solves timed alternately against any commit; documented beside `deal-profile`
- [x] 4a. Groups across a set of edges kept on the marks' log (`keptEdgeGroups`: joins and local splits), with `kept-structures.test.ts` checking every kept structure, the linked groups' included, against a fresh one in each game that keeps one (seen failing on an unlogged placement); Filling 0.86×, Palisade 0.94×, Separate and Galaxies level. A kept sum no longer admits a term reading candidates
- [ ] 4. Kept state on the placement log for every group builtin (`pointGroups`, `edgeGroups`, `joinedAcross`, `of`, growing regions), with totals per group as `linkedSum` gives them; a guard each, seen failing on a plant
- [ ] 5. Per-element kept definitions made again only for the elements a placement could change, by a dependency derived from the statement
- [x] 6a. `edge(x, y)` over a loop on `adj4(x)` read from a table by the loop's counter, and a loop's binding no read uses dropped: Palisade 0.83×, Path 0.90×, Dominosa 0.95× (deals, same boards and verdicts)
- [ ] 6. Code generation independent of phrasing: one loop for aggregates over one set, no set built only to be counted, cheap geometry and clue reads, a per-element value computed once a scan; each timed on the games whose profile names it
- [x] 7. The compiler's cost report: each technique's growth stated above it (`techniqueGrowth`), warned from `n^2.5` at `npm run describe` and refused past `n^3`; it lists Boats' six rungs at `n^2.5` and Galaxies' `soleOwner` at `n^3`, both games measured slow
- [x] 7b. Boats' steep rungs brought down by an engine lever: `keptDefinition` keeps a definition of a number, and one whose value is a number or a truth, where its loops nest two deep. Boats' `done(m)` is kept, its rungs fall below `n^2.5`, and its deals take 0.74× (solves 0.69×), Path 0.92×, Bricks 0.91×, the rest level
- [ ] 7c. Galaxies' `soleOwner` (`n^3`)
- [ ] 8. The guide's cost rules for porters retired where the compiler covers them; the rest restated as what the compiler reports
- [ ] 9. The catalog's census redone with the tool against the baseline; any game past 10% brought to the owner with the shape that keeps it there
