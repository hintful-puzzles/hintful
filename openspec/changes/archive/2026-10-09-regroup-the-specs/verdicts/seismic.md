# Verdicts: seismic

## keep `seismic`: The generator does not call the hint

The rule is not only about seeds. It tells a session changing a hint deduction that the tier a board is certified at, the measured size bounds and the retry caps cannot move with it, which is what that session would otherwise have to re-measure. It holds today: `src/games/seismic/generator.ts` imports the solver and nothing of the hint.

## keep `seismic`: The generator strips clues and accepts only a board of its tier

The tier half is the game's statement of what its generator accepts, and the seed sentence has no shared home: a `<params>#<seed>` id is still loadable (`ts-engine` "The midend retains generator aux info for Solve"), and `testing` "The test suite is deterministic under parallel load" asks seed-determinism only of tests.

## keep `seismic`: Seismic input, note-taking and completion

What a control does stays. `engine-notes` gives the mechanism for every member, and this is where Seismic's spec says it is a member, that it offers the sticky preference and which way it defaults, and what counts as solved. `engine-notes` "Every member offers the keep-highlight preference, defaulted the same way" says the members default the sticky preference alike without saying which way.

## edit `seismic`: A flagged cell carries its own mistake overlay

The look is the game's own and stays: `src/games/seismic/render.ts` draws an inset double outline in the error color, and its comment gives the reason, that it must read apart from the red digit a live rule violation gets. The two share the color and differ in shape, so the requirement now names the shape and what it is told apart from. That the overlay reaches an unchanged cell is `engine-drawing` "A per-cell overlay reaches the render cache through the shared sidecar", kept here as the scenario that shows it.

from: with a distinct mistake overlay
to: with a mistake overlay of their own, an inset double outline that reads apart from the red number a broken rule gets

## keep `seismic`: A test holds every generated board to the rules

It already reads as the generator's promise ("Every generated board SHALL satisfy"), and "by test rather than by luck" says the promise is guarded and not a property of the construction alone. Rewording it would change nothing a reader does.

## reword `seismic`: The deductions the hint makes

The second scenario was a copy, word for word, of the scenario of the same name under `engine-candidate-hints` "Latin-family hints distinguish naked and hidden singles", and spoke of "any Latin-family hint" rather than of Seismic. Seismic's own rule is the clause of this requirement that a home whose candidates are already down to the number is the one-candidate deduction, and Seismic says a one-candidate cell through the shared narrator (`say.naked` in `src/games/seismic/hint-text.ts` calls `narrateLatinReason`). The scenario is rewritten to state that for Seismic. The text is shortened to fit the limit by pronouns alone ("that number" to "it", "is available" to "applies"); every deduction, the exception and the order are as they were.

### Requirement: The deductions the hint makes

The hint SHALL deduce: an empty area of one cell can only hold a 1; a cell with
one candidate left can only hold it; a number with one cell left in its area
must go there, unless that cell's candidates are down to it already, which is
the previous deduction; and a number is struck from every cell outside an area
that clashes, under the mode's keep-apart rule, with every cell the area still
has for it. The last SHALL be taken only when no other applies.

#### Scenario: An area starved of a number rules it out of every cell that clashes with all its homes

- **WHEN** every cell an area still notes for 3 lies within 3 cells, along a row
  or column, of a cell outside the area that also notes 3, and a hint is requested
  at that point in Seismic mode
- **THEN** the step strikes 3 from every such cell at once, rings those cells,
  hatches the area, and says the area can put its 3 only within that reach of them

#### Scenario: A number's last home that has one candidate left is a one-candidate step

- **WHEN** a number has one cell left in its area and that cell's notes are
  already down to that number
- **THEN** the step is narrated as a cell with one candidate left, and the
  one-cell-left narration is used only where the cell still notes another number

## keep `seismic`: Seismic explains the next deduction

The sentence about the midend's refusal is already gone from the regrouped requirement, rightly: `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game" covers Seismic with no departure. What is left, that asking leaves the state and the shared region partition unchanged, is Seismic's.

## note engine-candidate-hints: the naked-single rule's population leaves Seismic out

`engine-candidate-hints` "Latin-family hints distinguish naked and hidden singles" says it applies "to every game on the shared Latin solver and to Solo". Seismic is on neither and narrates its one-candidate cell through the same `narrateLatinReason`. If the cross-game test behind that requirement walks Seismic, the requirement's population sentence is short by one game.

## note seismic: the cut of "The generator fills each region by the solver's own propagation" stands

It is not in the regrouped spec and is not restored. What a player sees of that divergence from upstream is which sizes deal and how long a deal takes, and those are held by "Tectonic's bound is what can be reached", "Seismic's bound is what is possible" and "A preset is never a long wait". The construction itself is recorded in the head comment of `src/games/seismic/generator.ts`.
