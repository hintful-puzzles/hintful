# Ledger: dominosa

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Dominosa game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `dominosa` game partitions the grid into dominoes that are exactly the `DCOUNT(n)` pairs, one of each, matching the clues | spec: Dominosa game implements the Game interface |
| The game implements `Game` with six named type arguments | untrue: `dominosaGame` in `src/games/dominosa/index.ts` is a `Game` of eight type arguments, the last two being `DominosaHint` and `DominosaRung`, so the requirement now says `Game` and lists none |
| The grid is `n+1` by `n+2` when tall and `n+2` by `n+1` when not | spec: Dominosa game implements the Game interface |
| The wide board is upstream's | history |
| Params are `n` (default 6), `diff` and `tall`, encoded `{n}`, `t` when tall, and a full-form `d{t,b,h,e}` suffix | spec: Dominosa params are the highest number, a tier and the tall flag |
| An encoding without `t` decodes as the wide board, so the id names the board its desc was laid out for | spec: Dominosa params are the highest number, a tier and the tall flag |
| Such ids were written before `tall` existed | history |
| `da` and bare `a` name no tier, so the default tier stands | spec: An id asking for an unchecked board names no tier |
| The fourth tier is named `Unreasonable`, because its forcing chain is a search over a closure of all placements | spec: The fourth Dominosa tier is named Unreasonable and keeps its character |
| Upstream called that tier `Extreme` | history |
| All upstream presets are offered, dealt tall | spec: Dominosa offers upstream's presets, dealt tall |
| There are 12 presets | figure |
| `validateParams` enforces `n ≥ 1` and a valid difficulty | untrue: `validateParams` in `src/games/dominosa/state.ts` tests no minimum of `n` and no range of `diff`. The minimum is `bounds: { min: 1 }` on the `n` item of `paramConfig` and the tiers are the difficulty item's choices, both of which `paramsError` in `src/engine/params.ts` checks before it calls the game. What `validateParams` does refuse of a difficulty, in full form, is a tier above Easy at `n = 1` and above Normal at `n = 2`. The requirement now states each, in spec: Dominosa refuses params outside its bounds |
| `validateParams` enforces the overflow bound | spec: Dominosa refuses params outside its bounds |
| The game provides `solve` and `textFormat` | spec: Dominosa game implements the Game interface |
| `textFormat` is provided for `n < 1000` only | spec: Dominosa game implements the Game interface |
| Scenario: params round-trip to `6dh` | spec: Dominosa params are the highest number, a tier and the tall flag |
| Scenario: the fourth tier still encodes as `de` | spec: The fourth Dominosa tier is named Unreasonable and keeps its character |
| That scenario's rename and the ids written before it | history |
| Scenario: `validateParams` given `n = 0` returns an error | untrue: `validateParams` returns null for `n = 0`, and it is the engine's check of the `n` item's minimum that refuses it, so the scenario now names the engine |
| Scenario: an id without `t` loads as the wide board | spec: Dominosa params are the highest number, a tier and the tall flag |
| Scenario: the default board is dealt tall | spec: Dominosa params are the highest number, a tier and the tall flag |

## Dominosa descriptions carry the clue grid

| Rule | Where it went |
| --- | --- |
| The desc format, the shared frozen `numbers` array, and what `validateDesc` rejects, with both scenarios | spec: Dominosa descriptions carry the clue grid |

## Dominosa input places dominoes and barrier edges

| Rule | Where it went |
| --- | --- |
| A left-click or `CURSOR_SELECT` toggles a domino, erasing overlapping dominoes and barrier edges | spec: Dominosa input places dominoes and barrier edges |
| A right-click or `CURSOR_SELECT2` between two empty squares toggles a barrier edge, which never affects the win and is forbidden next to a domino | spec: Dominosa input places dominoes and barrier edges |
| A right-click on a number, or a digit key, toggles it in one of two value-highlight slots, a UI-only aid | spec: A right-click on a number or a digit key toggles a value highlight |
| Cursor keys move a half-grid cursor over the `(2w−1) × (2h−1)` lattice | spec: The Dominosa keyboard cursor walks the half-grid |
| Scenario: placing a domino erases an overlapping one | spec: Dominosa input places dominoes and barrier edges |
| Scenario: a barrier edge cannot be drawn next to a domino | spec: Dominosa input places dominoes and barrier edges |

