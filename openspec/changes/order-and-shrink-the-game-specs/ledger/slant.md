# slant

The Purpose was corrected: it named "its formats and controls" and "an
explained deductive hint drawn in the element-type legend", which the spec no
longer holds as such. It says instead what of the params, the controls and the
hint is the game's own, and that the clicks, keys and params are declared.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: A same-slant mark the solution contradicts is a mistake | the scenario's "and the hint refuses" reworded out; sentences unchanged | `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game" (`FIX_MISTAKES_FIRST` when `findMistakes` reports anything) |
| Params: Slant's parameters are a size and a difficulty | removed. A sentence in "Params: A Slant string with no difficulty letter reads as Easy" sends the reader to `paramConfig`, the declared codec and `presets` (rule 2), and keeps the tie its first scenario held: Normal is the letter `h`. Scenarios "Params round-trip" and "Invalid params are rejected" dropped | `paramConfig`, `src/games/slant/state.ts:131` (`bounds: { min: 2 }`, `:135`; `difficultyItem`, `:137`) and the `paramsCodec` field list, `:141` (`dims`, `choice "d"` over `eh`, full form only); `engine-params`, "Params validity is the engine's check" (a bound's refusal); `src/engine/__snapshots__/params-stability.test.ts.snap` holds `5x5dh` / `5x5` and the other presets; `src/games/slant/slant.test.ts:111` and `:126` |
| Params: A Slant string with no difficulty letter reads as Easy | title kept. Gains the pointer sentence and "Normal SHALL keep the letter `h`" (see the row above). "and SHALL refuse one whose `d` is followed by a letter other than `e` or `h`" cut, with the scenario's line "AND `5x5dh` with its `h` written `x` is refused"; the missing-field sentence kept | `engine-params`, "A params string is read whole or refused" ("A letter after a tag that the tag does not list … SHALL each be refused"; scenario "A difficulty letter the game does not have"); the letters are `DIFF_CHARS`, `src/games/slant/state.ts:38` |
| Generation: Slant generates solver-gated boards | retitled "Generation: Slant strips clues while its difficulty's solver still solves the board". First sentence (a unique solution its difficulty's solver finds, and not solvable one level down) cut (the pointer that first replaced it went in the second pass); the stripping sentence kept, with "that solver" written out as "the solver of the board's difficulty". Scenario kept | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates" (solvable at the requested tier and not one tier down); the gate is `src/games/slant/generator.ts:121` |
| Solver: Slant solves with a graded deductive solver | scenario "Generated boards solve at exactly their difficulty" dropped; the sentences and "Solve recovers from a wrong mid-game state" kept | `engine-difficulty`, "A difficulty tier binds the board it generates", scenario "A board generated above the easiest tier needs that tier"; `src/games/slant/slant.test.ts:330` holds it for Slant |
| Controls: A click cycles a square through its three states | retitled "Controls: Slant's clicks and keys are its declared verbs, and a preference swaps the buttons". "`interpretMove` SHALL cycle" replaced by a sentence that sends the reader to `targetVerbs` and keeps the two cycles in the game's own symbols as the antecedent of the kept swap sentence. Scenario "Left-click cycles a square" dropped: it repeats the kept sentence and the `does` string. "Swapped button order" kept | `targetVerbs.primary` and `.secondary` with their `does` strings, `src/games/slant/index.ts:140`-`147`; `engine-input`, "The engine owns a declaring game's press and select keys" |
| Controls: The Marks key turns Slant's notes mode on and off | removed (the sentence the first cut joined to "Controls: A notes-mode press marks the nearest side", saying where turning notes mode on is stated, went in the second pass). "With notes mode off, input SHALL be unchanged" and scenario "Notes mode off leaves a click cycling" dropped | `engine-notes`, "One way into note-taking across the collection" (the Marks key, last on the keypad, and the app's `P`), "The engine gives every note-taking game its Marks key" (appended whether or not the game has a key list; Slant has no `requestKeys`) and "An offered Marks key is never inert"; the arm is `src/games/slant/index.ts:181`. The dropped scenario's case is the left-click cycle in this spec's "Controls: Slant's clicks and keys are its declared verbs, and a preference swaps the buttons" |
| Controls: Slant's keys cycle the cursor square or set it outright | retitled "Controls: Slant's own keys set the cursor square outright". First sentence (the arrows move and reveal the cursor) and second (the select keys cycle, one each way) cut; the key list of the third cut, and what it says of the keys (they set the square directly, with no cycle) reworded to stand on "Each key-only verb of `targetVerbs`". Scenario kept | `engine-input`, "One arrow press reveals the cursor and moves it" and "The engine owns a declaring game's press and select keys" (Enter the left-click verb, Space the right-click verb, a verb's own keys that verb); `targetVerbs.keyOnly[].keys` and `.does`, `src/games/slant/index.ts:148`-`167`; `squareGrid`, `:139` |
| Preferences: Slant exposes its two upstream preferences | retitled "Preferences: Slant's two preferences swap the buttons and fade grounded diagonals". "SHALL expose via the `Game.prefs` hook", the choice labels and "(boolean …)" cut; both keys and the order of `left-button`'s two choices kept (the order restored in the second pass: no test of the game reads `left-button` or its choices); what each preference changes kept, and "default off" kept as "off unless set". Scenario kept | `prefs`, `src/games/slant/index.ts:428`-`448` (`kw`, `name`, `type`, `choices`); `ts-engine`, "The engine supports per-game user preferences". That the first choice is `\`-first is this spec's "Controls: Slant's clicks and keys are its declared verbs, and a preference swaps the buttons" |
| Hint: Slant ships an explained deductive hint | removed. Its one clause of the game's own (the solver is seeded with the placed diagonals and the player's same-slant marks) joins "Hint: Slant's hint uses every technique at either difficulty", whose scenario is a case of it. Scenario "The plan completes deductive boards" dropped | the `Game` type (`hint`); `engine-hints`, "A hint is deduced from the board in play", "The hint walk SHALL cover every preset a game offers" (following hints solves a board of every preset) and "A hint step always names a technique, with no un-narrated fallback" |
| Hint: Each hint step names its technique and says why the move is forced | removed. "lead with the recognizable indication", the one clause with no shared home, joins "Hint: Each Slant technique is narrated by its own reason". "name its technique", "state why the move is forced" and "conclude in the necessity voice" cut; scenario "Loop and dead-end firings name the connectivity reason" dropped | `engine-hints`, "A hint step always names a technique, with no un-narrated fallback" ("SHALL always explain why its move is forced by a named technique") and "The necessity-voice rule applies to every hinting game not ledgered as narrating moves". The dropped scenario is the second sentence of "Hint: Each Slant technique is narrated by its own reason" |
| Hint: Each Slant technique is narrated by its own reason | gains the sentence "Each step SHALL lead with the recognizable indication."; its own sentences and scenario unchanged | |
| Hint: The hint's recorder leaves the generator's solve unchanged | removed | `engine-hints`, "The solver and the hint are two projections of one deduction engine" ("The generator runs the techniques to a fixpoint with the recorder off … the hint runs the same techniques with the recorder on"). That the seed too is an option is how the solver is built (`SlantSolveOpts`, `src/games/slant/solver.ts:64`): a seed is a player's board, and the generator has none |
| Hint: Slant hint rendering follows the element-type legend | replaced, with "Hint: A hint's evidence is drawn in the evidence color", by the pointer requirement "Hint: Slant's hint marks are its legend's, with no slash drawn in a ringed square" (rule 2). "SHALL highlight, not perform", the ring in `COL_HINT` and the placed mark in `COL_HINT` went; "no slash preview: the diagonal is drawn only once the move is made" kept. Scenario "A target is ringed and left empty" kept | `hintMarks.roles.ring`, `src/games/slant/index.ts:384`; `colors`, `src/games/slant/render.ts:99`; `engine-hints`, "The engine SHALL own the hint mark roles and the words for them" (a ring marks what the step decides) and "Requesting a hint never mutates the board" |
| Hint: A hint's evidence is drawn in the evidence color | joined into "Hint: Slant's hint marks are its legend's, with no slash drawn in a ringed square". The list of what is outlined, and the three colors, went; "computed against the board as that step fires" kept. Scenario "Evidence is visible as an area" dropped; "Every step carries visible evidence" kept | `hintMarks.roles.outline`, `src/games/slant/index.ts:385` (the clues it reads in the hint color, the diagonals round them, the chain, the pairs along a line of 2s, the marks it relies on, the doubled square); `colors`, `src/games/slant/render.ts:99`-`101`; that a dead-end step shades the trapped components is this spec's "Hint: Each Slant technique is narrated by its own reason" |
| Hint: Slant's hint uses every technique at either difficulty | gains the seeding sentence from "Hint: Slant ships an explained deductive hint"; its own sentence and scenario unchanged but for "The hint" becoming "It" | |

## Kept, and why

- **Params, "a string with no `d` segment as the default difficulty, Easy".**
  Slant's tier is a `choice` segment, for which `engine-params`, "A params
  string is read whole or refused", names no tier ("the segment names no tier
  of its own"); the game states it.
- **Params: Slant refuses a grid too large to count.** `engine-params`, "A
  grid too large for a game is refused in one sentence", leaves where the
  ceiling sits to the game.
- **Description: Slant descriptions are run-length clue grids.** The reader
  is the engine's `scanRunLength`, and no capability states the grammar; see
  the engine requests.
- **The four `Generation` requirements that say what each solver uses.** What
  a tier means for this game.
- **Solver, "The solver SHALL be reused by `solve()` and `findMistakes`".**
  Slant is not on the search's tiers, so no shared requirement says where its
  Solve and its mistake check take their answer.
- **Controls, the two cycles in "Slant's clicks and keys are its declared
  verbs".** The `does` strings say them; kept as the antecedent of "The two
  SHALL be swapped", and as the game's own symbols for the declaration's
  words.
- **Controls: Slant's own keys set the cursor square outright**, as Clusters
  keeps the same of its number keys: the `does` strings say "draw", and not
  that a key does not cycle.
- **Hint, "Each step SHALL lead with the recognizable indication"**, in
  "Hint: Each Slant technique is narrated by its own reason". No shared
  requirement states it (see the engine requests).
- **Hint: Slant's hint steps come in the order its solver finds them.**
  `hintRungs` lists the techniques, and nothing reads it for order: the order
  is the solver's loop.
- **Look: Slant draws its squares on the collection's quiet surface** and the
  five `Look` requirements after it. Slant's renderer is hand-written, so
  which surface a slashed square takes, the margin's tone and what the flash
  lights are decisions of its own.

## Engine requests

- "Each step SHALL lead with the recognizable indication", in "Hint: Each
  Slant technique is narrated by its own reason". Light Up's spec
  has the same sentence and Pattern's and Keen's a form of it. `engine-hints`
  states the technique ("A hint step always names a technique, with no
  un-narrated fallback") and the necessity voice, and names the arc "from
  indication through reasoning to conclusion" only in passing ("Removing an
  em-dash keeps the sentence's substance"). Belongs in `engine-hints`; the
  code is the sentence builders of `src/engine/hint-words.ts`.
- The run-length clue grammar: "one digit … per clue, with maximal runs of
  clueless vertices compressed as `a`–`z` (a run of 1–26, a longer run
  emitting `z` chunks)", in "Description: Slant descriptions are run-length
  clue grids". Palisade's description states the same grammar. Belongs in
  `engine-params`, beside the dot-run grammar; the code is `scanRunLength` and
  `encodeRunLength`, `src/engine/run-length.ts`. What a game's digits mean,
  and whether a short description is refused (Slant) or padded (Palisade),
  stay the game's.

## Found

- The spec does not say that a notes-mode drag across more sides repeats the
  mark, which the help page does ("drag on across more sides to do the same
  to each"): `markDrag`, `src/games/slant/index.ts:256`.
- The spec does not say that the `left-button` preference swaps Enter and
  Space with the buttons, which the help page does:
  `src/games/slant/index.ts:128`.
- The spec does not say that turning notes mode off, or Escape, lets go of a
  pin only; that the Marks key lets go of one is `src/games/slant/index.ts:183`.
- "Solver: Slant solves with a graded deductive solver" says the solver is
  reused by `solve()`. A dealt board's Solve takes the generator's answer
  from `aux` and asks the solver only where there is none:
  `src/games/slant/index.ts:300`.
- The spec never says when a hinted move completes its step
  (`slantHintKeepTrack`, `src/games/slant/hint.ts:784`).
- The dropped scenario "Invalid params are rejected" said a 1-wide grid gives
  "a non-null error string" from validation; the refusal is the bound's, made
  by the engine before `validateParams` is asked.

## Review

14 rows read, each against the declaration or the requirement it names, read
whole; 3 corrected (a scenario dropped, a cross-reference, a line citation),
3 rows added, no sentence restored.

Changed:

- **"Hint: Each hint step names its technique and says why the move is
  forced"** removed. The writer kept it whole for one clause; three of its
  four clauses are `engine-hints`' and its scenario was the next requirement's
  second sentence. The clause with no home joined "Hint: Each Slant technique
  is narrated by its own reason", and the engine request names it there.
- **"Controls: Slant's clicks and keys are its declared verbs, and a
  preference swaps the buttons"**: scenario "Left-click cycles a square"
  dropped, a restatement of the sentence above it.
- **"Rules: A same-slant mark the solution contradicts is a mistake"**: "and
  the hint refuses" left the scenario; that is the midend's.
- `SlantSolveOpts` is at `solver.ts:64`.

Checked and found sound:

- The 5 engine titles the spec cites are exact, and the others the ledger
  names exist and state what their rows removed: the bound's refusal, the
  unlisted letter after `d`, the tier binding in both directions, the arrow
  that reveals and moves, Enter and Space as the two buttons' verbs, the
  Marks key appended to a keypad the game does not list, the three roles.
- The declarations: `bounds: { min: 2 }`, `choice "d"` over `eh` in the full
  form only, the six presets, the three verbs' `does` strings and keys,
  `prefs`, the legend's two roles, the three hint colors.
- The new sentences: `interpretMove` hands every press outside notes mode to
  `interpretTargetVerbs`; Slant has no `requestKeys`; `5x5` decodes at the
  default's tier, Easy.
- The kept requirements, read for copies: the `Generation` four are what
  each tier's solver uses; `Look` is a hand-written renderer's. "A mistaken
  square SHALL be marked in the error color" stays, the renderer being
  Slant's own.
- Each subject read alone: none hollow, no dangling antecedent.

## Second pass

The brief's "A pointer is for that case only" and its line on a preference's
key, applied. 8 citing sentences read; 2 removed, 3 kept as the pointer of an
owed subject, 3 kept as the game's own.

Removed, each a copy with a citation in a subject that says plenty:

- **Generation, the stripping**: "What the dealt board's tier then promises
  is `engine-difficulty`, …". Four requirements of the subject say what each
  tier's solver uses.
- **Controls, the notes-mode press**: "Notes mode SHALL be turned on and off
  as in every game that takes notes (`engine-notes`, …); Slant has no keypad
  key of its own beside the Marks key." `Controls` has its pointer
  (`targetVerbs`) and three requirements of notes-mode input of its own. The
  requirement is as it stood before the cut, so its row is gone.

Kept as pointers: `Params`, `Controls` (`targetVerbs`), `Hint` (the legend).
Kept as the game's own: the refusal's quoted sentence in `Params`; "Of the
two preferences `prefs` declares"; the cell surface in `Look`.

Preferences: the cut kept both keys and dropped the order of `left-button`'s
choices with their labels. No test of the game names `left-button` or
`fade-grounded` (the tests set `ui.swapButtons` directly), so the order is
restored: "whose choices are in order `\`-first, the default, and `/`-first"
(`choices`, `src/games/slant/index.ts:433`).

Each subject read alone after the edits: none hollow, no fragment, every
title fits.
