# mines

The Purpose is unchanged.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Death is recoverable and is not a loss | the last clause of sentence 2 ("and only a win taken with the Solve function SHALL report as solved-with-help") cut, the sentence ending at "a loss on death". Both scenarios kept. Found, mended: the first scenario's THEN says the status is "ongoing" as it was on the dead board, where it said "still" of the board after the undo alone | `ts-engine`, "Solve leaves a solved board" (scenario "Solve finishes the board": the midend reports it solved-with-help) and "Only the Solve command sets the solver record" (only Solve) |
| Rules: Mines checks flags against its mines | scenario "Check & Save on Mines" dropped; sentences and "A right flag passes" untouched | `ts-engine`, "A mistake check compares with the one answer, hidden or not", whose one scenario is this one, set in Mines |
| Description: Mines finishes by deduction as its hint's plan | last sentence ("A board already won SHALL pass.") cut; scenario "A board its first square wins" dropped | `engine-params`, "A board already won finishes by deduction" (its scenario "A board the first move wins" is set in Mines: the ID opens and the save restores). `src/games/mines/mines-hint.test.ts:397` and `:405` hold the `9x9n1` case |
| Description: The board laid out supersedes the description it started from | removed. "Once the first click has laid the board out" joins "Description: A laid-out Mines description is its first square and a masked layout"; scenario "The game ID names the board being played" dropped | what `supersededDesc` answers and when: the requirement it joined, and `supersededDesc`, `src/games/mines/index.ts:497`. That the game ID, a restart and a save then name that board: `engine-params`, "The description in play follows the position" (scenario "Mines' first click generates the real layout"), "Restart enters the board the description in play opens" and "A save carries the description in play and the one the board started from". `src/games/mines/mines.test.ts:326`, `:402` and `:484` and `src/engine/desc-supersede.test.ts:99`, `:141` and `:185` hold the promise |
| Description: A laid-out Mines description is its first square and a masked layout | gains "Once the first click has laid the board out," at its head, from the requirement above; nothing else changed | |
| Controls: A Mines press opens on its release, and the secondary button flags | title kept. Sentence 3 ("The secondary button SHALL flag a covered square or take its flag off, and a drag on from it SHALL be the engine's sweep; the left button has none.") reworded to the one pointer of the subject: the flag, its drag, the cursor and the select keys come from `targetVerbs` (rule 2, for the keys the spec never named), keeping "the left button has no drag". Scenario "A flag drag" dropped. Found, mended: gains "a key acting at once" (`interpretTargetVerbs`, `index.ts:430`, has no release arm), and the first sentence drops "after" twice to stay within 500 characters, claiming the same | `targetVerbs.secondary` and its `does` string, `index.ts:247`; `sweep` with `buttons: ["secondary"]`, `index.ts:258`; the keys: `engine-input`, "The engine owns a declaring game's press and select keys"; the drag: `engine-input`, "A drag on from a press repeats the press" (its scenario "A drag paints and does not toggle" is the dropped one with marks for flags) and "A sweep honors its declared limits and skips no target" (the limit to one button) |
| Hint: One Mines number alone settles its squares | sentence 3 ("The step SHALL outline the number, and the mines it already touches, and ring the squares it decides.") cut; sentences 1 and 2 and the scenario untouched | `hintMarks.roles.ring` ("each square the step decides…") and `.outline` ("what the step reasons from: the numbers it counts, and the mines one of them already touches."), `index.ts:646`-`648`; `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws" |
| Hint: Mines counts the mines left | last sentence ("The step SHALL outline the numbers and stripe the squares they account for.") cut; the rest and the scenario untouched | `hintMarks.roles.outline` and `.stripes` ("…or the squares a count of the mines left covers."), `index.ts:647`-`650` |
| Look: Mines' flashes fill every square on their lit beats | retitled "Look: A death's flash fills every square in the error color on its lit beats". Sentence 1 (the win flash sweeps from the bottom left to the top right; a lit square is filled with a flash color and keeps what it holds) cut. The death's flash kept as it stood. Scenario "A flagged mine under the win's highlight" dropped | the route: `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep` otherwise: a diagonal from the bottom left to the top right), which `redraw` asks at `src/games/mines/render.ts:369`. The fill: `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground of a cell is filled with the role's color and keeps what it holds) |
| Hint: The Mines hint opens the first square, and refuses a dead or exhausted board | Found, mended: retitled "Hint: The Mines hint refuses a dead or exhausted board". First sentence cut ("Before the first click the hint SHALL open a square, saying that no mine is laid in the first square opened or beside it."); the two refusals and the scenario kept | this spec, "Hint: The Mines hint's first square is the middle one", which says which square, what the move is and the sentence in full |