## Dominosa detects completion and flags mistakes

| Rule | Where it went |
| --- | --- |
| The board is completed when the placed dominoes are the full set with no repeat, and it flashes on the transition unless reached via Solve | spec: Dominosa detects completion |
| `findMistakes` re-solves and returns both cells of every placed domino the solution lacks, a board without a unique solution yields none, and blanks and barrier edges are never flagged | spec: Dominosa flags a domino the unique solution lacks |
| The renderer overlays flagged cells distinctly from the always-on red clash highlight | spec: A flagged cell is drawn distinctly from a clash |
| Scenario: a wrong placement is flagged and Check & Save refuses | spec: Dominosa flags a domino the unique solution lacks |
| Scenario: a mistake overlay repaints on a later frame | spec: A flagged cell is drawn distinctly from a clash |

## Dominosa provides an explained deductive hint

| Rule | Where it went |
| --- | --- |
| `Game.hint(state)` returns a narrated plan from the current board, one solver firing at a time, seeded from the placed dominoes, each step with a forced move and why it is forced | spec: Dominosa provides an explained deductive hint |
| The solver is a ported one, and the bar is Palisade's | history |
| A placement step when a domino has exactly one remaining spot, the move placing it | spec: A placement step places a domino that has one spot left |
| A placement step when a square can pair with only one domino | untrue: `firstFiring` in `src/games/dominosa/solver.ts` places from a square that has one placement left, which `hint-text.ts` reads as "has only one neighbor left to pair with". A square that can be part of only one domino is the `squareSingleDomino` rung, a barrier, so the requirement now states each |
| A barrier step when a technique proves a spot cannot hold a domino, the move drawing that edge, narrated by the technique | spec: A barrier step draws the edge a technique rules out |
| The narrated techniques include the forcing chain | untrue: `DOMINOSA_RUNGS` in `src/games/dominosa/solver.ts` has no forcing-chain rung and `firstFiring` runs none, as this spec's own solver requirement demands. The barrier rungs are `squareSingleDomino`, `mustOverlap`, `localDuplicate`, `localDuplicate2`, `parity` and `set`, which the requirement now lists |
| Barriers of one firing group into one `continuesPrevious` journey, and one already drawn is skipped for display while advancing the deduction | spec: Barriers ruled out by one firing form one journey |
| The midend refuses a hint on a solved or mistaken board, lighting the overlay, before asking the game | spec: A hint is refused on a solved, mistaken or ambiguous board |
| `hint()` refuses on a board that is not uniquely solvable | spec: A hint is refused on a solved, mistaken or ambiguous board |
| The recorder is gated so the generator's solver path is unchanged | spec: The hint recorder is gated |
| The generator's path is named `runSolver` | history |
| Scenario: a hint refuses on a solved board | spec: A hint is refused on a solved, mistaken or ambiguous board |
| Scenario: a placement hint names the forced domino and explains why | spec: A placement step places a domino that has one spot left |
| Scenario: the plan solves the board from any non-mistaken mid-game position | untrue: the hint's pass runs no forcing chain, so at a position only that deduction advances `hint` in `src/games/dominosa/index.ts` returns `DEDUCTION_EXHAUSTED` and the plan stops. The scenario now names a board that needs no forcing chain, in spec: Dominosa provides an explained deductive hint |

## Dominosa renders the hint distinctly

| Rule | Where it went |
| --- | --- |
| Forced cells and a barrier's edge in `COL_HINT`, evidence squares in `COL_HINT_CELL`, the entries appended past the other colors, every hint bit in the render diff key, with the scenario | spec: Dominosa renders the hint distinctly |
| The colors the entries follow are upstream's enum, now named by what they color | history |

## Dominosa provides a domino reference with pair-occurrence highlight

