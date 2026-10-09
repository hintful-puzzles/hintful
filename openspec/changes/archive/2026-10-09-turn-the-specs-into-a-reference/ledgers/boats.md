# Ledger: boats

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Boats game implements the Game interface

| Rule | Where it went |
| --- | --- |
| The engine provides `src/games/boats/` implementing `Game`, registered | spec: Boats game implements the Game interface |
| Boats declares `findMistakes`, so Check & Save hard-blocks a provably wrong cell | spec: Boats game implements the Game interface |
| The parameters are width, height, fleet size, fleet configuration, a difficulty of four names and a remove-numbers flag | spec: Boats parameters are a board, a fleet, a difficulty and a remove-numbers flag |
| A game ID encodes all six and round-trips | spec: Boats parameters are a board, a fleet, a difficulty and a remove-numbers flag |
| Every game ID carries the difficulty and the remove-numbers flag | untrue: `encodeParams` in `src/games/boats/state.ts` writes the difficulty letter and the `S` flag only when `full`, so the requirement names the full encoding |
| Validation bounds: width and height 2 to 99, fleet size 1 to 9 and no greater than the larger dimension, at least one boat, the fleet fits | spec: Boats refuses parameters no fleet can be dealt from |
| The validation is upstream's, and every parameter set it admits deals a board at the requested difficulty | untrue: `validateParams` in `src/games/boats/generator.ts` also refuses a fleet of one boat above Easy when a board is to be generated, with `noSuchTier`, and the requirement now states it |
| The validation matches upstream | history |
| Scenario: every preset produces a uniquely soluble board at exactly its difficulty | spec: Boats game implements the Game interface |
| Scenario: the same holds for any legal parameter set | untrue: `newBoatsDesc` in `src/games/boats/generator.ts` throws after `MAX_GENERATE_ATTEMPTS` rejected boards, and its comment says small fleets lack a tier where the generator runs out, so the scenario is stated for the presets |
| Scenario: a game ID round-trips | spec: Boats parameters are a board, a fleet, a difficulty and a remove-numbers flag |

## Boats descriptions use the border-clue and run-length grid encoding

| Rule | Where it went |
| --- | --- |
| Border clues as `width + height` comma-terminated tokens, a count or a hidden marker, then the grid as run letters and clue letters | spec: Boats descriptions use the border-clue and run-length grid encoding |
| A run is emitted only before a clue or at a letter's maximum, so trailing squares with no clue encode short | spec: A Boats description omits a trailing run of squares with no clue |
| A board with no given clues at all encodes as its border clues alone | untrue: `encodeDesc` in `src/games/boats/state.ts` emits a letter whenever a run reaches `MAX_RUN`, so only a board smaller than that encodes as its border clues alone, and a larger one keeps a letter for each full run |
| Validation rejects more squares than the board, a wrong count of border slots told apart as too many or too few, and an unknown character | spec: Boats description validation rejects too many squares and never too few |
| Validation does not reject fewer squares than the board holds | spec: Boats description validation rejects too many squares and never too few |
| Scenario: a generated description round-trips | spec: Boats descriptions use the border-clue and run-length grid encoding |
| Scenario: too many squares is rejected | spec: Boats description validation rejects too many squares and never too few |
| Scenario: no given clues is accepted | spec: Boats description validation rejects too many squares and never too few |

## Boats input, placement, mistakes and completion

