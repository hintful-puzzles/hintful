# rect

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: run letters `a`-`z`, decimal numbers, `_` between two numbers | stated | "Rectangles descriptions use the upstream encoding" |
| desc | what `newState` refuses: an unknown character, a wrong length | stated | "Rectangles descriptions use the upstream encoding" |
| desc | refusal: a number outside `1 .. w * h`; a `_` out of place | gap | "A Rectangles description's number is from 1 to the grid's area" (new) |
| desc | a board with several answers or none | stated | "A pasted Rectangles board opens at the difficulty it needs" |
| params | `{w}x{h}`, a bare number as a square | stated | "Rectangles' parameters and their encoding" |
| params | the `e` segment, left out of the short form | stated | "Rectangles' parameters and their encoding" |
| params | the `d` segment, `e` and `u`; no letter reads as Easy | stated | "Rectangles' parameters and their encoding" |
| params | upstream's `a` | stated | "Rectangles reads past upstream's unchecked-board letter" |
| params | refusal: an area below 2 | stated | "Rectangles' parameters and their encoding" |
| params | refusal: more than 1,000,000 squares | gap | "Rectangles refuses a grid of more than a million squares" (new) |
| params | refusals: Unreasonable on the small shapes | stated | "Rectangles refuses Unreasonable where no board needs it" |
| control | left-drag draws a rectangle; right-drag clears the lines inside | stated | "Rectangles input" |
| control | a click on an edge; a click on a corner or a square's middle | stated | "Rectangles input" |
| control | the arrows move the cursor from square to square | gap | "Rectangles input" (corrected) |
| control | Enter and Space show a hidden cursor, and start, stretch and end a drag from a showing one | gap | "Rectangles' Enter draws from the cursor's square and Space clears" (new) |
| control | Escape, Backspace or Delete | stated | "Rectangles input" |
| control | the arrows show the cursor on the first press | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| hint | `fit`, `reach`, `overlap`, `starve`, `line` | stated | "A Rectangles hint step is one of five deductions" |
| hint | the order the deductions are tried in | gap | "Rectangles' hint tries its five deductions plainest first" (new) |
| hint | what a line step says | stated | "A line step names the clues that cannot cross the edge" |
| hint | what a step rings | stated | "A hint's rectangle is ringed as the contour of its squares" |
| hint | the refusal, and where the hint stops on an Unreasonable board | stated | "Rectangles' hint stops where its steps do" |
| words | the status bar: the dragged rectangle's size | stated | "Rectangles input" |
| words | the preset titles | stated | "Rectangles' menu offers its sizes at both difficulties, the largest two at Easy" |

## Defects

None.

## Notes

- "Rectangles input" said "a half-grid keyboard cursor with press-to-drag".
  The cursor moves from square to square (`src/games/rect/index.ts`, the
  `isCursorMove` arm of `interpretMove`, which moves it over `w` by `h`); it is
  the drag's ends that are on the half grid. The help page says square to
  square. The requirement is restated under `## MODIFIED Requirements` with
  those words corrected and nothing else changed. The header comment of
  `src/games/rect/index.ts` still says "a half-grid keyboard cursor".
- The arrows' first press on a hidden cursor is the engine's; Enter and Space
  on a hidden cursor are the game's own arm, since Rectangles declares no
  `targetVerbs`, and the keyboard requirement states it.
- The same requirement holds five behaviors (the pointer drags, the click, the
  keyboard, the cancel keys, the status bar) in one paragraph. The keyboard is
  now a requirement of its own; the rest was left as it is.
- "A Rectangles hint step is one of five deductions" lists the five in the
  order the code tries them and does not say it is an order. The help page
  does ("from the plainest up").