## Kept, and why

- **Params**, all five. The codec is written out (`decodeParams`,
  `encodeParams`, `src/games/mines/state.ts:125` and `:165`), so the letters,
  the short form and what a string with no `n` decodes to are stated nowhere
  else. "Params: Mines never asks for a board that may need a guess" is the
  game's case of `engine-params`, "A letter upstream writes is read by name",
  which leaves which letter to the game.
- **Params: Mines refuses a grid of 2²⁸ squares or more.** `engine-params`, "A
  grid too large for a game is refused in one sentence" gives the words and
  says "where the ceiling sits SHALL stay the game's own". Its scenario names
  Mines' ceiling, but as a case of the sentence, not as the rule.
- **Rules: The first move carries the layout it laid out**, first sentence.
  `engine-params`, "A save carries the description in play and the one the
  board started from" says the settling move carries what it settled. Which
  move that is here, and that replaying it generates nothing, is `executeMove`'s
  `begin` arm (`index.ts:450`), hand-written; the two refusals after it hang
  on it.
- **Rules: The clock reflects the state of play.** Already a pointer to the
  engine's timer with the one departure (`timerHolds`).
- **Hint: Mines ships an explained deductive hint from proved facts**, whole,
  with its scenario. `engine-hints`, "A hint is deduced from the board in
  play" says which marks a step may rest on is the game's to state, and gives
  the Mines flag as a scenario; the rule is this requirement's.
- **Hint: The Mines hint opens the first square, and refuses a dead or
  exhausted board**, "the collection's deduction-exhausted words". It is a
  pointer already: it says which of the collection's refusals Mines gives and
  quotes nothing.
- **Hint: Each Mines hint step names its numbers and its reason.**
  `engine-hints`, "A hint step always names a technique, with no un-narrated
  fallback" says a step names its technique; that the sentence names the
  numbers it counts is this game's wording rule.
- **Hint: Mines' hint takes the simplest deduction the board supports**, "one
  that changes nothing on the board SHALL NOT be shown". `engine-hints`, "A
  hint SHALL show only steps the player's board does not already decide"
  states it of the shared plan loop's `showable`; Mines' plan is its own loop
  (`src/games/mines/hint.ts`).
- **Look: The Mines cursor and marks sit at the square's edge**, second
  sentence. `engine-hints`, "A hint mark is drawn on the cell's border" allows
  the gutter or the cell's outermost pixels "according to the game's layout";
  which one is Mines', and the mistake's frame, are the game's.

## Engine requests

None.

## Found

- **"Hint: The Mines hint opens the first square…" and "Hint: The Mines hint's
  first square is the middle one" state the opening step twice**: the first
  says the hint opens a square and what it says, the second which square and
  the sentence in full. Left as they are.
- **The spec did not say what the keyboard does.** Enter opens or chords at
  the cursor and Space flags, through `interpretTargetVerbs`
  (`index.ts:430`), acting at once and not on a release. The Controls
  requirement now names the declaration and the engine requirement for the
  cursor and the select keys (rule 2); that a key acts at once where the
  left button waits for its release is still said nowhere.
- **"Rules: Death is recoverable…", scenario "A player dies, undoes, and
  carries on"** says "the game status is still 'ongoing'" of the board after
  the undo; `status` (`index.ts:509`) answers ongoing on the dead board too,
  which the sentence says and no scenario shows.

## Review

10 rows read, each against the declaration or the requirement it names, read
whole; 3 corrected, 1 removed with its sentence, no sentence restored.

Changed:

- **"Controls: A Mines press opens on its release, and the secondary button
  flags"**: the pointer named `engine-input`, "A drag on from a press repeats
  the press" for the flag, its drag and "the keys", and that requirement says
  nothing of keys. It now names "The engine owns a declaring game's press and
  select keys", which is where Enter and Space are stated, and says the
  cursor comes from the declaration too. One pointer for the subject; the
  drag's requirement is in the row.
