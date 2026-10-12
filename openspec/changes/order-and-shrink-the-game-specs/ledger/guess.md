# guess

The Purpose is unchanged.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Guess refuses params no board can be dealt for | title kept. Sentence 1 (the bounds of `ncolors`, `npegs` and `nguesses`) cut; sentence 2 untouched. Scenario "An eleventh color is refused by the engine" dropped; "Invalid params are rejected" kept | `bounds` on the three `numberItem`s of `paramConfig`, `src/games/guess/index.ts:533`, `:542`, `:547`; `engine-params`, "Params validity is the engine's check" (a bound's refusal names the field by its label; scenario "A value outside its range"). `src/games/guess/state.test.ts:68` holds the eleventh color |
| Params: Standard and Super are Guess's two named boards | removed, with its scenario | the two titled leaves and their params: `presets`, `src/games/guess/state.ts:147`. That a named leaf's title is its label and its line, and that any other board is titled by its params: `engine-params`, "A preset keeps a declared title only for a name no field says" (which names Guess's "Standard") and "One describer labels every params set". The words of `4x10, 6 colors, no duplicates`: the `label` of the `colors` and `pegs-per-guess` items and the `words` of the `allow-duplicates` modifier, `index.ts:531`-`572`; `state.test.ts:94` holds a label of that form |
| Controls: A color key wears its color and its digit | retitled "Controls: Guess's tenth color is the zero key". Sentence 1 (a key is painted in the color it enters and labeled with the digit it sends) cut; in sentence 2, the collection's `'a'` rollover and what `digitOf` answers reworded out, leaving the game's own: the tenth color is the `'0'` key, the game reads it as ten, and why. Scenario untouched | `engine-input`, "An on-screen key may name a palette color" (the swatch, and the label still the character sent), "A color keypad is built by the shared builder" and "A color keypad may spell its tenth value zero" (`colorKeysZeroIsTen`, the `'a'` rollover it stands beside, `digitOf` answering zero). The call: `requestKeys`, `index.ts:241` |
| Hint: Guess's hint places what the rows prove, then suggests a guess | sentence 1 ("Guess SHALL provide `hint`, `hintKeepTrack` and `refreshHintStep`.") cut; the rest and the scenario untouched | the `Game` object, `index.ts:600`-`611`: what the `Game` type says of a game with a hint |
| Hint: A mark step places what one reading proves | in sentence 1, "with the row it reads striped, any answer slots it leans on outlined, and the colors it rules out framed" cut. Sentence 2 and both scenarios untouched | `hintMarks.roles.ring` ("*the framed colors*, which the step rules out, or, when it suggests a guess, the color it picks for each slot"), `.outline` ("*the outlined slot*, one whose colors the step already knows and leans on") and `.stripes` ("*the striped row* the step reads"), `index.ts:602`-`607` |
| Hint: Three readings come from one scored row alone | last sentence ("Each SHALL stripe the row and frame the colors it rules out.") cut; the rest and the scenario untouched | `hintMarks.roles.stripes` and `.ring`, as above |
| Hint: A score the settled slots account for rules out the rest | last sentence ("Each SHALL stripe the row and outline the settled slots.") cut; the rest and the scenario untouched | `hintMarks.roles.stripes` and `.outline`, as above |
| Look: Guess's win flash sweeps the whole board | title kept. "SHALL sweep … diagonally" reworded to "SHALL light", over the game's own positions; sentence 2 (a lit position's box is filled with a flash color, an empty hole with it and a peg keeping its color) cut. Kept: which positions, the answer's row, why empty holes light, the feedback pegs. Scenario untouched | the diagonal: `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep` of the position, asked at `src/games/guess/render.ts:607`). The fill: `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground is filled with the role's color and keeps what it holds) |
| Controls: Guess's pointer acts on the release | third pass: title kept. From sentence 2, "An unconsumed press is answered with a release at the press point, so a press that slides off before it lifts SHALL still act where it started" cut; its last clause stands as a sentence of its own ("A press the touch hold promoted to the right button SHALL therefore still act as itself."). Sentence 1 and the scenario untouched | `engine-input`, "A press the game declines is answered with its release where it was pressed". `src/puzzle/components/view-interactive.ts:450`-`452` |
| Rules: A row is submittable only when it is markable | Found, mended: "(all, unless `allowBlank`)" now says how many are enough with blanks on, at least one | |
| Status bar: Guess says why a row will not go | Found, mended: "SHALL say so" replaced by the sentence the status bar reads, and the scenario's THEN quotes its ending | |

## Kept, and why

- **Params: Guess's parameters.** The codec is written out (`encodeParams`,
  `decodeParams`, `state.ts:159` and `:166`); the letters, the two-case flags
  and "in any order" are stated nowhere else.
- **Controls**, nearly all. Guess declares no `targetVerbs`: every press, key
  and tap is an arm of `interpretMove` (`index.ts:248`). The one sentence that
  reads as the collection's, "Guess SHALL offer an on-screen key for each of
  its colors, a Clear key, and a Submit key", is `requestKeys`, a function
  written by hand, and is the antecedent of what each key does.
- **Controls: A hold stays off the panel**, "Guess SHALL NOT declare
  `ignoresSecondaryButton`". A decision with its reason; the flag's absence
  says nothing of why.
- **Controls: Guess's pointer acts on the release**, "An unconsumed press is
  answered with a release at the press point". Kept until the third pass,
  which cut it (see its row).
- **Controls: Notes mode is the engine's pencil mode.** The first sentence
  names the engine field; everything after it is a departure (the frame moves
  rows, the Marks key shows no hidden cursor).
- **Hint: Guess's hint places what the rows prove…** and **Hint: A mark step
  places what one reading proves**, "SHALL derive its own rule-outs from the
  rows rather than read the player's". `engine-hints`, "A hint is deduced from
  the board in play" leaves which marks a step rests on to the game.
- **Hint: A hint's marks on the answer row sit beside the content.**
  `engine-hints`, "A hint marks beside the content, never behind it" gives the
  rule; where a frame and an outline go on a slot of blocks is this game's
  drawing.
- **Hint: A settled color is out of the other slots…**, "outlining the slot
  and reading no row" and "outlining them and striping the row". Left: each
  is a clause of the technique's sentence, and "reading no row" is the
  technique.
- **Status bar: Guess's status bar counts the guesses…**, the scenarios with
  `COMPLETED!` and `Auto-solved.`. The words are the engine's; that Guess's
  own follow them, and that a loss has none before it, is the game's.
- **Look: Guess draws an empty hole as quiet surface**, second sentence. It
  names which elements keep colors of their own and gives no color.

## Engine requests

- "An unconsumed press is answered with a release at the press point", in
  "Controls: Guess's pointer acts on the release". It would read the same in
  any game whose pointer acts on the release, and belongs in `engine-input`
  beside "A game declines a button it did not act on". The app does it, in
  `src/puzzle/components/view-interactive.ts:452` (a press the game did not
  consume is sent its release at the press's own location).
  **Answered:** `engine-input`, "A press the game declines is answered with
  its release where it was pressed".

## Found

- **"Rules: A row is submittable only when it is markable" says "enough pegs
  are filled (all, unless `allowBlank`)"** and never how many are enough with
  blanks on: one (`isMarkable`, `state.ts:200`; the `allow-blanks` doc says
  "at least one color in it").
- **"Status bar: Guess says why a row will not go" does not give the
  sentence.** It is `Guess N of M: this game allows no repeated colors.`
  (`statusbarText`, `index.ts:495`); the other status requirement quotes
  every other string.
- **"Controls: A key acts whether or not the cursor is shown" and "Controls:
  A color lands in the selected slot, else the first empty one" both state
  where a color goes with no cursor.** Left as they are.

## Review

9 rows read, each against the declaration or the requirement it names, read
whole; 5 corrected, 1 removed with its sentence, no sentence restored. The
engine request stands.

Changed:

- **"Params: Guess's parameters"**: the added sentence "The boards on its
  menu, two of them named, SHALL be those its `presets` gives (…)" removed,
  and its row with it. `Params` is not left hollow by the removal of the
  Standard and Super requirement, so that removal is plain; its row names
  `presets` (`state.ts:147`) and
  `src/engine/__snapshots__/params-stability.test.ts.snap` holds `c6p4g10Bm`
  as the default and `c8p5g12Bm` as `Type/Super`.
- **"Params: Guess refuses params no board can be dealt for"**: "Beside the
  bounds its number fields declare in `paramConfig`" removed.
- **"Controls: Guess's tenth color is the zero key"** (the writer's title,
  kept): the body was "SHALL be the engine's color keypad whose tenth key is
  `'0'` (`engine-input`, …)", the copy with a citation. It now states the
  game's own: the tenth color is the `'0'` key, which the game reads as ten
  (`index.ts:361`-`362`), because its colors stop at ten.
- **"Hint: A mark step places what one reading proves"**: "What a step's
  frames, outline and stripes stand for SHALL be the legend's (`hintMarks`)"
  removed.
- **"Look: Guess's win flash sweeps the whole board"**: "SHALL be the
  collection's (`ts-engine`, …) over" reworded to "SHALL light".

Checked and found sound:

- The three bounds (`index.ts:533`, `:542`, `:547`) and `state.test.ts:68`.
- `engine-input`, "An on-screen key may name a palette color" (the swatch,
  and the label still the character sent) and "A color keypad may spell its
  tenth value zero" (the `'a'` rollover, `digitOf` answering zero) state what
  went from the keypad requirement; `requestKeys` calls
  `colorKeysZeroIsTen` (`index.ts:243`).
- The legend (`index.ts:602`-`607`) against the three mark clauses cut: the
  framed colors ruled out, the outlined slot leaned on, the striped row read.
  The two mark clauses the writer kept in "Hint: A settled color is out of
  the other slots…" stay: there the outlined slots are the ones the step
  settles, which the legend's "already knows and leans on" does not say.
- `ts-engine`, "A game gives each element a position, and the route is which
  position it gives" and `engine-colors`, "A solved flash drawn as a color
  takes a shared color" against the flash sentences; `render.ts:607`.
- **The engine request.** `engine-input` was searched for every "release":
  no requirement states that the app answers a press the game declined with
  a release where it was pressed. `engine-hints`, "executeHint sends the
  gesture and never applies the move" says it in a parenthesis, of the hint's
  replay ("a declined press as its release alone"), and `ts-engine`, "An
  input that changes what the `Ui` shows is a UI-only change" says only when
  a declined press is claimed. The sentence stays in the spec and the request
  stays here. The code is `view-interactive.ts:450`-`452`.
- Guess declares no `targetVerbs`, and its `Controls` subject states every
  key in arms of its own, so it needs no pointer.
- Every title under "Kept, and why" exists, and the line citations were
  opened.

## Third pass

Rows of the engine's third-round tables that name Guess: 1. Engine requests
of its own: 1, answered. Sentences cut: 1 (two clauses of one sentence).
Clauses kept: 3.

- **"Controls: Guess's pointer acts on the release"**: that an unconsumed
  press is answered with a release at the press point, and that a press
  which slides off still acts where it started, went to `engine-input`, "A
  press the game declines is answered with its release where it was pressed"
  (its last sentence is the second clause). Kept: that the action is keyed
  on the button class and its press declined, the hold toggle's press, and
  that a press promoted to the right button acts as itself, which follows
  from the button class and is the game's.
- **Kept: "and nothing once the game is over"** in "Rules: Guess checks the
  answer row's rule-outs against the code". `ts-engine`, "A mistake check
  compares with the one answer, hidden or not" speaks of a board with no one
  answer established; Guess always has its code.
- **Kept: "on a board so large that its search finds no fitting answer within
  its budget"** in "Hint: Following the hint wins, and the hint refuses only
  a dead end". `engine-hints`, "A search that can prove a position lost says
  which of its two ends it met" is of a search for a finishing line that can
  prove a loss; this search is for a fitting answer and proves none.
- No "no departure" sentence, none of the form "What a pasted game ID opens
  as" and none citing `engine-difficulty`.

## Found, mended

- How many pegs are enough with blanks on: "Rules: A row is submittable only
  when it is markable" now says at least one (`isMarkable`, `state.ts:202`).
- The sentence of "Status bar: Guess says why a row will not go": quoted from
  `statusbarText`, `index.ts:506`.
- Two requirements state where a color goes with no cursor: left. Each says
  what the other does not (that a key acts on a hidden cursor and reveals
  it; where the cursor rests after an entry), so neither is a copy to
  remove.
