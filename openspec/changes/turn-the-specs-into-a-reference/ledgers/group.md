# Ledger: group

Base: bb004490

Where every rule of Group's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Group game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/group/` implements `Game`, registered, for a grid that must be Latin and associative | spec: Group game implements the Game interface |
| A size from 3 to 26, five difficulties and a "show identity" flag | spec: Group's parameters |
| An identity-hidden 3×3 is rejected | spec: Group's parameters |
| Hiding the identity leaves every tier but Easy, declared as the modifier's `only`, with its reason | spec: Hiding the identity leaves every tier but Easy |
| The engine builds the Easy refusal from the declaration, and a board already written is not held to it | spec: Hiding the identity leaves every tier but Easy |
| The element numbering depends on the flag and affects the solution encoding and labels, not the description | spec: The identity flag sets how elements are lettered |
| Scenario: a generated board is a solvable group table | spec: Group game implements the Game interface |
| Scenario: an identity-hidden 3×3 is rejected by validation | spec: Group's parameters |
| Scenario: an identity-hidden Easy deal is rejected by validation with a reason, which the requirement's body gives to the engine | spec: Hiding the identity leaves every tier but Easy |
| Scenario: the Custom dialog hides the identity with Easy chosen | spec: Hiding the identity leaves every tier but Easy |

## Group descriptions use the upstream run-length encoding

| Rule | Where it went |
| --- | --- |
| Clues as decimal numbers, blank runs as letters, an underscore where numbers abut | spec: Group descriptions use the upstream run-length encoding |
| The solution is encoded separately in the identity-dependent letters | spec: Group descriptions use the upstream run-length encoding |
| Validation rejects a wrong cell count, telling too little from too much, an out-of-range number and an unknown character | spec: A Group description is validated against the grid area |
| Scenario: a generated description round-trips | spec: Group descriptions use the upstream run-length encoding |
| Scenario: a description of the wrong length is rejected | spec: A Group description is validated against the grid area |

## Group ports the graded group-axiom solver over the shared Latin solver

| Rule | Where it went |
| --- | --- |
| The shared Latin engine, with only Group's deductions and validator supplied | spec: Group ports the graded group-axiom solver over the shared Latin solver |
| Normal: associativity and the identity's row and column | spec: Each Group tier adds its own deductions |
| Tricky rules out identity candidates from a product that equals neither of its factors | untrue: `solverHard` in `src/games/group/solver.ts` rules an element out by a filled product of it that is not the other factor, which includes a product equal to the element itself; spec: Each Group tier adds its own deductions |
| Hard uses the generic set elimination and forcing | untrue: `solveGroup` in `src/games/group/solver.ts` sets `diffSet0` to the Tricky tier, so the plain set elimination runs at Tricky and Hard adds the harder variant and forcing; spec: Each Group tier adds its own deductions |
| Unreasonable is the generic recursion, and neither it nor Hard has a Group technique | spec: Each Group tier adds its own deductions |
| A completed grid is accepted only if associative | spec: Group ports the graded group-axiom solver over the shared Latin solver |
| No tier beyond the five, and none of the three techniques left unimplemented, since the grading depends on their absence | spec: Group ports the graded group-axiom solver over the shared Latin solver |
| The five tiers and the three techniques are the ones upstream ships and lists | history |
| Scenario: the solver grades a board at the intended difficulty | spec: Group ports the graded group-axiom solver over the shared Latin solver |
| Scenario: associativity is used as a deduction | spec: Each Group tier adds its own deductions |

## Group generation from the group data table

