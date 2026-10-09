# Ledger: towers

Base: bb004490

Where every rule of Towers' spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Towers game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `towers` game implements `Game`, with the rules of Skyscrapers | spec: Towers game implements the Game interface |
| The six type arguments of `Game` by name | reason |
| It provides `solve` and `textFormat` and not `statusbarText` | spec: Towers game implements the Game interface |
| Params are `w` and `diff`, the four tiers and their values, the encoding, and the presets at every tier | spec: Towers' parameters are a grid size and a difficulty |
| `validateParams` requires `w` from 3 to 9 | untrue: `validateParams` in `src/games/towers/state.ts` checks no size and refuses only a 3x3 above Normal. The bounds 3 and 9 are declared on the grid-size item of `paramConfig` and `paramsError` in `src/engine/params.ts` refuses outside them |
| `validateParams` requires, when full, a known difficulty | untrue: `choice` in `src/engine/params-codec.ts` leaves the default tier on a letter it does not know, since Towers passes no `invalid`, so nothing is refused |
| The corrected rules of size and tier | spec: Towers' grid size runs from 3 to 9 |
| Scenario: params round-trip | spec: Towers' parameters are a grid size and a difficulty |
| Scenario: `validateParams` returns an error for a `w` out of range | untrue: the engine's check of the declared bounds returns it, as "Grid size must be at least 3." |
| The corrected scenario | spec: Towers' grid size runs from 3 to 9 |

## Towers descriptions encode edge clues and grid givens

| Rule | Where it went |
| --- | --- |
| The clue fields in order, then the run-length-encoded givens | spec: Towers descriptions encode edge clues and grid givens |
| The `_` separator is optional | untrue: `parseDesc` in `src/games/towers/state.ts` expects a `_` between two adjacent givens and refuses one anywhere else, which is what the generator's `encodeDesc` writes |
| `validateDesc` rejects the four malformed shapes | untrue: Towers has no `validateDesc`. The one reading `newState` builds from (`parseDesc` through `descValue`) refuses them, and the engine takes its verdict from that |
| What the reading refuses, and what `newState` decodes into which arrays | spec: Towers' reading of a description refuses a malformed one |
| Scenario: a description round-trips, clues at their index | spec: Towers descriptions encode edge clues and grid givens |
| Scenario: givens in both arrays, other cells empty with no marks | spec: Towers' reading of a description refuses a malformed one |
| Scenario: a malformed description is rejected | spec: Towers' reading of a description refuses a malformed one |

## Towers generates uniquely-solvable boards at the target difficulty

| Rule | Where it went |
| --- | --- |
| Generate a Latin square, derive the clues, remove givens and above Easy clues, regenerate until exactly the tier, unique, with an `aux` | spec: Towers generates uniquely-solvable boards at the target difficulty |
| Scenario: a generated board is unique and correctly graded | spec: Towers generates uniquely-solvable boards at the target difficulty |

## Towers accepts digit, pencil, clue-strike, and solve moves

| Rule | Where it went |
| --- | --- |
| A cell is selected by mouse, with 3D-aware hit-testing, or by keyboard cursor, for a real entry or a pencil mark | spec: Towers selects a cell by pointer or by keyboard cursor |
| The left button gives the real-entry highlight and the right button the pencil one | spec: Towers offers a sticky pencil mode; spec: With sticky mode off a click chooses the kind of entry |
| The select key gives the real-entry highlight and select2 the pencil one | untrue: `toggleNoteTakingMode` in `src/engine/note-taking-cell.ts` makes `CURSOR_SELECT` switch pencil mode while the highlight shows, and `interpretMove` in `src/games/towers/index.ts` makes `CURSOR_SELECT2` clear the cell |
| The corrected keyboard rule | spec: Towers selects a cell by pointer or by keyboard cursor |
| A digit enters or pencil-toggles, backspace, space and 0 clear, a value already held is a no-op, givens reject entry, `executeMove` is pure | spec: Towers accepts digit, pencil, clue-strike, and solve moves |
| A click or shift/ctrl-cursor onto a clue toggles its done state | spec: An outside clue is struck through by a click or a modified cursor key |
| Solved exactly while the filled grid violates no clue or Latin constraint | spec: Towers is solved while the filled grid breaks no rule |
| Scenario: entering the last correct tower completes the board | spec: Towers is solved while the filled grid breaks no rule |
| Scenario: entry into an immutable cell is rejected | spec: Towers accepts digit, pencil, clue-strike, and solve moves |
| Scenario: clue strike toggles | spec: An outside clue is struck through by a click or a modified cursor key |

## Towers renders in selectable 3D and 2D styles with pencil marks

