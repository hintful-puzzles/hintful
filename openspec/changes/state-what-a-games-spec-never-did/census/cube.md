# cube

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the hex mask of painted squares, a comma, the start square | gap | "Cube descriptions are a hex mask of the painted squares and a start square" (new) |
| desc | what the parser refuses: a character outside uppercase hex, a set unused bit, a wrong length, a start square off the arena | gap | "Cube descriptions are a hex mask of the painted squares and a start square" (new) |
| desc | what the parser accepts: a start square that is painted | gap | "Cube descriptions are a hex mask of the painted squares and a start square" (new) |
| desc | the order the mask's bits and the start square count the arena in, square and triangular | gap | "Cube numbers its arena from the top, a band's downward triangles first" (new) |
| desc | what `hasNoSolution` refuses: paint that does not number the solid's faces | gap | "A Cube description loads only with exactly a solid's worth of paint" (new) |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | the solid letter `t`, `c`, `o`, `i`, then `{d1}x{d2}` | stated | "Cube params are a solid and two dimensions" |
| params | the lenient decode: no letter is the cube, no `x{d2}` is square | stated | "Cube params are a solid and two dimensions" |
| params | what the short form leaves out: nothing (`c4x4` both ways) | stated | "Cube params are a solid and two dimensions" |
| params | refusal: a square grid with a dimension below 2, a triangular grid with both 0 | gap | "Cube refuses a grid too small for its solid" (new) |
| params | refusal: too few squares of a kind for the painted squares, and no square left to start on | gap | "Cube refuses a grid too small for its solid" (new) |
| params | refusal: a dimension below 0 | not-owed | `engine-params`: "A params field declares what it means, its range and its words" (the field's declared `min: 0`) |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | a left click rolls toward the pointer | gap | "A click rolls the solid toward the pointer" (new) |
| control | the right button, and a held press on touch | gap | "A click rolls the solid toward the pointer" (new); the promotion is `engine-input`: "A game with no secondary meaning is not given a synthetic one" |
| control | the arrow keys roll the solid | gap | "The arrows and the numeric keypad roll the solid" (new) |
| control | the numeric keypad's `8`, `2`, `4`, `6` | gap | "The arrows and the numeric keypad roll the solid" (new) |
| control | the numeric keypad's `7`, `9`, `1`, `3` on a triangular grid | gap | "The arrows and the numeric keypad roll the solid" (new); that each resolves to an orthogonal roll is "A Cube move is one of four orthogonal rolls" |
| control | what a roll does to the paint | stated | "Cube roll moves transform orientation and swap paint" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | the hint | not-owed | The game has none (`facts.json`: `hasHint: false`); `ts-engine`: "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft" |
| words | the status bar: `Moves: N` | gap | "Cube's status bar reads the count of rolls" (new) |
| words | the status bar's completion words | not-owed | `ts-engine`: "The status bar's completion words come from the engine" |
| words | the count keeps rising on a finished board | stated | "Cube is solved exactly while every face is painted" |
| words | the preset titles: the solid's name, with the grid where it is not the preset's | not-owed | `engine-params`: "One describer labels every params set" (the words come from the fields' `label` slots) |

## Defects

- **The diagonal keys on a triangle.** `help/games/cube.md:15` says the
  keypad's 7, 9, 1 and 3 "roll the solid across a sloping edge". In
  `src/games/cube/grid.ts:114-117` and `:144-147` the two diagonals that lean
  toward a triangle's flat side are given the mask of the roll across that
  flat side (`UpLeft` and `UpRight` are `Up` on a triangle pointing down,
  `DownLeft` and `DownRight` are `Down` on one pointing up); only the other
  two cross a sloping edge. Run 2026-10-11: on `t1x2:9048,4`, whose solid
  starts on a triangle pointing down, keypad `7` and `9` each answer the `U`
  roll and `1` and `3` the `L` and `R`; on `i3x3:08D2A16B82C8C0,35`, starting
  on one pointing up, `1` and `3` each answer `D` and `7` and `9` the `L` and
  `R`. The requirement states the code.
- **The keypad's 8, 2, 4 and 6.** `src/games/cube/index.ts:217-224` rolls on
  them as on the arrows; `help/games/cube.md:9` names the arrow keys and the
  mouse only. An omission of the help, not a contradiction.

## Notes

- **A start square that is painted loads.** `3905,2` for `c4x4` loads
  (`loadVerdict` null, run 2026-10-11), the solid standing on painted square
  2 with no face painted and the board not solved. The spec's "A Cube board
  is a solid on an arena of painted squares" promises an unpainted start of a
  *generated* board only, and `validateParams`'s "no square left to start on"
  refusal is about dealing. The description requirement now says the parser
  reads such a start as any other, since that is what it does: the paint
  under the solid is picked up like any other, on a roll back onto the
  square. Refusing it would be a change to what loads, and the owner's call.
- **Cube has no `hint`, no `solve` and no `transposeParams`**, and excuses
  only `findMistakes` in `notApplicable` (`src/games/cube/index.ts:363-366`),
  so by `ts-engine`'s contract-sections requirement it is a draft. Nothing in
  the spec says so or says why; that is a decision for the owner and not a
  gap this change fills.
- **The triangular arena's order** (each band's down-pointing triangles left
  to right, then its up-pointing ones, `src/games/cube/grid.ts:92-162`) is
  what a triangular description's bits index, and has its own requirement.
  Its scenario quotes `9048,4`, what `newDesc(decodeParams("t1x2"),
  randomNew("facts-cube"))` deals (run 2026-10-11; the same seed deals
  `0ED018,12` for `o2x2` and `08D2A16B82C8C0,35` for `i3x3`), read back
  through `newState`: `blue` set at 0, 3, 9 and 12, `current` 4. `facts.json`
  holds only the cube's description and the tests' are all square.
- **The start square's number is read with leading zeros** (`r.int`): what
  the engine's reader does for every game's decimal, and no requirement of
  Cube's.
- The spec's "Cube has no win flash" scenario says "the status bar reports
  the completion"; the words are the engine's, prefixed to `Moves: N`.