| Rule | Where it went |
| --- | --- |
| Played by mouse or touch and by keyboard, with a left-click cycle, a line drag, and a keyboard cursor with a segment key, a water key and modifier-drag | spec: Boats is played by pointer and by keyboard |
| A right-click toggles water | untrue: `clickFill` in `src/games/boats/index.ts` turns an empty cell to water and any filled cell, a boat segment included, to empty, so the requirement says that |
| Undo and redo come from the engine with no game-specific state | spec: Boats is played by pointer and by keyboard |
| An unknown segment resolves its shape from its neighbors, and a completed boat is crossed off the fleet list | spec: A boat segment resolves its shape and a completed boat is crossed off |
| Live flags: a line's count exceeded, boats touching, a boat the fleet cannot accommodate, a segment contradicting a given clue | spec: Boats flags a broken rule as the player plays |
| `findMistakes` re-solves to the unique solution and reports every placed cell that contradicts it, so a locally legal wrong placement is blocked | spec: Boats findMistakes re-solves to the unique solution |
| The live-flagged cells are a subset of what `findMistakes` reports | untrue: the live flags in `src/games/boats/validate.ts` fall on a line's number, on a given square (`FE_MISMATCH`) and on every square of an over-size boat (`FE_FLEET`), which `findMistakes` in `src/games/boats/solver.ts` need not report cell for cell. What holds is that a flagged board has a reported cell, and the requirement says that |
| Rendering draws each cell, the count clues and the fleet list, with wrong cells and counts in error colors, no interpolated animation, and a completion flash | spec: Boats draws its cells, clues and fleet with no interpolated animation |
| Scenario: a drag fills a run in a single move | spec: Boats is played by pointer and by keyboard |
| Scenario: a row over its count shows the count in the error color and is reported by `findMistakes` | spec: Boats flags a broken rule as the player plays |
| Scenario: the offending cells of that row are shown in the error color | untrue: `redraw` in `src/games/boats/render.ts` colors only the line's number from `countShips`, and a cell turns red only on `FE_MISMATCH` or the Check & Save overlay |
| Scenario: completing the fleet wins without filling in the water | spec: Boats draws its cells, clues and fleet with no interpolated animation |

## Boats explains its next deduction

| Rule | Where it went |
| --- | --- |
| An explained hint plans forced moves from the player's board and says why each is forced | spec: Boats explains its next deduction |
| The hint is the solver's deduction engine replayed one firing at a time, and alters neither solver, generator nor codec | spec: The Boats hint replays the solver's deductions one firing at a time |
| The hint replays at the lowest cap at which the board solves | spec: The Boats hint replays at the lowest cap that solves the board |
| The replay is only ever at that lowest cap | untrue: `deduceBoatsPlan` in `src/games/boats/hint-solver.ts` replays at the next cap up whenever the lower one yields no firing from the player's board, and the requirement now states it |
| A recovered hidden number is offered to the cheaper techniques before a harder one is tried | spec: A recovered border number is offered to the cheaper techniques first |
| Every named technique is narratable, with no unexplained fallback step | spec: Every Boats technique is narrated |
| Scenario: a hint names the technique that forces the move | spec: Boats explains its next deduction |
| Scenario: an easy board is taught an easy technique | spec: The Boats hint replays at the lowest cap that solves the board |
| Scenario: a recovered number feeds a line count | spec: A recovered border number is offered to the cheaper techniques first |
| Scenario: a refutation names the rule the alternative would break | spec: Every Boats technique is narrated |

## One deduction is one hint

| Rule | Where it went |
| --- | --- |
| One deduction forcing several squares is one hint, a journey whose later legs continue the first | spec: One deduction is one hint |
| Never-touch consequences are shown as part of the step and not narrated as further deductions | spec: One deduction is one hint |
| Forced squares and evidence are visually distinct, and a boat and water are each marked in the shape of the action | spec: A Boats hint marks a boat and water each in its own shape |
| Scenario: a line filled by one deduction is a single hint | spec: One deduction is one hint |

## Boats refuses to hint a board it cannot honestly advise

| Rule | Where it went |
| --- | --- |
| A hint is refused with a reason on a solved board, on a board with a square that contradicts the unique solution, and when no deduction is left | spec: Boats refuses to hint a board it cannot honestly advise |
| The mistake refusal surfaces the offending squares through the mistake overlay | spec: Boats refuses to hint a board it cannot honestly advise |
| A placement that breaks no rule yet but no solution permits counts as a mistake here | spec: Boats refuses to hint a board it cannot honestly advise |
| Scenario: a wrong-but-legal placement is refused | spec: Boats refuses to hint a board it cannot honestly advise |

