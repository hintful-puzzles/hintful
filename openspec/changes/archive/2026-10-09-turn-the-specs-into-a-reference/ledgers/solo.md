# Ledger: solo

Base: bb004490

Where every rule of Solo's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters, and a rule found
false of the code corrected to it.

## Solo game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `solo` game implements `Game`, a Latin square on a `cr × cr` grid with some cells given | spec: Solo game implements the Game interface |
| The six type arguments of `Game` | untrue: `soloGame` in `src/games/solo/index.ts` is a `Game` of eight, with `SoloHint` and `SoloRung` after `SoloMistake`. The rewrite names the interface and not its arguments |
| Four composable variants, the params record and the two difficulty axes | spec: Solo's four variants compose |
| It provides `solve` and `findMistakes` and reports `canMarkAll = true` | spec: Solo game implements the Game interface |
| Scenario: variants are served from one registered game | spec: Solo's four variants compose |

## Solo encodes and decodes its parameters

| Rule | Where it went |
| --- | --- |
| The base string, the `x` and `k` letters, and the symmetry and difficulty suffixes of full mode with their omitted defaults | spec: Solo encodes and decodes its parameters |
| "The upstream string" | history |
| `decodeParams` is lenient, accepts the legacy `{c}x{r}j` form and round-trips the presets | spec: Solo decodes its parameters leniently |
| `validateParams` enforces the bounds, killer dimensions below 10 among them | spec: Solo refuses parameters outside its bounds |
| `validateParams` enforces a known difficulty | untrue: `validateParams` in `src/games/solo/state.ts` reads no tier for being known. The difficulty is a `difficultyItem` choice in `paramConfig`, and the engine refuses a choice outside its list |
| `validateParams` enforces every upstream bound | untrue: its doc comment in `src/games/solo/state.ts` says it is upstream's less the single-field limits, which are the `bounds` of the `numberItem`s in `src/games/solo/index.ts` and are refused by the engine |
| Scenario: params round-trip across variants | spec: Solo encodes and decodes its parameters |
| Scenario: invalid params are rejected, out-of-range dimensions | spec: Solo refuses parameters outside its bounds |
| Scenario: `validateParams` returns an error for an unknown difficulty | untrue: the engine refuses it, as above |

## Solo descriptions encode givens, block structure, and killer cages

| Rule | Where it went |
| --- | --- |
| The givens grid, then a jigsaw board's block structure, then a killer board's cage structure and cage-sum grid, each behind a comma | spec: Solo descriptions encode givens, block structure, and killer cages |
| `newState` rebuilds the block partition, the cage partition and each cage's sum, and flags givens immutable | spec: Solo decodes a description into its partitions |
| The partition is a disjoint-set structure | reason |
| `validateDesc` rejects a malformed grid, block structure or cage-sum grid | spec: Solo decodes a description into its partitions |
| Scenario: a description round-trips through generate and decode | spec: Solo descriptions encode givens, block structure, and killer cages |
| Scenario: a malformed description is rejected | spec: Solo decodes a description into its partitions |

## Solo solves with its bespoke graded solver

| Rule | Where it went |
| --- | --- |
| A self-contained solver of a candidate cube and per-group position grids, built from a constraint-group list so X and jigsaw share the technique loops | spec: Solo solves with its bespoke graded solver |
| "A port of upstream's `solver_usage` model" | history |
| The standard and the killer techniques, in difficulty order | spec: The techniques Solo's solver implements |
| `solveSolo` returns the difficulty reached, or an impossible or ambiguous sentinel | spec: Solo solves with its bespoke graded solver |
| Scenario: the solver grades a known board | spec: Solo solves with its bespoke graded solver |
| Scenario: the solver detects an inconsistent board | spec: Solo solves with its bespoke graded solver |

## Solo interprets digit, pencil, and mark-all input

