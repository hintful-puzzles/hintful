# unequal

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Unequal is a Latin square with clues between neighbors | last sentence (provides `solve` and `textFormat`, no `statusbarText`) cut; the rest and the scenario untouched | the hooks on the game object, `src/games/unequal/index.ts:622` and `:654`; `ts-engine`, "Solve, the status bar and text export follow from the game's methods" |
| Rules: Unequal checks for mistakes against the unique solution | retitled "Rules: Unequal's mistake check re-solves from its givens and clues". Sentence 1 (a wrong number, and notes that have crossed out the answer) cut to what the answer is re-solved from (second pass: the sentence no longer names the two shared requirements); sentence 2 (empty when not uniquely solvable) cut (third pass). Scenario "A wrong number is flagged, ordinary notes are not" dropped; "An ambiguous board", which restated sentence 2, dropped with it (third pass); scenario "A wrong number that breaks no rule" written as the game's case | nothing flagged where the givens and clues do not solve to one answer, and the dropped scenario: `ts-engine`, "A mistake check compares with the one answer, hidden or not" (scenario "A board whose solver finds two answers"); a wrong entry: `engine-hints`, "Check & Save names a wrong entry in every game"; the notes, extra candidates not reported, the answer from clues and givens: `ts-engine`, "A candidate note that excludes the answer is a mistake" (its first scenario is the dropped one). The check: `index.ts:403` |
| Params: Unequal's parameters and their encoding | sentence 1 gains "which are the tiers Easy, Normal, Tricky, Hard and Unreasonable in that order", from "Params: Unequal's top tier is named Unreasonable and keeps its character"; nothing else changes. Found, mended: a last sentence added, that a string with no `d` decodes as Normal (`decodeParams` starts from `defaultParams`, whose `diff` is `"easy"`, `src/games/unequal/state.ts:146`, `:158`), with the scenario "A string with no difficulty": `4` and `4de` are the snapshot's `default  full=4de  brief=4`, and `5a` the short form of its Adjacent 5×5 presets | |
| Params: Unequal's top tier is named Unreasonable and keeps its character | removed, but for the tie between the five values and the five tier names (sentence 1), which joins "Params: Unequal's parameters and their encoding". Sentence 2 (named Unreasonable because it branches and backtracks), sentence 3 (its character stays `r`) and the scenario "The top tier keeps its difficulty character" go | the name: `DIFF_NAMES = tierNames(5, { search: true })`, `src/games/unequal/state.ts:49`, and `engine-difficulty`, "Unreasonable is declared and never issued by position"; the character: this spec's "Params: Unequal's parameters and their encoding" (`r` is the fifth letter) and `engine-difficulty`, "A tier's name is not part of any encoding". The `unequal` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `7dr` and `7adr` |
| Params: Unequal refuses the parameters it cannot deal | title kept. Sentence 1 (the bounds, 3 to `MAX_CANDIDATE_VALUE`, an order of 32 refused) cut (second pass: "The range of the order itself SHALL be the one its `paramConfig` item declares", which stood in its place, went too); sentence 2 (an unknown difficulty letter) cut; sentence 3 kept. Scenarios "Invalid params are rejected" and "A difficulty letter that names no tier" dropped; "A small Adjacent puzzle has no upper tiers" kept | `bounds: { min: 3, max: MAX_CANDIDATE_VALUE }`, `index.ts:601`, and `engine-params`, "Params validity is the engine's check"; the letter: `engine-params`, "A params string is read whole or refused" and "The engine makes the one refusal of a params string". `src/games/unequal/unequal.test.ts:95`-`98` holds both bound refusals |
| Generation: Unequal generates uniquely-solvable boards at the target difficulty | retitled "Generation: What an Unequal board promises at its tier is the collection's". All four sentences replaced by one that names the three shared requirements and says Unequal departs from none, in either mode (rule 2: the subject's ordinary case). Scenario "Generated board is unique and correctly graded" dropped; scenario "An Adjacent board at Hard" written from a preset | `engine-difficulty`, "Every tier promises one solution found at its cap", "A difficulty tier binds the board it generates", "A generator never settles for a lower tier" (deals the tier asked for or exhausts its bound) and, for the refusal before a deal, "An unbindable tier is refused, not silently downgraded", which this spec's "Params: Unequal refuses the parameters it cannot deal" applies. The gate: `src/games/unequal/generator.ts:252`; `5adx` is a preset in the snapshot |
| Controls: Unequal accepts digit, pencil, clue-spent, and solve moves | sentence 1 ("`interpretMove` SHALL select a cell by mouse or keyboard cursor") replaced by one that says where the selection is stated; the rest and the scenario untouched. Found, mended: retitled "Controls: A digit places a number or toggles its pencil mark, and Backspace or Space clears", the old title naming a clue-spent move, which the next requirement states, and a solve move, which the body never did; and the last sentence gains "and in pencil mode no key SHALL change a cell that holds a number" (`src/games/unequal/index.ts:292`) | `engine-notes`, "The note-taking cell is one shared mechanic" and the requirements after it; Unequal's call, `pressNoteTakingCell`, `index.ts:236` |
| Controls: A clue is struck through by a click or a modified arrow | Found, mended: "A click on" is "A click of either button on": `interpretMove` takes a press of either button in a gap (`src/games/unequal/index.ts:222`-`233`). Scenario untouched | |
| Preferences: Unequal exposes pencil-mark preferences | retitled "Preferences: Auto-pencil strikes a placed number from its row and column". Kept: where auto-pencil strikes. Cut: that the three preferences are offered, and that with auto-pencil off cleanup is left to Mark-all and the hint. Scenario "A placement with auto-pencil off" dropped; scenario "A number is placed with auto-pencil on" written | `autoPencilPref`, `stickyPencilPref`, `pencilKeepHighlightPref`, `index.ts:657`-`661`; `engine-notes`, "The pencil preferences have one key each, which a saved preference depends on" and "Every member offers the keep-highlight preference, defaulted the same way" (auto-pencil starts off, "which leaves cleaning the notes to the Mark-all press and the hint"; scenario "A placement with no preference changed") |
| Hint: Unequal provides an explained deduction hint | retitled "Hint: Unequal's hint is the shared candidate plan over rows and columns". Its sentence replaced by a pointer to the shared plan and its preset, saying what Unequal supplies, where it departs and that its marks are the legend's (rule 2). Scenarios "An inequality bound is taught as a note strike" and "An adjacency clue is taught in Adjacent mode" move, unchanged, to "Hint: A clue elimination is one firing of one clue"; scenario "A single on an Unequal board" written | `engine-candidate-hints`, "A shared candidate-elimination hint plan". Unequal's call: `runLatinCandidatePlan`, `index.ts:487`; the single: `narrateLatinReason`, `index.ts:461` |
| Hint: The hint prefers a single, then a strike, then a placement | removed | `engine-candidate-hints`, "The walk owns the ladder" (naked singles, the game's rungs, recorded strikes, recorded placements), "A placement's cull continues its journey" and "Candidate-elimination hints clean obvious candidates at populate" (the row and column eliminations a placed value implies); the moves: "The walk builds every step from the game's words" |
| Hint: A clue elimination is one firing of one clue | gains the scenarios "An inequality bound is taught as a note strike" and "An adjacency clue is taught in Adjacent mode" from "Hint: Unequal provides an explained deduction hint" | |
| Hint: Unequal's hint narration meets the hint quality bar | retitled "Hint: Unequal's clue sentences read correctly at the ends of the range". Cut: "meeting the hint quality bar", "then the reasoning, then a necessity-voice conclusion", and the two conclusions quoted. Kept: the rule for the value extremes, and that a clue step's indication is the inequality or adjacency pattern (third pass: "SHALL lead with" reworded out, the pattern kept as what the indication is). Scenario untouched | the order: `engine-hints`, "A step's sentence opens with what the player can spot"; `engine-hints`, "A hint step's words SHALL be built from their parts" and "The engine writes the words that join a sentence's parts"; the necessity voice: `engine-hints`, "The necessity-voice rule applies to every hinting game not ledgered as narrating moves"; the conclusions: `engine-candidate-hints`, "A candidate strike SHALL end in the walk's conclusion" ("so we must cross out…") and "A naked single shades its cell and a hidden single its region" ("it can only be N") |
| Hint: A hint's marks ring the struck cell and outline the clue's pair | removed; "Hint: Unequal's hint is the shared candidate plan over rows and columns" says the marks are the legend's | `hintMarks.roles` (`ring`: "the cell the step is about"; `outline`: "the two cells either side of a sign or bar (the ringed one, and \"the cell across\" it)"), `index.ts:626`; `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws"; the strikes of one firing sharing the ring: `engine-hints`, "A hint marks beside the content, never behind it" (the acted-on cell is ringed whether the step places or strikes) |
| Hint: The hint's deduction is capped below recursion | removed; its scenario "An Unreasonable board" moved to "Hint: Unequal's hint reasons no harder than the board's tier" and was dropped there in the third pass | `engine-candidate-hints`, "A recording solve stops below the tier that searches" (its first scenario is the dropped one); the reason: `engine-hints`, "A Search is refused and never narrated" |
| Hint: Unequal's hint reasons no harder than the board's tier | title kept. Third pass: "and at Hard on an Unreasonable board" reworded out, the cap at the board's own tier now said of a board below Unreasonable; the scenario "An Unreasonable board", gained from "Hint: The hint's deduction is capped below recursion", dropped; the order of techniques, which tier offers which, and the other two scenarios untouched | `engine-candidate-hints`, "A recording solve stops below the tier that searches". Unequal's call: `Math.min` of the board's tier and `DIFF_EXTREME`, `index.ts:486` |
| Hint: The selection is drawn over the box and the hint's marks beside it | third pass: retitled "Hint: The hint's marks are drawn in the gap beside the box". Sentence 1 (the wash and the pencil-mode corner over whichever surface the box has) cut; sentence 2 and the scenario untouched | `engine-notes`, "The highlight is part of the cell's background" (the wash replaces whichever surface the game gives the cell, a given's lifted one included; the triangle lies over it) |

## Kept, and why

- **Params: Unequal's parameters and their encoding.** The codec is
  hand-written (`state.ts:150`, `:157`), and the tie between the stored
  values and the tier names is nowhere else: `"easy"` is Normal.
- **Params: Unequal refuses…**, the Adjacent refusal. It is not gated on
  `full`, so it is not the collection's generation-only refusal.
- **Controls: Unequal provides on-screen key labels** and **The keypad is
  zero-based from order 10.** `unequalKeys` is written out by hand
  (`index.ts:548`) and is not `digitKeys`.
- **Controls: … digit, pencil, clue-spent, and solve moves**, the entry
  sentences. `interpretMove` is hand-written, and what `0` and a letter mean
  is Unequal's (`engine-input`, "The meaning of a digit key stays with the
  game").
- **Hint: The hint starts on the implicit reading.** A departure from the
  convention of `engine-candidate-hints`, "A game states the reading it starts
  on", with its reason.
- **Hint: A clue elimination is one firing of one clue**, "by one
  `pencilStrike` move … lies in one cell". The strike axis is the game's
  (`engine-candidate-hints`, "The game keeps what carries its meaning").

## Engine requests

The five Latin games' requests go under five names, the same in `keen.md`,
`towers.md`, `unequal.md`, `group.md` and `mathrax.md`. Each name's first
line, the rule as the engine would state it and the home, is the same in every
ledger that has it; what follows is this game's sentence and code.

- **The entry arm of a note-taking game.** Left the game's own: no shared
  code decodes a key, tests a given or builds the move, and lifting it was
  evaluated and declined, since it would need a shared move type
  (`src/engine/note-taking-cell.ts`); no guard holds it. The sentences stay.
  With a cell highlighted, a value's
  key enters that value, or in pencil mode toggles its pencil mark; Backspace
  and Space clear the cell; in pencil mode no key changes a cell that holds a
  value; a given takes no entry. Home: `engine-notes`, beside "The engine owns
  what a press and an entry do to the highlight".
  Unequal's sentence: "With a cell highlighted, a digit `1..order` … SHALL
  place that number, or toggle the pencil mark in pencil mode, and backspace,
  space, or below order 10 the `0` key, SHALL clear it. Immutable (given)
  cells SHALL reject entry.", in "Controls: Unequal accepts digit, pencil,
  clue-spent, and solve moves". Code: `index.ts:289`-`311`. Stays Unequal's:
  the bound `order`, a letter for 11 and above, and `0` as a clear only below
  order 10.
- **A mistake check reports nothing where the puzzle does not solve to one
  answer.** Answered: `ts-engine`, "A mistake check compares with the one
  answer, hidden or not". The sentence is cut. Where the game's solver, asked from the clues and givens, finds no
  answer or more than one, `findMistakes` reports nothing. Home: `ts-engine`,
  beside "A mistake check compares with the one answer, hidden or not".
  Unequal's sentence: "When they do not solve to exactly one answer it SHALL
  return an empty result.", in "Rules: Unequal's mistake check re-solves from
  its givens and clues". Code: `index.ts:408`.
- **A candidate hint's recording solve runs at the board's tier, and no higher
  than the top tier below Unreasonable.** Answered for the cap:
  `engine-candidate-hints`, "A recording solve stops below the tier that
  searches"; "and at Hard on an Unreasonable board" is cut. Left the game's
  own: that the solve runs at the board's own tier, which is not the
  collection's rule (Rome records at every tier, Subsets at the top one), so
  that clause stays. Home: `engine-candidate-hints`,
  beside "A recording solve reads the placed entries and never the notes".
  Unequal's sentence: "The hint's recording solver SHALL be capped at the
  board's own tier, and at Hard on an Unreasonable board", in "Hint: Unequal's
  hint reasons no harder than the board's tier". Code: `index.ts:486`.
- **Auto-pencil strikes a placed value from the other cells of its no-repeat
  regions.** Answered: `engine-notes`, "An auto-pencil strike is decided when
  the placement is made", which leaves which regions to the game; Unequal's
  sentence states the regions alone and stays whole.
  In these four games the regions are the row and the column.
  Home: `engine-notes`, beside "The pencil preferences have one key each,
  which a saved preference depends on", which leaves the reach to the game.
  Unequal's sentence: "With auto-pencil on, placing a number SHALL strike it
  from the pencil marks of the other cells of its row and column.", the whole
  of "Preferences: Auto-pencil strikes a placed number from its row and
  column". Code: `index.ts:338`.
- **The auto-pencil decision is recorded on the move.** Answered:
  `engine-notes`, "An auto-pencil strike is decided when the placement is
  made". Unequal's spec does
  not state it; its `set` move carries `autoElim` (`index.ts:309`). See
  `towers.md`.

## Found

- **The spec does not say what a params string with no `d` decodes to.**
  `decodeParams` starts from `defaultParams`, whose `diff` is `"easy"`, the
  Normal tier (`state.ts:146`, `:158`), so `5a` is an Adjacent 5×5 at Normal.
  The codec is hand-written and an old link depends on it.
- **The spec does not say that a drag through the gaps repeats the strike, or
  that either button strikes.** `spentDrag` (`index.ts:189`) is a
  `dragMarkVerbs` declaration and `interpretMove` opens its sweep on a press of
  either button in a gap (`index.ts:222`-`233`). "Controls: A clue is struck
  through by a click or a modified arrow" states the click and the keys.
- **"Controls: Unequal accepts digit, pencil, clue-spent, and solve moves"**
  does not say that no key changes a filled cell in pencil mode
  (`index.ts:292`), which Keen's and Mathrax's specs do, and names a solve
  move its body does not state.
- **"Hint: The selection is drawn over the box and the hint's marks beside
  it"** is a decision about how the board is drawn, filed under `Hint` for
  its second sentence.
- **The dropped scenario "Generated board is unique and correctly graded"
  never asserted the lower bound** its requirement stated ("and not below
  it"); the generator does hold it (`generator.ts:252`).

## Review

15 rows read, each against the declaration or the requirement it names, read
whole; 2 rows corrected (a citation each), and no sentence restored or cut in
the spec.

Changed:

- **"Hint: Unequal's hint narration meets the hint quality bar"**: the row
  named no home for "a necessity-voice conclusion" as a rule; it is
  `engine-hints`, "The necessity-voice rule applies to every hinting game not
  ledgered as narrating moves".
- **"Hint: A hint's marks ring the struck cell and outline the clue's pair"**:
  the row named no home for "equivalent strikes of one firing SHALL share the
  target hint color"; the legend's `ring` is every cell the step is about, and
  `engine-hints`, "A hint marks beside the content, never behind it" gives the
  one mark.
- **Engine requests** reworded under the five names the five ledgers share.

Checked and found sound:

- Every engine title the spec cites is exact (`spec-citations` resolves them),
  and each requirement a row names states all of what the row removed. The
  removed "prefers a single, then a strike, then a placement" leans on three
  requirements of `engine-candidate-hints`, and each states its own clause
  whole: the ladder, the clean, the cull.
- The declarations: the order's `bounds` (`index.ts:601`), with
  `MAX_CANDIDATE_VALUE` 31 so that 32 is refused; `DIFF_NAMES`
  (`state.ts:49`); the three pencil preferences (`index.ts:657`-`661`); the
  legend (`index.ts:626`).
- The new sentences against the code: the five values are the five tiers in
  that order (`DIFF_NAMES`, with `"easy"` the second); the gate deals no board
  the tier below finishes, in either mode (`generator.ts:252`); `findMistakes`
  solves from `state.immutable` and the clue flags (`index.ts:406`); `newUi`
  states the implicit reading (`state.ts:312`), the one departure the hint's
  pointer names; a placement's sentence is `narrateLatinReason`'s
  (`index.ts:461`).
- The quoted strings: `5adx` is the preset "Adjacent: 5x5 Hard" of the params
  snapshot, `5ade` and `4dt` presets beside it.
- The four requests' claim that no capability states them, as in `keen.md`.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body. The two scenarios moved under "Hint: A clue elimination is
  one firing of one clue" are cases of its sentence.
- Left: `unequalKeys` is written out by hand (`index.ts:548`), so both keypad
  requirements stay; the codec is hand-written, so its requirement stays.

## Second pass

Applied the brief's "A pointer is for that case only". 7 citing sentences or
clauses read: 2 removed, 4 kept as a subject's one pointer for its concern,
1 kept as a departure.

Removed (the rows above say where each is stated):

- **"Rules: Unequal's mistake check re-solves from its givens and clues"**:
  "SHALL report what the collection's check reports (`engine-hints`, …, and
  `ts-engine`, …), against" reworded out; the sentence keeps what the answer
  is re-solved from. `Rules` states the puzzle and its two modes itself.
- **"Params: Unequal refuses the parameters it cannot deal"**: "The range of
  the order itself SHALL be the one its `paramConfig` item declares." removed.
  `Params` holds the values, the hand-written encoding and two refusals.

Kept as a pointer:

- `Generation`: "Generation: What an Unequal board promises at its tier is the
  collection's", whole. Without it the subject holds only what an Adjacent
  board's bars are, and says nothing of a board in Unequal mode.
- `Controls`: "Unequal SHALL take its selection from the engine's note-taking
  cell (`engine-notes`, …)", the one place the subject says how a cell is
  selected.
- `Hint`: the first sentence of "Hint: Unequal's hint is the shared candidate
  plan over rows and columns", which also names the one departure, and its
  last, "What its marks stand for SHALL be the legend's (`hintMarks`)": one
  pointer requirement for the plan and the marks.

Kept as a departure: "so it does not come from the shared `digitKeys` helper
the other digit games use", in "Controls: The keypad is zero-based from order
10".

Preferences: the cut removed the three preferences' labels ("sticky pencil
mode", "auto-pencil", "keep mouse highlight after changing a pencil mark") and
no key or choice order; the spec never named a key.

Each subject read alone after the edits: no fragment, no dangling pronoun
("they" and "it" in the mistake check's second sentence are still the givens
and clues and `findMistakes`), every title fits its body.

## Third pass

Rows of the engine's third-round tables that name Unequal: 5. Engine requests
of its own: 5. Cut: 2 sentences, 2 clauses and 2 scenarios, in 4
requirements. Clauses kept: 7.

Cut (the rows above say where each is stated):

- **"Rules: Unequal's mistake check re-solves from its givens and clues"**:
  "When they do not solve to exactly one answer it SHALL return an empty
  result.", and the scenario "An ambiguous board", which only restated it.
  The scenario written in its place is `entryMistakes`' comparison with the
  re-solved answer (`src/games/unequal/index.ts:403`-`416`).
- **"Hint: Unequal's clue sentences read correctly at the ends of the
  range"**: "SHALL lead with".
- **"Hint: The selection is drawn over the box and the hint's marks beside
  it"**: its first sentence; retitled for the one it keeps.
- **"Hint: Unequal's hint reasons no harder than the board's tier"**: "and at
  Hard on an Unreasonable board", and the scenario "An Unreasonable board",
  which is the engine requirement's own first scenario.

Kept:

- **The inequality or adjacency pattern** as a clue step's indication: what
  the indication is stays the game's.
- **"capped at the board's own tier"**, now said of a board below
  Unreasonable, and which tier offers which technique.
- **"Preferences: Auto-pencil strikes a placed number from its row and
  column"**, whole: the regions, and nothing of when the strike is decided.
- **"Controls: The keypad is zero-based from order 10"** and **"Controls:
  Unequal provides on-screen key labels"**: a keypad of its own, as
  `engine-input`, "The digit keypad has one key for each value, a letter
  past nine" says of a game that counts past nine another way.
- **The entry sentences** of "Controls: Unequal accepts digit, pencil,
  clue-spent, and solve moves": left the games' own.
- **"Generation: What an Unequal board promises at its tier is the
  collection's"**, whole, "with no departure" included. The subject's other
  requirement is of Adjacent boards only, so without the pointer `Generation`
  says nothing of a board in Unequal mode, the ordinary case. Unsure: if a
  sentence of one mode counts as "what the game does there", it goes.
- **"departing only in the reading it starts on"** in "Hint: Unequal's hint
  is the shared candidate plan over rows and columns": the subject's one
  pointer, and it states a departure.

No sentence of the form "What a pasted game ID opens as". The spec was
searched for the third round's other rules in other words (an arrow moving
the highlight, a search the hint never runs): none is stated.

Each subject read alone: no fragment, no dangling pronoun, every title fits
its body, and the Purpose names nothing that went.

## Found, mended

- What a params string with no `d` decodes to: stated in "Params: Unequal's
  parameters and their encoding", with a scenario.
- A drag through the gaps repeats the strike, and either button strikes: the
  second stated in "Controls: A clue is struck through by a click or a
  modified arrow"; the first left: `spentDrag` is a declaration
  (`engine-input`, "A draggable mark is declared as a sweep or as drag-mark
  verbs").
- The Controls title named a solve move, and its body said nothing of a
  filled cell in pencil mode: retitled, and the clause added.
- "Hint: The hint's marks are drawn in the gap beside the box" is a drawing
  decision under `Hint`: left: anything about the hint is `Hint`, and the
  third pass left it only the marks.
- The dropped scenario never asserted the lower bound: left: the scenario is
  gone, and the bound is the collection's.