## The fleet display fits the canvas for every legal fleet

| Rule | Where it went |
| --- | --- |
| The inventory is laid out within the reported canvas width for every fleet validation admits | spec: The fleet display fits the canvas for every legal fleet |
| Rows break between whole batches and also within a batch too wide for a row | spec: The fleet display fits the canvas for every legal fleet |
| Upstream records the overflow as a known defect | history; held: src/games/boats/render.ts "TODO ui: Certain custom fleets don't fit in the UI" |
| The layout is computed once and shared by the size calculation and the renderer | spec: The fleet layout is computed once and leaves a fitting fleet as it was |
| Where the batch-only layout stayed inside the row limit, the layout is identical to it | spec: The fleet layout is computed once and leaves a fitting fleet as it was |
| Scenario: a fleet wider than one row wraps | spec: The fleet display fits the canvas for every legal fleet |
| Scenario: a fleet that already fitted is unchanged | spec: The fleet layout is computed once and leaves a fitting fleet as it was |

## Boats solves with a four-tier deductive solver

| Rule | Where it went |
| --- | --- |
| A deductive solver with four named tiers reports the highest tier needed, and never guesses or backtracks | spec: Boats solves with a four-tier deductive solver |
| Connectivity uses the shared disjoint-set structure, and a boat's first square is the class's smallest element and never its root | spec: A boat's first square is the smallest element of its class |
| The solver is monotone in its cap, and Solve and the mistake check solve once at the highest cap | spec: The Boats solver is monotone in its difficulty cap |
| An end-capped boat with an undecided square beyond grows once every boat of its length is finished, at the second tier | spec: An end-capped boat that cannot stop grows at the second tier |
| The generator places a random fleet, derives the clues, optionally hides numbers, and rejects any board not at exactly the target tier, reproducibly from a seed | spec: The Boats generator deals a unique board at exactly the requested difficulty |
| Scenario: the solver reports the required difficulty | spec: Boats solves with a four-tier deductive solver |
| Scenario: a finished boat is seen as finished, with no contradiction | spec: A boat's first square is the smallest element of its class |
| Scenario: a board that solves at the easiest cap solves at every cap above | spec: The Boats solver is monotone in its difficulty cap |
| Scenario: an unfinished boat that cannot stop grows | spec: An end-capped boat that cannot stop grows at the second tier |
| Scenario: generation is reproducible from a seed | spec: The Boats generator deals a unique board at exactly the requested difficulty |

## Boats draws its squares on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| An undecided square is the cell surface with the surface grid line, and decided squares and given water keep the water fill, given water with its waves | spec: Boats draws its squares on the collection's quiet surface |
| A given segment sits on the lifted surface of a given | spec: A given boat segment sits on the lifted surface of a given |
| The help page says a given segment sits on a lighter square | spec: A given boat segment sits on the lifted surface of a given |
| Waves and the edge of a collision diamond are in ink, not the grid's color | spec: Boats draws its waves and its collision diamond's edge in ink |
| A segment, placed or given, and an unfound boat in the tally are the placed-piece color, the pair's first member | spec: A boat segment and an unfound boat in the tally share the placed-piece color |
| The keyboard cursor is a ring in the cursor color at the square's edge, outside a segment's outline | spec: The Boats keyboard cursor is a ring at the square's edge |
| Scenario: a given segment is told by the cell under it | spec: A given boat segment sits on the lifted surface of a given |
| Scenario: the tally shows the piece on the board | spec: A boat segment and an unfound boat in the tally share the placed-piece color |
| Scenario: undecided is surface and water is blue | spec: Boats draws its squares on the collection's quiet surface |
