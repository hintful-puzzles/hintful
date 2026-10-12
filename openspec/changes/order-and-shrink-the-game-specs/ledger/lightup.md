# lightup

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Light Up's params are validated | title kept. Sentence 1 (a width or height below 2, a symmetry or a difficulty off its list, refused by the engine from `paramConfig`) cut. Sentence 2 untouched. Scenario "Invalid params are rejected" loses "a 1-wide grid", which the cut sentence refused and `validateParams` does not; the other three untouched | `bounds: { min: 2 }`, `src/games/lightup/index.ts:488`; `choices: SYMMETRY_CHOICES`, `index.ts:506`; `difficultyItem(DIFF_NAMES, "difficulty")`, `index.ts:525`; `engine-params`, "Params validity is the engine's check" (each item's `bounds`, each choice inside its list, then the game's own `validateParams`) |
| Controls: Light Up accepts pointer and cursor input | title kept. "A left-click" and "a right-click" reworded to "the left-click verb of Light Up's `targetVerbs`" and "the right-click verb", which is where a reader finds which input applies which. "A click on a wall SHALL be a no-op" and "A left-click on a marked square, and a right-click on a bulb, SHALL be rejected without a history entry" joined in one sentence that says a verb makes no move there ("without a history entry" goes: no move is no entry, and the kept scenarios say it). The drag sentence cut to the game's departure and its reason (only the right-click verb is repeated); "on the squares it passes that held what the pressed square held" goes. All three scenarios kept; it takes "The keyboard is refused where the click is" from the requirement below | `targetVerbs.primary`, `.secondary` and `.sweep` (`buttons: ["secondary"]`), `index.ts:126`-`145`; `engine-input`, "The engine owns a declaring game's press and select keys", "A drag on from a press repeats the press" (each further target that holds what the pressed one held gets the verb) and "A sweep honors its declared limits and skips no target" (a drag limited to some buttons) |
| Controls: Light Up's keyboard cursor | retitled "Controls: Completing a Light Up board hides the cursor". Sentence 1 (the arrows move and reveal a cursor) and sentence 2 (Select or Enter a bulb, select2 or `i` a mark, under the clicks' rejection rules) cut; sentence 3 kept, with "keyboard" added since the cursor is no longer introduced. Scenario "The keyboard is refused where the click is" moves, unchanged, to "Controls: Light Up accepts pointer and cursor input"; scenario "The last bulb is placed from the keyboard" written for the kept sentence | the cursor: `squareGrid(…)`, `index.ts:133`, and `engine-input`, "One arrow press reveals the cursor and moves it"; Enter, Space and `i`: `engine-input`, "The engine owns a declaring game's press and select keys" (Enter the left-click verb, Space the right-click one, a verb's own keys that verb) and `keys: [letterKey("I")]`, `index.ts:137`. The new scenario: `changedState`, `index.ts:107` |
| Hint: Light Up ships an explained deductive hint | removed, with its scenario "The plan completes deductive boards". "The game SHALL implement `hint()` returning a plan of narrated steps computed by the game's own solver techniques from the player's current position, honoring the bulbs" cut; that the impossible-marks already placed are honored as the bulbs are joins "Hint: A hint step that rules a square out places the impossible-mark" | `engine-hints`, "The engine supports an ephemeral Hint System", "The solver and the hint are two projections of one deduction engine" and "A hint is deduced from the board in play" (an entry the player placed is never a step and a step may rest on it; which marks a step may rest on it leaves to the game, so the impossible-marks stay); the scenario: `engine-hints`, "A hint finishes a board from a right entry made out of order" and "A hint step always names a technique, with no un-narrated fallback" |
| Hint: A hint step that rules a square out places the impossible-mark | gains "The hint SHALL honor the impossible-marks the player has placed as it does the bulbs.", from the requirement above | |
| Hint: Light Up hint rendering follows the element-type legend | retitled "Hint: A Light Up hint target is ringed with no bulb or mark previewed", which is what its body says. Sentence 1 ("The displayed hint SHALL highlight, not perform") cut; the rest and the scenario untouched | `engine-hints`, "Requesting a hint never mutates the board" (a hint displays a plan through highlights, and the player applies a step only by following it or by an explicit apply) |
| Hint: A Light Up hint step names its technique and says why | retitled "Hint: A Light Up hint step leads with what to look for, and one firing is one step". Sentence 1 ("Each step SHALL name its technique") cut; "and conclude in the necessity voice" reworded out of sentence 2; sentence 3 untouched. Both scenarios kept | `engine-hints`, "A hint step always names a technique, with no un-narrated fallback" and "The necessity-voice rule applies to every hinting game not ledgered as narrating moves" (a forced step is required to carry necessity) |
| Look: Light Up's cursor and completion flash | title kept. "SHALL sweep the open squares diagonally" reworded to "SHALL light the open squares only", which keeps what is the game's (which squares are elements of the flash) and drops the route. Both scenarios kept | `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep` of its center, a diagonal from the bottom left); the game's call is `flash.win(sweepStep(x, y))`, `src/games/lightup/render.ts:189` |

