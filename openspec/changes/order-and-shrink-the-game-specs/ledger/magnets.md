# magnets

The Purpose's list is corrected: "its description and params encodings" named
what the spec no longer holds, and now reads as its description encoding and
what its params refuse.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Magnets' parameters | retitled "Params: A Magnets params string is its declared codec's, and a board too small for its tier is refused". Sentence 1 (the four fields, `{w}x{h}`, the `d{e\|t}` and `S` suffixes, the bare `{n}`) replaced by one that sends the reader to the declaration and says the game departs nowhere (rule 2). Sentence 2 cut to its upper bound and its reason ("SHALL each stop at 61, the largest count one description character writes"); "declared bounded from 2" goes. Sentence 3 (`validateParams`) untouched. All three scenarios kept | the fields and the lower bound: `paramConfig`, `src/games/magnets/state.ts:156`-`176` (`bounds: { min: 2, max: DESC_ALPHABET_SIZE - 1 }`); the encoding: `paramsCodec(defaultParams, [dims, choice "d" …, flag "S" …])`, `state.ts:179`, with `DIFF_CHARS = "et"`, `state.ts:65`; the bare `{n}`: `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters". The `magnets` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `5x6dtS` and `5x6de`; `src/games/magnets/magnets.test.ts:54` holds `10x9dtS` |
| Params: Every Magnets preset size is offered at each tier | removed, with its scenario | the preset table: `PRESETS`, `state.ts:132`-`142` (three lines a size); `engine-params`, "A board's tiers are one run of lines, and every tier is offered". The snapshot above holds the nine presets, `9x10de` among them |
| Generation: Magnets grades boards with a tiered deductive solver | removed. Sentence 1 (a board is solved at its own difficulty, and a Normal board not at Easy) and the scenario "A generated board is uniquely solvable at its difficulty", which restated it, cut; sentence 2 (a deduction crosses a domino to its partner) joins "Generation: The deductions of Magnets' Easy tier" | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates" (solvable at the requested tier and not one tier down) |
| Generation: The deductions of Magnets' Easy tier | gains "At either tier the solver SHALL propagate a deduction across a domino to its partner: a color excluded at one end excludes the opposite color at the other.", from the requirement above, with "At either tier" for the place it now stands in | |
| Generation: Strip clues removes each number a Magnets board does not need | title kept. Last sentence ("A params label with it set SHALL end in the words "strip clues"") cut. Scenario kept: its title "5x6 Normal, strip clues" is the game's case | `label: { slot: "tail", words: (p) => (p.stripclues ? "strip clues" : null) }`, `state.ts:170`; `engine-params`, "One describer labels every params set" (the tail comes last) |
| Controls: Magnets input cycles domino contents and toggles clue aids | title kept. "A left-click or `CURSOR_SELECT`" and "A right-click or `CURSOR_SELECT2`" reworded to "the left-click verb of Magnets' `targetVerbs`" and "the right-click verb", which is where a reader finds which input applies which; "SHALL refuse to start from" reworded "never from"; "A left-click on a border clue number" reworded "On a border clue number the left-click verb". Both scenarios kept | `targetVerbs.primary` and `.secondary`, `src/games/magnets/index.ts:134`-`172`; `engine-input`, "The engine owns a declaring game's press and select keys" |
| Controls: A Magnets drag repeats its press across tiles or across clues | title kept. "Magnets SHALL declare a sweep for both buttons" and "SHALL repeat the press on each square that holds what the pressed square held" cut; what a square holds is kept as the one thing the game supplies to the collection's drag, which is cited there for the word "holds"; tiles against clues and the singleton kept. Scenario kept | `targetVerbs.sweep`, `index.ts:174`-`185` (no `buttons` limit, so both); `engine-input`, "A drag on from a press repeats the press" |
| Hint: Magnets offers an explained hint | removed, with its scenario "The hint finishes the board". "Magnets SHALL implement `hint` as the recording projection of its graded solver: the same ladder, run one firing at a time from the player's board, each firing narrated with the premise that forced it" cut; the start from the `?` marks as from the placed dominoes joins "Hint: A Magnets firing the player can write is one journey of legs" | `engine-hints`, "The solver and the hint are two projections of one deduction engine", "A hint step always names a technique, with no un-narrated fallback" and "A hint is deduced from the board in play" (an entry the player placed is never a step and a step may rest on it; which marks a step may rest on it leaves to the game, so the `?` stays); the scenario: `engine-hints`, "A hint finishes a board from a right entry made out of order" and "The hint walk SHALL cover every preset a game offers" |
| Hint: A Magnets firing the player can write is one journey of legs | gains "The hint SHALL start from the player's own `?` marks as it does from the placed dominoes.", from the requirement above | |
| Controls: The Magnets cursor walks onto the clues | title kept. "`CURSOR_SELECT` on a clue slot SHALL toggle that clue's done mark as a left-click there does" cut; "`CURSOR_SELECT2` on one SHALL do nothing" reworded "On a clue slot the right-click verb SHALL do nothing". Both scenarios kept | `engine-input`, "The engine owns a declaring game's press and select keys" (Enter applies the left-click verb, Space the right-click one); what the left-click verb does on a clue is this spec's "Controls: Magnets input cycles domino contents and toggles clue aids" |
| Look: Magnets' win flash lights a domino whole | title kept. "SHALL sweep the dominoes diagonally" reworded "The win flash's elements SHALL be the dominoes", which keeps what is the game's (the element, and its position) and drops the route. Scenario kept | `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep`, a diagonal from the bottom left); the game's call is `flash.win(mid)`, `src/games/magnets/render.ts:523` |

