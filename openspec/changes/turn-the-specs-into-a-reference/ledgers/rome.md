# Ledger: rome

Base: bb004490

Where every rule of Rome's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Rome game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/rome/` implements `Game` for Rome and is registered | spec: Rome game implements the Game interface |
| The parameters, what validation requires of width, height and difficulty, and the game ID round-trip with an absent `x` read as a square board | spec: Rome's parameters |
| Validation "matching upstream" | history |
| It implements `findMistakes` because every tier is pure deduction on a unique board, and Check & Save hard-blocks on any mistake | spec: Rome game implements the Game interface |
| The two highlight preferences, the first on and the second off by default | spec: Rome's two highlight preferences |
| The preferences and their defaults are upstream's | history |
| Scenario: every preset produces a soluble board | spec: Rome's generator keeps every board soluble at its tier |
| Scenario: a game ID round-trips | spec: Rome's parameters |

## Rome descriptions use the region-border and clue encoding

| Rule | Where it went |
| --- | --- |
| The region layout is a run-length list over the inter-cell edges, a letter for a run of non-walls and `z` a maximal run with no trailing wall | spec: Rome descriptions use the region-border and clue encoding |
| A run of walls is written as a digit | untrue: a wall run is a decimal number of any length, `String(wrun)` in `encodeWallRuns` of `src/engine/wall-runs.ts` |
| The clue grid is a run-length sequence of letters for empty runs and `U`, `D`, `L`, `R`, `X` for fixed arrows and goals | spec: Rome descriptions use the region-border and clue encoding |
| Validation rejects invalid border characters, invalid clue characters, a region over four cells and a goal in a region not of size one | spec: Rome rejects a description that breaks its shape |
| Scenario: a generated description round-trips | spec: Rome descriptions use the region-border and clue encoding |
| Scenario: a goal in an oversized region is rejected | spec: Rome rejects a description that breaks its shape |

## Rome input, arrow placement, pencil marks and completion

| Rule | Where it went |
| --- | --- |
| Played by a drag for an arrow, a right-drag or the pencil key for a mark, or a keyboard cursor | spec: Rome places an arrow or a mark by drag or by keyboard cursor |
| A move onto a fixed clue, off the grid, or repeating the existing arrow changes no state and adds no history | spec: An input that changes nothing adds no history |
| Pencil marks are part of the state and round-trip through the save codec | spec: Pencil marks are part of Rome's state |
| Placing an arrow shows it, and what makes a board complete and reported solved | spec: Rome is complete when every arrow leads to a goal |
| Rendering draws outlines, arrows, goals, quadrant pencil marks, the optional goal highlight, the off-grid error tint and a completion flash, with no interpolated arrow animation | spec: What Rome draws |
| A duplicate arrow takes an inline error tint | untrue: a duplicate arrow the player placed is drawn in the error color, a fixed one stays in ink, and the square keeps its surface, `drawArrow` and the `color` choice in `redraw` of `src/games/rome/render.ts` |
| Scenario: dragging a direction places an arrow | spec: Rome places an arrow or a mark by drag or by keyboard cursor |
| Scenario: completing the grid wins | spec: Rome is complete when every arrow leads to a goal |
| Scenario: a duplicate arrow in a region is flagged as a mistake | spec: Mistake-checking reports the rule violations the board shows |

## Rome solves by deduction and generates soluble boards

| Rule | Where it went |
| --- | --- |
| A solver that fills the grid by pure deduction or reports invalid or incomplete, its rules gated by difficulty, never backtracking or guessing | spec: Rome's solver deduces and never guesses |
| Validity is judged by a disjoint-set forest of arrows, flagging off-grid, duplicate and looping arrows | spec: Rome judges validity with a forest of arrows |
| The generator uses the solver, fills single-cell regions, merges regions keeping arrows distinct, removes redundant clues, and accepts only a board soluble at its tier and not below | spec: Rome's generator keeps every board soluble at its tier |
| Generation from a seed is reproducible | spec: Rome generation is reproducible from a seed |
| Scenario: the solver completes a soluble board without guessing | spec: Rome's solver deduces and never guesses |
| Scenario: generation is reproducible from a seed | spec: Rome generation is reproducible from a seed |

## Rome mistake-checking covers arrows and marks that break no rule

| Rule | Where it went |
| --- | --- |
| Mistake-checking reports the off-grid arrow, the duplicate arrow and the loop the board already shows | spec: Mistake-checking reports the rule violations the board shows |
| Separately, an arrow that breaks no rule but contradicts the unique solution, re-derived from the fixed clues alone, with nothing reported on an undeducible board | spec: Rome mistake-checking covers arrows and marks that break no rule |
| A mark claims its arrow is possible, so non-empty marks excluding the answer are a mistake of their own kind, and a square with no marks is not one | spec: Marks that rule out the answer are a mistake |
| "Exactly as every other note-taking game in the collection reports one" | reason |
| Scenario: a legal-looking arrow that contradicts the solution is flagged | spec: Rome mistake-checking covers arrows and marks that break no rule |
| Scenario: a duplicate arrow in a region is flagged as a mistake | spec: Mistake-checking reports the rule violations the board shows |
| Scenario: marks that rule out the answer are a mistake | spec: Marks that rule out the answer are a mistake |
| Scenario: a square with no marks at all is not a mistake | spec: Marks that rule out the answer are a mistake |

