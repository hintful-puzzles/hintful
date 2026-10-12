# solo

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Solo flags mistakes against its unique solution | retitled "Rules: Solo checks entries and notes against the answer its givens and cage sums fix". Sentence 1 (implement `findMistakes`; a wrong digit is `"cell"`, a note set that crossed out the answer is `"note"`) replaced by one that names the two shared requirements and keeps what they leave to the game: the answer is the solver's from the givens and, on a killer board, the cage sums. Sentence 2 (an ambiguous board reports nothing) cut (third pass). Scenario "A wrong digit and a wrong note are flagged" dropped; "A killer board, which has no givens" written in words | `ts-engine`, "A mistake check compares with the one answer, hidden or not" (a wrong entry; no mark flagged against an answer where the solver did not establish exactly one) and "A candidate note that excludes the answer is a mistake" (the note rule, extra candidates not flagged, the answer from what the puzzle fixes; its first scenario is the dropped one). The two kinds are `entryMistakes`, `src/engine/entry-mistakes.ts:46`, called at `src/games/solo/index.ts:341` |
| Params: Solo reads the legacy jigsaw form and a single leading number | title kept. "and SHALL round-trip the preset list" reworded out of sentence 1; the last sentence (a `d` with no tier letter and a character the encoding does not use are refused) cut. Both scenarios untouched | the round trip: `engine-params`, "Encode and decode are mutual inverses over the corpus", and the `solo` entry of `src/engine/__snapshots__/params-stability.test.ts.snap`. The refusals: `engine-params`, "A params string is read whole or refused" ("a tag with nothing after it, and any character no piece of the game's grammar reads", of every game's `decodeParams`) and "The engine makes the one refusal of a params string"; `paramsLetter` and `unreadParams` at `src/games/solo/state.ts:242` and `:245` |
| Params: Solo refuses parameters outside its bounds | title kept. The last sentence (a single field's limit is its Custom-dialog bound, the difficulty a choice among the tiers, the engine refuses outside either) reworded shorter and given its citation. Scenarios untouched | |
| Look: Solo draws its cages, digits, pencil marks and live errors | title kept. "and a completion flash" reworded out of the sentence. Scenario untouched | `ts-engine`, "The win flash plays on a forward move that solves the board"; `engine-colors`, "A solved flash drawn as a color takes a shared color" (a lit cell's ground is `FLASH` or `FLASH_LEAD`, which is all Solo gives it: `src/games/solo/render.ts:118`-`119`) |
| Generation: Solo generates boards uniquely solvable at exactly the requested difficulty | retitled "Generation: Solo builds a full grid under every active constraint". Sentence 1 (the full grid, `divvy`) untouched. Sentence 2 (kept only when uniquely solvable at exactly the requested difficulty) cut (second pass: the pointer that had replaced it went, the subject's next requirement saying which boards Solo keeps). Scenario "Generated board is uniquely solvable at its difficulty" dropped; "A board with the diagonals and cages both" written in words | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates" (its first scenario is the dropped one). The gate: `src/games/solo/generator.ts:433` and `:485` |
| Controls: Solo provides on-screen key labels | removed. The pointer sentence it left in "Controls: Solo interprets digit, pencil, and mark-all input" ("The on-screen keypad SHALL be the one `requestKeys` declares for the grid's size.") went in the third pass, so that requirement stands as it did | `requestKeys: (p) => digitKeys(p.c * p.r)`, `src/games/solo/index.ts:794`; `engine-input`, "The digit keypad has one key for each value, a letter past nine" (`digitKeys`: `1` to `9`, then `a` on, then the clear key). That the letters type what they label stays in "Controls: Solo types the numbers past 9 as letters" |
| Preferences: Solo exposes pencil-mark preferences | removed | `prefs`, `index.ts:796`-`806`; `engine-notes`, "The pencil preferences have one key each, which a saved preference depends on" (the three preferences) and "Every member offers the keep-highlight preference, defaulted the same way" (keep-highlight on, sticky on, auto-pencil off, "which leaves cleaning the notes to the Mark-all press and the hint"). The defaults: `newUi`, `state.ts:699` |
| Hint: Solo provides an explained deduction hint | removed; one sentence that sends the reader to the walk and the legend joins "Hint: Solo's hint is the candidate walk's, started on the implicit reading". Scenario "A region elimination is taught as a note strike" dropped | `engine-candidate-hints`, "A shared candidate-elimination hint plan" (the walk on a working board, for a pencil-notes game; its scenario: a strike's move is the game's strike move and its marks the candidates it strikes) and "A shared candidate-elimination hint entry" (`hint` is one call); `engine-hints`, "A hint is deduced from the board in play" |
| Hint: Solo's hint starts on the implicit reading | retitled "Hint: Solo's hint is the candidate walk's, started on the implicit reading". Gains the pointer sentence to the walk and the legend. "Solo SHALL start its hint on the implicit reading of a cell with no notes" kept, with a citation; "and under it the plan SHALL emit no fill-all step" cut. Scenario untouched | `engine-candidate-hints`, "A candidate hint plan reads an unmarked cell the way the player chose" ("Under `implicit` … the plan SHALL emit no fill-all step") |
| Hint: Solo's hint marks pair each color with a shape | removed | `hintMarks.roles` (`ring`, `outline`, `stripes`, the ring's "pencil marks to cross out, which are shown with a line through them"), `index.ts:770`-`778`; `engine-hints`, "The engine SHALL own the hint mark roles and the words for them", "A hint naming several kinds of element colors them by a stable legend" and "A legend color is never the only cue" |
| Hint: Solo's hint never narrates a guess | removed; its scenario "The hint declines when only a guess remains" moved to "Hint: Solo's hint uses no technique above the board's tier" and was dropped there in the third pass | the cap below recursion and the dropped scenario: `engine-candidate-hints`, "A recording solve stops below the tier that searches" (capped beneath `Unreasonable` on every board; refuses with `DEDUCTION_EXHAUSTED` only where the capped plan holds no step; scenario "Nothing left to record"). Solo's call: `Math.min(state.params.diff, DIFF_EXTREME)`, `index.ts:578`. `engine-hints`, "A Search is refused and never narrated" |
| Hint: A single-digit pattern step names the fewer lines | removed | `engine-candidate-hints`, "The solver says which lines confine a value" (the two readings; "a solver without repeated values SHALL record whichever is fewer lines") and "A value confined across several lines shows the lines" (the lines are striped and named). Solo's: `confinedLines`, `src/games/solo/solver.ts:1014`, and `say.confined`, `src/games/solo/hint-text.ts:177` |
| Hint: Solo's hint uses no technique above the board's tier | title kept. Third pass: "and at Extreme on an Unreasonable board" reworded out, the cap at the board's tier now said of a board below Unreasonable; the scenario "The hint declines when only a guess remains", gained from "Hint: Solo's hint never narrates a guess", dropped; "An Easy board is hinted with Easy's techniques" untouched | `engine-candidate-hints`, "A recording solve stops below the tier that searches" |
| Solver: A census certifies that every rung fires | third pass: title kept. "A firing census SHALL walk … and assert that every rung fires on the corpus" reworded to what is Solo's: which boards, at which caps, and that every rung fires on them (Solo records no rung as unreached, `unreached: {}`, `src/games/solo/solo-ladder.test.ts:147`). Scenario untouched | what a census is and when it fails: `testing`, "A firing census certifies a solver's ladder" |
| Hint: Solo's narration leads with what was spotted | third pass: retitled "Hint: A Solo step's indication is its firing region, or what the player looks at". "SHALL lead with … then give the reasoning, then conclude in the necessity voice" reworded out of sentence 1 and "SHALL lead with" out of sentence 2; kept: what the indication of each kind of step is, and the words of the conclusions. The six scenarios untouched | the order: `engine-hints`, "A step's sentence opens with what the player can spot"; the necessity voice: `engine-hints`, "The necessity-voice rule applies to every hinting game not ledgered as narrating moves" |
| Look: Solo draws its digits on a quiet surface, with a given's cell lifted | third pass: last sentence ("The selection's wash and its pencil-mode corner SHALL be drawn over whichever surface the cell has.") cut; the first sentence and the scenario untouched | `engine-notes`, "The highlight is part of the cell's background" (the wash replaces whichever surface the game gives the cell, a given's lifted one included; the triangle lies over it) |

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
- **Solver: A census certifies that every rung fires**: which boards, which
  caps, and that no rung goes unfired, which `testing`, "A firing census
  certifies a solver's ladder" leaves to the game.
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

- Answered: `ts-engine`, "A mistake check compares with the one answer,
  hidden or not". The sentence is cut.
  "When the board is not uniquely solvable from those the result SHALL be
  empty.", in "Rules: Solo checks entries and notes against the answer its
  givens and cage sums fix". Belongs in `ts-engine`, beside "A mistake check
  compares with the one answer, hidden or not": what a check reports where
  the solver finds no single answer. Each game writes the early return
  itself (`src/games/solo/index.ts:340`); `entryMistakes`
  (`src/engine/entry-mistakes.ts`) is handed an answer and never the lack of
  one.
- Answered: `engine-input`, "The digit keypad has one key for each value, a
  letter past nine". The sentence is cut.
  "The on-screen keypad SHALL be the one `requestKeys` declares for the
  grid's size.", in "Controls: Solo interprets digit, pencil, and mark-all
  input". No capability states what `digitKeys` builds (`1` to `9`, then
  `a` on, then Clear): `engine-input`, "Games may expose on-screen key
  labels" states the hook only, and "A key label carries its resolved text"
  the labels of a keypad of three, with nothing of the letters past 9.
  Belongs in `engine-input`. `src/engine/key-labels.ts`, `digitKeys`.
- Answered: `engine-notes`, "The highlight is part of the cell's
  background". The sentence is cut.
  "The selection's wash and its pencil-mode corner SHALL be drawn over
  whichever surface the cell has.", in "Look: Solo draws its digits on a
  quiet surface, with a given's cell lifted". Salad says it in the same
  words. Belongs in `engine-notes`, "The highlight is part of the cell's
  background", which says the picture is drawn with the background and before
  the content, and not that a lifted given keeps its surface under it.
  `src/engine/note-taking-cell.ts`.
- Answered: `testing`, "A firing census certifies a solver's ladder" (in
  `testing` and not `engine-helpers`, the census being a test helper). The
  sentence is cut to which boards and caps, and that every rung fires.
  "A firing census SHALL walk pinned boards … and assert that every rung
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

## Second pass

Citing sentences read: 6. Removed: 1. Kept as the subject's one pointer: 4.
Kept as a departure: 1.

- **Removed.** "What a board kept at a tier promises SHALL be the
  collection's (`engine-difficulty`, …), with no departure", in the first
  `Generation` requirement, retitled "Generation: Solo builds a full grid
  under every active constraint". The subject says Solo's own of the ordinary
  case: "Generation: Givens are removed in symmetry orbits" keeps a removal
  only while the board stays solvable within the requested difficulty, and a
  killer board only when it lands on both difficulties. The sentence was the
  copy with a citation attached. Row corrected.
- **Kept as a pointer.** `Rules`, the mistake check (its one word on what a
  mistake is, with where Solo's answer comes from); `Params`, the last
  sentence of "Solo refuses parameters outside its bounds" (the codec is
  hand-written, so the subject has no other word on a single field's bound,
  and the requirement would keep the cross-field cases alone); `Controls`,
  the keypad sentence (an engine request, left as it is); `Hint`, the walk
  and the legend in one sentence.
- **Kept as a departure.** `Hint`, "Solo SHALL start it on the implicit
  reading": the citation locates the convention departed from.
- **Preferences.** The removed "Preferences: Solo exposes pencil-mark
  preferences" named no key and no choice order, so the cut took none out of
  the spec.
- Each subject read alone after the edit: none is a fragment, and every
  title fits its body.

## Third pass

Rows of the engine's third-round tables that name Solo: 7. Engine requests of
its own: 4. Cut: 3 sentences, 3 clauses and 1 scenario, in 6 requirements.
Clauses kept: 6.

Cut (the rows above say where each is stated):

- **"Rules: Solo checks entries and notes against the answer its givens and
  cage sums fix"**: "When the board is not uniquely solvable from those the
  result SHALL be empty."
- **"Controls: Solo interprets digit, pencil, and mark-all input"**: "The
  on-screen keypad SHALL be the one `requestKeys` declares for the grid's
  size." The requirement is again as it stood at the base, so its row is
  gone and the sentence is accounted for in the row of "Controls: Solo
  provides on-screen key labels".
- **"Solver: A census certifies that every rung fires"**: "A firing census
  SHALL walk … and assert", what a census is.
- **"Hint: Solo's narration leads with what was spotted"**: "SHALL lead with
  … then give the reasoning, then conclude in the necessity voice", twice;
  retitled.
- **"Hint: Solo's hint uses no technique above the board's tier"**: "and at
  Extreme on an Unreasonable board", and the scenario "The hint declines when
  only a guess remains", which is the engine requirement's "Nothing left to
  record".
- **"Look: Solo draws its digits on a quiet surface, with a given's cell
  lifted"**: its last sentence.

Kept:

- **The census's boards and caps, and that every rung fires on them**, and
  its scenario, which names the frozen differential beside the census.
- **What each kind of step's indication is**, and the words of the three
  conclusions: Solo's.
- **"capped at the tier in the board's params"**, now said of a board below
  Unreasonable.
- **"Preferences: Auto-pencil strikes a placed digit from its no-repeat
  regions"**, whole: the regions, and nothing of when the strike is decided.
- **"Controls: Solo types the numbers past 9 as letters"**: what a typed
  letter enters, in either case, and `M` from 22 numbers, are `interpretMove`'s
  (`engine-input`, "The meaning of a digit key stays with the game"); the
  engine's keypad requirement is of the keys offered.
- **The first sentence of the mistake check**, with its two citations: the
  second pass kept it as the one word of `Rules` on what a mistake is, and
  the third round does not touch it.

No "no departure" sentence, and none of the form "What a pasted game ID opens
as". The spec was searched for the third round's other rules in other words
(an arrow moving the highlight, an auto-pencil decision, a search the hint
never runs): none is stated.

Each subject read alone: no fragment, no dangling pronoun, every title fits
its body, and the Purpose names nothing that went.