## Kept, and why

- **Rules: Magnets flags mistakes against the unique solution.** `ts-engine`,
  "A mistake check compares with the one answer, hidden or not" does not say
  a `?` on a neutral domino is a mistake, nor why.
- **Params: … `w` and `h` SHALL each stop at 61.** The number is the items'
  `bounds`; the reason is the requirement and does not stand without it.
- **Description**, both requirements. `parseDesc` and `encodeDesc` are written
  out by hand (`state.ts:217`, `:303`).
- **Generation: the Easy and Normal deductions.** What a tier means.
- **Controls: The Magnets cursor walks onto the clues.** The geometry is the
  game's own object (`index.ts:90`-`124`), not `squareGrid`, so where the
  cursor ranges is the game's; that the right-click verb means nothing on a
  clue is its function's (`index.ts:160`-`166`).
- **Hint: Following a Magnets leg through its press cycle keeps the plan.**
  `magnetsKeepTrack` is written by hand (`src/games/magnets/hint.ts:838`) and
  does not call `trackTargets`.
- **Hint: A Magnets hint hatches the line its sentence names.**
  `engine-hints`, "A hint hatches the one line its sentence names" says "the
  clue slot at its end"; Magnets has two a line and hatches both, and which
  line a single-domino step names is the game's.
- **Hint: A Magnets firing the player can write is one journey of legs.**
  `engine-hints`, "One deduction firing is one journey" says a firing is a
  journey; that a "cannot be neutral" conclusion is a journey of `?` marks is
  the game's.
- **Look: Magnets' win flash lights a domino whole.** `ts-engine`, "A game
  gives each element a position, and the route is which position it gives"
  gives `sweepStep` of an element's center; that the element is the domino
  and not the square is the requirement.

## Engine requests

None. "SHALL start from the player's `?` marks as it does from the placed
dominoes" is the game's by the shared requirement's own word: `engine-hints`,
"A hint is deduced from the board in play" says "Which marks a step may rest
on … are the game's to state" (`seedSolver`, `src/games/magnets/hint.ts:96`).

## Found

- **A params string with no `d` decodes as Normal, and the spec does not say
  so.** `defaultParams` is the third preset, 5×6 Normal with stripped clues
  (`state.ts:144`), and `choice` leaves an absent tier as the default has it,
  so `6x5` is a 6×5 Normal board; `flag` sets an absent `S` to off, so it is
  not stripped. `engine-params`, "A params string is read whole or refused"
  hands the tier back to "the game's `defaultParams`". Every other game of
  this batch decodes a bare size as Easy. An old link depends on it.
  **Reviewed: true.** `defaultParams` is `PRESETS[2]`
  (`src/games/magnets/state.ts:144`-`146`, the table at `:132`-`142`);
  `choice`'s decode returns at once where its tag is absent
  (`src/engine/params-codec.ts:259`-`260`), and `flag`'s sets the field to
  the opposite of its letter (`:290`-`294`). No test holds it: the game's
  tests decode only what they encoded in full (`magnets.test.ts:50`), and
  the snapshot records `brief=5x6` for the default without decoding it. The
  short form of every Easy preset therefore reads back as Normal.
- **"Params: … SHALL refuse Easy unless `w ≥ 3` or `h ≥ 3`, Normal unless
  `w ≥ 5` or `h ≥ 5`" binds a board that arrives written too**
  (`validateParams`, `state.ts:185`-`196`: only the 3×6 test is under
  `full`). The spec says so by "and, of full params," on the last clause
  only. A 4×4 Normal game ID with its description is therefore refused,
  where `engine-difficulty`, "An unbindable tier is refused, not silently
  downgraded" asks that such a refusal bind generation only.
  **Reviewed: true.** `validateParams` reads `full` only for the 3×6 line
  (`state.ts:191`); "at least five" (`:187`-`:188`) and "at least three"
  (`:194`) are returned whatever it is, and the midend checks an ID that
  carries a description with `full` false (`src/engine/midend.ts:591`-`593`).
  `describeAbsentTiers` holds the loading case for `3x6dt`, `6x3dt` and
  `3x6dtS` only (`magnets.test.ts:41`); no test loads a written board under
  5 both ways. Upstream refuses the same sizes and so never wrote such a
  description, so the boards refused are ones made by hand.
