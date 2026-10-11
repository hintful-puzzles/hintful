# mines

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the form `newDesc` writes, before the first click: `r{n},u,{state}` | gap | "A Mines description before the first click is a mine count and a seed" (new) |
| desc | `u` or upstream's `a` in that form | stated | "Mines never asks for a board that may need a guess" |
| desc | the form `supersededDesc` writes: `{x},{y},m{hex}`, and `u` for an unmasked layout | gap | "A laid-out Mines description is its first square and a masked layout" (new) |
| desc | a layout with no first square, an older save's | stated | "A layout with no first square is a board not laid out yet" |
| desc | what the parser refuses of a layout | gap | "A Mines layout is read only as the encoder writes it" (new) |
| desc | that `supersededDesc` answers once the board is laid out | stated | "The board laid out supersedes the description it started from" |
| params | `{w}x{h}n{n}` in full | stated | "Mines' parameters" |
| params | what the short form leaves out, and a string with no `n` | gap | "Mines' short params leave out the mine count" (new) |
| params | a bare `{w}` being square | not-owed | `engine-params`: "The engine provides a shared dimension param parser" (see Notes: the game parses the prefix itself) |
| params | the `X` and `Y` letters | gap | "Mines' short params leave out the mine count" (new) |
| params | upstream's `a` letter, skipped | stated | "Mines never asks for a board that may need a guess" |
| params | the Custom dialog's `n%` | stated | "Mines' parameters" |
| params | refusal: `n` above `w·h − 9`, and under full validation `w` or `h` of 2 or less | stated | "Mines' parameters leave room for a safe first click" |
| params | refusal: `n` below 1, a side above 32767 | not-owed | `engine-params`: "Params validity is the engine's check" (the fields' declared bounds) |
| params | refusal: `X` or `Y` outside the grid | gap | "Mines' short params leave out the mine count" (new) |
| params | refusal: an area of 2²⁸ or more | gap | "Mines refuses a grid of 2²⁸ squares or more" (new) |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | a left press on a covered square opens, on the release, the square released over | gap | "A Mines press opens on its release, and the secondary button flags" (new) |
| control | a left click on a number with its flags chords | stated | "A plain left-click chords without a false-uncover preview" |
| control | the pressed preview | stated | "The pressed preview never shows where the release will not chord" |
| control | a chord over misplaced flags | stated | "Chording never reveals more than it must" |
| control | the secondary button flags a covered square, and a drag repeats it | gap | "A Mines press opens on its release, and the secondary button flags" (new) |
| control | Enter and Space at the cursor, and the first select key only showing it | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | the arrows move and reveal the cursor | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | no move on a dead board | stated | "Death is recoverable and is not a loss" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rung `firstClick`: what it says | stated | "The Mines hint opens the first square, and refuses a dead or exhausted board" |
| hint | rung `firstClick`: which square | gap | "The Mines hint's first square is the middle one" (new) |
| hint | rungs `satisfied` and `full`: one number alone | gap | "One Mines number alone settles its squares" (new); the spec gave `satisfied` as a scenario of "Each Mines hint step names its numbers and its reason" and `full` nowhere |
| hint | rung `pair`: two numbers that share squares, and a number's squares beyond another's | gap | "Two Mines numbers that share squares settle the squares they do not" (new) |
| hint | rung `count`: the mines left | gap | "Mines counts the mines left" (new) |
| hint | the order the rungs are tried in, and flags before opens | gap | "Mines' hint takes the simplest deduction the board supports" (new) |
| hint | that it reasons from the numbers and never a flag | stated | "Mines ships an explained deductive hint from proved facts" |
| hint | that each step names its numbers and its reason | stated | "Each Mines hint step names its numbers and its reason" |
| hint | the refusals: a dead board, deduction run out | stated | "The Mines hint opens the first square, and refuses a dead or exhausted board" |
| hint | how the marks are drawn | stated | "The Mines cursor and marks sit at the square's edge" |
| words | the status bar | gap | "The Mines status bar counts flags against mines" (new); that the deaths persist is "The count of deaths persists" |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None. `help/games/mines.md:47` says the first step opens a square in the
middle, as `src/games/mines/hint.ts:295` does, and its four named ideas
(`help/games/mines.md:42-45`) are the four rungs of
`src/games/mines/deduce.ts:169-216`.

## Notes

- **A bug: a description whose first square is a mine parses, and is
  refused in the wrong words.** Run 2026-10-11 through `validateDesc`,
  `loadVerdict` and the midend's `newGameFromId`: `0,0,u800` on a 3×3 grid
  passes `validateDesc`, and `newState` answers a dead board, its bar reading
  "DEAD!" (`src/games/mines/state.ts:288-299`,
  `src/games/mines/index.ts:357`). `loadVerdict` refuses it, and the midend
  refuses `9x9n10:0,0,u800000000000000000000` (one mine, under its own first
  square), each in the engine's sentence "This game ID's puzzle needs trial
  and error, and only puzzles that deduction alone solves can be played
  here.", because the hint refuses a dead board. Nothing about that board
  needs trial and error. The delta does not state it: "A Mines layout is read
  only as the encoder writes it" lists what the parse refuses and says
  nothing of a mine under the first square. Recommendation: refuse it in the
  parse, with a sentence of the game's own.
- **A bug, and a player can reach it: a board the first click finishes
  does not load again, and its save does not restore.** Run 2026-10-11
  through the midend: `9x9n1`, which the Custom dialog allows, with the
  `facts.json` description's `r10` changed to `r1`; the hint's first step
  opens the middle square, the flood opens every safe square and the board
  is solved. Its game ID is then `9x9n1:4,4,m885d4e8bb6954086d11a0`, which
  `newGameFromId` refuses as needing trial and error, and `loadGame` of the
  save `saveGame` wrote answers "Could not restore this saved game: This game
  ID's puzzle needs trial and error, and only puzzles that deduction alone
  solves can be played here." `finishesByDeduction`
  (`src/games/mines/index.ts:639-648`) asks the hint for a plan, and the hint
  answers a board already won with no steps, which it reports as deduction
  run out (`src/games/mines/hint.ts:318`). A typed layout whose first
  square opens everything is refused the same way
  (`9x9n10:8,8,u800000000000000000000`). "Mines finishes by deduction as its
  hint's plan" is the requirement it breaks. Recommendation: a board that is
  won on opening finishes; fix it in `finishesByDeduction`, and ask whether
  the engine's walk of a hint to the end of a board has the same hole for
  every untiered game.
- **A bug: a first square with a mine beside it loads.** The midend opens
  `9x9n10:1,0,u800000000000000000000`, one mine in the top-left square and
  the first square beside it, showing a 1 (run 2026-10-11), where the hint
  says "No mine is ever laid in the first square you open or beside it" and
  the same layout in a `begin` move is refused
  (`src/games/mines/index.ts:453-455`, "The first move carries the layout it
  laid out"). No layout the game or upstream wrote has one, so only a typed
  ID reaches it. The delta does not state it.
- **No 3×3 board with a mine can be opened by a player, and a test's example
  is one.** `1,1,u800` on `3x3n1` (`src/games/mines/mines.test.ts:167`)
  parses; `loadVerdict` refuses it as needing trial and error (one mine among
  eight covered squares round a 1), and the midend refuses `3x3n1:1,1,u800`,
  `3x3n1:0,0,u800` and `3x3n1:0,1,u800` alike before reading the description,
  with "There must be at least 9 more squares than mines." The scenarios
  therefore quote `0,8,mff9452e1d83a0a7065160`
  (`src/games/mines/__fixtures__/mines-c-reference.json:2`), which the midend
  opens, and for the unmasked form `0,8,u840900209000001020040`: that
  layout's bits with the engine's mask taken off, which no test or fixture
  holds. Run 2026-10-11, it opens the same board and `supersededDesc` answers
  the masked string.
- A dealt board's own layout loads as well: the first hint step on the
  `facts.json` description opens column 4 of row 4, and the board then
  answers `supersededDesc` with `4,4,m0d7e046643973c51ff688`, which
  `loadVerdict` admits (run 2026-10-11).
- **`decodeParams` parses its `{w}x{h}` prefix itself**
  (`src/games/mines/state.ts:129-136`), where `engine-params`'s "The engine
  provides a shared dimension param parser" says a game "SHALL use it and
  SHALL NOT parse the prefix itself". The behavior is the same. Net and
  Netslide do likewise.
- **The `X` and `Y` letters have no reader in play.** Only the batch
  generator behind the differential test reads them
  (`src/games/mines/generator.ts:411-420`); `newDesc` ignores them. They are
  stated because a params string may carry them and one outside the grid is
  refused.
- **The saved `Ui` is `D{deaths}`** (`src/games/mines/state.ts:331-339`), a
  `C` from an older save being read past. The spec says the count survives a
  save and not how it is written; the brief's kinds have no row for a save
  field, so none was written.
- **An area bound is in `validateParams` of Mines, Net, Netslide and Pattern
  alike**, each with the engine's sentence and a number of its own (2²⁸, a
  million, a million, 2⁵³). The engine could state the rule once and take the
  number as a declaration.
- The hint's count of five numbers at most, and its giving up past forty
  candidates (`src/games/mines/deduce.ts:162-165`), are bounds on a search no
  dealt board has reached; the requirement states the five, which a player
  can see, and not the forty.
