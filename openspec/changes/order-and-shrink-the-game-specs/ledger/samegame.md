# samegame

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Same Game's params are a size, a color count and a scoring system | retitled "Params: Same Game reads upstream's r and sets nothing", and moved to stand last in its subject, after the requirement that says what a string holds. Sentence 1 (the four fields and the `{w}x{h}c{ncols}s{scoresub}` form) removed. Sentence 2 (the trailing `r`) cut to what the letter asked upstream for and that it is read and sets nothing; "encoding SHALL never write it" removed. Scenario "Params round-trip and lenient decode" replaced by "A string upstream wrote for a random grid", which keeps its `r` case and its strings and drops the round trip | the fields: `paramConfig`, `src/games/samegame/state.ts:72`-`95`; the encoding: `paramsCodec(defaultParams, [dims, num "c", num "s", unusedLetter("r")])`, `state.ts:101`-`111`; the round trip: `engine-params`, "A game declares its params encoding once, and both codec halves are derived" and "Encode and decode are mutual inverses over the corpus"; what a string holds, in this spec: "Params: Same Game writes its params whole in both encodings"; never written: `engine-params`, "A letter upstream writes is read by name". `src/games/samegame/samegame.test.ts:71`-`76` holds `15x10c4s2` and `15x10c4s2r`, and the `samegame` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` the presets' strings |
| Params: Same Game refuses params it cannot deal | title kept. The one sentence cut to the two refusals `validateParams` makes (fewer than three colors, a grid of one square); the width, the height, the nine colors and the two scoring systems removed. Scenario "Invalid params are rejected" replaced by "Two colors, and one square", with the sentences from the game's test | `bounds: { min: 1 }` on the dimensions, `state.ts:75`; `bounds: { max: 9 }` on the colors, `state.ts:79`; `choices: ["(n-1)²", "(n-2)²"]`, `state.ts:86`; each refused by `engine-params`, "Params validity is the engine's check". The kept two: `validateParams`, `state.ts:115`-`116`, and `samegame.test.ts:87`-`96` |
| Params: A Same Game title names the colors and the other scoring | removed, with its scenario "The other scoring system" | the two `label.words`, `state.ts:80` ("`${p.ncols} colors`") and `:89` ("alt. scoring" unless `scoresub` is 2, beside the choices that name the two scorings); `engine-params`, "One describer labels every params set" (the size, then the tail words). `samegame.test.ts:122` holds "5x5, 3 colors, alt. scoring", and the params snapshot the four preset titles |

## Kept, and why

- **Params: Same Game writes its params whole in both encodings.** What a
  string with no `c` or no `s` decodes to is what an old link depends on, and
  it stays even where the declaration holds it. That the short form is the
  full one is stated with its reason, which no declaration gives.
- **Params: Same Game refuses an area too large to count.** `engine-params`,
  "A grid too large for a game is refused in one sentence" leaves where the
  ceiling sits to the game; the sentence quoted is the scenario's string.
- **Generation: Same Game generates boards that can be cleared.** Same Game
  has no tiers, so no `engine-difficulty` requirement promises this of it.
- **Controls: A first click in Same Game selects the group**, "selecting adds
  no step to Undo". `ts-engine`, "A UI-only input redraws without a history
  entry" is why; that a selection is a UI update and not a move is an arm of
  `interpretMove`.
- **Controls: Same Game's keyboard cursor acts where it stands.** Same Game
  declares no `targetVerbs`. The wrap at the edges is a departure from the
  clamped cursor of `engine-input`, "A bounded-grid cursor is driven through
  moveCursor".
- **Status bar**, "which the engine's completion words precede". Already a
  pointer, and it gives the one string a reader would otherwise have to
  compose.
- **Look: Same Game's flash lifts the field and leaves the tiles**, "SHALL
  sweep the field's cells". `ts-engine`, "A game gives each element a
  position, and the route is which position it gives" lists four routes; the
  clause says which this board takes, and the rest (the margin at rest, the
  stuck flash) is the game's.

## Engine requests

None.

## Found

- **"Generation: … boards that can be cleared" has a scenario that does not
  give a case of it.** "A generated description is well-formed" asks only that
  the description parses to `w·h` tiles, not that some order of removals
  empties the board.
- **The color count's floor and ceiling are stated in two places.** The
  ceiling of 9 is a bound of the field (`state.ts:79`) and the floor of 3 is
  `validateParams`' (`state.ts:115`), so the Custom dialog's field knows only
  half its range. The refusals a player reads differ in form accordingly
  ("Number of colors must be at least three." against the engine's bound
  sentence).
- **Same Game has no hint**, so by the collection's rule it is a draft; the
  spec owes no `Hint` subject and has none.
- **"Rules: Same Game removes…" says "shuffle non-empty columns to the
  left"**, and its scenario says "empty columns have moved right". Both
  describe `snuggle`; "shuffle" reads as a random order, which it is not.

## Review

Three rows read, each against the code line and the engine requirement it
names; two corrected. The 15 untouched requirements read sentence by sentence
against the three classes; none cut.

- **Corrected: the Params pointer is removed.** The writer's first sentence
  ("Same Game's params …, their encoding and a board's title SHALL be those
  its `paramConfig` and its declared codec give (…)") stood in a subject that
  is neither hollow nor down to a corner case: "Params: Same Game writes its
  params whole in both encodings" says a game ID names a size, a color count
  under `c` and a scoring system under `s`, and what each decodes to when left
  out. So the copy is a plain removal. What was left, the `r`, is a
  requirement of its own under a title written for it, moved after that one
  so the subject does not open on a letter of upstream's.
- **Corrected: the `r` sentence lost its citation.** `unusedLetter("r")`
  (`state.ts:110`) and `engine-params`, "A letter upstream writes is read by
  name" state that such a letter is read, changes nothing and is never
  written. Kept as the game's own: which setting of upstream's this app has
  no field for, which "Generation: Same Game generates boards that can be
  cleared" rests on ("No parameter SHALL deal a grid that may not be
  clearable").
- **Corrected: "Params: Same Game refuses params it cannot deal".** "What else
  a field may hold is its bounds or its choices in `paramConfig`" removed, a
  second pointer in the same subject. The two refusals left are exactly
  `validateParams`' own (`state.ts:115`-`116`), and both quoted sentences are
  at `samegame.test.ts:92` and `:95`.
- **Sound: the removed title requirement.** `label.words` on the color count
  gives "{n} colors", and on the scoring gives "alt. scoring" unless
  `scoresub` is 2 (`state.ts:80`, `:89`); `samegame.test.ts:122` holds "5x5,
  3 colors, alt. scoring".
- **Kept and checked**: the status bar's "which the engine's completion words
  precede" is the subject's one pointer and gives the string a player reads.

## Third pass

Nothing changed in the spec. Rows of the engine's third-round tables that
name Same Game: 0. Engine requests of its own: 0. Sentences cut: 0. Clauses
kept: 1.

- **Kept: "which the engine's completion words precede"** in the status bar:
  the subject's one pointer.
- No "no departure" sentence, none of the form "What a pasted game ID opens
  as" and none citing `engine-difficulty`: Same Game has no tiers.
- The spec was searched for the third round's rules in other words (the
  cancel keys, the release of a declined press, a lit beveled tile, a hatch
  under content, a mistake check without an answer): none is stated. Same
  Game has no hint, no Solve and no mistake check.
