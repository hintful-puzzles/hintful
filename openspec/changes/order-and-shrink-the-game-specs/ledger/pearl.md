# pearl

The Purpose was corrected: it named "its description and params encodings" and
"its hint", and now says what of the params and of the hint the spec holds.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Pearl's findMistakes compares the board with its one solution | retitled "Rules: A Pearl mistake is a line the solution lacks or a cross on an edge it uses". "Because boards are uniquely solvable, the game SHALL implement `findMistakes`:" and "each a definite mistake" cut from the first sentence; the rest and the three scenarios kept | `ts-engine`, "The engine supports an ephemeral, opt-in mistake-checking hook" (the hook returns what contradicts the unique solution) and "A mistake check compares with the one answer, hidden or not" |
| Params: Pearl's parameters | replaced by the pointer requirement "Params: A Pearl params string with no difficulty letter is Easy" (rule 2). The field list and the encoding cut, with scenario "Params round-trip". The sentence about upstream's `n` cut, with scenario "Upstream's unchecked-board letter" | `paramConfig`, `src/games/pearl/state.ts:115`, and the `paramsCodec` field list, `:127` (`dims`, `choice "d"` over `DIFF_CHARS`, `unusedLetter("n")`); `engine-params`, "A letter upstream writes is read by name" (read, changes nothing, never written; its first scenario is Pearl's `6x6den`); `src/engine/params-read-whole.test.ts` holds `12x8dtn` and `6x6den`, and `src/games/pearl/pearl.test.ts` decodes `12x8dtn` |
| Params: Pearl's parameter bounds | retitled "Params: Pearl refuses a Normal board whose width and height sum under 11". First sentence (each of `w` and `h` at least 5) and scenario "A board narrower than the minimum" cut | `bounds: { min: 5 }` on the dimensions, `src/games/pearl/state.ts:118`; `engine-params`, "Params validity is the engine's check" |
| Params: Pearl's difficulty letters are e and t | removed. Its second sentence's first half (no letter decodes as Easy, whatever the default preset's difficulty) and scenario "A string with no letter" joined "Params: A Pearl params string with no difficulty letter is Easy". Cut: the letters, that the short form leaves them out, the refusal of another letter, and scenario "The Normal preset" | `choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true })`, `src/games/pearl/state.ts:130`, with `DIFF_CHARS = "et"`, `:82`; `engine-params`, "A params string is read whole or refused" (a letter the tag does not list is refused); `src/engine/__snapshots__/params-stability.test.ts.snap` holds `6x6dt` with its short form `6x6` |
| Generation: Pearl's generator gates every board on the solver | first clause (a unique solution at the requested difficulty, and failing one tier easier) became a citation, with a clause saying where the tiers are stated; "SHALL then greedily minimize the clues" kept. Scenario "Generated boards are uniquely solvable at their difficulty" dropped, and "A pearl is taken away after the gate" written, the kept sentence having none | `engine-difficulty`, "A difficulty tier binds the board it generates" (both directions; its first scenario is the dropped one) and "Every tier promises one solution found at its cap". The new scenario is the removal loop of `newClues`, `src/games/pearl/generator.ts` (a removal is kept while `pearlSolve` at the tier returns 1; the lower tier is asked once, before it) |
| Hint: Pearl explains the next deduction | retitled "Hint: One Pearl hint step is one premise of the solver's ladder". "The game SHALL implement `hint` as a recording projection of its own solver ladder" cut to "one premise of the solver's ladder"; the list kept. Scenario "Following the hint finishes a board" dropped, and "A black pearl settled on both axes" written | `engine-hints`, "The solver and the hint are two projections of one deduction engine"; the scenario is "The hint walk SHALL cover every preset a game offers" and "A hint finishes a board from a right entry made out of order". The new scenario is `nailSquare` with `oneAxis`, `src/games/pearl/solver.ts:199` (across before up and down) |
| Hint: A Pearl hint step says why and marks what it decides | removed, with its scenario | the legend, `hintMarks.roles`, `src/games/pearl/index.ts:493` (`ring`: a line from a square's center to its edge, or a cross on an edge, in the action color; `outline`: the squares the step reasons from); `engine-hints`, "A hint step always names a technique, with no un-narrated fallback" and "A bound hint step's words SHALL name exactly the marks it draws" |
## Kept, and why

- **Rules: A Pearl mistake is a line the solution lacks or a cross on an edge
  it uses.** The two kinds, that a missing segment is none, and the empty
  answer on a board the solver cannot finish are in no shared requirement.
- **Params, "a string with no difficulty letter SHALL give Easy, whatever the
  default preset's difficulty".** A departure from the declared codec's
  ordinary reading (`engine-params`, "A params string is read whole or
  refused": a piece left out is as `defaultParams` has it, which is Normal
  here). The codec is built on a default of its own,
  `src/games/pearl/state.ts:128`.
- **Params: Pearl refuses a Normal board whose width and height sum under
  11.** `validateParams`; the overflow ceiling is the game's (`engine-params`,
  "A grid too large for a game is refused in one sentence").
- **Description, both requirements.** `parseDesc` is the game's; the run
  letters are the engine's helper, which no engine requirement states (see the
  engine requests).
- **Preferences: Pearl's appearance preference.** Untouched. It holds the
  key, the order of the two choices and the default, which a stored
  preference depends on, and neither the label nor the preference's
  description of itself. The default is `newUi`'s
  (`src/games/pearl/index.ts:111`) and no declaration's.
- **Solver: Pearl's Solve uses the generator's solution when it has one.**
  `ts-engine`, "The midend retains generator aux info for Solve", hands the aux
  over; that Pearl's Solve takes it is `solve`'s own.
- **Controls, all seven.** `interpretMove` is hand-written. The cross drag is
  declared with `dragMarkVerbs` (`src/games/pearl/index.ts:175`), and that it
  is the right button's, and that a line is refused over a cross, is what the
  requirement states of it.
- **Hint: Pearl's hint tries a square, then a pearl, then an early loop.** The
  order is the solver's rung list (`src/games/pearl/solver.ts:544`) and the
  recording pass; `hintRungs` lists premises in another grain.

## Engine requests

- The verdict rule of `trackTargets` (completed, on track with the step
  shrunk to what is left, off) → `engine-hints`. The sentence is
  "`hintKeepTrack` SHALL judge a move by the edges it changes, holding a step
  whose edges are only partly made and shrinking it to what is left", in
  "Hint: Pearl's hint follows a step made one edge at a time"; the code is
  `trackTargets`, `src/engine/hint-track.ts:40`, which `pearlKeepTrack` calls
  (`src/games/pearl/hint.ts:456`).
- The run-letter clue grammar of `encodeRunLength` and `scanRunLength` (`a`–`z`
  for 1–26 blanks) → `engine-params`. The sentence is "the letters `a` through
  `z` SHALL each stand for a run of 1 to 26 unclued squares, a longer run
  being written as several letters", in "Description: A Pearl run letter
  counts its unclued squares from a"; the code is `src/engine/run-length.ts`,
  which `src/games/pearl/state.ts:155` and `:169` call. Whether the last run
  is written (`keepTrailingBlanks`) stays the game's.

## Found

- **"Greedily minimize the clues" removes white pearls only.** The removal
  loop of `newClues` (`src/games/pearl/generator.ts`) tries each white pearl
  twice and never a black one, upstream's behavior reproduced on purpose (the
  comment there says why). The spec does not say so.