| Rule | Where it went |
| --- | --- |
| Select a group, decompress by breadth-first search, permute with the identity fixed when shown, remove clues while uniquely solvable | spec: Group generation from the group data table |
| Small sizes that cannot reach a tier are generated one tier easier | untrue: `newGameDesc` in `src/games/group/generator.ts` generates at the tier asked, and `validateParams` in `src/games/group/state.ts` refuses the size (`sizeLacksTier`, `tierTooRare`); spec: A size is refused at a tier none of its boards need |
| The downgrade exceptions are upstream's | history |
| Identity-hidden mode blanks the identity's row and column and one more of each, and re-verifies | spec: An identity-hidden board blanks two rows and columns |
| A board solvable one tier below the target is rejected | spec: Group generation from the group data table |
| Scenario: small sizes are downgraded rather than failing | untrue: `validateParams` in `src/games/group/state.ts` refuses such a size and nothing is dealt a tier easier; spec: A size is refused at a tier none of its boards need |
| Scenario: identity-hidden boards do not reveal the identity | spec: An identity-hidden board blanks two rows and columns |

## Group input, gameplay aids and rendering

| Rule | Where it went |
| --- | --- |
| Selecting a cell and typing an element letter fills it, and right-click selects for pencil marks | spec: Group fills a cell from a selection |
| Typing an element's number fills the cell | untrue: `interpretMove` in `src/games/group/index.ts` takes an entry only where `isChar` holds, which is a letter, and `requestKeys` offers letters only |
| A diagonal drag from a selected cell fills a whole diagonal at once | spec: A diagonal drag fills a whole diagonal at once |
| Filling is idempotent, and an immutable cell may be set to the value it holds | spec: Group fills a cell from a selection |
| Dragging a header repositions a row and column, and a divider marks a boundary until its two elements part | spec: Group's rows and columns reorder, and take subgroup dividers |
| `findMistakes` is provided, since the puzzle is uniquely solvable | spec: Group game implements the Game interface |
| The legend, pencil marks in a grid, the selection, errors in the error color, and the completion flash | spec: Group draws its legend, marks and errors |
| The leading diagonal is stroked through its cells | spec: The leading diagonal is a stroke, not a shade |
| Dividers are edges in ink against the quiet grid | spec: Only a subgroup divider is drawn in ink |
| Scenario: a diagonal multifill sets several cells at once | spec: A diagonal drag fills a whole diagonal at once |
| Scenario: reordering rows carries its divider correctly | spec: Group's rows and columns reorder, and take subgroup dividers |
| Scenario: a completed valid table wins | spec: Group game implements the Game interface |

## Group provides an explained deduction hint

| Rule | Where it went |
| --- | --- |
| `hint` returns a plan of steps, from a sound cube seeded from placed entries only, built by walking a working copy | spec: Group provides an explained deduction hint |
| A naked single is preferred first, placed by a `set` move | spec: Group's own placements lead the eliminations |
| A lazy populate step, emitted only when some empty cell lacks notes | spec: Notes are penciled in only when an elimination needs them |
| The populate step is emitted on every plan | untrue: Group starts on the implicit reading (`newUi` in `src/games/group/state.ts`), under which `runCandidatePlan` in `src/engine/candidate-plan.ts` has no populate. It holds under the populate reading, as the new requirement says |
| Populate and the strikes are made by a `pencil` move | untrue: the plan fills by `pencilAll` and strikes by `pencilStrike` (`groupCandidateMoves` in `src/games/group/index.ts`) |
| The row and column eliminations a placed value implies are struck | spec: Notes are penciled in only when an elimination needs them |
| Group's own deductions come after the Latin eliminations | untrue: `buildSteps` in `src/games/group/index.ts` gives the walk a rung (`leads`) that runs before the recorded strikes, so associativity and the identity fill lead, with every single the board shows until the notes are set up; spec: Group's own placements lead the eliminations |
| The associativity placement, the identity fill and the identity-mark elimination | spec: The hint teaches Group's three deductions |
| The identity-mark elimination needs a product equal to neither factor and rules out both | untrue: under recording `solverHard` fires once per element, on a product of it that is not the other factor; spec: The hint teaches Group's three deductions |
| A forced generic placement, naked or hidden, narrated by which, re-derived from the working board | spec: A generic placement says whether it is naked or hidden |
| Narration meets the quality bar, names cells by letter, and the associativity step states its triple and products | spec: A Group hint's narration explains why |
| One firing is one journey, with `continuesPrevious` legs and a shared target color | spec: One firing of a deduction is one journey |
| Refused when solved or mistaken, by the midend, lighting the overlay | spec: A Group hint is refused on a solved or mistaken board |
| Capped below recursion, and refuses honestly when nothing is forced | spec: The hint never teaches a guess |
| Every step is monotone progress, a recomputed hint leads to a solved board, and recompute skips what the board reflects | spec: Every hint step is monotone progress |
| A note is added by populate alone | untrue: under the implicit reading `noteLeg` and `fold` in `src/engine/candidate-plan.ts` write notes by a `pencilAdd` move, so the rule says a note added; spec: Every hint step is monotone progress |
| "The cross-game resume guarantee" | reason |
| `hintKeepTrack`'s verdicts and `refreshHintStep`'s dropping of dead marks | spec: A stored Group plan follows the player's moves |
| Recording is gated so the path with it off is byte-for-byte unchanged | spec: Recording leaves the solver's verdicts alone |
| One recorded firing maps to exactly one `group` | spec: One firing of a deduction is one journey |
| Scenario: associativity forces a placement and the hint teaches why | spec: The hint teaches Group's three deductions |
| That scenario's three product cells are shaded as evidence | untrue: `say.associativity` in `src/games/group/hint-text.ts` marks them `outline`, and `redraw` in `src/games/group/render.ts` draws evidence on the cell's border |
| Scenario: the identity's row and column are filled as one journey | spec: One firing of a deduction is one journey |
| Scenario: identity-hidden mode rules out an identity mark | spec: The hint teaches Group's three deductions |
| That scenario strikes the marks of both factors, narrated "neither can be the identity" | untrue: one step strikes one element's marks, and `say.identityElim` in `src/games/group/hint-text.ts` says the product is not the other factor "as it would be if" the element "were the identity" |
| Scenario: the hint resumes from a self-played mid-game position | spec: Every hint step is monotone progress |
| Scenario: the hint refuses on a board with mistakes | spec: A Group hint is refused on a solved or mistaken board |