## Kept, and why

- **Rules: Light Up ships findMistakes.** `ts-engine`, "A mistake check
  compares with the one answer, hidden or not" names neither the two kinds of
  mistake nor that a mark on a square the answer leaves empty is not one.
- **Params: Light Up's parameters** and **Params: Light Up reads a params
  string with no symmetry, and the legacy r.** `decodeParams` and
  `encodeParams` are written out by hand (`src/games/lightup/state.ts:122`,
  `:150`), so the letters and their order are not declared anywhere.
- **Params: A Light Up label names its walls and symmetry only when they are
  unusual.** The label words are functions inside `paramConfig`
  (`index.ts:497`, `:511`); what counts as the usual symmetry for a size is
  their logic and not a field.
- **Params: Light Up's words call the square a wall.** A decision about
  wording, and a departure from upstream's "black squares".
- **Params: Light Up refuses a grid too large to count.** `engine-params`, "A
  grid too large for a game is refused in one sentence" leaves the ceiling to
  the game.
- **Description.** `parseDesc` is the game's own (`state.ts:393`): the
  engine's run-length scanner has no requirement that states the grammar.
- **Generation: Light Up generates solver-gated boards.** "accept the grid
  only when the solver solves it at the target difficulty" and "reject a
  board that is then still solvable one difficulty lower" are
  `engine-difficulty`, "A difficulty tier binds the board it generates", but
  they are two of five steps whose order is the requirement.
- **Hint: A hint step that rules a square out places the impossible-mark.**
  `engine-hints`, "A hint relies only on marks the player can make" asks for
  a mark placed as a move where a tier needs one; that Light Up's is the
  impossible-mark, on every ruled-out square, is the game's.
- **Hint: A Light Up hint target is ringed with no bulb or mark previewed**
  and **Hint: Light Up draws a hint's evidence by what it is.** The legend says
  the three ways evidence is drawn in the player's words; the palette roles,
  the white line inside the clue's ring and "a bulb target and a mark target
  SHALL look identical" are `redraw`'s.
- **Hint: On an Unreasonable board the hint stops at the guess point.**
  `engine-hints`, "A Search is refused and never narrated" states the
  refusal; that the deductions before it are still narrated is in no shared
  requirement.
- **Hint: Light Up's hint steps come in the solver's scan order.** The order
  is the solver's loop (`src/games/lightup/solver.ts`), not `hintRungs`.
- **Look: The impossible-mark is the ruled-out cross.** What the preference
  changes, and its default (`newUi`, `index.ts:103`), are not in `prefs`.

## Engine requests

- "`hintKeepTrack` SHALL classify a player's partial completion of a
  multi-cell step as on-track, and SHALL shrink the step in place to the
  squares that remain.", the whole of "Hint: A partly followed hint step
  shrinks in place". It is the verdict rule of `trackTargets`,
  `src/engine/hint-track.ts:40`, and Singles and Tents state it of themselves
  in the same terms (`singles.md`, § "Engine requests", has the full
  request). Belongs in `engine-hints`, beside "A completed verdict vouches
  for the rest of the plan".
- "Completing the board SHALL hide the keyboard cursor.", the whole of
  "Controls: Completing a Light Up board hides the cursor". Singles does the
  same in its own `changedState` (`src/games/singles/index.ts:103`) and its
  spec does not say so. Belongs in `engine-input`, beside "One arrow press
  reveals the cursor and moves it", if it is to be the collection's rule; no
  engine code does it today, each game writes the line.