| Rule | Where it went |
| --- | --- |
| The play area and clue ring, a tower solid under 3D and a centered digit under 2D, pencil marks in an auto-sized grid | spec: Towers renders in selectable 3D and 2D styles with pencil marks |
| Distinct colors for givens, entries, done clues and errors, the two highlights, the keyboard cursor, the completion flash | spec: Towers tells its inks and its selection apart |
| A per-tile cache accounts for a tower's protrusion | spec: Towers repaints the neighbors a tower reaches into |
| The protrusion is into the up-left neighbors | untrue: `drawTile` in `src/games/towers/render.ts` moves a tower's top right by `x3d` and up by `y3d`, and `redraw` repaints a clip when the tile to its left, below it or below-left changed, so a tower reaches up and to the right |
| Scenario: the initial 3D frame draws clues and towers | spec: Towers renders in selectable 3D and 2D styles with pencil marks |
| Scenario: the 2D preference suppresses the tower solids | spec: Towers renders in selectable 3D and 2D styles with pencil marks |

## Towers exposes appearance and pencil-highlight preferences

| Rule | Where it went |
| --- | --- |
| An appearance choice defaulting to 3D and a keep-highlight boolean, on the `Ui`, applied by `interpretMove` or `redraw` | spec: Towers exposes appearance and pencil-highlight preferences |
| The keep-highlight boolean defaults off | untrue: `newUi` in `src/games/towers/state.ts` sets `pencilKeepHighlight: true` |
| Scenario: the appearance preference drives the rendering style | spec: Towers exposes appearance and pencil-highlight preferences |

## Towers checks for mistakes against the unique solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves from clues and givens, never from notes, and returns the two kinds of contradicting marking | spec: Towers checks for mistakes against the unique solution |
| A note set with extra candidates is not reported, and both kinds render as one red overlay | spec: A note is a mistake only when it excludes the correct height |
| A board not uniquely solvable from the givens returns an empty result | spec: Towers checks for mistakes against the unique solution |
| Check & Save refuses a board with an invalid note, as it does a wrong filled cell | spec: Check & Save refuses a board with an invalid note |
| Scenario: a wrong tower is flagged | spec: Towers checks for mistakes against the unique solution |
| Scenario: a note that excludes the correct height is flagged | spec: Towers checks for mistakes against the unique solution |
| Scenario: a note with extra candidates is not a mistake | spec: A note is a mistake only when it excludes the correct height |
| Scenario: Check & Save refuses a board with an invalid note | spec: Check & Save refuses a board with an invalid note |

## Towers offers a sticky pencil mode with an on-screen indicator

| Rule | Where it went |
| --- | --- |
| A sticky pencil preference, on by default, under which a right-click toggles the mode and a left-click only moves the highlight, and the keyboard path is unaffected | spec: Towers offers a sticky pencil mode |
| A sticky right-click always moves the highlight to the clicked cell | untrue: `applyPress` in `src/engine/note-taking-cell.ts` returns with the highlight unmoved when the cell can take no mark |
| With sticky mode off a left-click reverts to real entry and a right-click is a per-cell pencil select | spec: With sticky mode off a click chooses the kind of entry |
| "Exactly as upstream" and "already mode-persistent" | history |
| The pencil glyph while pencil mode is active, where no tower overlaps, appearing and clearing with the mode, altering no state | spec: Towers shows an on-screen indicator while pencil mode is active |
| Scenario: sticky mode keeps pencil entry across left-clicks | spec: Towers offers a sticky pencil mode |
| Scenario: right-click toggles the mode off | spec: Towers offers a sticky pencil mode |
| Scenario: sticky mode disabled restores upstream behavior | spec: With sticky mode off a click chooses the kind of entry |

## Towers provides an explained, pencil-notes-based deduction hint