## Group's Check & Save flags pencil marks that have crossed out the answer

| Rule | Where it went |
| --- | --- |
| Marks that leave out the answer are a `note` mistake, marks that include it are not, and the hint refuses meanwhile | spec: Group's Check & Save flags pencil marks that have crossed out the answer |
| Scenario: marks without the answer are a mistake and the hint refuses | spec: Group's Check & Save flags pencil marks that have crossed out the answer |
| Scenario: extra candidates beside the answer are not a mistake | spec: Group's Check & Save flags pencil marks that have crossed out the answer |

## Group's table order and subgroup lines have keyboard routes

| Rule | Where it went |
| --- | --- |
| Every arrangement change the pointer makes is reachable by the keyboard alone | spec: Group's table order and subgroup lines have keyboard routes |
| Shift and an arrow move the cursor's column or row, the cursor stays on its element, and a hidden cursor is only shown | spec: Shift and an arrow move the cursor's row or column |
| A bar and a minus toggle the line after the column or below the row, and do nothing at the last | spec: Two keys toggle the subgroup line beside the cursor |
| Scenario: Shift+Right moves a column as dragging its heading does | spec: Shift and an arrow move the cursor's row or column |
| Scenario: the bar toggles the line a click between headings toggles | spec: Two keys toggle the subgroup line beside the cursor |

## Group draws its table on a quiet surface, with a given's cell lifted

| Rule | Where it went |
| --- | --- |
| A cell the player fills is the cell surface and a given's the lifted surface, and the legend stays outside | spec: Group draws its table on a quiet surface, with a given's cell lifted |
| The line and the frame are the surface grid line, the frame no heavier, and a divider stays in ink | spec: Only a subgroup divider is drawn in ink |
| The leading diagonal is a stroke under the content, never a shade | spec: The leading diagonal is a stroke, not a shade |
| The selection's wash and pencil corner go over either surface, and the hint's marks stay at the edge | spec: The selection and the hint keep clear of a cell's surface |
| Scenario: a given is told by the cell under it | spec: Group draws its table on a quiet surface, with a given's cell lifted |
| Scenario: only a divider is heavy | spec: Only a subgroup divider is drawn in ink |
