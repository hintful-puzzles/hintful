# Ledger: bricks

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Bricks game implements the Game interface

| Rule | Where it went |
| --- | --- |
| The engine provides `src/games/bricks/` implementing `Game`, registered | spec: Bricks game implements the Game interface |
| Parameters are a width, a height and a difficulty, Easy or `Unreasonable` | spec: Bricks parameters are a width, a height and a difficulty |
| The harder tier is named `Unreasonable` because its rung solves the rest of the board from a hypothesis | spec: The harder Bricks tier is named Unreasonable |
| The name stands in place of upstream's `Normal` | history |
| Validation requires width at least 2, height at least 2 and a known difficulty | spec: Bricks parameters are a width, a height and a difficulty |
| That validation is the game's | untrue: `validateParams` in `src/games/bricks/state.ts` refuses only a 2x2 at the harder tier, and the size bounds and the unknown difficulty are refused by the engine's `itemError` in `src/engine/params.ts` from the `bounds` and the choices `paramConfig` declares, so the requirement says the engine refuses them |
| A game ID encodes width, height and difficulty and round-trips | spec: Bricks parameters are a width, a height and a difficulty |
| The encoded difficulty characters are unchanged, so an existing ID names the same board | spec: Bricks parameters are a width, a height and a difficulty |
| The characters were unchanged by the rename | history |
| The tier names have a single definition read by the menu, the contract and the dialog | spec: Bricks tier names have a single definition |
| The board is a hexagon stored as a padded parallelogram, with its width, its masked corners, its six-direction neighbors and no use of the shared tiling engine | spec: The Bricks board is a hexagon stored as a padded parallelogram |
| Scenario: every preset produces a soluble board | spec: Bricks game implements the Game interface |
| Scenario: a game ID round-trips through the parameters | spec: Bricks parameters are a width, a height and a difficulty |
| Scenario: the menu, the contract and the custom dialog offer the same tiers | spec: Bricks tier names have a single definition |

## Bricks descriptions use the run-length cell encoding

| Rule | Where it went |
| --- | --- |
| A description encodes only the playable cells in reading order, numbers with a separator between two adjacent ones, runs as a lowercase count, and no boundary cells | spec: Bricks descriptions use the run-length cell encoding |
| Validation rejects too many or too few cells, telling them apart, and a clue out of range | spec: A Bricks description of the wrong size or range is rejected |
| Scenario: a generated description round-trips | spec: Bricks descriptions use the run-length cell encoding |
| Scenario: a description with the wrong number of cells is rejected | spec: A Bricks description of the wrong size or range is rejected |

## Bricks input, mistake-checking and completion

| Rule | Where it went |
| --- | --- |
| Clicking or dragging cycles a cell between shaded, unshaded and empty, and the right button cycles the other way | spec: Bricks cells cycle by a click or a drag |
| A numbered cell is never shadeable | spec: Bricks cells cycle by a click or a drag |
| A hexagon-aware keyboard cursor, whose up and down alternate an orthogonal and a diagonal step | spec: The Bricks keyboard cursor follows the hexagonal grid |
| `findMistakes` reports the offending cells so Check & Save hard-blocks | spec: Bricks reports rule violations through findMistakes |
| Violations are marked with three-in-a-row bars, gravity diamonds and error-colored clue numbers | spec: Bricks marks a rule violation on the board |
| Those marks show live during play | untrue: `redraw` in `src/games/bricks/render.ts` computes the error flags only while a drag is in flight, for the previewed board, or from the `mistakes` the check hands it, and a committed board otherwise carries none, so the requirement says that |
| Only an over-counted clue is marked | untrue: `validateCounts` in `src/games/bricks/solver.ts` flags a clue that is over its count or can no longer reach it, and `drawTile` colors either, so the requirement says a miscounted clue |
| Complete when the grid satisfies all three rules | spec: A Bricks board is complete when its three rules hold |
| Completion also needs no cell left empty | untrue: `status` in `src/games/bricks/index.ts` calls `bricksValidate` with `strict` false, which never looks for an empty cell, so a board whose bricks are all placed is solved with other cells still empty, and the requirement says an empty cell counts as not shaded |
| The game flashes on completion and has no interpolated animation | spec: A Bricks board is complete when its three rules hold |
| Scenario: dragging paints a run of cells | spec: Bricks cells cycle by a click or a drag |
| Scenario: a mistake blocks Check & Save | spec: Bricks reports rule violations through findMistakes |
| Scenario: satisfying every rule wins | spec: A Bricks board is complete when its three rules hold |