- **The spec names `validateDesc` as Pearl's.** Pearl declares no validator;
  the verdict is the engine's reading of `newState` (`engine-params`, "The
  engine derives a description's verdict from newState").
- **"Controls: Pearl's keyboard cursor draws lines and marks" says nothing
  that "Controls: Pearl's Enter key traces a path the arrows extend" does
  not**, but its scenario. A second copy inside the spec, of the game's own,
  left as it stood.
- **"Solver: Pearl's solver is a certified deduction ladder" names a test (the
  firing census, the frozen differential) in its body and in both scenarios.**
- **The snapshot of encoded params has no line for the 8×8 Normal preset**: it
  is the default, and is held there as `default`.

## Review

9 rows read, each against the declaration or the requirement it names; 4
corrected, of which 2 were withdrawn with their edits.

Changed:

- **"Preferences: Pearl's appearance preference" restored as it stood**, and
  its row withdrawn. The cut had taken the key out of the body and put "the
  one its `prefs` declares" in its place. The requirement never held the
  label ("Puzzle appearance") or a description of the preference: what it
  holds is the key, the order of the choices and the default, which stay.
- **"Hint: Pearl's hint follows a step made one edge at a time" restored as it
  stood**, and its row withdrawn. The sentence added to it ("A step's marks
  SHALL be the roles `hintMarks` declares, and Pearl SHALL draw no other") was
  a pointer inside a subject with eleven requirements of the game's own. The
  marks requirement it stood in for is removed plainly, and its row says
  where the marks are stated.
- **The `n` clause cut from the Params pointer** ("upstream's trailing `n`
  read as `engine-params`, …"): a second pointer in one requirement, to a
  segment of the declared codec the first already names.
- **The two engine requests reworded** to the wording the other ledgers
  carry. Neither is stated: `engine-hints` says what the midend does with a
  verdict and not when `trackTargets` gives each, and `engine-helpers` names
  `scanRunLength` and `encodeRunLength` only as names a game may not
  redeclare.

Checked and found sound:

- The Generation pointer is kept: the subject is owed and would hold only
  "greedily minimize the clues" without it. It is true of `newClues`
  (`src/games/pearl/generator.ts:199`): the full set of pearls is asked at the
  tier and at the tier below, and each removal at the tier alone (`:219`).
  `engine-difficulty`, "A difficulty tier binds the board it generates" states
  both directions.
- The Params pointer: the codec starts from a default of its own at Easy
  (`state.ts:128`), so "whatever the default preset's difficulty" is a
  departure and stays. `bounds: { min: 5 }` is at `:118`, `unusedLetter("n")`
  at `:132`; `params-read-whole.test.ts:153` holds `6x6den` and `12x8dtn`,
  and the snapshot holds `6x6dt` with `6x6`.
- The new scenario "A black pearl settled on both axes" is `nailSquare` with
  `oneAxis` (`solver.ts:199`): left and right before up and down.
- The seven engine titles the rows and the spec cite are exact. The legend
  (`index.ts:493`) states the line, the cross and the outline the removed
  marks requirement did.
- `validateDesc` in the Description requirement is the engine's function
  (`src/engine/desc-error.ts:250`), not a hook of Pearl's; the sentence is
  loose and not false, and stays under Found.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