- **"Hint: Each Mines hint step names its numbers and its reason"**: the
  added sentence "What a step's ring, outline and stripes stand for SHALL be
  the legend's (`hintMarks`)" removed, and its row with it. The `Hint`
  subject says plenty of its own, so the two mark sentences are plain
  removals, each with its row.
- **"Look: Mines' flashes fill every square on their lit beats"**: "Beside
  the collection's win flash (`ts-engine`, …)" removed for the same reason.
  The death's flash reads as it did before the cut, under the writer's new
  title.

Checked and found sound:

- `ts-engine`, "Solve leaves a solved board" (scenario "Solve finishes the
  board", of any game) and "Only the Solve command sets the solver record"
  together state the solved-with-help clause; the kept scenario "Solve on a
  dead board" is the game's case of it.
- `ts-engine`, "A mistake check compares with the one answer, hidden or not"
  holds the dropped scenario word for word, in its own requirement.
- `engine-params`, "A board already won finishes by deduction", "The
  description in play follows the position", "Restart enters the board the
  description in play opens" and "A save carries the description in play and
  the one the board started from" state what the removed description
  requirement said of the ID, a restart and a save; what `supersededDesc`
  writes is in the requirement that gained the clause.
- The legend (`index.ts:646`-`650`) against the two mark sentences: the ring,
  the numbers and touched mines outlined, the squares a count covers striped.
- `ts-engine`, "A game gives each element a position, and the route is which
  position it gives" and `engine-colors`, "A solved flash drawn as a color
  takes a shared color" state the sweep and the fill; `render.ts:369` asks
  `sweepStep`.
- Every title under "Kept, and why" exists, and the line citations were
  opened.
- The 29 requirements left untouched: none holds a sentence a declaration or
  a shared requirement states whole. `validateParams` (`state.ts:174`) holds
  every refusal the `Params` subject states but `1 ≤ n`, which is the mines
  field's bound (`index.ts`, `bounds: { min: 1 }`) and was left as half of
  the one inequality.

## Third pass

Nothing changed in the spec. Rows of the engine's third-round tables that
name Mines: 0. Engine requests of its own: 0. Sentences cut: 0. Clauses kept:
3, each read against the third-round requirement it resembles.

- **Kept: "and nothing before the first click lays the mines out"** in
  "Rules: Mines checks flags against its mines". `ts-engine`, "A mistake
  check compares with the one answer, hidden or not" says nothing is flagged
  where "the game's solver or search did not establish exactly one answer".
  Mines' answer is the layout and no solver's; that there is none until the
  first click is the game's (`findMistakes`, `src/games/mines/index.ts:520`).
- **Kept: "The left button SHALL act on its release"** in "Controls: A Mines
  press opens on its release, and the secondary button flags".
  `engine-input`, "A press the game declines is answered with its release
  where it was pressed" is of a declined press; Mines consumes its press and
  acts where the pointer lifts, which its scenario shows.
- **Kept: "it SHALL refuse with the collection's deduction-exhausted words"**
  in "Hint: The Mines hint opens the first square, and refuses a dead or
  exhausted board". `engine-hints`, "A hint gives every step deduction still
  forces before it refuses" binds a board "whose tier permits search"; Mines
  has no tiers, so which refusal it gives is still the game's to say.
- No "no departure" sentence, none of the form "What a pasted game ID opens
  as" and none citing `engine-difficulty`.

## Found, mended

- The opening step stated twice: the first sentence of "Hint: The Mines hint
  opens the first square, and refuses a dead or exhausted board" removed and
  the requirement retitled "Hint: The Mines hint refuses a dead or exhausted
  board"; "Hint: The Mines hint's first square is the middle one" says all
  of what went. The older title stands in the sections above as it was when
  they were written.
- That a key acts at once: a clause of "Controls: A Mines press opens on its
  release, and the secondary button flags".
- "Still ongoing" after the undo: the scenario of "Rules: Death is
  recoverable and is not a loss" now says the dead board was ongoing too
  (`status`, `index.ts:509`).
