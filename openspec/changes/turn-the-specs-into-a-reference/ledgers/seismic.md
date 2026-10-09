# Ledger: seismic

Base: bb004490

Where every rule of Seismic's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Seismic game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/seismic/` implements `Game` for Seismic and is registered | spec: Seismic game implements the Game interface |
| The four parameters, the refusal of a side below 4 and of an unknown difficulty, and the game ID that round-trips with a bare number as a square | spec: Seismic's parameters |
| "Matching upstream" | history |
| A size bound is measured on the shipped generator, carries a reason the Custom dialog shows naming the mode, and reflects the stage that is the limit | spec: The size bound is measured, per mode, and says why |
| The retry loops below a bound are finite and fail with a labeled error | spec: The generator's retry loops are finite |
| The bound is per mode because the modes are stopped by different things | spec: The size bound is measured, per mode, and says why |
| Tectonic's limit is reachability, and every size within its bound generates, some slowly | spec: Tectonic's bound is what can be reached |
| Seismic's limit is possibility, its bound stays at the largest area whose worst observed run is short, and raising it needs the slow sizes repeated over several seeds | spec: Seismic's bound is what is possible |
| A bound set from medians is the error | spec: Seismic's bound is what is possible |
| The 100 cells, the sixteen seconds an attempt runs | figure |
| The distinction between the two modes is not a matter of degree | reason |
| 10×10 is the Seismic size that does not generate at all | spec: Seismic's bound is what is possible |
| The median bound was shipped and retracted once | history |
| A Custom size MAY take seconds to generate and a preset SHALL NOT, with the reason | spec: A preset is never a long wait; spec: Tectonic's bound is what can be reached |
| Presets stop well inside the bound | untrue: the 8×8 Seismic presets in `PRESETS` (`src/games/seismic/state.ts`) are exactly `MAX_CELLS_SEISMIC`, and the test asserts each preset passes validation and is at most 8×8 in either mode |
| That presets hold back is asserted, not left to convention | spec: A preset is never a long wait |
| This is what makes the size upstream's notes call standard available without the menu wait the constructive generator removed | history |
| A region of size N holds each of 1 to N, and the Tectonic rule | spec: A region holds each number once and equal numbers keep apart |
| In Seismic mode two equal Z in a line are at least Z cells apart | untrue: `placeNumber` and `validateGame` in `src/games/seismic/solver.ts` bar a Z from the Z cells either side, so two Zs need at least Z cells between them, as the Purpose and the ruleset's own sentence say |
| Regions on the shared disjoint-set structure, and generation reproducible without a canonical-element choice | spec: Regions live on the shared disjoint-set structure |
| Scenario: a game ID round-trips | spec: Seismic's parameters |
| Scenario: every preset produces a soluble board | spec: The generator strips clues and accepts only a board of its tier |
| Scenario: a board larger than upstream's 7×7 is generable | spec: The size bound is measured, per mode, and says why |
| Scenario: 10×10 in Tectonic is accepted, and no preset offers it | spec: Tectonic's bound is what can be reached |
| Scenario: 10×10 in Seismic is refused up front | spec: Seismic's bound is what is possible |
| Scenario: a size with a long tail is kept out of the menu | spec: A preset is never a long wait |

## Seismic descriptions use the run-length wall and clue encoding

| Rule | Where it went |
| --- | --- |
| Two comma-separated parts, walls then clues, with their run-length letters and counts, the wall list stated in the order `src/engine/wall-runs.ts` reads it | spec: Seismic descriptions use the run-length wall and clue encoding |
| Decoding rebuilds the regions and the fixed clues | spec: A Seismic description is validated against its regions |
| Validation rejects an unknown wall character, a region over nine cells and a clue over its region's size | spec: A Seismic description is validated against its regions |
| Validation otherwise accepts | untrue: `parseDesc` in `src/games/seismic/state.ts` also refuses a clue of 0, a character that is neither a clue letter nor a digit, and a clue list that runs past or stops short of the board, and `readWallRuns` in `src/engine/wall-runs.ts` refuses a wall list that does the same |
| Scenario: a generated description round-trips | spec: Seismic descriptions use the run-length wall and clue encoding |
| Scenario: an over-large clue is rejected | spec: A Seismic description is validated against its regions |

## Seismic input, note-taking and completion

| Rule | Where it went |
| --- | --- |
| The Solo control scheme, the sticky pencil preference and the pencil-mode indicator | spec: Seismic input, note-taking and completion |
| A digit is entered only within the region's size, never over a fixed clue, and is a no-op when it changes nothing | spec: A digit is entered only where its region can hold it |
| A keypad sized to the largest region the generator produces in the mode, plus a clear key | spec: The on-screen keypad offers only digits a board can accept |
| Mark-all fills every empty cell with all of its region's candidates | untrue: `pencilAll` in `executeMove` (`src/games/seismic/index.ts`) fills only an empty cell with no notes, and `interpretMove` makes no move when none lacks notes |
| The corrected mark-all | spec: Mark-all fills a note-less cell with its region's candidates |
| What rendering draws, the live error color, the completion flash and no move animation | spec: Seismic draws its numbers, its notes and a broken rule |
| Scenario: a digit above the region size is rejected | spec: A digit is entered only where its region can hold it |
| Scenario: completing the grid wins | spec: Seismic input, note-taking and completion |