## Bricks provides an explained deduction hint

| Rule | Where it went |
| --- | --- |
| Bricks implements `hint` and `hintKeepTrack`, computed from its own contradiction solver as a second projection of one engine, every hinted move a deduction the solver can make from the player's position | spec: Bricks provides an explained deduction hint |
| The plan is recompute-stable through a deterministic scan order | spec: A Bricks hint plan is recompute-stable |
| A step explains why, naming the rule the opposite color would break, as premise, contradiction and conclusion in the necessity voice | spec: A Bricks hint step explains why the move is forced |
| The forced cell is the target, the evidence cells are marked distinctly, the forced color is not pre-placed, and a step is one self-contained journey | spec: A Bricks hint marks the forced cell and its evidence, and places nothing |
| The recursive lookahead rung is not narrated, the recorder omits it while the solver keeps it, and the hint refuses where the single-cell rung runs out | spec: The recursive lookahead rung is never narrated |
| The single-cell rung has an unclassified case, narrated as a break at a marked cell | untrue: `classifyShadeTrial` and `classifyUnshadeTrial` in `src/games/bricks/solver.ts` end in `unclassified`, which throws, `BricksReason` has five kinds and none for it, and `src/games/bricks/hint-text.ts` has no sentence for it, so the requirement says such a trial is an error and is never narrated |
| That case does not inherit the wording about following a chain of forced consequences | spec: A Bricks contradiction no named rule matches is an error, never a narration |
| The chain wording was the recursive rung's and was never true of this case | history |
| A hint is refused with a banner on a solved board, on a board `findMistakes` faults, and on placed cells that contradict the solution without breaking a rule, where the banner says a placed cell must be wrong | spec: A Bricks hint is refused on a solved, mistaken or contradicted board |
| Scenario: a forced move is explained by the rule it would break | spec: A Bricks hint step explains why the move is forced |
| Scenario: the lookahead rung never reaches a narration | spec: The recursive lookahead rung is never narrated |
| Scenario: the unclassified break is narrated as a break, not as a chain | untrue: no narration of an unclassified break exists, as `unclassified` in `src/games/bricks/solver.ts` throws, and the scenario is replaced by one in which every refutation has a named rule |
| Scenario: a hint is refused on a solved, mistaken, or wrong-but-legal board | spec: A Bricks hint is refused on a solved, mistaken or contradicted board |

## Bricks offers only difficulties that exist

| Rule | Where it went |
| --- | --- |
| Bricks offers Easy and `Unreasonable` and no third tier as a name, in the menu, the contract or the dialog | spec: Bricks offers only difficulties that exist |
| The third tier was upstream's | history |
| The tier stays decodable, parses and round-trips, is refused for a full parameter set with a message naming the difficulty and the tiers that exist, and is accepted otherwise | spec: The undeclared Bricks tier still loads and is never dealt |
| That refusal is `validateParams`' | untrue: `validateParams` in `src/games/bricks/state.ts` does not look at the tier, and the refusal is `itemError` in `src/engine/params.ts` reading the `retired` count `difficultyItem` is given, so the requirement says the engine refuses it from the retired choice |
| The tiers are lookahead depth, and depth 2 recurses the sub-solve | spec: The depth-2 rung stays in the Bricks solver |
| Depth 2 decides nothing depth 1 has not, by measurement | figure; held: src/games/bricks/state.ts "Depth 2 never pays." |
| Upstream documented the symptom and the port once kept it as a quirk | history |
| The depth-2 rung stays available to the solver, where hints and Solve use it at no cost | spec: The depth-2 rung stays in the Bricks solver |
| Mistake-checking uses the depth-2 rung | untrue: `findMistakes` in `src/games/bricks/solver.ts` runs the validity pass and never the solver, and only `hint` and `solve` in `src/games/bricks/index.ts` ask for `DIFF_TRICKY` |
| The cross-game contract does not cover the undeclared tier, so the game's own suite asserts its character round-trips | spec: The Bricks suite holds the undeclared tier's letter |
| Scenario: the undeclared tier is not generated | spec: The undeclared Bricks tier still loads and is never dealt |
| Scenario: the undeclared tier still round-trips through a game ID | spec: The undeclared Bricks tier still loads and is never dealt |
| Scenario: the generator refuses rather than exhausts its retries | spec: The undeclared Bricks tier still loads and is never dealt |

