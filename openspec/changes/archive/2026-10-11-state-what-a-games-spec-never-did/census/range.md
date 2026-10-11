# range

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: clue digits, run letters `a`-`z`, `_` between two clues | stated | "Range descriptions are run-length clue grids" |
| desc | what `newState` refuses: another character, a clue outside `1 .. w + h - 1`, a wrong length | stated | "A malformed Range description is refused" |
| desc | a board with several answers or none | stated | "A pasted Range board opens at the difficulty it needs" |
| params | `{w}x{h}`, a bare number as a square | stated | "Range params are a width and a height" |
| params | the `d` segment, `e` and `u`, left out of the short form; no letter reads as Easy | stated | "Range params are a width and a height" |
| params | refusals: `w + h` above 128, both sides at most 2 for dealing | stated | "Range params are refused outside their bounds" |
| params | refusal: Unreasonable on a strip | stated | "Range refuses Unreasonable where no board needs it" |
| control | left and right press, Enter and Space: the two three-state cycles; a clue is inert | stated | "Range marks cells via three-state cycling moves" |
| control | a drag on from a press | not-owed | `engine-input`: "A drag on from a press repeats the press" |
| control | Shift with an arrow crosses the squares it leaves and enters | stated | "Range's keyboard cursor marks white with shift" |
| control | the arrows move the cursor; a shifted arrow on a hidden cursor only shows it | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| hint | `adjacency`, `satisfied`, `overrun`, `reach`, `connect` | stated | "A Range hint step states the deduction that forces its cell" |
| hint | the order the rules are tried in | gap | "Range's hint takes the clue rule first in each pass" (new) |
| hint | what a step marks | stated | "A Range hint outlines its evidence as an area", "The forced cell and its premises take different marks", "A shaded premise, a run and a clue each take their own mark" |
| hint | the refusal, and where the hint stops on an Unreasonable board | stated | "A Range hint is refused only when the rules force no cell", "Range's hint stops where its rules do" |
| words | the status bar (none) | not-owed | `ts-engine`: "Solve, the status bar and text export follow from the game's methods" |
| words | the preset titles | stated | "Range's menu offers each size at both difficulties" |

## Defects

None.

## Notes

- "Range's deduction applies three rules to a fixpoint" lists the rules as
  adjacency, the clue rule, connectedness. The solver runs them clue rule
  first, then adjacency, then connectedness (`applyRules`), and that is the
  order the hint's plan lists its cells in. The requirement's list is not
  written as an order, so the code does not contradict it, but a reader may
  take it for one.
- The order requirement's scenario is a board that was run: seven squares in
  a row, a 1 at each end (`1e1`), the middle square shaded by the player. The
  plan is the two squares beside the clues, shaded, then the two beside the
  middle, cleared.
- A shifted arrow at the grid's edge crosses the square the cursor is on and
  does not move it. "Range's keyboard cursor marks white with shift" covers
  it with "the vacated and/or entered empty cells".