| Rule | Where it went |
| --- | --- |
| A left-click highlights a cell for a real entry, and a right-click highlights an empty cell for a pencil mark and toggles a persistent mode when sticky | spec: Solo selects a cell by pointer or keyboard |
| Cursor-select highlights a cell for a real entry and select2 highlights one for a pencil mark | untrue: in `interpretMove` in `src/games/solo/index.ts` the select key goes to `toggleNoteTakingMode`, which toggles pencil mode while the highlight shows, and `CURSOR_SELECT2`, which is space, clears the cell |
| A right-click on a given or filled cell toggles pencil mode and does not select the cell | spec: Solo selects a cell by pointer or keyboard |
| That right-click rule holds whatever the sticky preference | untrue: `applyPress` in `src/engine/note-taking-cell.ts` leaves the highlight alone only on the sticky branch. With sticky off the press turns pencil mode on and moves the highlight to the cell, hidden |
| A digit key enters the digit or toggles the pencil mark, and backspace or space clears | spec: Solo interprets digit, pencil, and mark-all input |
| Keyboard cursor movement | spec: Solo selects a cell by pointer or keyboard |
| `M` or `m` fills every empty cell with all candidate pencil marks | untrue: `adaptiveMarkAllMove` in `src/engine/candidate-hint.ts` yields `pencilAll` only while an empty cell has no marks, `applyNoteMove` fills only those cells, and on a fully noted board the key strikes the obvious candidates or makes no move |
| What the mark-all key does | spec: Mark-all fills the cells without notes, then clears the obvious |
| Entering a digit equal to the cell's contents is a no-op that hides the mouse highlight | spec: Solo interprets digit, pencil, and mark-all input |
| With auto-pencil on, a real placement strikes the digit from every other cell of its no-repeat regions | spec: Auto-pencil strikes a placed digit from its no-repeat regions |
| `executeMove` returns a new state and never mutates its input | spec: Solo interprets digit, pencil, and mark-all input |
| A placement that completes the grid marks the state completed | untrue: `SoloState` in `src/games/solo/state.ts` has no completed flag, and `status` derives solved from the grid through `checkValid` |
| When a board is solved | spec: Solo is solved when every region holds every digit |
| Scenario: placing and penciling digits | spec: Solo interprets digit, pencil, and mark-all input |
| Scenario: mark-all fills pencil candidates | spec: Mark-all fills the cells without notes, then clears the obvious |

## Solo renders blocks, cages, diagonals, digits, pencil marks, and overlays

| Rule | Where it went |
| --- | --- |
| Thick block boundaries from the partition in one pass, cage-sum labels, givens distinct from player digits, auto-sized pencil marks, the highlights, live errors, the mistake overlay and the completion flash | spec: Solo renders blocks, cages, diagonals, digits, pencil marks, and overlays |
| The killer cages are drawn as dashes | untrue: `drawNumber` in `src/games/solo/render.ts` draws a cage's outline with `drawLine` in `COL_KILLER`, inset from the cell's edge, and no call there dashes a line |
| The two diagonals are stroked through their cells on an X board | spec: An X board's diagonals are a stroke, never a shade |
| A CapsLock-style indicator is shown while pencil mode is on | spec: A pencil-mode indicator shows while pencil mode is on |
| The indicator shows only for the persistent mode | untrue: `redraw` in `src/games/solo/render.ts` passes `ui.pencilMode` to `repaintPencilIndicator` whether or not the mode is sticky |
| The palette keeps the upstream enum's indices with the fork's colors appended | spec: Solo's palette keeps the upstream indices |
| A per-tile diff cache on an `Int32Array`, with every overlay outside the tile value in the diff key | spec: Solo's tile cache repaints a cell an overlay changes |
| Scenario: variant decorations are drawn | spec: Solo renders blocks, cages, diagonals, digits, pencil marks, and overlays |
| Scenario: the cage outlines are dashed | untrue: as above, the outlines are plain inset lines |
| Scenario: the mistake overlay repaints on an already-drawn cell | spec: Solo's tile cache repaints a cell an overlay changes |

## Solo flags mistakes against its unique solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves from the givens and cage sums, never the notes, and returns wrong digits as `"cell"` and crossed-out solution digits as `"note"` | spec: Solo flags mistakes against its unique solution |
| The result is empty when the board is not uniquely solvable from the givens | spec: Solo flags mistakes against its unique solution |
| It drives Check & Save, which blocks a quick-save while any mistake exists | spec app-shell: Checking a board never costs a player their checkpoint |
| Scenario: a wrong digit and a wrong note are flagged | spec: Solo flags mistakes against its unique solution |

## Solo exposes pencil-mark preferences

