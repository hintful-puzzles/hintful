# solo

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Solo flags mistakes against its unique solution | retitled "Rules: Solo checks entries and notes against the answer its givens and cage sums fix". Sentence 1 (implement `findMistakes`; a wrong digit is `"cell"`, a note set that crossed out the answer is `"note"`) replaced by one that names the two shared requirements and keeps what they leave to the game: the answer is the solver's from the givens and, on a killer board, the cage sums. Sentence 2 (an ambiguous board reports nothing) kept. Scenario "A wrong digit and a wrong note are flagged" dropped; "A killer board, which has no givens" written in words | `ts-engine`, "A mistake check compares with the one answer, hidden or not" (a wrong entry) and "A candidate note that excludes the answer is a mistake" (the note rule, extra candidates not flagged, the answer from what the puzzle fixes; its first scenario is the dropped one). The two kinds are `entryMistakes`, `src/engine/entry-mistakes.ts:46`, called at `src/games/solo/index.ts:341` |
| Params: Solo reads the legacy jigsaw form and a single leading number | title kept. "and SHALL round-trip the preset list" reworded out of sentence 1; the last sentence (a `d` with no tier letter and a character the encoding does not use are refused) cut. Both scenarios untouched | the round trip: `engine-params`, "Encode and decode are mutual inverses over the corpus", and the `solo` entry of `src/engine/__snapshots__/params-stability.test.ts.snap`. The refusals: `engine-params`, "A params string is read whole or refused" ("a tag with nothing after it, and any character no piece of the game's grammar reads", of every game's `decodeParams`) and "The engine makes the one refusal of a params string"; `paramsLetter` and `unreadParams` at `src/games/solo/state.ts:242` and `:245` |
| Params: Solo refuses parameters outside its bounds | title kept. The last sentence (a single field's limit is its Custom-dialog bound, the difficulty a choice among the tiers, the engine refuses outside either) reworded shorter and given its citation. Scenarios untouched | |
| Look: Solo draws its cages, digits, pencil marks and live errors | title kept. "and a completion flash" reworded out of the sentence. Scenario untouched | `ts-engine`, "The win flash plays on a forward move that solves the board"; `engine-colors`, "A solved flash drawn as a color takes a shared color" (a lit cell's ground is `FLASH` or `FLASH_LEAD`, which is all Solo gives it: `src/games/solo/render.ts:118`-`119`) |
| Generation: Solo generates boards uniquely solvable at exactly the requested difficulty | retitled "Generation: Solo builds a full grid under every active constraint and keeps a board at its tier". Sentence 1 (the full grid, `divvy`) untouched. Sentence 2 (kept only when uniquely solvable at exactly the requested difficulty) replaced by one that names the two shared requirements and says the game departs from neither. Scenario "Generated board is uniquely solvable at its difficulty" dropped; "A board with the diagonals and cages both" written in words | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates" (its first scenario is the dropped one). The gate: `src/games/solo/generator.ts:433` and `:485` |
| Controls: Solo interprets digit, pencil, and mark-all input | gains "The on-screen keypad SHALL be the one `requestKeys` declares for the grid's size." (rule 2: the keypad's own requirement goes) | |
| Controls: Solo provides on-screen key labels | removed | `requestKeys: (p) => digitKeys(p.c * p.r)`, `src/games/solo/index.ts:794`; `digitKeys` and `clearKey` in `src/engine/key-labels.ts` (`1` to `9`, then `a` on, then Clear on button 8). That the letters type what they label stays in "Controls: Solo types the numbers past 9 as letters" |
| Preferences: Solo exposes pencil-mark preferences | removed | `prefs`, `index.ts:796`-`806`; `engine-notes`, "The pencil preferences have one key each, which a saved preference depends on" (the three preferences) and "Every member offers the keep-highlight preference, defaulted the same way" (keep-highlight on, sticky on, auto-pencil off, "which leaves cleaning the notes to the Mark-all press and the hint"). The defaults: `newUi`, `state.ts:699` |
| Hint: Solo provides an explained deduction hint | removed; one sentence that sends the reader to the walk and the legend joins "Hint: Solo's hint is the candidate walk's, started on the implicit reading". Scenario "A region elimination is taught as a note strike" dropped | `engine-candidate-hints`, "A shared candidate-elimination hint plan" (the walk on a working board, for a pencil-notes game; its scenario: a strike's move is the game's strike move and its marks the candidates it strikes) and "A shared candidate-elimination hint entry" (`hint` is one call); `engine-hints`, "A hint is deduced from the board in play" |
| Hint: Solo's hint starts on the implicit reading | retitled "Hint: Solo's hint is the candidate walk's, started on the implicit reading". Gains the pointer sentence to the walk and the legend. "Solo SHALL start its hint on the implicit reading of a cell with no notes" kept, with a citation; "and under it the plan SHALL emit no fill-all step" cut. Scenario untouched | `engine-candidate-hints`, "A candidate hint plan reads an unmarked cell the way the player chose" ("Under `implicit` … the plan SHALL emit no fill-all step") |
| Hint: Solo's hint marks pair each color with a shape | removed | `hintMarks.roles` (`ring`, `outline`, `stripes`, the ring's "pencil marks to cross out, which are shown with a line through them"), `index.ts:770`-`778`; `engine-hints`, "The engine SHALL own the hint mark roles and the words for them", "A hint naming several kinds of element colors them by a stable legend" and "A legend color is never the only cue" |
| Hint: Solo's hint never narrates a guess | removed; its scenario "The hint declines when only a guess remains" moves, unchanged, to "Hint: Solo's hint uses no technique above the board's tier" | the cap below recursion: this spec's "Hint: Solo's hint uses no technique above the board's tier" ("and at Extreme on an Unreasonable board"; `Math.min(state.params.diff, DIFF_EXTREME)`, `index.ts:578`). That the hint then says it cannot deduce: `engine-hints`, "A Search is refused and never narrated", and `engine-candidate-hints`, "A shared candidate-elimination hint entry" (an empty plan refuses) |
| Hint: A single-digit pattern step names the fewer lines | removed | `engine-candidate-hints`, "The solver says which lines confine a value" (the two readings; "a solver without repeated values SHALL record whichever is fewer lines") and "A value confined across several lines shows the lines" (the lines are striped and named). Solo's: `confinedLines`, `src/games/solo/solver.ts:1014`, and `say.confined`, `src/games/solo/hint-text.ts:177` |
| Hint: Solo's hint uses no technique above the board's tier | gains the scenario "The hint declines when only a guess remains", from "Hint: Solo's hint never narrates a guess"; sentences untouched | |

## Kept, and why

- **Params: Solo encodes and decodes its parameters**, whole. The codec is
  hand-written (`encodeParams`, `decodeParams`, `state.ts:186`-`249`):
  `engine-params`, "A params encoding the grammar does not fit stays
  hand-written".
- **Params: Solo refuses parameters outside its bounds**, last sentence (a
  single field's limit is its bound in the Custom dialog, and the engine
  refuses a value outside it). `engine-params`, "Params validity is the
  engine's check" states it; the sentence is the pointer that tells a reader
  of this requirement why `validateParams` holds no per-field limit, and it
  names that requirement.
- **Solver: A census certifies that every rung fires**, and **Look: Solo
  draws its digits on a quiet surface…**, last sentence: see Engine requests.
- **Rules: … the answer its givens and cage sums fix**, "the result SHALL be
  empty". No shared requirement says what a check does on a board with
  several answers; `engine-params`, "A board with a mistake check loads only
  with exactly one answer" keeps a player from one.
- **Controls: Solo types the numbers past 9 as letters**, the `M` sentence.
  `engine-notes`, "The letter M is Mark-all where the board has no M key"
  gives the rule by the keypad; that Solo's keypad has an M key from 22
  numbers, and that it types 22, is Solo's.
- **Preferences: Auto-pencil strikes a placed digit from its no-repeat
  regions.** `engine-notes`, "The pencil preferences have one key each…"
  leaves where to the game ("under a label of the game's own that says
  where").
- **Preferences: The auto-pencil label names the relation, not the regions.**
  The label is `prefs`' (`index.ts:800`), a declaration; the requirement is
  the rule the declaration must keep (no list of regions) and its reason.
- **Hint: Solo's hint is the candidate walk's…**, "SHALL start it on the
  implicit reading". `engine-candidate-hints`, "A game states the reading it
  starts on" hands it back: the convention is `populate`, and a game says
  where it departs.
- **Hint: Solo marks every board element its hint sentence points at**, first
  sentence. `engine-hints`, "A bound hint step's words SHALL name exactly the
  marks it draws" says every mark is named; that every cell the words point
  at is marked follows only from how words are built.
- **Hint: The two rungs whose premise is not a region carry their cells**, the
  row-versus-column half and its scenario "The locked pattern shows its own
  cells". `engine-candidate-hints`, "A value confined across several lines
  shows the lines" states the marks. Kept because the sentence says which of
  Solo's rungs the rule before it covers, and the scenario is the
  requirement's only one.
- **Look: Solo draws its digits on a quiet surface, with a given's cell
  lifted.** `engine-colors`, "The engine owns what a board of pieces looks
  like" says a game takes these by reference; that Solo does is the
  requirement.

## Engine requests

- "When the board is not uniquely solvable from those the result SHALL be
  empty.", in "Rules: Solo checks entries and notes against the answer its
  givens and cage sums fix". Belongs in `ts-engine`, beside "A mistake check
  compares with the one answer, hidden or not": what a check reports where
  the solver finds no single answer. Each game writes the early return
  itself (`src/games/solo/index.ts:340`); `entryMistakes`
  (`src/engine/entry-mistakes.ts`) is handed an answer and never the lack of
  one.
- "The on-screen keypad SHALL be the one `requestKeys` declares for the
  grid's size.", in "Controls: Solo interprets digit, pencil, and mark-all
  input". No capability states what `digitKeys` builds (`1` to `9`, then
  `a` on, then Clear): `engine-input`, "Games may expose on-screen key
  labels" states the hook only, and "A key label carries its resolved text"
  the labels of a keypad of three, with nothing of the letters past 9.
  Belongs in `engine-input`. `src/engine/key-labels.ts`, `digitKeys`.
- "The selection's wash and its pencil-mode corner SHALL be drawn over
  whichever surface the cell has.", in "Look: Solo draws its digits on a
  quiet surface, with a given's cell lifted". Salad says it in the same
  words. Belongs in `engine-notes`, "The highlight is part of the cell's
  background", which says the picture is drawn with the background and before
  the content, and not that a lifted given keeps its surface under it.
  `src/engine/note-taking-cell.ts`.
- "A firing census SHALL walk pinned boards … and assert that every rung
  fires on the corpus.", the whole of "Solver: A census certifies that every
  rung fires". ABCD says it of itself and no engine capability names the
  census. Belongs in `engine-helpers`, beside the deduction fixpoint; which
  boards the corpus is stays the game's. `describeLadderCensus`,
  `src/engine/testing/ladder-census.ts`.

## Found

- **A symmetry code with a number the encoding does not use is read and
  dropped.** `decodeParams` (`state.ts:227`-`240`) reads `m`, `md` or `r` and
  the number after it, and sets a symmetry only for 2, 4 and 8 (`r`: 2 and
  4); `3x3m3`, `3x3r7` and `3x3m` leave the default symmetry and refuse
  nothing, and `a5` reads as `a`. `engine-params`, "A params string is read
  whole or refused" says none "SHALL be read as a default or passed over".
  Run by the reviewer through `decodeParams`: `3x3m3`, `3x3r7`, `3x3m` and
  `3x3md` each decode with the default symmetry and encode in full as `3x3`;
  `3x3a5` decodes as no symmetry and encodes as `3x3a`; `3x3m4` is read as
  written; `3x3d` and `3x3q` are refused in the engine's sentence. No player
  meets it but by typing such an ID: no encoder writes one.
- **"Controls: Solo interprets digit, pencil, and mark-all input" says
  nothing of Mark-all**, though its title names it. The press is the engine's
  (`engine-notes`, "The Mark-all press is the engine's, from the game's
  hook"); what it strikes is `regionsOf`, which the auto-pencil requirement
  states for a placement and no requirement states for Mark-all.
- **The spec does not say why Solo departs from the `populate` convention**,
  which `engine-candidate-hints`, "A game states the reading it starts on"
  asks of a game that overrides it. The reason is the comment at
  `state.ts:709`.
- **"Solver: A census certifies that every rung fires"** is a statement about
  a test ("the frozen differential or the firing census fails") and not about
  the game. Left.
- **"Hint: Solo marks every board element…" names `SoloRegion`**, a type of
  the solver's, and "Hint: Every killer sum…" names `DIFF_KINTERSECT`, a
  constant. Left.

## Review

Twelve rows read, each against the requirement or declaration it names; none
corrected, two added. Three engine requests read; all three stand, two added.

Changed:

- **Look: Solo draws its cages, digits, pencil marks and live errors.** "and
  a completion flash" went: when the flash plays and what a lit cell looks
  like are the collection's, and Solo's `render.ts` gives a lit cell the two
  shared roles and nothing else. Row added.
- **Params: Solo refuses parameters outside its bounds.** The kept pointer
  sentence named no requirement; it now cites `engine-params`, "Params
  validity is the engine's check", and was shortened to stay within the
  length. It claims what it did. Row added.
- **Engine requests**: the highlight over a lifted given (the sentence stood
  in the spec, with no request, where Salad's ledger files the same words)
  and the firing census (the writer had it under Found; ABCD's ledger files
  it).
- **Found**: the symmetry codes were run, and the result written in.

Read and found sound:

- The twelve rows. The two `ts-engine` requirements state the entry check,
  the note rule and where the answer comes from; `findMistakes` is one call
  of `entryMistakes` after the early return (`index.ts:331`-`349`). The
  refusals cut from the legacy-form requirement are `paramsLetter` and
  `unreadParams` in the codec, and `3x3d` and `3x3q` are refused when run.
  The generator's two gates are an equality on the tier reached
  (`generator.ts:433`, `:485`), which is both directions of "A difficulty
  tier binds the board it generates". The preferences' three keys and three
  defaults are `engine-notes`' two requirements and `newUi`. The ring's
  "shown with a line through them" is in `hintMarks.roles`. The fewer-lines
  rule and the striped lines are `engine-candidate-hints`' two requirements,
  the first for "a solver without repeated values", which Solo's is.
- The request for what a check reports with no single answer:
  `ts-engine`, "The engine supports an ephemeral, opt-in mistake-checking
  hook" and the two cited say nothing of it, and `engine-params`, "A board
  with a mistake check loads only with exactly one answer" is about loading.
- The request for `digitKeys`: `engine-input`, "Games may expose on-screen
  key labels", "A key label carries its resolved text", "A game offers a
  keypad exactly when touch play needs one to type" and "Backspace clears
  wherever the panel's Clear does" between them never give the keys past 9.
- Kept requirements read for copies, every subject: the hand-written codec
  and description parser, the solver's ladder, `interpretMove`'s digit and
  letter arms (`engine-notes`, "A game in the mechanic keeps its puzzle and
  its own move" leaves the move to the game), the auto-pencil's regions, the
  hint's techniques, words and tier cap (`engine-candidate-hints`, "The walk
  owns the ladder" states no cap). Nothing more is a copy, and the cut stays
  near a tenth.
- The new sentences: each cited title is exact (`spec-form` and the citation
  check pass), and "A killer board, which has no givens" is true of a dealt
  board ("Generation: Givens are removed in symmetry orbits").