- "On a board of the `Unreasonable` tier the hint SHALL narrate the
  deductions that remain from the player's position", in "Hint: On an
  Unreasonable board the hint stops at the guess point". Belongs in
  `engine-hints`, beside "A Search is refused and never narrated": that a
  deducing hint on an `Unreasonable` board gives every step deduction still
  has before it refuses. `deduceHintPlan`, `src/games/lightup/solver.ts:553`.

## Found

- **The spec does not say what a params string with no `d` decodes to.**
  `decodeParams` sets Easy before it reads `r` or `d` (`state.ts:139`),
  whatever `defaultParams` holds. A hand-written codec, so the engine fixes
  nothing here and an old link depends on it.
- **A params string with no `b` or no `s` keeps the default's walls and
  symmetry** (20%, and 4-way rotational demoted on a board that is not
  square). The spec states the demotion and not that the percentage is the
  default's.
- **"Params: Light Up reads a params string with no symmetry, and the legacy
  r" says "Decoding SHALL accept two forms beyond the full encoding"**; the
  short form `{w}x{h}` is a third, stated in the requirement before it.
- **"Rules: Light Up ships findMistakes": "A board without a unique solution
  SHALL yield `[]`"** is not reachable by a player: such a board does not
  load (`engine-params`, "A board with a mistake check loads only with
  exactly one answer").
- **The scenario "Generated boards solve at exactly their difficulty" sits
  under the requirement that lists the techniques**, and states the binding
  that "Generation: Light Up generates solver-gated boards" requires. Left.
- **"Hint: Light Up hint rendering follows the element-type legend" has a
  title its body does not carry**: the body is about the target's ring. It
  was so before the cut; retitled in review.
- **The cut is small because little of the spec is a copy.** The params
  codec and the description parser are written out by hand, and the hint's
  requirements are techniques, wording and colors.

## Review

6 rows read, each against the declaration or the requirement it names, read
whole; 3 rows corrected and 2 added.

Changed:

- **Params: Light Up's params are validated.** "The smallest width and
  height, and the symmetries and tiers there are, SHALL be those its
  `paramConfig` declares" cut: a pointer in a subject with six requirements
  of its own. The scenario's "a 1-wide grid" went with it, since nothing the
  requirement still states refuses one.
- **Controls: Light Up accepts pointer and cursor input.** The sentence that
  only sent the reader to `targetVerbs` and `engine-input` cut; the two
  toggles now name "the left-click verb of Light Up's `targetVerbs`"
  themselves.
- **Hint: Light Up's hint takes the player's impossible-marks as premises**
  (the writer's title) is gone. Its citation of "A hint is deduced from the
  board in play" was a copy with a citation, and its one scenario the
  collection's promise. The game's clause joins the requirement that says why
  a step places the mark.
- **Hint: A Light Up hint target is ringed with no bulb or mark previewed**:
  a title for the body, and "SHALL highlight, not perform" cut.

Checked and found sound:

- The codec is written by hand (`decodeParams`, `state.ts:122`;
  `encodeParams`, `:150`) and so is the description's reading (`parseDesc`,
  `state.ts:392`), so both subjects keep their letters.
- The declarations: `bounds: { min: 2 }` (`index.ts:488`), the symmetry
  choices (`:506`), the tiers (`:525`), the two verbs, `I` and the sweep's
  `buttons: ["secondary"]` (`index.ts:126`-`145`).
- Every cited engine title is exact, and each requirement states all of what
  its row removed.
- The three engine requests, each against `engine-hints` and `engine-input`
  by title and by a grep for its words: none is stated. The verdict rule of
  `trackTargets` is in no capability. Nothing says completing a board hides
  the cursor; each game writes the line (`changedState`, `index.ts:107`).
  "A Search is refused and never narrated" and "Deduction runs out only
  where the tier permits search" state the refusal on an `Unreasonable`
  board and not that what deduction remains is narrated first.
- The hint takes the marks as it finds them: `deduceHintPlan` deduces on a
  copy of the state in play (`solver.ts:553`).
- "Width times height must not be unreasonably large." is `AREA_TOO_LARGE`
  (`src/engine/params.ts:255`), and "7x7 Easy, 30% walls, no symmetry" is
  `lightup.test.ts:192`.
- Each subject read alone: none hollow, no dangling antecedent.
- Every requirement left untouched was read for a copy by the three classes.
  What they hold is a hand-written codec, parser, generator or solver, a hint
  technique, its wording or its colors, and the look.
