# Verdicts: engine-notes

## keep `engine-notes`: A field that is not the player's candidate set is outside the vocabulary

It is the boundary of a requirement cited by title, "One note-taking vocabulary and one layout across games", and not a rule about how work is done, so `process` does not fit even though `docs/games/mechanics.md` § "Pencil marks: the full note-taking UX" repeats it. The boundary has a consequence the guide does not give: a `pencil` array on a board is what "Whether a game takes notes is derived from what the game is" reads, so renaming Pearl's `marks` or a solver's scratch to `pencil` would enroll a game with no notes in the Marks key and the keypad rule.

## keep `engine-notes`: The engine decides when the indicator repaints

The cache's place is a contract and not `how`: the game's draw state carries the field (`PencilIndicatorCache.pencilModeShown`, declared by each member's draw state, as in `src/games/towers/render.ts`), and its being on the draw state is the whole reason a fresh draw state repaints with no first-frame flag from the game. A session adding a note-taking game checks its draw state against this.

## keep `engine-notes`: Enrollment in the mechanic is derived from the Ui

The source-scan sentence is the reason for an exception, not a description of the guard: `engine-input`, "The collection's input guards share one behavioral probe", forbids a probe that reads a game's source, and this guard reads source because no behavior distinguishes a hand-written copy of the arm from the shared one. The rest is the rule itself: who is in the mechanic, and that a member routes its press through a shared arm (`membersNotMentioning` over `pressNoteTakingCell(` and `tapNoteTakingCell(` in `src/engine/note-taking-cell.test.ts`).

## keep `engine-notes`: Membership in the highlight's picture is derived as the mechanic's is

As "Enrollment in the mechanic is derived from the Ui": the scan sentence says why this guard may read source. The requirement also holds two things found nowhere else in the spec, that a member paints its cell background through the engine, and that a member whose selection is not a cell (Map) is excused by an exact ledger and tests its own picture.

## edit `engine-notes`: The pencil-mode indicator is legible against the canvas

declared: the two figures copy `GLYPH_MIN` and `GLYPH_MAX` in `src/engine/pencil-indicator.ts`. The decision is the legibility floor, which the scenario states as a share of the canvas, and the ceiling's reason, which the sentence keeps. The archived proposal of `size-the-pencil-indicator-to-the-board` shows the figures were chosen to meet that floor from the tile size alone, not decided for themselves, so a session retuning them checks against the scenario.

from: clamped between 20 and 48 CSS pixels
to: clamped between a floor and a ceiling in CSS pixels

## note the cut "The vocabulary guard scans for a retired spelling as a typed-array field" is not restored

The doubt asked whether a guard's instrument reasoning belongs in the spec. It does not here: the rule the guard holds is "One note-taking vocabulary and one layout across games", and why the scan keys on a declaration's shape and not on the bare word is the general rule of `docs/method.md` § "A scan that keys on a name", with this guard's own case (`HintMarks`, a `Mark[]`, the `pencilStrike` move's `marks`) in the header of `src/engine/note-vocabulary.test.ts`, which is where a session changing the scan reads it.
