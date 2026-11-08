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
- [~] 4. Kept state on the placement log for every group builtin: not built. The groups still made afresh are made once a run, about a scan's cost (Slant's `pair`, `share` and `same`, Filling's `tooFar`); Dominosa's `parity` asks a question per edge that a kept structure cannot answer. Concluded on the owner's word (2026-11-08): speed is improved as work passes (`docs/descriptions.md` § "What a technique compiles to")
- [~] 5. Per-element kept definitions made again only for the elements a placement could change: not built, on the same word. The recording tried in `keep-definitions-across-placements` cost more than it saved
- [x] 6a. `edge(x, y)` over a loop on `adj4(x)` read from a table by the loop's counter, and a loop's binding no read uses dropped: Palisade 0.83×, Path 0.90×, Dominosa 0.95× (deals, same boards and verdicts)
- [x] 6b. Clue reads by element in one load (`ClueList.valueAt`): level on Light Up, Mathrax, Singles, Clusters, Sticks and Dominosa (0.95 to 1.04×); kept as the simpler read
- [x] 6c. A count, sum or truth read again in one binding is made once (`Shared`), where the code that made it has surely run since the last fact: Light Up's deals 0.96×, Magnets' solves 0.89×
- [x] 6d. A definition that reads no marks is kept for the board from one loop or a walk, not two: Light Up's deals 0.16×, Clusters 0.68×, Dominosa 0.86×, Slant 0.92×, Bricks 0.89×; Boats, Galaxies, Magnets level
- [x] 6e. A definition that reads the marks is kept where it is read inside a loop that does not bind its argument (Mosaic's `need(c)` across the clues near `c`): Mosaic, Path, Slant and Clusters 0.93 to 0.94×; Palisade and Mines level
- [x] 6f. A definition of several arguments kept for the board (Star Battle's `band(k, dir, a)`): Star Battle's solves 0.95×, deals 0.97×. Kept for the marks it made Rect's deals 1.08× and Path's 1.04×, so it is not; nor is one whose statement compiles to one expression with no loop or walk (Rect's `meets(r, s)`, 1.09× kept), which also stopped keeping Boats' `num(L)`: Boats 0.95×
- [~] 6. Code generation independent of phrasing: 6a to 6f done; one loop for several aggregates over one set and cheaper geometry reads (`slash`) are left to be made as work passes, on the owner's word (2026-11-08)
- [x] 7. The compiler's cost report: each technique's growth stated above it (`techniqueGrowth`), warned from `n^2.5` at `npm run describe` and refused past `n^3`; it lists Boats' six rungs at `n^2.5` and Galaxies' `soleOwner` at `n^3`, both games measured slow
- [x] 7b. Boats' steep rungs brought down by an engine lever: `keptDefinition` keeps a definition of a number, and one whose value is a number or a truth, where its loops nest two deep. Boats' `done(m)` is kept, its rungs fall below `n^2.5`, and its deals take 0.74× (solves 0.69×), Path 0.92×, Bricks 0.91×, the rest level
- [x] 7c. Galaxies' `soleOwner`: a quantifier over a kept group whose body reads no marks and nothing else bound is made once a group (`groupQuantifier`); Galaxies' deals 0.71×, solves 0.41× (13×17 Unreasonable deals 0.44×). Its stated growth stays `n^3`, since the measure cannot see a loop guarded to one binding
- [x] 8. The guide's cost rules restated as each lever landed: a markless definition, a repeated read, a definition read in a loop that does not bind it and one of several arguments are kept by the compiler, and a count read twice is made once; the guide states the standing rule that speed is improved as work passes
- [~] 9. The catalog's census redone against the hand-written ladders: dropped on the owner's word (2026-11-08); a profile and the commit before told more than the comparison with the replaced code
