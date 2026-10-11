# undead

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: three totals, the grid (`a`–`z` runs, `L`, `R`, `G`, `V`, `Z`), `2·(w+h)` sightings | stated | "Undead descriptions encode totals, the mirror grid, and sightline clues" |
| desc | the order of the sightings round the edge | stated | "Undead traces sightlines through the mirror maze" |
| desc | what the parser refuses | stated | "A malformed Undead description is refused" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the short form | stated | "Undead's parameters and their encoding" |
| params | the `d` letter and its `e`, `n`, `t` | stated | "Undead's parameters and their encoding"; "Undead's top tier is Unreasonable and keeps the letter t" |
| params | what the short form leaves out (the difficulty) | stated | "Undead's parameters and their encoding" |
| params | an unknown difficulty letter | stated | "Undead's parameter limits" |
| params | refusal: width or height below 3, more than 54 squares | stated | "Undead's parameter limits" |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for"; "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `monsters`: pictures or letters | gap | "Undead's count style and monster display are preferences" (modified: the key) |
| pref | `count-style`: Total, Remaining, Placed/Total, Left/Total | gap | "Undead's count style and monster display are preferences" (modified: the key); what it changes is in "Undead's count blocks follow the selected count style" |
| control | a click selects a square; right-click selects it for pencil marks | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| control | `G`/`V`/`Z`, `1`/`2`/`3` and a count-block click place a monster, or toggle its pencil mark | stated | "Undead supports monster, pencil, and clue moves with a cursor" |
| control | `E`, `0`, Backspace clear | stated | "Undead supports monster, pencil, and clue moves with a cursor" |
| control | Space and Delete clear; a click on the count block of the monster already there clears | gap | "Space, Delete and a second count click clear an Undead cell" (new) |
| control | a mirror or a given takes no entry | stated | "Undead refuses edits to fixed cells" |
| control | `M` pencils every monster into each empty square with no marks | stated | "Undead's Mark-all fills the cells that have no notes" |
| control | `A` switches pictures and letters | gap | "Undead's count style and monster display are preferences" (modified: the key) |
| control | a click on a clue strikes it through | stated | "A click on a sighting clue strikes it through" |
| control | a drag along the clues repeats the strike | not-owed | `engine-input`: "A draggable mark is declared as a sweep or as drag-mark verbs" |
| control | the arrows move the highlight; the first lands on the top-left square | gap | "Undead's first arrow selects the top-left square" (new) |
| control | Enter switches between placing and pencil marks | not-owed | `engine-notes`: "The select key on a showing highlight toggles pencil mode" |
| control | the keypad: Ghost, Vampire, Zombie, Clear | stated | "Undead provides on-screen key labels" |
| hint | the opening step that pencils every monster in (`populate`) | gap | "Undead's hint pencils every monster in before its first strike" (new) |
| hint | a sightline's two clues leave no room for a monster (`sightline`) | stated | "A sightline step speaks of the line and its two clues" |
| hint | every monster of a kind is placed (`total`) | stated | "Undead explained deduction hint" (scenario "Total exhaustion is narrated honestly, not as a sightline") |
| hint | exactly as many cells can hold a monster as its total (`onlyCells`) | gap | "Undead's hint fills a cell when a monster has exactly the cells it needs" (new) |
| hint | one monster left uncrossed (`single`) | stated | "Undead explained deduction hint" (scenario "Naked single is surfaced first as a placement") |
| hint | the order the techniques are tried in | gap | "Undead's hint tries a single, then a counted placement, then a strike" (new) |
| hint | the voice of a conclusion | stated | "Undead's hint conclusions use the necessity voice" |
| hint | what a step marks | stated | "Undead's hint marks follow the element-type color legend"; "A struck candidate stays legible" |
| hint | the forcing rung is never spoken; an Unreasonable board's hint stops | stated | "The forcing rung never reaches an Undead hint"; "An Unreasonable board's hint stops where deduction stops" |
| hint | refusal on a finished board or one with a mistake | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | preset titles: a size and a tier | not-owed | `engine-params`: "One describer labels every params set"; `engine-difficulty`: "Tier names come from one collection-wide scale" |

## Defects

- The help says the opening fill comes first: "if some empty square has
  none, its first step pencils every monster into each empty square that has
  no marks yet" (`help/games/undead.md:47`). The code places a counted
  placement before the fill, since that step needs no marks
  (`src/games/undead/index.ts:710` runs before `ensurePopulated()` at
  `src/games/undead/index.ts:721`), so on a board with no marks the first step
  can be a placement. Run on 2026-10-11: it was on 31 of 60 dealt boards (the
  note on the planner below has the sample). "Undead's hint pencils every monster in
  before its first strike" states the code.

## Notes

- `engine-input`'s "One arrow press reveals the cursor and moves it" has the
  scenario "the cursor becomes visible and has moved one cell". Undead's first
  arrow on a board with nothing selected shows the highlight on the top-left
  square whichever arrow it is (`src/games/undead/index.ts:240`): its cursor
  starts at `(0, 0)`, which in its bordered coordinates is the corner of the
  clue ring and not a square. Run on 2026-10-11: Down on a new `4x4de` board
  put the highlight at the top-left square, and the next Right moved it one
  square. The new requirement states what the code does; whether the engine's
  rule should bind Undead is a question for the engine.
- A bug, the hint's: the planner takes a counted placement from anywhere in
  the recorded deductions before any strike, including one the recording
  reached only after strikes the player has not been shown (`nextPlaceOp`,
  `src/games/undead/index.ts:543`). Its sentence then speaks of cells that
  "can still hold" a monster by deductions the board does not show, with no
  mark on the board to say which cells those are. On a board with no marks it
  is always so: every empty cell can hold every monster until something is
  struck, so the recorder's first counted placement always follows a strike.
  Run on 2026-10-11 over 60 boards dealt from `4x4de`, `4x4dn`, `4x4dt`,
  `5x5de` and `5x5dn` (12 each): the first step of a hint on the board as
  dealt was such a placement on 31 of them, and the fill on the other 29.
- In pencil mode a clear key on a cell that holds a monster and a pencil mark
  under it clears both, and on one that holds a monster and no mark does
  nothing (`src/games/undead/index.ts:273`; run on 2026-10-11). A monster
  placed over marks keeps them (`executeMove`, `set`), which is how the first
  case arises. "Space, Delete and a second count click clear an Undead cell"
  states both.
- A right-click on a count block does nothing; only the left button reads the
  blocks (`src/games/undead/index.ts:188`).
- The first Hint on a board with no marks and no counted placement is the
  fill, and the first strike follows it; a `single` can only arise once marks
  exist, so in practice the order is counted placement, fill, then singles
  and strikes.