| Rule | Where it went |
| --- | --- |
| A sticky-pencil preference, default on, and an auto-pencil preference, default off, through `prefs` | spec: Solo exposes pencil-mark preferences |
| What auto-pencil strikes when on | spec: Auto-pencil strikes a placed digit from its no-repeat regions |
| A keep-mouse-highlight preference through `prefs` | spec: Solo exposes pencil-mark preferences |
| The keep-highlight preference defaults off, matching upstream | untrue: `newUi` in `src/games/solo/state.ts` sets `pencilKeepHighlight: true`, and the field's comment says upstream's defaults off |
| Preference values live on the `Ui` and `newUi` sets their defaults | spec: Solo exposes pencil-mark preferences |
| With auto-pencil off, note cleanup is manual, by mark-all or a hint | spec: Solo exposes pencil-mark preferences |
| The auto-pencil label names the relation and lists no region, and why | spec: The auto-pencil label names the relation, not the regions |
| The label that listed row, column and block was wrong on X and Killer boards | history |
| Scenario: the preferences are exposed with their defaults | spec: Solo exposes pencil-mark preferences |
| Scenario: the keep-highlight boolean defaults to off | untrue: it defaults to on, as above |
| Scenario: the auto-pencil label holds on every mode | spec: The auto-pencil label names the relation, not the regions |

## Solo provides an explained deduction hint

| Rule | Where it went |
| --- | --- |
| `hint(state, aux?, ui?)` returns a plan of steps teaching the next deduction in notes terms, from a cube seeded by placed entries only, built by walking a working copy | spec: Solo provides an explained deduction hint |
| The order preferred: a naked single, then the notes' setup, then a deductive elimination, then a forced placement | spec: The order Solo's hint prefers |
| A naked single is sound on a mistake-free board, since its candidate is then the solution | reason |
| The lazy populate by `pencilAll`, emitted only when an empty cell lacks notes, and the basic-region strikes a placed or given value implies | spec: The setup of the notes follows the reading the player chose |
| The populate step comes on any board with no notes | untrue: `newUi` in `src/games/solo/state.ts` sets `candidateReading: "implicit"`, under which `CandidateWalk` in `src/engine/candidate-plan.ts` sets up with the clean alone and pencils nothing in. The fill-all step is the populate reading's |
| The basic-region strikes reach the row, column, sub-block and diagonals | untrue: the clean reads `regionsOf` in `src/games/solo/index.ts`, which adds the cell's killer cage. The rewrite says the no-repeat regions |
| The kinds of technique firing an elimination can be | spec: The eliminations Solo's hint teaches |
| A forced placement is narrated as a naked or a positional single, re-derived from the working board | spec: A forced placement is narrated by which single it is |
| A narration leads with the indication, then the reasoning, then a necessity-voice conclusion | spec: Solo's narration leads with what was spotted |
| "Meeting the hint quality bar" | guide: docs/games/hints.md § "The quality bar" |
| Every placement concludes "can only be N" | untrue: `say.hiddenSingle` and `say.cageSingle` in `src/games/solo/hint-text.ts` conclude "must be N", and only the naked single says "it can only be N". The rewrite gives both |
| One firing forcing several strikes is one journey, and its equivalent strikes share the target color | spec: One firing is one journey and one group |
| Each element type named in one step has a stable color paired with a non-color cue | spec: Solo's hint marks pair each color with a shape |
| The cues are a shade, a ring and a cross-through | untrue: `hintMarks.roles` in `src/games/solo/index.ts` declares a ring, an outline and stripes, and `drawPencilMarks` in `src/games/solo/render.ts` draws a line through a struck candidate. No cell is shaded |
| "Per the cross-game hint color-legend convention" | guide: docs/games/hints.md § "The element-type color legend" |
| The auto-pencil preference folds a placement's trivial eliminations in, or has them taught as continuations | spec: Auto-pencil governs the eliminations a placement implies |
| A hint is refused on a solved or mistaken board, and the refusal lights the mistake overlay | spec: A hint is refused on a solved or mistaken board |
| Solo's `hint` returns those two refusals | untrue: `computeHintPlan` in `src/engine/midend.ts` returns `ALREADY_SOLVED` and `FIX_MISTAKES_FIRST` before it calls the game's `hint`, and `hint` in `src/games/solo/index.ts` asks `findMistakes` nothing |
| The deduction is capped below recursion, so a board needing a guess is reported as not deducible | spec: Solo's hint never narrates a guess |
| Every step is monotone progress, a recomputed hint leads to a solved board, and a recompute skips what the board already shows | spec: Every hint step is monotone progress |
| The note a step adds is always populate's | untrue: under the implicit reading the walk writes a cell's notes with `pencilAdd`, an arm of `SoloMove` in `src/games/solo/state.ts`. The rewrite says a note added |
| "The cross-game resume guarantee" | reason |
| `hintKeepTrack` advances on a matching move and drops the plan otherwise | spec: Solo keeps a displayed plan on track |
| `refreshHintStep` drops a stored step's dead marks, or resolves the step, before each display | spec: A kept step is refreshed before it is shown |
| A `pencilStrike` clearing a subset of the step's marks is on track | untrue: `keepCandidateHintTrack` in `src/engine/candidate-hint.ts` completes on a `pencilStrike` of exactly the step's marks and is `off` for any other, and it is a pencil toggle clearing one mark that shrinks the step |
| Recording is gated so the generate and solve path is unchanged with it off, since the solver is Solo's own | spec: Recording leaves the solve path unchanged |
| One recorded firing maps to exactly one `group` | spec: One firing is one journey and one group |
| Scenario: a region elimination is taught as a note strike, its move | spec: Solo provides an explained deduction hint |
| Scenario: the same, its narration | spec: Solo's narration leads with what was spotted |
| Scenario: the same, the region's cells shaded and the struck candidates in the hint color | untrue: the region is striped through `mark.this("stripes", …)` in `src/games/solo/hint-text.ts`, and `drawPencilMarks` in `src/games/solo/render.ts` strikes a candidate through in the pencil color. The rewrite's case is under Solo's hint marks pair each color with a shape |
| Scenario: a killer-cage deduction is taught on a killer board | spec: The eliminations Solo's hint teaches |
| The sentence reads "this cage must sum to V" | untrue: `say.cageMinMax` in `src/games/solo/hint-text.ts` reads "This killer cage must total V" |
| Scenario: a positional single is named by its region | spec: A forced placement is narrated by which single it is |
| The region is shaded and the cell marked | untrue: `say.hiddenSingle` in `src/games/solo/hint-text.ts` stripes the region and rings the cell |
| Scenario: an empty board is populated before elimination | spec: The setup of the notes follows the reading the player chose |
| Scenario: the hint resumes from a self-played position | spec: Every hint step is monotone progress |
| Scenario: the hint refuses on a board with mistakes | spec: A hint is refused on a solved or mistaken board |
| Scenario: the hint declines when only a guess remains | spec: Solo's hint never narrates a guess |