| Rule | Where it went |
| --- | --- |
| `hint` and `hintKeepTrack` deliver an explained hint that is the recording solver's script, seeded from the placed grid only and expressed against the live notes and grid | spec: Towers provides an explained, pencil-notes-based deduction hint |
| The three kinds of step: populate through `pencilAll`, eliminate through `pencilStrike`, place | spec: A Towers hint step populates, eliminates or places |
| The steps are of three kinds, whatever the player's preferences | untrue: `buildSteps` in `src/games/towers/index.ts` passes the `hint-notes` reading to the walk, and under `implicit` the walk emits no fill-all and writes notes with `pencilAdd`. The three kinds are those of the `populate` reading `newUi` starts on |
| A multi-cell firing is one step bearing a single `pencilStrike` | untrue: `strikeAxis` in `src/games/towers/index.ts` is the struck height, so a firing ruling out two heights is one step for each |
| At each step a naked single is preferred ahead of any further elimination | untrue: the walk takes a firing that continues from the plan's latest steps before the rung order decides (`HintFrontier`, driven from `src/engine/candidate-plan.ts`), so the order holds for a freshly built plan and among firings that continue equally; spec engine-candidate-hints: A candidate hint plan continues from its latest steps where it can |
| The order: a naked single, then the next clue elimination, then a forced placement | spec: A Towers hint is ordered the way a person solves |
| A placement's trivial row and column eliminations follow the auto-pencil preference, and `hint` receives the `Ui` to read it | spec: Auto-pencil decides whether a hint teaches a placement's eliminations |
| The narration leads with the indication, then the reasoning, then a necessity-voice conclusion | spec: A Towers hint step says what was spotted and why it forces the move |
| The highlight shows the driving clue and its line of sight, and the targets, strikes of one firing sharing the target's mark | spec: A Towers hint step marks the clue it reasons from and the cells it acts on |
| The clue and its line are shaded | untrue: the words in `src/games/towers/hint-text.ts` outline the clue in its slot and stripe the line, and `redraw` in `src/games/towers/render.ts` draws the outline on the cell's border |
| The struck candidates are marked in the hint color | untrue: `drawTile` in `src/games/towers/render.ts` crosses a struck candidate through in the pencil color, and the hint color rings its cell |
| The palette names `COL_HINT_CELL` and `COL_HINT` | reason |
| The hint refuses on a solved board or one with mistakes, and the refusal lights the mistake overlay | spec: A hint is refused on a solved board or one with mistakes |
| Towers' `hint` gives those two refusals | untrue: `candidateHint` in `src/engine/candidate-hint.ts` refuses only an empty plan. The midend gives both before the game is asked; spec engine-hints: The midend SHALL refuse a hint on a finished or wrong board before asking the game |
| Every step is monotone progress, and a recompute skips what is already on the board | spec: Every Towers hint step is progress the hint never undoes |
| A recomputed hint leads to a solved board from any solvable, mistake-free position | untrue: `buildSteps` in `src/games/towers/index.ts` caps the recording below the recursive tier, so on an Unreasonable board the plan can come up empty and `candidateHint` refuses. The promise holds on a board whose tier needs no search |
| "The cross-game resume guarantee" | reason |
| `hintKeepTrack` advances on a matching move and otherwise drops the plan | spec: hintKeepTrack advances the plan when a move matches the step |
| A `pencilStrike` clearing a subset of the step's marks is on track | untrue: `keepCandidateHintTrack` in `src/engine/candidate-hint.ts` completes on a `pencilStrike` of all the step's marks and is off on any other. The step shrinks on a pencil toggle that clears one of its marks |
| Recording is gated so the generator's solve path is unchanged, and the fixpoint has a step budget | spec: Recording a deduction script leaves the generator's solve unchanged |
| Scenario: a clue elimination is taught as a note strike | spec: A Towers hint step populates, eliminates or places; spec: A Towers hint step says what was spotted and why it forces the move; spec: A Towers hint step marks the clue it reasons from and the cells it acts on |
| Scenario: on an empty board the first step fills the notes | untrue: the walk in `src/engine/candidate-plan.ts` takes a naked single or one of Towers' note-free clue lines (`extremeClueLines` in `src/games/towers/index.ts`) before the fill, and emits no fill under the implicit reading |
| The corrected scenario | spec: A Towers hint step populates, eliminates or places |
| Scenario: a collapsed cell is placed | spec: A Towers hint step populates, eliminates or places |
| Scenario: the hint resumes from a self-played mid-game position | spec: Every Towers hint step is progress the hint never undoes |
| Scenario: the hint refuses on a board with mistakes | spec: A hint is refused on a solved board or one with mistakes |
| Scenario: a naked single is offered ahead of further elimination | spec: A Towers hint is ordered the way a person solves |

## Towers auto-pencils row/column eliminations on placement

| Rule | Where it went |
| --- | --- |
| An auto-pencil preference, off by default, strikes a placed height from its row and column, the decision recorded on the move | spec: Towers auto-pencils row/column eliminations on placement |
| With it off a placement leaves other marks untouched and cleanup is manual, by mark-all or a hint | spec: With auto-pencil off a placement leaves the notes alone |
| "Upstream behavior" | history |
| The preference governs the hint: folded into the placement when on, explicit strikes when off | spec: Auto-pencil decides whether a hint teaches a placement's eliminations |
| Scenario: placing a tower clears matching notes in its line | spec: Towers auto-pencils row/column eliminations on placement |
| Scenario: auto-pencil off leaves notes untouched | spec: With auto-pencil off a placement leaves the notes alone |

## Towers provides on-screen key labels

| Rule | Where it went |
| --- | --- |
| `requestKeys` returns a button for each digit and then a clear key | spec: Towers provides on-screen key labels |
| Scenario: the keypad covers the grid's heights plus clear | spec: Towers provides on-screen key labels |

## Towers stands its towers on a quiet surface, with a given's lifted

| Rule | Where it went |
| --- | --- |
| A play cell is on the cell surface and a given on the lifted one, a tower's top and faces take the surface, its edges stay ink | spec: Towers stands its towers on a quiet surface, with a given's lifted |
| The grid line and the frame are the surface grid line, never across a tower's base, every line under 2D, the clue ring outside the surface | spec: The grid line recedes and never crosses a tower's base |
| The selection's wash is over whichever surface, faces included, and the hint's marks stay on the border | spec: The selection's wash and the hint's marks keep to the cell |
| Scenario: a given tower is told by its surface | spec: Towers stands its towers on a quiet surface, with a given's lifted |
| Scenario: a tower keeps its edges and the grid recedes | spec: The grid line recedes and never crosses a tower's base |