| Rule | Where it went |
| --- | --- |
| The game implements the reference-aid hooks: a checklist of the `DCOUNT(n)` pairs with found status, and a click-to-highlight of a pair's candidate placements | spec: Dominosa provides a domino reference with pair-occurrence highlight |
| `reference(state, ui)` gives one `ReferenceItem` per domino index, with `pips` and an `a–b` label, and `selected` is the highlighted pair's key or null | spec: The reference has one item for each domino |
| Status comes only from the placed dominoes by scanning `grid`, with no solver, and is `outstanding`, `placed` or `conflict` by count | spec: A reference item's status counts the player's own dominoes |
| `DominosaUi` carries `highlightPair`, and `selectReference` sets or clears it and reports a change | spec: The highlighted pair is Ui-only state |
| It coexists with the number-highlight aid and is Ui-only, never a move, never serialized | spec: The highlighted pair is Ui-only state |
| It resets on completion with the number-highlight slots, is dismissed by any board tap, and is otherwise not cleared by `executeMove`, so a programmatic move or the panel closing keeps it | spec: The highlighted pair clears on completion and on a board tap, and survives a move |
| Any pointer tap on the board clears it, the tap still does its action, and a tap that does nothing else repaints | spec: Any pointer tap on the board dismisses the spotlight |
| Escape is undiscoverable and unavailable on touch | spec: Any pointer tap on the board dismisses the spotlight |
| `redraw` boxes both squares of every adjacent pair showing that domino and no other squares, in `COL_REFERENCE`, distinct from the mistake, hint and number-highlight colors | spec: The spotlight boxes every candidate placement of the pair |
| The highlight state is folded into the render cache key | spec: The spotlight boxes every candidate placement of the pair |
| Scenario: a board tap dismisses the spotlight while doing its action | spec: Any pointer tap on the board dismisses the spotlight |
| Scenario: the checklist reflects placed, outstanding and conflicting pairs | spec: A reference item's status counts the player's own dominoes |
| Scenario: selecting a pair boxes exactly its candidate placements | spec: The spotlight boxes every candidate placement of the pair |
| Scenario: the highlight is Ui-only and clears on completion | spec: The highlighted pair is Ui-only state; spec: The highlighted pair clears on completion and on a board tap, and survives a move |

## Dominosa solves with a graded deductive solver

| Rule | Where it went |
| --- | --- |
| The solver grades by difficulty, returns the 0 / 1 / 2 verdict and tracks the maximum difficulty used | spec: Dominosa solves with a graded deductive solver |
| It grades as upstream's `run_solver` does | history |
| The deductions each of the four tiers adds | spec: Each Dominosa tier adds its deductions to the tier below |
| Parity rules out a domino that would split the unfilled area into two odd regions, by bridge-finding over the placement graph | spec: Parity and forcing chains are found on the placement graph |
| The forcing chain follows parity-linked chains of forced placements, using a flip DSF | spec: Parity and forcing chains are found on the placement graph |
| The forcing chain remains in the solver, so the generator grades on it | spec: The forcing chain grades boards and is never narrated |
| Every description is unchanged by that | history |
| The forcing chain is not recorded by the hint's pass, because a closure over all placements is a search and no hint narrates a search on any tier | spec: The forcing chain grades boards and is never narrated |
| Scenario: a generated board is uniquely solvable at its difficulty, and not one level below | spec: Dominosa solves with a graded deductive solver |

## Dominosa renders dominoes, barriers and overlays under the web geometry

| Rule | Where it went |
| --- | --- |
| What the renderer draws, the border of minus the domino gutter, every per-square overlay in the render diff key, with the scenario | spec: Dominosa renders dominoes, barriers and overlays under the web geometry |
| The domino ends follow upstream's `draw_tile`, and the geometry is the web build's `NARROW_BORDERS` | history |

## Dominosa draws a domino as a piece in the theme pair's first color

| Rule | Where it went |
| --- | --- |
| A placed domino takes the placed-piece color, a clashing one the error color, and the number on either is a white that is the same in both schemes | spec: Dominosa draws a domino as a piece in the theme pair's first color |
| A highlighted number on a domino is drawn on a disc of the board's color, inside the mistake outline | spec: A highlighted number on a domino sits on a disc of the board's color |
| The reference spotlight takes the color for what the player is after, which no domino, mistake, hint or value highlight takes | spec: The spotlight boxes every candidate placement of the pair |
| Scenario: a highlighted number on a domino sits on a badge | spec: A highlighted number on a domino sits on a disc of the board's color |
| Scenario: the domino's number does not invert with the scheme | spec: Dominosa draws a domino as a piece in the theme pair's first color |
