# ascent

The Purpose was left as it stood: it names nothing the cut removed.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Ascent is solved by one path through every number | "and flashes" cut from the scenario's last line; the sentence kept | `ts-engine`, "The win flash plays on a forward move that solves the board" |
| Rules: findMistakes compares the board with its one solution | the clause "so that Check & Save refuses a board holding one" cut, and "and Check & Save refuses to save" from the scenario; the rest kept | `quick-save`, "Check & save gates the checkpoint on a clean board" |
| Params: Ascent's parameters | retitled "Params: Ascent refuses an area of 1000, a Hexagon out of proportion and a 2×2 in Edges". The field list, the 2-to-50 limits and "A game ID SHALL encode every parameter and round-trip through decode" cut; the three refusals `validateParams` makes kept. Scenario "A game ID round-trips through the parameters" replaced by "A Hexagon of even height", since the kept sentence had none | `paramConfig`, `src/games/ascent/index.ts:422` (`bounds: { min: 2, max: 50 }` at `:432`); `engine-params`, "Params validity is the engine's check" and "Encode and decode are mutual inverses over the corpus". The new scenario is `validateParams`, `src/games/ascent/index.ts:382` (the sentence at `:385`) |
| Params: Ascent's rulesets are told apart by a square's neighbors | retitled "Params: One mode letter names an Ascent ruleset and its shape". Kept: the mode letters of the encoding, that the dialog's two fields are one letter, and what a string naming no mode decodes as. Cut: the four rulesets, their order and their neighbors, and the three shapes. Both scenarios kept | `RULESETS`, `src/games/ascent/index.ts:245` (each `name` and `rule`), `rulesetItem` at `:423` and the shape field at `:467`; `engine-params`, "A game declares its rulesets with rulesetItem" |
| Params: Each ruleset declares what it offers | removed, with its scenario | each ruleset's `only`, `src/games/ascent/index.ts:249` to `:268`; `engine-params`, "A ruleset declares what it offers of the other settings", "The engine refuses a deal that asks for what a deciding field does not leave" (the refusal is the engine's and no game writes it) and "The engine refuses a submitted form that holds what a deciding field does not leave" (the dropped scenario's case) |
| Params: The Type menu has a section for each ruleset | removed, with its scenario | `BOARDS`, `src/games/ascent/index.ts:226`, `presets` with its `tiers` option, `:279`, and `defaultParams`, `:294` (the first board); `engine-params`, "The preset menu gives each ruleset a section" and "The preset menu is a grid"; `src/engine/params-stability.test.ts` lists the eighteen lines under their sections |
| Generation: Ascent's generator keeps every board soluble at its tier | last sentence ("Its loop SHALL be bounded.") cut | `engine-difficulty`, "Every generate-until-success loop is bounded by the shared retry limit"; `retryLimit`, `src/games/ascent/generator.ts:308` |
| Generation: Ascent grades its difficulty tiers honestly | removed, with its scenario | `engine-difficulty`, "A difficulty tier binds the board it generates" (its first scenario is the dropped one; it binds every game with more than one tier, so every grid mode) |
| Controls: Ascent draws and erases a path | the clause "so Ascent has a secondary meaning and SHALL NOT declare `ignoresSecondaryButton`" cut; what the right button does kept | `engine-input`, "The secondary-button declaration is held to the behavior" (a game declares the flag if and only if the button means nothing) |
| Controls: Ascent offers a number keypad | "an on-screen keypad of the digits `1`–`9` and `0` and a Clear key" reworded to "Ascent's on-screen keypad"; how a pointer writes a number, what Clear does and why the keypad is there kept, with the scenario | `requestKeys: numberKeys`, `src/games/ascent/index.ts:609` |
| Controls: Ascent's keys click at the cursor, and the number pad types or moves | the eight directions of the pad cut for "a direction pad", and "Up and Down SHALL zigzag, keeping the cursor in its column" for the helper `interpretMove` steps by; Enter, Space and Backspace kept, and the preference's key `numpad`, its two choices in their order and which is the default. Gains "its 5 and 0 still typing" from "Controls: A number-pad key that moves Ascent's cursor types nothing". Scenario kept | `engine-input`, "The engine reads a number-pad digit as a direction, once" and "A cursor step on a sheared hexagonal board is the engine's"; called at `src/games/ascent/ui.ts:749` and `:754` |
| Controls: A number-pad key that moves Ascent's cursor types nothing | removed, with its scenario. Its last sentence (the pad's 5 and 0 type) joined "Controls: Ascent's keys click at the cursor, and the number pad types or moves" | `engine-input`, "The engine reads a number-pad digit as a direction, once" ("A game with such a pad SHALL take all eight directions from it before asking `digitOf`, so that none is also a digit"; its scenario "A diagonal is a direction and not a digit") |
| Preferences: Ascent's auto-advance preference moves the selection past numbers already placed | its name ("Skip past already-placed numbers when advancing") cut; the key `auto-advance-runs`, the default and what the preference changes kept, with the scenario | `prefs`, `src/games/ascent/index.ts:509` (`name`) |
| Hint: Ascent explains the next number | the sentence "The hint SHALL refuse on a solved board and while `findMistakes` reports anything." cut; the rest and the scenario kept | `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| Hint: A hint step says why in one sentence and marks what it reads | "of at most 120 characters" cut; the three marks cut, keeping that the ring and the outlines follow square and hexagonal cells alike; "without drawing the number" cut; the last sentence and the scenario kept | `engine-hints`, "Hint narration SHALL be short enough to read at a glance" (120 characters) and "Requesting a hint never mutates the board" (only highlighting is added); `hintMarks.roles`, `src/games/ascent/index.ts:618` |

## Kept, and why

- **Params: Ascent's full encoding adds hidden ends, the tier and symmetry
  after the mode letter**, and the mode letters of **Params: One mode letter
  names an Ascent ruleset and its shape.** `encodeParams` and `decodeParams`
  are written out (`src/games/ascent/index.ts:302`, `:317`); no `paramsCodec`
  declares a letter.
- **Params: Ascent's square grids turn and its hexagonal grids do not.**
  `transposeParams` is a function of the game's own (`:595`), and the reason
  is in no declaration.
- **Params: An Ascent label names a Hexagon by its size and says only the
  departures.** The words come from functions inside two `paramConfig` items
  (`size`, `:433`; `label.words`, `:444`), so the declaration holds them. Kept
  for the habit that decides when the words are said (hidden in Edges, shown
  elsewhere), which is what a title of the game's own means; no test holds
  "shown ends".
- **Generation: Ascent's generator keeps every board soluble at its tier**,
  scenario "Every preset produces a uniquely soluble board". It reads like
  `engine-difficulty`, "Every tier promises one solution found at its cap"; it
  is the requirement's one scenario.
- **Hint, "SHALL NOT read lines the player drew"** and **"A step SHALL be
  followed by placing its number by any gesture".** `engine-hints`, "A hint is
  deduced from the board in play", leaves which marks a step rests on to the
  game, and the keep-track verdict is `ascentKeepTrack`'s own
  (`src/games/ascent/hint.ts:1024`).
- **Hint, the "120 characters" of the rival, pointers and Edges-route
  requirements.** Each says what the sentence gives up when its fuller form
  would not fit, which is the game's choice and not the limit.
- **Hint: Ascent's hint asks its techniques in the order of their tiers** and
  **On an Edges board Ascent's hint asks the arrows before the runs of their
  tier.** `hintRungs` lists the rungs in another order (`lines` and `pointers`
  after the route rungs) and nothing reads it for order.
- **Look: What Ascent draws**, "Moves SHALL be applied instantly, with no
  interpolated animation." Ascent declares no `animLength`, so the sentence
  restates an absence. It is the sentence the requirement's one scenario
  gives the case of, and cutting it leaves the path-ends sentence with a
  scenario to be composed.
- **Look: Ascent draws its cells on a quiet surface and lifts a given**, and
  the three after it. Ascent's renderer is its own, so each is a choice in
  `redraw` among the collection's roles.

## Engine requests

None.

## Found

- "Look: What Ascent draws" holds two unrelated sentences under a title that
  names neither, and its scenario is of the second only. The first (the
  numbers shown at the ends of a path holding one number, `updatePathHints`,
  `src/games/ascent/state.ts:347`) has no scenario.
- The spec has no requirement for Solve. `solve` runs the solver at its
  hardest tier and answers a move whether or not the board came out complete
  (`src/games/ascent/index.ts:521`); a loaded board is one some tier solves,
  so the case does not arise in play.
- The spec never says what `findMistakes` returns on a board its solver does
  not complete from the clues: nothing (`src/games/ascent/index.ts:540`).
- "Params: Ascent's square grids turn and its hexagonal grids do not" says the
  Hexagon "SHALL be recorded as wide by nature in the portrait guard's
  ledger": a sentence about a guard's ledger and not about the game.
- "Controls: The UI_UPDATE tail of interpretMove is kept" states how a
  function is built and what must not be done to it; what a player sees is
  its scenario alone.
- The dropped scenario "A ruleset is asked for on a shape it does not have"
  quoted "Board shape must be Rectangle for Edges."; the sentence is the
  engine's, built from `only`.
