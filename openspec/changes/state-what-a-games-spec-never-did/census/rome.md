# rome

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the wall list's numbers and letters; the clue grid's letters and `U`, `D`, `L`, `R`, `X` | stated | "Rome descriptions use the region-border and clue encoding" |
| desc | which borders the list covers and in what order; the `,` between the parts; a run letter's count | gap | "A Rome description is the walls, a comma, then the clues" (new) |
| desc | what `newState` refuses: a bad character, an area over four squares, a goal in an area of more than one | stated | "Rome rejects a description that breaks its shape" |
| desc | refusal: a missing comma, a part past its count | gap | "A Rome description is the walls, a comma, then the clues" (new) |
| params | `WxH`, an absent `x`, the full-form `d` and `e`, `n`, `t` | stated | "Rome's parameters" |
| params | no `d` reads as Easy; a `d` with another letter | gap | "A Rome params string with no difficulty letter is Easy" (new) |
| params | refusals: a side below 3, a difficulty out of range | stated | "Rome's parameters" |
| pref | `goal` | stated | "Rome's two highlight preferences" |
| pref | `loop` | stated | "Rome's two highlight preferences" |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `hint-notes`: what it changes | not-owed | `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose" |
| pref | `hint-notes`: Rome starts on `implicit`, not the convention | gap | "Rome's hint pencils marks in only as a step needs them" (new) |
| control | drag a direction to place an arrow; right-drag for a mark | stated | "Rome places an arrow or a mark by drag or by keyboard cursor" |
| control | a tap: selects, or clears the player's own arrow | stated | "A tap that commits no move selects the square" |
| control | a press on a fixed clue or outside the grid | stated | "A Rome press on a fixed clue or outside the grid grabs nothing" |
| control | the keypad's `↑`, `↓`, `←`, `→` and Clear | stated | "Rome offers one key per arrow, and a Clear key" |
| control | the Marks key | not-owed | `engine-notes`: "The engine gives every note-taking game its Marks key" |
| control | Mark all (`M`) | stated | "Rome fills and cleans candidate marks in one press" |
| control | Enter arms a placement, Space a mark, the arrow key that follows; Space while placing clears | gap | "Rome's Enter and Space arm the cursor for one arrow key" (new) |
| control | the typed `8`, `2`, `4`, `6`, Backspace and Delete | gap | "Rome's digits 8, 2, 4 and 6 type the arrows" (new) |
| control | the arrows move the cursor | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | a mark pointing off the grid | stated | "Rome refuses a pencil mark pointing off the grid" |
| hint | `populate`, `clean` | not-owed | `engine-candidate-hints`: "Candidate-elimination hints clean obvious candidates at populate" |
| hint | `note` | not-owed | `engine-candidate-hints`: "The implicit reading writes the notes a firing rests on" |
| hint | `dup`: the strike after a placement, in Rome's words | gap | "Rome's hint strikes an arrow its area already holds" (new) |
| hint | `single`, `regionsFull`, `hiddenSingle` | gap | "Rome's hint places an arrow for one of three reasons" (new) |
| hint | `loop` | stated | "A walk in a Rome hint is numbered square by square" |
| hint | `onlyHome`, `pair` | gap | "Rome's hint keeps the squares an area's arrows must go in" (new) |
| hint | `reach` | gap | "Rome's hint keeps the one mark that leads to a goal" (new) |
| hint | `opposite` | gap | "Rome's hint rules out an arrow into a square that could only point back" (new) |
| hint | the order: the walk's ladder | not-owed | `engine-candidate-hints`: "The walk owns the ladder" |
| hint | the order the game's own rules are met in, and their tiers | gap | "Rome's rules are met in one order, Easy first" (new) |
| hint | what a step marks | stated | "A Rome hint rests on what the player can see or mark" |
| words | the status bar (none) | not-owed | `ts-engine`: "Solve, the status bar and text export follow from the game's methods" |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- "Rome explains its next deduction" said only that the hint narrates "by the
  premise that forces it"; of the game's eight reasons only the loop was
  stated, in a scenario. The others are now requirements, written from
  `hint-text.ts` and the solver's rules.
- "Rome's solver deduces and never guesses" says the rules are gated Easy,
  Normal, Tricky and names none of them. The new order requirement names them
  by tier. It states the order the solver's ladder meets them in; which
  recorded firing the hint shows next is the engine's choice
  (`engine-candidate-hints`: "The walk owns the ladder", "A candidate hint plan
  continues from its latest steps where it can").
- `engine-candidate-hints`: "A game states the reading it starts on" makes
  `populate` the convention and asks a game that overrides it to say so. Rome
  starts on `implicit` (`newUi`), and only Map's spec states its own default.
  Group, Mathrax, Seismic, Solo and Unequal start on `implicit` as well
  (`git grep -n 'candidateReading: "implicit"' src/games`), and each owes the
  same sentence.
- The step that rules out an arrow into a square that could only point back
  strikes each neighbor as its own leg (the walk splits a firing by the square
  it strikes), and under the default reading a leg from a square with no marks
  is folded into the arrow or the marks it leaves. The writer's "one step" for
  both neighbors was not what the code does. No board in fourteen walked from
  4×4 to 10×10 struck both neighbors at once, so the two-leg journey is read
  from the code and not seen.
- The area rule's reason can list several arrows (`only`), but on a board
  with an answer a square is the last home of one arrow only, so the scenario
  that had one square as the last home of two was of a board the mistake check
  refuses first.
- The help page says to "use the arrows on the numpad to enter arrows
  directly". The code answers to the characters `8`, `2`, `4` and `6` wherever
  they are typed, the number row included, and the help does not say so.
- The run-of-walls list is the engine's (`src/engine/wall-runs.ts`), shared
  with Seismic, and no engine capability states it: each game's spec describes
  it for itself. One requirement in `engine-params` would serve both.
- A params `d` with an unknown letter encodes back as `d?` (`4x4dz` gives
  `4x4d?`), in Rome and in Salad alike. The requirement states only that it is
  refused.