- **"Controls: The Magnets cursor walks onto the clues", scenario "The cursor
  stops short of a corner"** says the cursor "stays where it is"; on a hidden
  cursor the same press shows it (`index.ts:109`-`121`).
- **The spec says "domino" throughout its own sentences** while "Hint:
  Magnets calls its pieces tiles when a player reads about them" keeps the
  word from a player. The requirement excepts "the code's names"; the spec's
  own prose is neither. Left.

## Review

7 rows read, each against the declaration or the requirement it names, read
whole; 4 rows corrected and 4 added.

Changed:

- **Generation: Magnets grades boards with a tiered deductive solver** is
  gone. "What a Magnets board dealt at a tier promises SHALL be the
  collection's (…)" was a pointer in a subject with three requirements of
  its own, and the scenario restated the shared rule. Its one sentence of
  the game's joins the Easy tier's requirement.
- **Controls: Magnets input cycles domino contents and toggles clue aids**
  is one requirement again under its first title: the sentence that only
  sent the reader to `targetVerbs` and `engine-input` cut, the split it had
  forced is not needed.
- **Controls: A Magnets drag repeats its press across tiles or across
  clues.** "A drag with either button SHALL repeat its press as the
  collection's does" cut to the citation that gives "holds" its meaning.
- **Hint: Magnets' hint takes the player's `?` marks as premises** (the
  writer's title) is gone: a citation of "A hint is deduced from the board
  in play" with the collection's promise for its scenario. The game's clause
  joins the requirement that says why a step marks a `?`.
- **Controls: The Magnets cursor walks onto the clues.** That Enter on a
  clue does what a click there does is the collection's; cut.
- **Look: Magnets' win flash lights a domino whole.** "sweep … diagonally"
  is the route, which `ts-engine` states; reworded out, as the writer did in
  the other four games.

Checked and found sound:

- The declarations: `paramConfig` with its bounds and the codec
  (`state.ts:156`-`183`), `DIFF_CHARS = "et"`, the preset table, the label's
  "strip clues" (`state.ts:170`), the two verbs and the sweep
  (`index.ts:142`-`185`), the legend (`index.ts:283`).
- Every cited engine title is exact, and each requirement states all of what
  its row removed.
- The kept pointer in `Params`: without it the subject is its bound and its
  refusals.
- The description is written and read by hand (`parseDesc`, `state.ts:217`;
  `encodeDesc`, `:303`), and `magnetsKeepTrack` (`hint.ts:838`) does not call
  `trackTargets`, so neither is a copy.
- The hint starts from the `?` marks: `seedSolver` (`hint.ts:96`-`108`).
- `10x9dtS` is `magnets.test.ts:54`, and `5x6dtS` with its title the
  snapshot's default.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
- Every requirement left untouched was read for a copy by the three classes.
  Fifteen of the 25 are the hint's techniques, sentences and marks.

## Third pass

No row of the engine tables names a sentence of Magnets'. One names it as
saying nothing (`engine-params`, "A bare flag letter left out is read as the
opposite of its meaning": the spec gives `10x9dtS` and says nothing of `S`
left out), and the hints' Found names its hatch, drawn over a tile's body and
under its symbol, which the spec does not state. The ledger filed no engine
request. The spec is unchanged.

Read against the third round's requirements, and each kept:

- "Rules: Magnets flags mistakes against the unique solution" states no
  result for a board without one answer.
- "Hint: A Magnets hint hatches the line its sentence names" says which line
  and that both clue slots are hatched with it, and not where the hatch lies.
- "Hint: Following a Magnets leg through its press cycle keeps the plan" is
  the game's own `hintKeepTrack`, which does not call `trackTargets`.
- No sentence of a refusal where deduction runs out, of a search, or of what
  a step's sentence opens with.

Sentences cut: 0. Clauses kept: 1, under section 2 of the brief: "with no
departure from the codec grammar", in "Params: A Magnets params string is
its declared codec's, and a board too small for its tier is refused". It is
a clause of the one pointer `Params` has to its declaration, in the
subject's only requirement, whose other sentences are bounds and refusals.
`Generation` says what each tier's deductions are and holds no sentence of
what a dealt board promises; the spec has no pasted-ID sentence.