## Rome fills and cleans candidate marks in one press

| Rule | Where it went |
| --- | --- |
| Rome answers Mark-all and declares `canMarkAll`, and the press is adaptive, filling then striking, with no move when nothing is left to strike | spec: Rome fills and cleans candidate marks in one press |
| The legal set is per square, all four less any pointing off the grid, the same set the solver seeds and the hint's populate fills, and the fill is additive | spec: The arrows a square can hold are counted per square |
| Scenario: the first press fills only what the grid's edges allow | spec: The arrows a square can hold are counted per square |
| Scenario: a later press removes only, and converges | spec: Rome fills and cleans candidate marks in one press |

## Rome explains its next deduction

| Rule | Where it went |
| --- | --- |
| An explained `hint()` on the shared candidate-elimination plan, refusing on a solved or mistaken board, narrating the next forced move by its premise in Rome's vocabulary | spec: Rome explains its next deduction |
| Every sentence rests on what the player can see or mark, and the square a step acts on is ringed rather than filled | spec: A Rome hint rests on what the player can see or mark |
| A step's evidence is shaded | untrue: no square is filled, the squares reasoned from are outlined and a named area is striped, the `outline` and `stripes` roles of `say` in `src/games/rome/hint-text.ts`, drawn by `HintMarks.paint` and `drawHatch` in `src/games/rome/render.ts`, and `hintMarks.roles` in `src/games/rome/index.ts` says so to the player |
| A walk's chain is numbered in order, and computed rather than assumed | spec: A walk in a Rome hint is numbered square by square |
| A walk's chain is shaded | untrue: the chain is outlined, `say.loop` in `src/games/rome/hint-text.ts` marks it with the `outline` role and `drawHintOrdinal` numbers it in `src/games/rome/render.ts` |
| Scenario: the hint survives the board that found this, there the pinned board | history |
| The script comes from a recording projection of the solver, which changes no deduction, with the reason | spec: The hint's recorder changes nothing the solver decides |
| Scenario: a deduction is narrated by its premise, not by its move | spec: A walk in a Rome hint is numbered square by square |
| Scenario: the recorder changes nothing the solver decides | spec: The hint's recorder changes nothing the solver decides |
| Scenario: a hint can be followed to a finished board | spec: Rome explains its next deduction |

## Rome offers one key per arrow, and a tap selects a square

| Rule | Where it went |
| --- | --- |
| A key for each arrow and a Clear key, what each does in each mode, and the drag still working beside them | spec: Rome offers one key per arrow, and a Clear key |
| A press and release that commits no move selects the square in both modes, with its reason | spec: A tap that commits no move selects the square |
| The selection's effect on highlight and notes mode is the note-taking cell's rule with the gesture's button, and a mouse-driven highlight goes after an arrow and stays through a mark | spec: A Rome selection follows the note-taking cell's rule |
| The selected square takes the note-taking cell's picture, and an armed cursor shows a `?` in the ink of what it will make | spec: The selected square is drawn with the note-taking cell's picture |
| Scenario: a square is entered without dragging | spec: Rome offers one key per arrow, and a Clear key |
| Scenario: the same key marks while notes mode is on | spec: Rome offers one key per arrow, and a Clear key |
| Scenario: a tap that commits nothing still selects | spec: A tap that commits no move selects the square |
| Scenario: an armed cursor prompts for its direction | spec: The selected square is drawn with the note-taking cell's picture |

## Rome refuses a pencil mark pointing off the grid

| Rule | Where it went |
| --- | --- |
| An off-grid pencil mark is refused on every way into notes, the drag previews none and its release selects, with the reason | spec: Rome refuses a pencil mark pointing off the grid |
| Executing a pencil move leaves no off-grid mark, so a move log holding one replays without it | spec: A replayed off-grid mark leaves no note |
| The move log was "saved before the refusal" | history |
| Placing such an arrow as a real entry stays a move the board flags | spec: An arrow placed pointing off the grid stays a move |
| Scenario: each way into notes refuses an off-grid mark | spec: Rome refuses a pencil mark pointing off the grid |
| Scenario: a replayed off-grid mark leaves no note | spec: A replayed off-grid mark leaves no note |
| Scenario: the hint survives the board that found this | spec: A replayed off-grid mark leaves no note |

## Rome draws its squares on a quiet surface and keeps its outlines

| Rule | Where it went |
| --- | --- |
| The cell surface, the lifted surface of a given under a fixed arrow or a goal, the inks of the two arrows, and the surface grid line inside a region | spec: Rome draws its squares on a quiet surface and keeps its outlines |
| An outline, the frame included, stays in ink at full width and turns a corner solid | spec: A region's outline is content |
| The goal's disc color, the settled square's wash of it, and the three tints that replace the surface | spec: Rome's goal takes the color for where the player is going |
| The completion flash sweeps a bright and a dim beat over each square's surface, in colors that read in both schemes | spec: Rome's completion flash sweeps the board |
| Scenario: a fixed arrow is told by the square under it | spec: Rome draws its squares on a quiet surface and keeps its outlines |
| Scenario: an outline is stronger than a grid line | spec: A region's outline is content |
| Scenario: the flash moves | spec: Rome's completion flash sweeps the board |