## Solo provides on-screen key labels

| Rule | Where it went |
| --- | --- |
| `requestKeys` returns one button per symbol, labeled by its character, then a clear key | spec: Solo provides on-screen key labels |
| Scenario: a 9-symbol board shows 1 to 9 and clear | spec: Solo provides on-screen key labels |
| Scenario: a smaller board shows fewer digits | spec: Solo provides on-screen key labels |

## Solo generates boards uniquely solvable at exactly the requested difficulty

| Rule | Where it went |
| --- | --- |
| A full solution grid under every active constraint, with jigsaw blocks from `divvy` | spec: Solo generates boards uniquely solvable at exactly the requested difficulty |
| `divvy` was "lazily ported" | history |
| Givens are removed in symmetry orbits by re-running the graded solver | spec: Givens are removed in symmetry orbits |
| Every variant has givens removed | untrue: `newSoloDesc` in `src/games/solo/generator.ts` publishes a killer board with no givens, kept when `dlev.diff === maxdiff && dlev.kdiff === maxkdiff`, and removes orbits only on the non-killer path |
| A board is kept only when uniquely solvable at exactly the requested difficulty, and regenerated otherwise | spec: Solo generates boards uniquely solvable at exactly the requested difficulty |
| A capped-iteration backstop throws | spec: Generation is bounded |
| Scenario: a generated board is uniquely solvable at its difficulty | spec: Solo generates boards uniquely solvable at exactly the requested difficulty |

## Solo marks every board element its hint sentence points at

| Rule | Where it went |
| --- | --- |
| A step marks every cell its narration points at, and carries the cells where the firing is not over a `SoloRegion` | spec: Solo marks every board element its hint sentence points at |
| This covers the deduced extra-cage and the single-digit row-versus-column elimination | spec: The two rungs whose premise is not a region carry their cells |
| Scenario: the deduced extra-cage shows the region it counted | spec: Solo marks every board element its hint sentence points at |
| The region's cells are shaded | untrue: `say.cageSingle` in `src/games/solo/hint-text.ts` stripes the region through `thisRegion` and rings the open cell |
| Scenario: the locked pattern shows its own cells | spec: The two rungs whose premise is not a region carry their cells |