## Seismic flags mistakes against the unique solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves from the fixed clues and flags a wrong placement and a note set that crosses out the answer | spec: Seismic flags mistakes against the unique solution |
| Extra notes are not flagged, and nothing is flagged when the givens are not uniquely soluble | spec: findMistakes flags nothing it cannot be sure of |
| The flagged cells get a distinct overlay that repaints on the frame after the move | spec: A flagged cell carries its own mistake overlay |
| Scenario: a wrong placement is flagged | spec: Seismic flags mistakes against the unique solution |
| Scenario: a crossed-out note is flagged | spec: Seismic flags mistakes against the unique solution |
| Scenario: a correct partial board reports no mistakes | spec: findMistakes flags nothing it cannot be sure of |

## The on-screen keypad offers only digits a board can accept

| Rule | Where it went |
| --- | --- |
| `requestKeys` offers no digit that no generated board could accept, and why an inert key matters on touch | spec: The on-screen keypad offers only digits a board can accept |
| The panel matches the generator's bound, derives it and does not restate it, and takes the generator's bound and not the format's | spec: The keypad derives its bound from the generator |
| A restated bound produced this defect when the distribution changed, and the panel confused the two bounds | history |
| The format admits nine and the generator produces at most five | figure |
| Scenario: no offered digit is unreachable | spec: The on-screen keypad offers only digits a board can accept |
| Scenario clause: Seismic has no entry in the inert-panel-key findings list, which is the rule admitting no exception, named by a test's private list | spec: The on-screen keypad offers only digits a board can accept |
| Scenario: widening the generator widens the panel | spec: The keypad derives its bound from the generator |

## Seismic solves by candidate elimination and generates regions before numbers

| Rule | Where it went |
| --- | --- |
| The solver's rungs by tier, what it reports and the rules it enforces | spec: Seismic solves by candidate elimination and generates regions before numbers |
| The generator partitions into connected regions before placing a number | spec: Seismic solves by candidate elimination and generates regions before numbers |
| It fills each region over the solver's own propagation and does not depend on a post-hoc test of a randomly merged region | spec: The generator fills each region by the solver's own propagation |
| The post-hoc test is upstream's, its author wanted it replaced, and its success rate falls away above fifty cells | history; figure |
| Clues are stripped while soluble at the tier, a board is accepted only at its tier, and a seed is reproducible | spec: The generator strips clues and accepts only a board of its tier |
| "Both stages unchanged" | history |
| Every generated board is held by test to connected regions holding 1 to their size, the keep-apart rule and a description round-trip | spec: A test holds every generated board to the rules |
| Scenario: the solver grades a puzzle's difficulty | spec: Seismic solves by candidate elimination and generates regions before numbers |
| Scenario: generation is reproducible from a seed | spec: The generator strips clues and accepts only a board of its tier |
| Scenario: every region is valid by construction | spec: A test holds every generated board to the rules |

## Seismic explains the next deduction

| Rule | Where it went |
| --- | --- |
| The midend refuses a hint on a solved or mistaken board, and `hint(state)` otherwise returns an ordered plan of narrated forced steps | spec: Seismic explains the next deduction |
| The plan is walked by `runCandidatePlan` with the keep-apart rule as its `reach` | spec: The hint walks the shared candidate plan with the keep-apart reach |
| It offers "Hints pencil in" and starts on the implicit reading, with the reason | spec: The hint starts on the implicit reading |
| It deduces from the player's notes and what a note-less cell is left, sound because `findMistakes` flags a crossed-out answer | spec: The hint deduces from the player's notes |
| Populate fills with the additive `pencilAll`, and either reading strikes the obvious in one setup step | spec: The hint sets the notes up before a deduction reads them |
| The four deductions, and the last only when no other is available | spec: The deductions the hint makes |
| A placement is followed by a step striking what it rules out | spec: A placement is followed by the strikes it causes |
| The last deduction strikes what the trial rung rejects, one step per area and number, narrated directly as a Check, never needed on Easy | spec: The starved-area deduction is the solver's trial rung |
| The generator does not call the hint | spec: The generator does not call the hint |
| Scenario: an area starved of a number | spec: The deductions the hint makes |
| Scenario: a hint resumes from narrowed notes | spec: The hint deduces from the player's notes |
| Scenario: asking for a hint leaves the board untouched | spec: Seismic explains the next deduction |
| Scenario: the naked-single phrasing is never used on a multi-candidate cell | spec: The deductions the hint makes |
| Scenario: a note-less cell reads as what the rule leaves it | spec: The hint walks the shared candidate plan with the keep-apart reach |

## Seismic draws its cells on a quiet surface and keeps its walls

| Rule | Where it went |
| --- | --- |
| The cell surface, the lifted surface of a given, the two number colors and the surface grid line inside a region | spec: Seismic draws its cells on a quiet surface and keeps its walls |
| A wall, the frame included, stays in ink at full width and meets in a solid corner | spec: A region's wall is content |
| The flash sweeps a bright and a dim beat over each cell's own surface, in colors that read in both schemes | spec: The completion flash sweeps two beats over each cell's surface |
| Scenario: a given is told by the cell under it | spec: Seismic draws its cells on a quiet surface and keeps its walls |
| Scenario: a wall is stronger than a grid line | spec: A region's wall is content |
| Scenario: the flash moves | spec: The completion flash sweeps two beats over each cell's surface |