## Bricks grades the tiers it does offer

| Rule | Where it went |
| --- | --- |
| A board above the easiest tier is not soluble at the tier below, and the gate probes the tier immediately below the one asked for | spec: Bricks grades the tiers it does offer |
| Upstream probes at Easy whatever the tier | history |
| The rename changed no description, being a menu label | history; spec: Bricks parameters are a width, a height and a difficulty |
| Scenario: an Unreasonable board genuinely needs its own tier | spec: Bricks grades the tiers it does offer |

## Bricks solves and generates by deduction

| Rule | Where it went |
| --- | --- |
| The solver decides complete, unfinished or invalid from the three rules | spec: Bricks solves and generates by deduction |
| It places cells by contradiction with bounded lookahead, every tier is solvable by pure deduction, and it does not guess | spec: The Bricks solver places cells by contradiction |
| The generator fills, numbers and removes numbers in a random order while the puzzle stays uniquely solvable at its difficulty, reproducibly from a seed | spec: The Bricks generator keeps every puzzle uniquely solvable |
| Scenario: the solver reaches the unique solution | spec: Bricks solves and generates by deduction |
| Scenario: generation is reproducible from a seed | spec: The Bricks generator keeps every puzzle uniquely solvable |

## Bricks presets draw tall, and a Bricks board is never turned

| Rule | Where it went |
| --- | --- |
| Presets are 6×7 and 8×10, taller than wide, and `transposeParams` is not declared because a turned board is a different puzzle | spec: Bricks presets draw tall, and a Bricks board is never turned |
| The presets are upstream's 7×6 and 10×8 turned | history |
| Scenario: a Bricks board is dealt as chosen | spec: Bricks presets draw tall, and a Bricks board is never turned |

## A dealt Bricks board has a solution

| Rule | Where it went |
| --- | --- |
| The generator writes out only a board its solver completes at the difficulty asked for, solves the fully numbered board before removing a number, and starts again when that solve fails | spec: A dealt Bricks board has a solution |
| The second numbering can take away a supporting brick, and removal cannot repair a board that does not solve | spec: A dealt Bricks board has a solution; reason |
| Scenario: a board two squares wide loads from its own ID | spec: A dealt Bricks board has a solution |
| Scenario: a board at the smallest height loads from its own ID | spec: A dealt Bricks board has a solution |

## Bricks draws its shaded cells as pieces on a quiet surface

| Rule | Where it went |
| --- | --- |
| The board is pieces on a quiet surface, and a shaded cell holds the collection's square shaded piece inset on its cell | spec: Bricks draws its shaded cells as pieces on a quiet surface |
| A ruled-out cell is the undecided surface with the cross, an undecided cell the plain surface, and no state is a whole-cell fill or a step of gray | spec: No Bricks cell state is a fill of the whole cell |
| A clue sits on the lifted surface, the line between cells is the surface's grid line, and no cell has a bevel | spec: A Bricks clue sits on the lifted surface, and no cell is beveled |
| The cursor and both hint rings are drawn in the margin a piece leaves, and a gravity mark carries a rim | spec: Bricks draws its marks beside the piece |
| The game names no hue, in its hint sentences, its control words and its help page | spec: Bricks names no hue |
| Scenario: the three states are told apart without a fill | spec: No Bricks cell state is a fill of the whole cell |
| Scenario: a clue is told from a cell the player decides | spec: A Bricks clue sits on the lifted surface, and no cell is beveled |
| Scenario: a control names the ruled-out state by the collection's word | spec: Bricks names no hue |