## Every killer sum Solo cites is worked out from the board in one step

| Rule | Where it went |
| --- | --- |
| The region rule derives its sums afresh each pass and keeps no derived part of a cage as a working cage | spec: Every killer sum Solo cites is worked out from the board in one step |
| The three sums a killer deduction can rest on | spec: A killer sum has one of three origins |
| A recorded killer reason says which, and its `reads` name every filled cell the sum rests on | spec: A killer sum has one of three origins |
| The hint narrates each sum by what it came from, calling nothing a cage the board does not show and no cage's other cells filled while one is open | spec: A killer sum is narrated by what it came from |
| Scenario: a killer single's cage is filled wherever the hint says so | spec: Every killer sum Solo cites is worked out from the board in one step |
| Scenario: a sum the region rule leaves is narrated from its region | spec: A killer sum is narrated by what it came from |
| Scenario: a recorded killer sum follows from the board and its reads | spec: A killer sum has one of three origins |

## Solo's solver is a certified deduction ladder whose rungs run alone

| Rule | Where it went |
| --- | --- |
| The techniques run as a `runDeductionFixpoint` ladder of named rungs in the stated order | spec: Solo's solver is a certified deduction ladder whose rungs run alone |
| The order is "upstream's" | history |
| Each rung has its tier on its own scale, the ladder holds only the rungs both caps admit, and a firing raises its own scale's grade | spec: Each rung is graded on its own scale |
| A rung reads nothing an earlier rung left in the same pass, so the replay runs a rung alone | spec: Solo's solver is a certified deduction ladder whose rungs run alone |
| A firing census over pinned boards of every variant, at every pair of caps and at search, asserts every rung fires | spec: A census certifies that every rung fires |
| The hand-written loop is not kept | spec: Solo's solver is a certified deduction ladder whose rungs run alone |
| "Once the adoption is proved" and "git holds it" | history |
| A killer region left nothing for its open cells is a contradiction | spec: A killer region left nothing is a contradiction |
| Scenario: a mis-tiered or reordered rung fails | spec: A census certifies that every rung fires |
| Scenario: a premise cut short is found | spec: Solo's solver is a certified deduction ladder whose rungs run alone |
| Scenario: a region left nothing is not a solve | spec: A killer region left nothing is a contradiction |

## Solo draws its digits on a quiet surface, with a given's cell lifted

| Rule | Where it went |
| --- | --- |
| A filled cell is on the cell surface and a given's cell on the lifted surface | spec: Solo draws its digits on a quiet surface, with a given's cell lifted |
| The line inside a block is the surface grid line, a block's boundary and the frame stay ink, and other content keeps its own color | spec: Only a block's boundary and the frame are heavy |
| An X board's diagonals are a stroke in the grid line's color under the content, never a shade | spec: An X board's diagonals are a stroke, never a shade |
| The selection's wash and pencil-mode corner are drawn over whichever surface the cell has | spec: Solo draws its digits on a quiet surface, with a given's cell lifted |
| The hint's marks stay in the gutter | spec: The hint's ring and outline stay in the gutter |
| Every hint mark is in the gutter | untrue: `drawNumber` in `src/games/solo/render.ts` hatches a striped cell inside the tile with `ds.hint.drawHatch`, between its background and its content, and draws a struck candidate's line among the pencil marks. The ring and the outline are the gutter's, through `markBand` |
| Scenario: a given is told by the cell under it | spec: Solo draws its digits on a quiet surface, with a given's cell lifted |
| Scenario: only a block's boundary is heavy | spec: Only a block's boundary and the frame are heavy |

## Solo's single-digit pattern step marks the lines it read

| Rule | Where it went |
| --- | --- |
| The step marks the cells the digit is left with and the other cells of the confining lines, and its narration points at them and names the lines as rows or columns | spec: Solo's single-digit pattern step marks the lines it read |
| A firing reads two ways, and the step names whichever is fewer lines | spec: A single-digit pattern step names the fewer lines |
| Scenario: a replay from the marked cells reaches the same strike | spec: Solo's single-digit pattern step marks the lines it read |
| Scenario: the player can check the step from the frame | spec: Solo's single-digit pattern step marks the lines it read |
| Scenario: the step names the fewer lines | spec: A single-digit pattern step names the fewer lines |
