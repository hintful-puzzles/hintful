# slide

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description's shape: squares in reading order, anchors, back-links, forcefield prefix, runs, then the target and an optional minimum | stated | "Slide descriptions use the upstream run-length block encoding" |
| desc | the letters `a`, `m`, `e`, `w`, `d{n}`, `f`, the count, `,tx,ty[,min]` | gap | "Slide descriptions spell each square with a letter" (new) |
| desc | refusals: wrong number of squares, not exactly one main piece, a bad back-reference, an unknown character, no target | stated | "A malformed Slide description is rejected" |
| desc | refusals: a count of 0 or 1, `f` before `d`, a target off the board, anything after the minimum | gap | "Slide refuses a count below 2, a forcefield block square and a target off the board" (new) |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | that the string carries width, height and limit | stated | "Slide's params are a width, a height and a solution-length limit" |
| params | `{w}x{h}`, the `m` letter and the `u` letter; the square shorthand; a string naming no limit | gap | "Slide's params write the limit as m and a number, or u" (new) |
| params | what the short form leaves out (nothing) | gap | "Slide's params write the limit as m and a number, or u" (new) |
| params | refusal: a limit of zero | stated | "A solution-length limit of zero is refused" |
| params | refusal: a board too large | stated | "A Slide board too large to generate is rejected" |
| params | the bound is 48 squares, is not gated on `full`, and so holds for a board that arrives with its description | gap | "Slide's size limits hold for a board that arrives with its description" (new) |
| params | refusal: width below 5 or above 251, height below 4 | gap | "Slide's size limits hold for a board that arrives with its description" (new) |
| params | the Custom field reads any negative limit as no limit | stated | "Slide's params are a width, a height and a solution-length limit" |
| control | grab, drag, snap to the nearest reachable cell, release | stated | "A Slide block is moved by grab, drag and release" |
| control | the right button does what the left does | gap | "Either pointer button moves a Slide block" (new) |
| control | only the key block enters the gate | stated | "Only the main block passes a forcefield cell" |
| control | the arrows move the cursor | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | Enter or Space picks a block up and puts it down | stated | "The keyboard select grabs with the pointer's grab" |
| control | the arrows walk a held block one square a press | stated | "A held block moves one cell per press" |
| control | Escape hands a held block back | stated | "The keyboard select grabs with the pointer's grab" |
| control | Backspace and Delete cancel a grab as Escape does; any of the three with nothing held hides the cursor | gap | "Escape, Backspace and Delete each cancel in Slide" (new) |
| control | a pointer press hides the cursor and puts down a keyboard grab | stated | "A pointer press takes the board over" |
| control | one journey is one move, and a slide straight back takes it off | stated | "A multi-step slide of one block counts as one move"; "A keyboard journey produces the one move its drag produces" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| words | the status bar: `Moves: {n} (min {m})` | gap | "Slide's status bar counts moves beside the minimum" (new) |
| words | the status bar's completion words | not-owed | `ts-engine`: "The status bar's completion words come from the engine" |
| words | the preset titles "max 25 moves" and "no move limit" | gap | "A Slide board's name gives the limit on its shortest solution" (new) |

## Defects

None.

## Notes

- Slide has no hint (`facts.json`: `hasHint: false`, `hintRungs: null`), and
  no preference, so the census has no `hint` or `pref` row. `AGENTS.md` calls
  a game without a hint a draft; `src/games/slide/index.ts` says in its header
  that one "would be a solver-path hint of its own".
- The 48-square bound in `validateParams` (`src/games/slide/state.ts`) is not
  gated on `full`, so a `<params>:<desc>` ID for a larger board does not load.
  Run through the midend's `newGameFromId`: a player who enters a game ID
  opening `7x7m25:` gets "Width times height must be at most 48; the solver
  runs out of memory beyond that." and no board, whatever the description.
  `engine-params` "A generation-only bound is gated on full" asks for the gate
  where a bound holds only when generating. The code's comment on `MAX_CELLS`
  argues from the generator's memory alone. **The question for the owner** is
  whether a larger board that arrives already made should load. Solve runs
  the same exhaustive search on it once, from the position; the generator's
  cliff was measured on its own boards, which start with every block a single
  square and so have far more layouts to reach than a finished puzzle. Solve
  on a larger finished board was not measured here: the one size known to
  fail does so by exhausting a 4 GB heap. The new requirement states what the
  code does.
- The help's Controls section names Escape as the key that hands a block back.
  `isCancelKey` also takes Backspace and Delete, which reach the game as one
  code (`DELETE` in `src/engine/pointer.ts`); pressed with a block held, each
  put it down where it was picked up, as Escape did. The help leaves that out
  and does not contradict it.
- The description and params strings of the new requirements were run through
  `newState`, `decodeParams` and `paramsError`, and each means what its
  scenario says.
- The spec's "A Slide board too large to generate is rejected" speaks of "a
  documented bound" and gives no number. The new requirement gives 48.
