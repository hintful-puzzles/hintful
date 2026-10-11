# slant

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the point grid row-major, `0`–`4`, runs `a`–`z` | stated | "Slant descriptions are run-length clue grids" |
| desc | what the parser refuses: an unknown character, too short, too long | stated | "Slant descriptions are run-length clue grids" |
| desc | refusal: a digit above 4 | gap | "A Slant clue above 4 is refused" (new) |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the square shorthand `{n}` | stated | "Slant's parameters are a size and a difficulty" |
| params | the `d` letter (`e`, `h`) | stated | "Slant's parameters are a size and a difficulty" |
| params | what the short form leaves out | stated | "Slant's parameters are a size and a difficulty" |
| params | a missing or unknown difficulty letter reads as Easy | gap | "A Slant difficulty letter that is missing or unknown reads as Easy" (new) |
| params | refusal: width or height below 2 | stated | "Slant's parameters are a size and a difficulty" |
| params | refusal: width times height too large | gap | "Slant refuses a grid too large to count" (new) |
| pref | `left-button` | stated | "Slant exposes its two upstream preferences"; "A click cycles a square through its three states" |
| pref | `fade-grounded` | stated | "Slant exposes its two upstream preferences" |
| control | left-click and right-click cycle a square | stated | "A click cycles a square through its three states" |
| control | Enter and Space cycle the cursor square, swapped with the buttons | stated | "Slant's keys cycle the cursor square or set it outright"; `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | `\`, `/` and Backspace set the cursor square outright | stated | "Slant's keys cycle the cursor square or set it outright" |
| control | the pointer's way to what `\`, `/` and Backspace do | not-owed | `engine-input`: "A pointer route is a repeat, a cycle or a notes-mode press" |
| control | the arrows move and reveal the cursor | stated | "Slant's keys cycle the cursor square or set it outright" |
| control | a drag on from a press repeats it | not-owed | `engine-input`: "A drag on from a press repeats the press" |
| control | the Marks key, and `P`, turn notes mode on and off | stated | "The Marks key turns Slant's notes mode on and off" |
| control | a notes-mode press marks the nearest side | stated | "A notes-mode press marks the nearest side" |
| control | a notes-mode drag marks each side it crosses | not-owed | `engine-input`: "A draggable mark is declared as a sweep or as drag-mark verbs"; "A sweep honors its declared limits and skips no target" |
| control | notes-mode Enter and Space pin and pair; Escape lets go | stated | "The notes-mode keyboard pins a square and marks toward a neighbor" |
| control | the pencil shown while notes mode is on | not-owed | `engine-notes`: "A sticky notes mode is visible on the board" |
| control | `requestKeys` / the keypad | stated | "The Marks key turns Slant's notes mode on and off" |
| hint | rung `clue-fill` (a clue with just enough squares left) | stated | "Each Slant technique is narrated by its own reason" |
| hint | rung `clue-empty` (a clue already met) | stated | "Each Slant technique is narrated by its own reason" |
| hint | rung `loop` | stated | "Each Slant technique is narrated by its own reason"; "The Easy solver counts clues and avoids immediate loops" |
| hint | rung `deadend` | stated | "Each Slant technique is narrated by its own reason"; "The Normal solver avoids dead ends" |
| hint | rung `equiv` (a square takes the slant of a placed one it is marked alike with) | stated | "A hint step rests only on what the board shows" |
| hint | rung `mark-clue` (a mark from a clue with one line left for two squares) | stated | "A mark the board lacks is placed by a step of its own" |
| hint | rung `mark-v` (a mark from the two v-shapes a pair cannot form) | stated | "A mark the board lacks is placed by a step of its own" |
| hint | the order the techniques are tried in | gap | "Slant's hint steps come in the order its solver finds them" (new) |
| hint | every technique is used at either difficulty | gap | "Slant's hint uses every technique at either difficulty" (new) |
| hint | what a step says | stated | "Each hint step names its technique and says why the move is forced"; "Each Slant technique is narrated by its own reason" |
| hint | what a step marks | stated | "Slant hint rendering follows the element-type legend"; "A hint's evidence is drawn in the evidence color" |
| hint | refusal when deduction runs out | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording" |
| hint | refusal on a finished board or one with a mistake | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- The spec's "Slant ships an explained deductive hint" says the plan is
  computed "by the game's own solver techniques" and does not say at which
  difficulty. The code runs the full solver for the hint on every board
  (`src/games/slant/solver.ts`, the function the hint's plan is deduced with,
  passes `DIFF_HARD`), so an Easy board's hint can use a same-slant mark. A
  new requirement states it. Its scenario was run on `facts.json`'s Easy
  board, `5x5de:1a0a11a22a3b22b1a1g330a1b1a`: over 4,000 positions, each with
  a random share of the answer drawn and every pair that slants alike marked,
  8 plans opened with a square read off a mark ("The outlined mark links this
  square to the outlined square, so it must be a backslash too."), and 2,333
  had such a step somewhere.
- **The ceiling on a grid's area is in no shared requirement.**
  `validateParams` refuses a width times height past the largest number the
  app counts exactly, in the engine's words (`AREA_TOO_LARGE` in
  `src/engine/params.ts`). `engine-params` "A params refusal is a sentence"
  fixes the form of a refusal and leaves which refusals a game has to the
  game, so it does not state this one, and a new requirement does. Every game
  that returns `AREA_TOO_LARGE` writes the same check; `engine-params` could
  state it once.
- `choice(…, "d", …)` is given no `invalid` value in
  `src/games/slant/state.ts`, which is what makes an unknown letter read as
  the default. Spokes passes one and refuses the same string. The codec lets
  each game choose, and `engine-params` states neither behavior, so each
  game's spec now says its own.
