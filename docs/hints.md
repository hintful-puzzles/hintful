# Hints

What every game's explained hint owes: the quality bar, the words of a step,
the `Game` hooks and the plan behind them, the refusals, and the cross-game
guards that hold all of it. It rests on the specs
[`engine-hints`](../openspec/specs/engine-hints/spec.md) and
[`engine-candidate-hints`](../openspec/specs/engine-candidate-hints/spec.md),
and on [`palisade`](../openspec/specs/palisade/spec.md) for the bar. Three more
guides hold the rest of the hint. Every game opens
[`hints-marks.md`](./hints-marks.md) when it draws a step on the board: the
marks, the legend, evidence, chains, and also how a firing is grouped into a
step or a journey and which facts a hint may rest on. A game with candidate notes opens
[`hints-candidates.md`](./hints-candidates.md). A game with no deduction
ladder, whose hint is a search or a heuristic, opens
[`hints-search.md`](./hints-search.md).

## What every game does

Each step names the file of `src/skeleton/grid/` that already does it.

1. **Run the solver's rungs one firing at a time.** `solver.ts` holds the
   reason union, the rung list `SKELETON_RUNGS` and `skeletonRecordingPass`,
   built on `singleFirings` (§ "Recording the deduction", § "Name the rung a
   step speaks").
2. **Build the plan from the player's own marks.** `hint.ts`'s `skeletonHint`
   hands a copy of the board, the pass and a `stepBudget` to `deduceHintPlan`,
   and returns a `HintRefusal` where there is no step (§ "The shared plan
   loop: deduceHintPlan", § "The step budget", § "Refusal wording comes from
   one module").
3. **Turn each firing into a `HintStep`**: its `move`, `rung: reason.kind`,
   its `words` and `explanation: words.text` (`stepOf` in `hint.ts`).
4. **Write every sentence in `hint-text.ts`**, exported as `say`, as a
   `Sentence` whose pointing words are references to marks (§ "Writing the
   narration").
5. **Judge the player's move against the step** in `skeletonKeepTrack`, with
   `trackTargets` and `changedCells` from `engine/hint-track.ts`, narrowing
   the words when a step shrinks (§ "The hooks a hinted game implements").
6. **Declare the hooks in `index.ts`**: `hint`, `hintRungs`, `hintMarks`,
   `hintKeepTrack` and `hintGesture` (§ "Every step is a gesture").
7. **Paint the marks from the words** in `render.ts`, from `stepMarks(hint)`.
   How is [`hints-marks.md`](./hints-marks.md).
8. **Write the help page's `## Hints` section**, with `{{hint-marks}}`
   (`help.md`, stamped to `help/games/<id>.md`; § "The help teaches the
   marks").
9. **Pin a position for every rung and test the plan** in
   `skeleton-hint.test.ts`: `describeHintPins`, `npm run hint-scan`, and
   `renderPinnedHint` for a frame (§ "Verifying a hint in-process").
10. **Run the app and read each sentence against its frame.**

## Sections

| Section | Read it when |
| --- | --- |
| The quality bar | you start a hint, or a review cites a rule of the bar by its number |
| Guess-free generation is the precondition | a hint would fall back on the answer or a search to find its move |
| Cognitive load: one step per hint | a step's reasoning takes more than one inference to follow |
| – The forcing boundary | a rung supposes a value and propagates to a contradiction |
| Writing the narration | you write or review any sentence a hint speaks |
| – A sentence has parts | you build a step's `Sentence`, or choose its relation |
| – Bind the words to the marks | a sentence points at the board, or the binding check fails |
| – Necessity for deductions, imperative for moves | you word a step's conclusion |
| – Lead with the indication | a step reasons from more than one local rule |
| – Two marks of one kind: tie them, and never by color | a step marks two elements of one kind and says "this cell" |
| – Name a square by its value | a step's squares hold numbers, or two of them hold the same one |
| – The premise must single out the conclusion | another move would satisfy the premise a sentence states |
| – Keep the narration terse | a sentence runs past 120 characters, the length ledger fails, or a reference fails `hint-reference.ts` |
| – The sentences live in one file per game | you add, move or reword a sentence |
| – No em-dashes | a sentence wants a dash |
| – Conclude with the action the move makes | a step strikes candidates, or its words claim a placement |
| – Sanity-read at the degenerate extremes | a sentence interpolates a clue, a count or a size |
| – Name elements by what the player can see | a sentence names a tile, a line or a place on the board |
| – Rules belong in the help | a sentence opens with a fact true of every step |
| – The help teaches the marks | you write the help page's `## Hints` section, or change a mark |
| – Hint the move that advances the goal | a plan offers forced moves that build nothing |
| – Show only what the board does not already say | a step restates what the player's own marks show |
| The hooks a hinted game implements | you wire `hint`, `hintKeepTrack` or another hint hook into `Game` |
| – Name the rung a step speaks | you add a deduction, or a test needs to know which one a step is |
| – Every step is a gesture | you write `hintGesture`, or a walk throws on a step's move |
| – The shared plan loop: deduceHintPlan | you write the loop that turns firings into a plan |
| – Recording the deduction | the solver must say why each firing happened |
| – A rung is not a premise, so return per premise | one rung holds several rules, or one step shows several deductions |
| – A firing is not always a technique, so check the boundary too | true, forced steps split one thing a player sees at once |
| – Census the reasons, not only the rungs | a reason kind may never fire, or you add one |
| Refusal wording comes from one module | `hint()` has no step to give |
| Refusal couples to the mistake overlay | the board holds a mistake when a hint is asked, or `solve` refuses |
| The cross-game guards | a cross-game hint test fails for your game |
| – A hint must resume from any position | the hint is asked from a board the player reached alone |
| – A hint carries on from an entry the player made first | a rule bounds a line by the nearest undecided cell |
| – The step budget | a deduction loops until nothing changes |
| – Stale plans and refreshHintStep | a followed move or a preference can settle a later step |
| – A plan's copy is the board, no further on and no further back | the planner works on a copy of the board |
| Verifying a hint in-process | you test a hint's frame or pin its positions |
| Probe before trusting a diagnosis | a hint misbehaves and you have a theory why |

## The quality bar

Every game is to have a `hint()`, a game without one is a draft, and a new
game ships with its hint. A hint that names the next move with no explanation,
as upstream's `'h'` does, is below the bar. The rules are cited elsewhere by
these numbers:

1. **Explain why the move is forced, not only what to do.** Narrate the
   deduction itself. If the conclusion does not follow from the premises the
   sentence states, the coupling is missing: state it.
2. **One deduction firing is one journey.** A firing that forces several moves
   is one multi-leg `HintStep` journey, its later legs flagged
   `continuesPrevious`, so it reads and auto-plays as one hint.
3. **Equivalent moves share a color.** Moves that share a fate render
   identically; a second color reads as a second role.
4. **Pace auto-hint uniformly.** `AUTO_HINT_STEP_MS` a step
   ([`src/puzzle/puzzle.ts`](../src/puzzle/puzzle.ts)), floored by the move's
   own animation.
5. **Claim only what the code has checked, and make the plan
   recompute-stable.** Every sentence is a claim a player will trust. A plan
   is recomputed whenever the player goes their own way, so a heuristic plan
   must be stable across recomputes (`hints-search.md` § "Recompute-stable
   plans").
6. **A hint relies only on marks the player can make.** Every fact a step
   rests on is on the board or can be put there by the player. Where a
   deduction needs a mark the game does not offer, the game gains the mark and
   the hint's steps place it. Where a notation would be too hard to manage,
   the tier that needs it becomes `Unreasonable` (`hints-marks.md` § "Give the
   facts a notation").
7. **A hint asks only for what the pointer does.** A hinted game declares
   `hintGesture`, and the midend plays a step by sending that gesture through
   `interpretMove` (§ "Every step is a gesture").
8. **One deductive step per hint; the rest goes onto the board.** A step
   carries at most one inference, and longer reasoning is spread over board
   marks, one a step (§ "Cognitive load: one step per hint").

A game with no deduction is exempt from deduction only, not from the bar
(`hints-search.md` § "What every game does"). The games still
without a hint are the registered games that declare no `hint`, derived by
[`engine/testing/hint-games.ts`](../src/engine/testing/hint-games.ts), and
[`work-management.md`](./work-management.md) § "Which hintless game comes
next" orders them.

Exemplars: Palisade (grouped multi-leg deductions),
[`src/games/range/`](../src/games/range/) (a recording solver, `hint` and
`hintKeepTrack`, and the highlight), [`src/games/towers/`](../src/games/towers/)
(candidate elimination), and [`src/games/inertia/`](../src/games/inertia/)
(no deduction: verified claims, a stable marked subgoal, a recompute-stable
plan).

## Guess-free generation is the precondition

Do not let a hint fall back on the known solution or a backtracking search: an
explained hint needs a board solvable by deduction alone, and that is the
generator's policy to keep.
[`solver-and-generator.md`](./solver-and-generator.md) § "Guess-free
generation" holds it. A game of movement or of an objective is outside the
policy and hints by `hints-search.md` § "What every game does".

## Cognitive load: one step per hint

Make every hint of a tier below `Unreasonable` understandable at a glance: at
most one inferential step. A hint the player has to work through has failed
even when it is correct.

Where a deduction's justification spans more than one step, spread it over
the board as gradual marks, one mark a step, each step narrating one
self-evident inference. The accumulated marks carry the state, as pencil notes
do in a candidate game: populate, strike one candidate with a one-line reason,
and so on to a naked single.

The marks must be ones the player can make, so that what a hint teaches
carries to the next board. A chain that needs a mark the player cannot make is
a notation the game is missing (`hints-marks.md` § "Give the facts a
notation").

### The forcing boundary

Never compress a forcing chain ("suppose X; it hits a contradiction; so not
X") into one sentence and call it one step. A contradiction that survives the
direct rungs comes from combining constraints, so it is a chain of at least
three links, and the sentence asks the player to run the propagation in their
head.

Which treatment a rung takes is decided by
[`solver-and-generator.md`](./solver-and-generator.md) § "Check, Tactic,
Search", by whether the reasoning is bounded and walkable, not by whether a
trial was involved:

- **A Check** is one placement and one validator call with no fixpoint. It is
  ordinary deduction and narrates directly at any tier. Exemplar: Sticks'
  `sticksTry`.
- **A Tactic** is a bounded chain. It keeps its middle tier and is walked:
  tentative marks the player watches accumulate, each leg one step, only the
  last strike real, on the multi-leg journey (`continuesPrevious`). Exemplar:
  Clusters, which renders every forced cell of its hypothetical from its own
  overlay bits.
- **A Search** runs an unbounded fixpoint or sub-solve from its hypothesis. It
  is `Unreasonable` and is not narrated: the hint refuses and says deduction
  has run out. Exemplar: Undead's `forcingPass`.

The other compliant choice is to keep the shipped tiers direct-only and not
deal forcing-tier boards below `Unreasonable`.

- **Judge the shape of the call, not the length of the sentence.** A rung
  that runs a fixpoint from its hypothesis is a Search however short its
  sentence.
- **Where a Tactic and a Search are the same function** with a different cap,
  no wording check separates them, so prove structurally that the hint reaches
  only the permitted one. Spokes asserts that a plan computed at its top tier
  equals one computed at Tricky, with a control showing Tricky adds firings
  the tier below lacks, so the equality cannot pass vacuously.
- **Stating the classified contradiction and anchoring it to the board is not
  a walk.** [`engine/hint-quality.test.ts`](../src/engine/hint-quality.test.ts)
  ("no hint leaves a chain for the player to carry, at any tier") holds every
  game to the walk.

## Writing the narration

Write every nontrivial step as indication, then reasoning, then conclusion:
the spotted pattern in board terms, why it forces the move, and the action.
The sections below are the rules for each part; `src/skeleton/grid/hint-text.ts`
is the smallest example of all of them.

### A sentence has parts

Build a step's words as a `Sentence`
([`engine/hint-words.ts`](../src/engine/hint-words.ts)) with `sentence(said)`,
its shorthand `so(...)`, or `unshaped(...)`. The game hands over the parts and
the engine writes the joins. Five rules hold:

1. Look, then what follows, then the move. Start with what the player should
   pay attention to.
2. Each part follows from the last. Never "move A is bad; do move B" with no
   stated relation.
3. "So" concludes only a move the sentence has narrowed to one. Where several
   moves would do, offer the move as one of them.
4. Leave the move to the board when the board makes it obvious.
5. Omit needless words.

The parts are `look` (the indication, and whatever follows in the same
clause), an optional `follows` (a consequence the move rests on), the `move`
as it reads mid-sentence, an optional `aim` (a stable subgoal) and the
`relation`, which picks the engine's words. The forms are `Relation` in
`hint-words.ts`, pinned word for word in `hint-words.test.ts`:

| relation | reads |
|---|---|
| forced (`so`) | "L, so M." / "L, so F: M." |
| oneOf | "L. One of them: M." |
| answers | "L. One way to save it: M." (the game's words before the colon) |
| effect | "L. M: E." (a move no rule forces, narrated by what it does) |
| sequence | "L. First, M." / "Next, L, M." / "Last, L, M." |
| again | "…and M, for B." (a journey's later leg) |
| serves | "Working on A: M." |

Any form takes an aim ("Working on A: …"). `sentence` capitalizes the result,
so a look that opens on a reference needs no `.capitalized()`.

- **Rule 3 is checked in a game whose hint searches.** `forced` there must
  carry the proof that every rival was judged lost, a value only `judgeRivals`
  makes (`hints-search.md` § "Judge the rivals of a searched move"), and the
  hint-quality walk fails a searching game's forced step without it.
- **Rule 2 is the reviewer's.** The structure fixes the order and the
  connective, not that the conclusion follows.
- **Rule 4 is `mark.move(words)`**: a ring on the step's own move (the
  engine's `MOVE` kind), which the renderer draws as it draws any move.
- **The exceptions are a closed set, each with a property the walk checks**:
  `bare` (nothing to say but the move; names only ring marks), `setup` (the
  method's opening procedure; names no outline or stripes) and `evident` (a
  look alone whose ringed squares say the move; names a ring). A step that
  fits none is first a question about the relations, and a new kind is an
  engine change with its reason.
- **A refusal stays a `Narration`**, not a `Sentence` (§ "Refusal wording
  comes from one module").

### Bind the words to the marks

Build every word that points at the board from a reference to the mark it
points at ([`engine/hint-words.ts`](../src/engine/hint-words.ts)), and paint
every hint mark from those references. The roles mean the same in every game:

| role | adjective | marks |
|---|---|---|
| ring | ringed | what the step decides |
| outline | outlined | what the step reasons from |
| stripes | striped | the line or region the sentence names |

**The words.** Write with `phrase` and a reference wherever the sentence
points: `mark.this("ring", CELL, [c], "cell")` for "this cell",
`mark.the("outline", CELL, cells, "square")` for "the outlined squares",
`mark.this("stripes", whole(CELL), cage, "cage")` for "this cage" (`whole`
counts a region as one thing), `mark.as(role, kind, els, words)` for anything
else that names a mark, and `mark.paren` for "its bulbs (ringed)". A literal
"this", "these" or mark adjective throws, and so does a reference whose words
use another role's adjective. The words re-render from a reference's elements,
so `Narration.narrow` rewrites the sentence of a step whose marks shrink.

**The declaration.** Every hinted game declares `hintMarks`: the roles its
steps name, in the words its help page gives them. The page writes
`{{hint-marks}}` where the list goes and the help build fills it
(`vite-plugins/hint-marks.ts`).

**The paint.** `stepMarks(hint)` is the step's references grouped by role and
kind, and `marks.of("outline", CELL)` is what the words outline, once each,
carrying what the reference named (an outlined cell keeps its chain ordinal).
Nothing else is a source for a mark. A highlight field may carry data that is
not a mark (a ghost glyph, a route, an animation), painted only where a named
mark is. Because nothing else is, the engine can take one reference out: a
player who presses a reference's words in the hint sees that reference's marks
light up while the rest stay drawn, with no code in the game: the worker draws
the step with and without them (`Narration.withoutMarksOf`,
`Midend.hideHintReference`), and the pixels that differ are theirs
(`markPixels`). So a reference's words
are what a player presses, and the fewer words around the mark's own name a
reference takes, the shorter its pill.
The glyph a role
takes on a kind is the game's. The shared painters
read the words too: `OverlaySidecar.pack(stepMarks(hint), …)` for candidate
games and `hintTileBits` for the border grid. A contained kind marks its
container (`MarkKind.within`): a ringed note rings its cell even when no
reference names the cell.

**The check.** `testing/hint-binding.ts` renders every step the hint-quality
walk visits and ablates the words: narrowing any one named element out must
change the frame, and narrowing all of them out must leave no hint on it. A
renderer that reads a mark off a highlight field cannot pass. The walk plays
refresh but not keep-track, so a game whose step shrinks on keep-track asserts
`bindingDefects` after a shrink in its own test (Tents).

What binding a hint turns up:

- **Evidence is outlined, never "ringed"**, whatever glyph draws it. Name the
  highlight field by the role too.
- **A mark drawn and never named is the common defect.** Name it in the
  sentence ("given the outlined cells"). Where the clause would be overhead on
  every step and the mark is there by the owner's choice, ledger the clause's
  length and keep the mark.
- **A leg names the element it rings**, not everything the firing will
  decide. A continuation leg rings what is left and points back at the
  evidence the first leg named ("…and these edges can't be walls either, for
  clue 3").
- **A strike ends on a reference to the struck notes**, so a refresh that
  finds some gone rewrites "cross out 2 and 4" as "cross out the 4".
- **A step that shrinks on keep-track narrows its words** with
  `Narration.narrow` and resets `explanation` (`skeletonKeepTrack`).
- **Two marks of one role are told apart by their kind, not their color.**
  Where a step decides two different things, give one a kind of its own and
  let the game draw its ring, so the sentence can say "this arrow" and "the
  ringed square". Exemplar: `ARROW` in `signpost/hint-marks.ts`.
- **A kind's key must tell apart every mark that can be drawn separately.**
  `stepMarks` keeps one element per key, so two marks sharing a key merge and
  one is never painted. Untangle keys a crossing by its pair of lines, since
  two crossings can share a point.
- **A renderer rule is a rule about the words.** Where the renderer lets one
  mark win an element over another, the words must not name the losing mark
  there: the ablation finds a named mark whose removal changes nothing.
- **A rule word is not a mark word.** "Shaded" is a cell state in a shading
  game and the lint allows it; "hatched" and "highlighted" only ever name
  marks.

### Necessity for deductions, imperative for moves

Word the conclusion clause as a decision, in the voice the move's nature
calls for:

- **A forced move takes a modal of necessity**: `must be`, `can only be`,
  `can't be`, `must stay`, `must cross out`. Never a state-of-being verb
  (`is`, `are`, `stays`, `it's`) in the conclusion: "so it must be white",
  not "so it stays white". Premise clauses still state facts plainly.
- **A move that is recommended and not forced takes the imperative**: "slide
  it into place", "fill with red". A statement of a measurement ("Moving this
  point here cuts its crossings from 16 to 4.") is neither voice and needs
  neither.

Choose by the move, not the genre: a deductive game's step that recommends a
non-forced move uses the imperative. A necessity premise may carry an
imperative tail where the premise already states the forcing (Palisade: "Clue
c reaches its count only if every remaining edge is a wall", then "draw them
all").

`src/engine/hint-quality.test.ts` holds every deductive game's forced steps to
the shared necessity vocabulary. The step's relation says whether it is a
deduction: a step that offers a move, or is declared `setup` or `bare`, is
read by its form and not held to the modal. An owner-endorsed phrasing that
carries necessity in its own words is a declared idiom in that file's idiom
table; add one deliberately, never by loosening the shared pattern. The exact
modal for a strike against a placement is a per-game test.

### Lead with the indication

Open every nontrivial hint by naming the indication, the recognizable board
pattern that triggered the deduction, before any reasoning. Phrase it as
something the player can learn to spot ("there's a pair of 5s in one column
and a pair of 1s in the next"), not buried mid-sentence or left to the
highlight.

Nontrivial is anything past one local rule application. A step whose signal
is the move itself ("These squares touch a shaded square…") satisfies the
rule already. The multi-element deductions are the ones that need care; when
in doubt, lead with the indication. Read orientation off the reason so
"column" or "row" is concrete. Exemplar: the `offset` arm of Singles, and the
`singles-hint.test.ts` case that asserts how it opens.

### Two marks of one kind: tie them, and never by color

Where a step marks more than one element of the same kind, do not say a bare
"this cell": tie the target to the other mark in words. With one mark in
view, "this cell" is right and a qualifier is noise.

Ask first whether the two marks are the same kind of thing. An edge against
regions, a spoke against hubs, a square against a clue: the noun already
picks the target out. The defect is a cell marked against another cell.

Never tie by color. The palette is scheme-relative, so a hue named in prose
is false under the other scheme and unreadable to a color-blind player. Two
marks that differ only by hue are marks to fix. The action color against the
evidence color is not such a pair, since it differs in weight, which
`palette.test.ts` ("keeps the hint emphases distinct, in both schemes")
asserts.

Tie by something the code guarantees, cheapest first:

- **A relation** ("its ringed red neighbor", "the shaded brick above").
  Check in code that the relation holds on every firing, by measuring, before
  writing it: a run may be longer than the two the sentence assumed, and a
  clue may never be adjacent to its target at all.
- **A value**, where the puzzle has one (§ "Name a square by its value").
- **A role word tied to the mark's shape**, where the game's marks already
  use distinct ones.
- **A number on the other marks.** Where the second mark is a chain the hint
  numbers, name those cells by ordinal and keep "this cell" for the one with
  no number. A numbered mark and an unnumbered one are not the same kind of
  thing, so this ties every mark on screen. Numbering a chain does not retire
  a tie that says which mark "this cell" means.

Guard it in the game's test: a second mark displayed implies the explanation
contains the tie. See the guard fail first, and give it a `checked` floor and
the set of reason kinds the sweep must have reached. Exemplars: the hint
tests of Clusters, Bricks, Range and Light Up.

`scripts/checks/hint-deixis.test.ts` (`npm run diff`, writes
`metrics/hint-deixis.md`) reads every frame for a bare deictic beside a second
mark, including one the sentence never mentions, which a grep cannot find. It
is a report to read periodically. Do not turn it into a gate: a lexical
filter cannot see a tie made by value, by line, by a leg's antecedent or by
kind.

### Name a square by its value

In a number puzzle, name a square by its value, never by a bare pronoun or
"this square": "This 3 shares a line with the ringed white 3", so both squares
are found by sight and the duplicate the deduction turns on is in the words.
The deduction knows its targets, so read the digit off the state in `narrate`.

- **Never open on a dangling "It", "They" or "This is…".** The banner is the
  player's first sight of the sentence.
- **A pronoun may only avoid restating the same value** where the referent is
  obvious ("This 3 … so it must be shaded"). Name the referent mid-sentence
  too where "it" could be read as another square.
- **Several squares of differing values are listed** (`joinNums`); squares
  sharing a value name it once in the plural ("These 3s").
- **An empty square has no value**: anchor it on a concrete neighbor ("The
  shaded region of N has only this one empty square to grow into").
- **On a subtle deduction, concrete values beat role words**, in the order of
  the proof: the signal, the move ruled out, the consequence, the deduction.
- **A narration with no digit or coordinate and three or more of "this",
  "that", "it", "the one"** is almost certainly improvable.
- **Describe only what is invariant in the layout.** Values do not make the
  geometry true: delete words that assume a tight figure ("overlap", "between
  them", "side by side") unless the solver's loop bounds guarantee it, and
  lean on the highlight for where.
- **Dodge "a 8"**: write without the article ("one of the 6s") or branch on
  the digit.
- **Guard the equal-value branch**: where two groups coincide, "Two 4s and two
  4s" reads broken, so special-case it.
- **Two squares of one value are named by where they sit.**
  `apartByPosition`
  ([`engine/apart-by-position.ts`](../src/engine/apart-by-position.ts)) gives
  "the upper 7" and "the lower 7", built over every number the one sentence
  names. Its users: `npm run refs -- src/engine/apart-by-position.ts
  apartByPosition`.

Exemplar: every branch of `narrate` in
[`singles/index.ts`](../src/games/singles/index.ts) names a value.

#### A clue named with its area is marked on its own square

Where a sentence names a clue and the frame shows the clue's area, mark the
clue's own square too. "This 4" over an outline round the squares it counts
leaves the player to find the 4 by the outline's middle, and two overlapping
areas have no two middles.

The clue is what the step reasons from, so it is an outline reference, and
the glyph is the game's. Put the glyph:

- **On the clue's square, and inside it**, because the square can also be one
  the step decides and a ring owns the border. Mosaic circles the number;
  Range redraws the digit in the action color.
- **Legible on every surface the clue is drawn on.** Where the evidence color
  hardly differs in lightness from the surface, the glyph takes the number's
  own ink: the shape is the mark, not the color.
- **Under one reference with the area.** The block and the circle are one
  reference (`BLOCK` in `mosaic/hint-marks.ts`), so the binding check holds
  them together and no word names them apart.

`scripts/checks/hint-area-names.test.ts` (`npm run diff`, writes
`metrics/hint-area-names.md`) lists each one-unit outline or stripes
reference that paints an area. It is a report, not a gate. Read the rows whose
words name a clue, a number or a square; a game that follows this rule stays a
row.

### The premise must single out the conclusion

State the premise that discriminates this move from the others. Where two
candidate moves both satisfy the stated premise, the sentence describes the
wrong reason, even when the move is right: find the premise that separates
them. Guard it by asserting the discriminating phrase present and the false
one absent (`singles-hint.test.ts`, "corner4").

Where one technique can be forced several ways, carry which. An "only one
candidate is left" rung has candidates that died of unrelated causes (the
wrong length, already used elsewhere, contradicting an entry), and one
sentence for all of them cites, on a fresh board, entries that do not exist.

- **Compute the reason at the point of elimination**, as a field on the
  firing, not at narration time: only the finder knows why the others died.
- **Write one sentence per cause.**
- **Read the fresh-board firing specifically.** It is the opener the player
  sees first.

Exemplar: the `because` field of Crossing's firing, and
`crossing-hint.test.ts`, which asserts each cause's phrasing and that a run
with nothing entered never cites what is "already in this run".

### Keep the narration terse

Say the why in one sentence, within 120 characters. Cut to the single premise
the highlight does not already show, lean on implied values ("the region of N"
already says to write N), and do not repeat the number.

**A reference names a thing on the board, and says which mark it is.** The
sentence has to read against the board without a press: "the striped
column", "the outlined 6", "the ringed square", never a bare "here" or
"this" beside other marks, and never a clause as the pill ("means none below
either"). The owner (2026-10-19, of Tracks): "before, it was possible to look
at the hint against the board and understand what's going on, but now it's
impossible without clicking." Each pill and its marks share a color of their
own, which ties the two but does not stand in for the words. Cut the rest:
"the outlined 3s and 2s", not "a pair of 3s in one column and a pair of 2s in
the next". Keep the premise and the reason, which no mark shows, and the rule
the step teaches where the help does not already state it.

`testing/hint-reference.ts` holds every step of the bound walk to it, reading
each reference's own words. A reference passes as the move, as a role's word
(or "numbered", for a chain), as a value (a number, a letter, an operator),
as a phrase the game's legend teaches for the role, or as a noun phrase that
is "this cell" or names its thing by a relation ("its partner", "the same
row"). It fails as a clause, as a bare pro-form ("it", "here", "the rest"),
as words that open on no determiner, and as "this cell" said in two roles of
one kind. So:

- **Put the verb outside the reference.** "so [the ringed squares] must all
  be mines", not "so [these must all be mines]". A literal "it" after the
  reference is fine: only the pill is pressed.
- **A struck note is named by its value**, even just after the premise named
  it: "puts 2 in this cell, so the 2 must go".
- **"Ringed" is the ring's word in every game**, whatever the game draws:
  each legend says what its ring looks like, and no single word is true of a
  band, a fill, an arrow and a dot. Where "ringed" would mislead, the legend
  teaches the game's own shape in the words the sentence uses (“the dotted
  squares”), and the guard accepts that phrase for that role.

Leave a journey's count to the chrome. A step whose journey has two or more
legs shows "Step 2 of 7" above its sentence, so the words never say which leg
it is or how many there are ("turn 2 of the 7", "Three jumps clear…"). The
bound walk in `hint-quality.test.ts` holds every leg to it (`journeyDefects`).

`hint-quality.test.ts` ("hint narration stays readable at a glance") holds
every step to the limit, over every tier and preset into the middle game and
each game's last preset at its hardest teachable tier. A sentence over the
limit fails the commit that wrote it.

**A sentence that needs more room is listed in `LONG_NARRATIONS`**: an entry
per reason, with the `rungs` that speak it and a `games` roster, held to 300.

- **Shortening a sentence means deleting its listing.** The ledger fails an
  unlisted long step and also a listing that matches nothing long. The
  commit and push hooks skip that reverse half, and report it skipped
  (`CORNER_WALKED` in that file), so after shortening a listed sentence run
  `npx vitest run src/engine/hint-quality.test.ts`, which runs it as CI and
  `npm run gate` do. The limit itself is never skipped.
- **What earns a listing**: a chain Tactic whose form the spec mandates, an
  owner-endorsed wording, a deduction with two premises, or a second sentence
  the owner asked for.
- **Add a game to a shared entry only once you have seen it speak the
  sentence.** That the solver records the rung is an inference: a plan may
  finish every board on cheaper rungs.
- **Where the guard calls a listing dead, suspect the walk first.** Give the
  listing `spokenOn`, a `params:desc` that speaks the sentence, which every
  commit then holds; reach for that pin before a wider walk. Before deleting a
  listing, widen the walk for that game (every leaf preset, every tier, both
  auto-pencil settings) and record the wider walk beside the entry.

To shorten without losing a premise:

- **Move a rule to the help** (§ "Rules belong in the help"), after checking
  the help teaches it.
- **Let the picture carry what it shows**: drop "(its other sides are
  walled)" beside walls that are drawn.
- **Keep every per-game guard's intent when its pinned words move**: re-key a
  tie or a phrase a test detects, do not drop it.
- **Re-read the degenerate extremes while there** (§ "Sanity-read at the
  degenerate extremes").

### The sentences live in one file per game

Put every sentence a game's hint speaks, and every word inside one, in
`src/games/<id>/hint-text.ts`, exported as `say`: a string for a fixed
sentence, a typed function for one that takes values. The deduction (the
game's `narrate`) decides which sentence and with what values; the text file
decides only how it reads. Sentences several games speak word for word are
the engine's [`hint-text.ts`](../src/engine/hint-text.ts). Exemplar:
`src/games/tracks/hint-text.ts`.

- **Values arrive as the board means them, never as words.** An axis, a
  count, a direction constant: the plural, "both" at two, "a" or "an" and a
  direction's name are the text file's choices. A conclusion the deduction
  computes arrives as a boolean, so no rule of the game hides in the text.
- **No entry reads the board.** An entry may take the deduction's own record
  where every value is in it; a value that must be looked up is looked up in
  `narrate` and passed in.
- **A game whose voice depends on a mode takes the mode**: `say` is then a
  function of it (Salad).
- **A wording comment moves with the wording.** Why an arm fires stays with
  `narrate`.
- **A refusal is not hint text.** It is a `HintRefusal`, and a game's own dead
  end goes through `puzzleDeadEnd` or `markedDeadEnd`, whose test reads the
  call; a `say` entry would hide the sentence from it.
- **Moving a sentence is not rewording it.** Hold a bulk move to a census of
  every step spoken across every tier, byte-identical before and after, and
  to a diff check that every literal on a removed line reappears on an added
  one. A reword is its own commit.

### No em-dashes

Write no em-dash in a hint. Use a comma, a semicolon, a colon or a sentence
break; parentheses are fine for a real aside. Rewrite the sentence, never
delete the clause to lose the dash. The en-dash is notation and stays
(Dominosa's `3–5`).

Held by the narration sweep in `hint-quality.test.ts` and, in
[`hint-em-dash.test.ts`](../src/engine/hint-em-dash.test.ts), a scan of every
hinting game's source and of the engine's shipped code, where a family's
sentence is often written once.

### Conclude with the action the move makes

Make the conclusion clause match the move's type:

- **An elimination says which candidates are ruled out and why**, ending on
  the strike that names the value ("…so the 4 must go"), not an abstract "so
  it can't go here". "Must go" is the necessity voice in two words; an
  imperative ("so cross out the 4") reads as a suggestion, and the necessity
  rule refuses it.
- **A placement keeps the positive necessity voice** ("it can only be 4").
- **Never imply a placement the rule does not establish.** A sentence that
  claims a unique value belongs to a step that places it: `pencilStrike` is
  "rule out", `set` is "must be".

On the candidate walk the conclusion is not the game's to write: a strike's
words are its premise, and the walk ends the sentence by the move the step
makes (`hints-candidates.md` § "The shared candidate-hint machinery"). The
game's sentences there only have to read well before ", so …". Exemplar:
`premise` in [`towers/index.ts`](../src/games/towers/index.ts).

### Sanity-read at the degenerate extremes

Where a sentence interpolates a clue, a count or a size, re-read it at the
minimum and maximum the value can take, and on a fresh board. "Can see only N
towers" contradicts itself when N is the grid's width, and "a run one short of
its count" is a run of zero at 1; phrase counts so they hold across the range
("sees exactly N").

An image has a range too. Read the guard of the premise's firing to find
every case it admits, and read the sentence against each: "the long way
around this 3" is false of a 2 with one edge already out, which the same
guard admits.

### Name elements by what the player can see

A name is a claim, so name an element only by something the player can check
against the picture.

- **Name it by what it does and how it is drawn**, not by a position that
  holds at some sizes. Netslide's immovable tile is "the source", since
  `⌊w/2⌋` is not the center of an even board.
- **Name a line as "this row" or "this column", over that line's stripes,
  never by a number.** No board draws line numbers, so "row 3" is a name the
  player cannot check. Name a line cited beside it by where it lies or by its
  mark ("the striped row", "the column beside it"), and a square a piece is
  sent to by the mark on that square. The rule is `engine-hints`, requirement
  "A hint names no row or column by a number the board does not draw", and
  `hint-quality.test.ts` fails a sentence that numbers a line.
- **Re-read a name at the degenerate size** (even against odd, `w = 1`).
- **A word the hint introduces is taught by the help page**
  (`help/games/<game>.md`), in the same word (§ "The help teaches the
  marks").

### Rules belong in the help

State on a step only the premise that makes this move follow. A fact true of
the whole board on every step is a rule: teach it on the help page and leave
it out of the sentence. Keep a rule in a sentence only where it is the
technique ("This row never slides, so only a column move shifts this
corner").

- **Diagnose by length times frequency.** Plan a number of fresh boards and
  tally each narration branch by count, share and mean length before
  rewriting.
- **Guard the result with a maximum-length assertion** over a scan of boards
  (`netslide-hint.test.ts`).
- **A rule's own consequence goes in the same step.** A move that a rule
  makes follow from the one just asked for is not a step of its own. Fold
  such consequences in where the plan is built, to closure, name each fold in
  the sentence, and make the narration fail on a step that folds one in
  without naming it. A fold that can follow any deduction takes one fixed
  second sentence, listed in `LONG_NARRATIONS`. Exemplar: `carryOn` in
  `src/games/pearl/hint.ts`.

### The help teaches the marks

Give every hinted game's help page a `## Hints` section that says what is
ringed, outlined, striped or hatched in that game, which marks are the
player's own notation and how to make them, and the words the sentences use
for them. A sentence can then use a mark without defining it.

Write it from the game's `hint-text.ts` and one rendered hint, never from
memory. A change to what a hint draws or calls its marks updates the section
in the same change. `src/help-coverage.test.ts` checks only that the section
is there. Exemplar: `src/skeleton/grid/help.md`.

### Hint the move that advances the goal

Offer the forced moves that take the player toward solving the puzzle, with
progress first. A hint need not follow the solver's rung order: each firing
only has to be forced.

- **Order goal-first.** Lead with the moves that build the answer, a forced
  connection before any rule-out.
- **Drop a move that is forced and advances nothing.** Find the local "does
  this help?" predicate and skip firings that fail it.
- **Prove the skip is safe.** A suppressed move must not be load-bearing for
  the solve; if suppressing it would stall the plan, narrate it.

Exemplar: Spokes, which hints a line before a mark and skips the rule-out
between two finished hubs, with the safety asserted in `spokes-hint.test.ts`.

### Show only what the board does not already say

A step must tell the player something their board does not already show.
Filter with [`deduceHintPlan`](../src/engine/hint-plan.ts)'s
`showable(board, firing)` (its users: `git grep -l showable -- src/games`). A
firing that is not showable still advances the working board and becomes no
step. The plan cap counts shown steps only, and the result's `hidden` count is
what a test reads to prove its corpus exercised the hook.

Decide what is evident by asking the game's own move legality, from either
side:

- **Hide a firing whose move the game would refuse** (Galaxies: an arrow
  inside a region already closed correctly).
- **Hide a firing whose contrary move the game would refuse** (Tracks: track
  on a side of a square marked empty).

What the loop cannot check:

- **Hide only what the player can already see.** A later step may cite a
  hidden firing's conclusion as a premise, which is honest only because the
  player sees it on the board.
- **Never hide a change the win condition needs**, or the plan never
  finishes. `hint-resume.test.ts` catches it.
- **Where a firing declares itself hidden, hold the declaration to the
  legality test.** `tracks-hint.test.ts` asserts every reasonless firing is
  evident, judged on the board before the firing landed, and that the
  production predicate and the legality test agree across the corpus
  ([`testing.md`](./testing.md) § "How a cross-game guard finds its
  population").

Use `showable` when the hidden firing must still move the board. A filter
that trims within a firing and never applies what it drops filters at find
time (Spokes).

## The hooks a hinted game implements

Implement these on `Game`. The contract and the `Midend` lifecycle are the
[`engine-hints`](../openspec/specs/engine-hints/spec.md) spec, and the
implementation is [`src/engine/midend.ts`](../src/engine/midend.ts). Exemplar:
`src/skeleton/grid/index.ts` and `hint.ts`.

- **`hint(state, aux?, ui?): HintResult`** returns `{ ok: true, steps }` or
  `{ ok: false, error }` with a `HintRefusal`. Compute the whole remaining
  plan once; the midend advances it as the player follows or auto-play runs.
  Each `HintStep` carries `move`, `rung`, `words` and `highlights`
  (game-specific render data). `aux` is the generator's solution where there
  is one, for a hint that falls back on it (`hints-search.md`
  § "What every game does"). `ui` is the midend's, for a game that
  reads a preference.
- **`hintKeepTrack(move, step, state)`** returns `"completed"` when the move
  matches the step's intent, `"onTrack"` for partial progress on a step of
  several moves, else `"off"`, which drops the plan. It is handed the state
  before the move (`Midend.processInput`), so a game that needs the result
  applies the move itself. For a pencil toggle, a candidate present now is
  one the toggle clears, the strike to follow, and an absent one is a toggle
  that would add it back, which is `"off"`. Do not test it with a timing the
  midend never uses.
- **`continuesPrevious`** on a step groups steps into one journey: the chrome
  counts a leg within it and auto-play runs the legs back to back. A move of
  the player's own never puts a sentence on screen: a completed step hides the
  hint and every leg waits to be asked for. So a leg's sentence cannot lean
  on the one before it still being on screen.
- **`refreshHintStep(step, state)`** validates a kept step at display
  (§ "Stale plans and refreshHintStep").
- **`hintGesture(state, ui, ds, move, step)`**, **`hintRungs`** and
  **`hintMarks`** are required of every hinted game (§ "Every step is a
  gesture", § "Name the rung a step speaks", § "Bind the words to the
  marks").

### Name the rung a step speaks

Stamp every step with `HintStep.rung`, the id of its deduction, and let
nothing read a sentence to find out which deduction a step is. The pins a
game's tests read ([`testing.md`](./testing.md) § "Pinning a hint's
positions") and the narration ledger key on the id, so a reword moves only
what asserts wording. A game writes three things, each once:

1. **The list**, beside the solver or the hint: a `FOO_RUNGS` tuple `as
   const` and the `FooRung` type derived from it.
2. **The stamp**, where a step is built: `rung: reason.kind`. Type the step
   `HintStep<FooMove, FooHint, FooRung>`, and a reason kind missing from the
   list fails to compile.
3. **The declaration**: `Game<…, FooHint, FooRung>` and `hintRungs:
   FOO_RUNGS`.

Exemplar: `SKELETON_RUNGS` in `src/skeleton/grid/solver.ts` and `stepOf` in
its `hint.ts`.

- **A rung is the deduction at the grain the solver or the plan already
  names it.** A reason union gives its `kind`s; a hint that picks a branch
  names the branches. The legs of one journey share their firing's rung.
- **Two sentences for one deduction are not two rungs** (a row or a column,
  one cell or several). A test that wants one of them writes a predicate
  over the step's fields. Split a rung only where the halves are different
  reasoning.
- **An id is the game's own word** as its solver spells it, and no sentence,
  help page or save holds it: a rename costs its pins' keys.

On the candidate walk the game writes no stamp
(`hints-candidates.md` § "The shared candidate-hint machinery"):

- **`runCandidatePlan` stamps its own steps**: a placement or a strike takes
  its reason's `kind`, and the setup steps and a placement's cull take the
  engine's `CANDIDATE_RUNGS`. The game's list is `[...CANDIDATE_RUNGS, …its
  reasons' kinds]` and its steps carry `PlanRung<Reason>`.
- **A `placeWords` that narrates another reason than the one it was handed
  returns that `rung` beside the words**, so the id and the sentence agree.
- **A plan with a `setUp` of its own is on the populate reading alone and
  says so in its types**: `runLatinCandidatePlan<…, "populate">`, steps of
  `PlanRung<Reason, "populate">`, a reason union of
  `SingleReasonUnder<"populate">`, and a list that spreads
  `LATIN_POPULATE_RUNGS`. The argument does not compile without a `setUp`,
  and a plan on both readings does not compile with one. The walk throws
  before it reads a single with no notes on such a plan. A game that wants
  its own setup and an own rung that asks `RungContext.placements()` before
  the setup is done lists `regionsFull` and widens `OwnSetUp`.
- **A candidate game's pin scan gives `ui` a rule that splits its boards
  between the two readings**, since `populate` is spoken only under one and
  `note` only under the other (`towers-hint.test.ts`).

### Every step is a gesture

Make every step's move one the pointer makes: a tap, a long press, a drag or
an on-screen key. The midend never applies a step's move. `executeHint` asks
`hintGesture` for the gesture
([`hint-gesture.ts`](../src/engine/hint-gesture.ts)), sends it through
`interpretMove`, and hands each move it makes to `hintKeepTrack`. A move off
the step, a key no on-screen control sends, or a gesture that ends before the
step completes throws, and `hint-gesture.test.ts` walks every plan.

- **A game that declares `targetVerbs` names its step's targets and no
  more.** `verbClicks(targetVerbs, { executeMove, hintKeepTrack }, state, ui,
  ds, step, targets)` clicks each target once with the first button whose
  verb makes a move `hintKeepTrack` keeps on the step, at the geometry's
  `pointAt`. It is one click a target because the midend refuses a move off
  the step, so a target reached only by cycling through a value the step does
  not want cannot be played. A step that presses a target several times over
  values the step accepts, or drags, keeps its own gesture. Exemplars: the
  skeleton's `hintGesture`, Pattern, Mosaic.
- **Aim at the middle of what the move changes**, computed from `ds.tileSize`
  with the helper the renderer uses to place the square or edge.
- **A step the pointer makes in several moves is several actions.**
  `hintKeepTrack` calls the earlier moves `"onTrack"` and the last
  `"completed"`.
- **A mode is part of the gesture.** A step in notes mode presses
  `PENCIL_MODE_BUTTON`, plays the notes, and presses it again if the mode was
  off. A keypad digit follows the tap that selects its cell. The shared
  shapes do this: `verbClicks`, `verbGesture` and `routeGesture` for
  target-verb games (a border grid names its edge with `borderStepEdge`), and
  `candidateGesture` for candidate games, given the game's `markAll` move so
  that a strike the mark-all control makes whole is one press of it.
- **A gesture that depends on the `Ui` asks the game.** Rehearse the taps on
  a `structuredClone` of the `Ui` through the game's own `interpretMove`
  (Crossing, Group, Ascent).
- **A point on a continuous board must be one a pixel can reach.** Propose
  only spots where the words hold for every landing inside the half-pixel
  box, at any tile size (`untangle/landing.ts`).
- **The keyboard is not a gesture.** Its route to every move is held by
  `target-verb.test.ts`, and a game outside the target-verb model owes the
  same in its own tests.

### The shared plan loop: deduceHintPlan

Build the plan with [`deduceHintPlan`](../src/engine/hint-plan.ts), not a
loop of your own. Give it the working board (cloned by the caller), a
`status` and `incomplete` pair, a `next(board)` firing finder, an optional
`apply`, and the two bounds. Rung order, reason types and sentences stay in
the game. Exemplar: `skeletonHint` in `src/skeleton/grid/hint.ts`.

- **`planCap` and a `StepBudget` are separate bounds**: one stops a plan
  running on, the other catches a rule that is not advancing.
- **`status()` is called before `next()` on every iteration**, and a game may
  depend on it (Subsets' validator refills what its later rungs read), so do
  not skip it.
- **Omit `apply` when the rungs mutate as they detect.** Applying a firing
  twice is wrong for a rung that reads its own effect.

Its users: `npm run refs -- src/engine/hint-plan.ts deduceHintPlan`. A game's
own `function deduceHintPlan` (`git grep -n "function deduceHintPlan" --
src/games`) is its plan builder, which may or may not call this one. Moving a
game onto it preserves behavior when its hint tests pass unedited.

### Recording the deduction

Record, for each firing, why it fired and on what evidence, from the rules
themselves. Decide first where the record comes from:

- **Threaded**: an optional recorder passed into the game's own rules, built
  only on the hint path, with every reason allocation gated on it so the
  generator's path is unchanged. Exemplars:
  [`range/solver.ts`](../src/games/range/solver.ts) (a `record` callback),
  the skeleton's `ladder`.
- **Parallel**: separate code over the solver's primitives that the generator
  never calls. Choose it where the hint needs the deduction in another order
  or at another grain than the generator, which needs only that it fires
  (`hints-candidates.md` § "A candidate game off the shared walk"). Exemplar:
  Clusters, which restarts its scan after each firing and takes the shortest
  chain.

A ladder on `runDeductionFixpoint` still makes that choice: a technique's
`run` returns a number and its `firings` tally counts by rung id, which is
not a record. What the ladder gives is the driver and a certified rung list:

- **Drive it with `singleFirings({ techniques, maxTier, budget,
  beforeTechnique })`**
  ([`deduction-fixpoint.ts`](../src/engine/deduction-fixpoint.ts)), built
  once over the working board. `next()` returns the technique that
  fired or `null`, and `impossible()` is sticky. Wrap it in a `next()` that
  turns the recorder into a firing and hand that to `deduceHintPlan`.
  Exemplars: `skeletonRecordingPass`, and `tracksRecordingPass` in
  [`tracks/solver.ts`](../src/games/tracks/solver.ts).
- **`beforeTechnique` clears the standing reason**, so a rung that declares
  none returns `null` and does not borrow the last one.
- **Record every firing, including one that changed nothing the player
  sees**, and let the plan loop hide it (§ "Show only what the board does not
  already say"). Do not bend `settled` to skip such firings: the `hidden`
  count cannot see them.
- **Read what the firing changed yourself**, from the recorder or by
  comparing the board before and after.
- **A rung in the `unreached` ledger of `<game>-ladder.test.ts` needs no
  narration.**

Rules for any recorder:

- **Group by a firing id, not by adjacency.** Give one firing's ops a shared
  `group` ([`deduction-record.ts`](../src/engine/deduction-record.ts)) and
  merge records by group into one multi-cell `HintStep`, in first-seen order.
  The links of a real chain stay separate steps.
- **One `group` covers exactly one firing.** A counter that bumps once per
  pass, under a routine that loops over every clue, puts several firings in
  one step. Make each clue or line routine return as soon as it fires on the
  recording path, and assert that every struck mark of a step lies within the
  step's narrated area (`towers-hint.test.ts`).
- **A solver that queues ops and cascades** attaches the reason to the queued
  op and records each op where it changes a flag, the cascade building its
  own reason at the apply site. Exemplar:
  [`singles/solver.ts`](../src/games/singles/solver.ts).
- **A solver that wipes the board cannot be replayed as it is.** Whatever the
  wipe derived from the givens becomes an ordinary narrated firing, and so
  does a placement's side effect, or a later sentence describes a board that
  is not the player's. Exemplar: Boats' `givenClue` and `neverTouch`. Where
  the wipe wraps only a loop, `deduceHintPlan` replaces it and the wrapper is
  never called (Sticks).
- **A Latin candidate cube is a notes representation; record off it**
  (`hints-candidates.md` § "What every game does").

### A rung is not a premise, so return per premise

Where one `DeductionTechnique` holds several teachable rules, or scans the
whole grid, return at the first premise that changed something, gated on the
recorder. Otherwise independent deductions land in one hint step
(`hints-marks.md` § "Group one firing into one step"). The gate keeps the
generator's accumulate-across-the-grid path unchanged. A coarse ladder needs
this as much as a fine one, and may need it at two levels: the sweep returns
at the first unit that moved, and a stage of two rules returns at the first
rule that fired.

- **Set the standing reason before applying the premise, and reset it only
  when the premise changed nothing.** Clearing it after a firing hands the
  driver ops with no reason.
- **Build the reason behind the `if (rec)`, never as an argument to a
  helper.** Some evidence costs a full-board scan, and an argument is built on
  the generator's hot path.
- **Capture the evidence inside the rung, before it acts.** A rung can
  destroy its own premise, and a snapshot afterward then shows a different
  set than the sentence counts.

Exemplar: [`tracks/solver.ts`](../src/games/tracks/solver.ts); Bridges for
the two levels.

### A firing is not always a technique, so check the boundary too

Where a hint is true and forced and the player still cannot name what they
learned, check whether the solver's firings are finer than the technique a
player sees: one human deduction reached in several firings is shown as
several unrelated hints, narrowest first.

- **Teach the engine the pattern as a rung; do not group firings in the
  hint.** A hint-side recognizer puts one technique in two places. Fall back
  to it only if the rung re-grades boards.
- **Measure a new rung on a solver-gated generator before writing it.** It
  changes when conclusions are reached, which can move a board's tier. Grade
  a corpus both ways and count the boards that change.
- **A pattern whose conclusions the existing rungs already reach** cannot
  strengthen the solver, but firing order is still observable, so measure
  that too.

Exemplar: Loopy's blocked corner pair.

### Census the reasons, not only the rungs

Reach every reason kind in the game's hint test, not only every rung: an arm
of a reachable rung can be unreached. Write a `Record<Reason["kind"], true>`
constant, so a new variant fails to compile until the census lists it, and
add a board by hand for a premise the generated corpus does not deal.
Exemplar: `tracks-hint.test.ts`.

An arm no board reaches is a finding to explain. "A cheaper rung gets there
first" is a guess until the ladder's order proves it: the arm may fire only on
a size the corpus never dealt, or be unable to fire because of a defect
([`solver-and-generator.md`](./solver-and-generator.md) § "A capped solver
must be monotone in its cap"). [`testing.md`](./testing.md) § "Pinning a
hint's positions" says how to tell the cases apart.

## Refusal wording comes from one module

Return a refusal as a `HintRefusal` from
[`src/engine/hint-refusal.ts`](../src/engine/hint-refusal.ts), never a string
of your own: `DEDUCTION_EXHAUSTED`, `CONTRADICTION_UNLOCALIZED`,
`NO_MOVE_WORTH_MAKING`, `SEARCH_OUT_OF_REACH`, `GAME_OVER`,
`PUZZLE_NOT_REASONABLE` and the rest. The wording is shared because
`help/features.md` teaches "there is a mistake" and "deduction has run out"
as a pair that call for opposite responses.

**The midend refuses before it asks.** A solved board gets `ALREADY_SOLVED`,
then a board on which `findMistakes` finds anything gets `FIX_MISTAKES_FIRST`
with the mistakes on the overlay. `FIX_MISTAKES_FIRST` promises a highlight
only the midend can draw, so it is not a `HintRefusal`. So `hint()` is asked
only about an unfinished board with nothing wrong that `findMistakes` can
see, and starts reasoning on its first line.

**A hint makes no wrong-board check of its own.** A hint that opens by
comparing the board with the answer is a second copy of `findMistakes` that
keeps the cell to itself: move what it found into `findMistakes`.
[`wrong-entry-check.test.ts`](../src/engine/wrong-entry-check.test.ts) holds
every game to it.

What a game answers for itself:

- **`DEDUCTION_EXHAUSTED` only for deduction running out on a sound board.**
  A game whose tiers are all deduction-complete cannot reach it. Where
  `hint()` returns it and `permitsSearch` (`difficulty.ts`) says the tier does
  not allow search, `Midend` throws with the game, the tier and the id, and
  `hint-resume.test.ts` fails the same refusal. A hint weaker than its game's
  solver can run out on a board that loaded
  ([`solver-and-generator.md`](./solver-and-generator.md) § "No option
  switches the generator's checks off").
- **`CONTRADICTION_UNLOCALIZED` for a board `findMistakes` passes that is
  still doomed**: inconsistent with no single entry wrong. A dealt board that
  reaches it has a shortfall in its `findMistakes`
  ([`solver-and-generator.md`](./solver-and-generator.md) § "Self-validating
  games run their rule checker").
- **`GAME_OVER` for a lost board that takes no more moves.** The midend does
  not refuse on `"lost"`, since a lost board may play on (Flood past its
  limit).
- **`SEARCH_OUT_OF_REACH` when a bounded search comes back empty.** That says
  nothing about the board. `NO_MOVE_WORTH_MAKING` is a claim about the board
  and only a game that checked it may say it, as a backstop in a construction
  that cannot come back empty on an unsolved board. `hint-resume.test.ts`
  accepts `SEARCH_OUT_OF_REACH` from exactly the games whose code names it
  (`SEARCH_REACH_GAMES` in `testing/hint-games.ts`, with a reason for each):
  a deductive game emitting it fails, and so does a searching game emitting
  anything else.
- **`puzzleDeadEnd(sentence)` for a dead end only this puzzle has**, in its
  own words (Inertia's dead ball). `hint-refusal.test.ts` reads every call and
  fails a sentence two games pass, one that spells out a shared kind, and one
  that does not tell the player to undo. Never refuse by telling the player
  to do what the hint exists to do.
- **`markedDeadEnd(phrase…)` for a dead end whose cause the game can point
  at.** Its words name the elements and the board marks them, held by
  `deadEndBindingDefects`. The renderer reads `redraw`'s `deadEnd` beside
  `hint` (`stepMarks(hint ?? deadEnd)`). Exemplar: Pegs' cut-off pegs.
- **A cheap proof that nothing finishes from the position belongs to
  `hasNoSolution`**, not `hint`, in a game with no mistake check. Its
  `markedDeadEnd` is what `loadDesc` refuses a board for, and the midend asks
  it before `hint` on a Hint press and on a check. A `hint` called directly
  on such a position says `NO_SOLUTION_FROM_HERE`. A bare `true` from the hook
  is a verdict for loading alone and leaves the hint to the game. Solve is not
  refused there (`solveBySearch`).

**Every refusal is also a verdict.** `isDeadEnd` says whether its advice is
to go back, and Check & save asks the hint for it after `findMistakes` and
refuses to save a dead end; a search past its reach settles nothing, so the
check saves and says so. `hint-refusal.test.ts` holds each kind's verdict to
whether its sentence tells the player to undo.

## Refusal couples to the mistake overlay

Give a hinted game a `findMistakes`: it is a precondition of the hint.
`Midend.computeHintPlan` asks it before the hint, puts what it finds on the
overlay Check & Save uses, and says to fix the highlighted mistakes first, so
a game with both hooks writes no line for this. `hint-resume.test.ts` asks
`findMistakes` at every position its walk reaches and fails if it flags one.

A refusal reaches the player in the transient banner on both the manual and
the Auto-Hint path ([`src/puzzle/puzzle.ts`](../src/puzzle/puzzle.ts)), with
or without a `statusbarText`; both are requirements of
[`engine-hints`](../openspec/specs/engine-hints/spec.md). A refused Solve uses
the same banner, so word a `solve` refusal as player-facing text.

## The cross-game guards

A game enrolls in every cross-game hint guard by declaring `hint`, with no
line of its own: the guards iterate the list
[`testing/hint-games.ts`](../src/engine/testing/hint-games.ts) derives from
the registry. They are
[`hint-resume.test.ts`](../src/engine/hint-resume.test.ts) (resume, purity,
plans whose every step changes the state and the frame, Latin naked-single
honesty), [`hint-overlay.test.ts`](../src/engine/hint-overlay.test.ts) (the
overlay reaches the render cache) and
[`hint-quality.test.ts`](../src/engine/hint-quality.test.ts) (voice, length,
binding, show-something). A game's own "the plan solves from empty" test is
not a substitute for any of them.

### A hint must resume from any position

A hint asked from a board the player reached by their own play must make
progress and lead to a solved board, wherever the board is solvable with no
mistakes on it. A move of the player's own drops the stored plan, so the next
hint is computed from the current state.

- **A recording solver written to run from empty is not resumable as it is.**
  Seed it from the cells already decided. Exemplar: `primeCascadeFromMarks`
  in `singles/solver.ts`.
- **A target recomputed on each call must converge.** Never emit a move that
  does not change the board.
- **A heuristic plan must not undo itself across recomputes**
  (`hints-search.md` § "Recompute-stable plans").

[`hint-resume.test.ts`](../src/engine/hint-resume.test.ts) walks a fresh
board to solved one freshly computed hint at a time, applying only
`steps[0]`. It walks one preset for each value of every axis the game's
`paramConfig` varies, and a board for each value the Custom dialog offers
that no preset holds ([`testing.md`](./testing.md) § "Slicing a preset sweep
for the gate"). The one refusal it accepts is `DEDUCTION_EXHAUSTED` on a
board whose tier permits search; on any other tier, or in a game with no
difficulty contract, a refusal fails.

### A hint carries on from an entry the player made first

Write every rule so that it concludes no less as cells are decided. Then
what the rules reach from the opening they reach from any board with right
entries added in any order. The resume walk does not check this: it visits
only positions the plan's own order makes.

The shape to look for is a bound taken from the nearest undecided thing (the
first gap, the next empty cell, the first candidate) where the true bound
reads the whole line. Ask the real question of the line: where an arm can
end, not how long the first gap is. A rule that leans on another to stay
monotone is fine; say so in a comment.

[`wrong-entry-check.test.ts`](../src/engine/wrong-entry-check.test.ts) asks
it of every game with `findMistakes`, `solve` and a hint: from a position
with nothing wrong on it, the hint finishes. The sharp probe is one right
entry on an otherwise untouched board, and a game where a move sets a cell
can afford the exhaustive form, every cell marked alone as the answer has it
(`range-solver.test.ts`, "a board that says more").

### The step budget

Tick a [`stepBudget`](../src/engine/step-budget.ts) once per iteration of
any "repeat until no progress" loop on the hint path, so a rule that reports
progress without changing the board throws a labeled error in milliseconds
and does not hang inside one `hint()` call.

- **Never guard the generator's path.** Gate the budget on the recorder or
  hint signal the function already carries, so generation runs the same loop
  unguarded. Exemplars: `applyRules` in `range/solver.ts` (gated),
  `deduceForcedEdges` in `palisade/solver.ts` (hint-only, so unconditional).
- **A rung ladder does not hand-roll the loop.**
  [`runDeductionFixpoint`](../src/engine/deduction-fixpoint.ts) and
  `singleFirings` tick the budget: pass `budget: stepBudget(...)` on the hint
  call and omit it on the generator's.
- **A search bounded by its visited set needs no budget.**

The limit is `DEFAULT_HINT_STEP_LIMIT`, well above what an honest fixpoint
needs.

### Stale plans and refreshHintStep

Implement `Game.refreshHintStep(step, state)` wherever a followed move or a
preference change can settle part of a later step. Return the step with its
dead marks dropped and `highlights` rebuilt to match, the same object when
nothing changed, or `null` when the step is fully resolved. The `Midend`
calls it before every display and moves past a resolved step.

Every candidate game whose moves clear notes as a side effect needs one: a
plan built with auto-pencil off holds explicit strike legs, and turning it on
makes a placement strike those notes first. Exemplar: Towers, with
`towers-stale-hint.test.ts` driving the real `Midend` through the preference
flip. `hint-resume.test.ts` asserts no plan step is a no-op when reached.

### A plan's copy is the board, no further on and no further back

Keep the planner's copy of the board equal to the board the player will have
at each step. Every difference is a sentence that is false when it is read.

- **Not behind: apply to the copy what `executeMove` applies, side effects
  included.** A copy that applies only the step's own change plans steps for
  what the board has already done by itself.
- **Not ahead: the copy holds no fact that no step put there.** A solver's
  private bookkeeping (two regions joined, a candidate already struck) is the
  player's work: make the fact a step, or read it off the player's marks and
  wait until they show it (`hints-marks.md` § "A solver's silent bookkeeping
  is the player's work").

`hint-resume.test.ts` ("a kept hint plan's every step changes what the board
draws") holds the first for every game. A step fails only when both the plain
frame and the frame with the step on it stand still, so a mark shown only for
the square in focus is safe when the step brings its square into focus.

No walk holds the second, so each game holds its own. The candidate walk has
the premise audit (`hints-candidates.md` § "A premise names everything its
deduction reads"). A game off that walk writes the property for its own nouns
and sees it fail first; comparing a kept step with the first step of a fresh
hint is not that test, since it fails for honest reasons (a journey's later
leg, a sweep's order). The structural form is a plan loop that advances its
copy with the game's own `executeMove` on the step's own move. Exemplars:
`palisade.test.ts` ("speaks of no region the board's own no-wall marks do not
make"), `undead-hint.test.ts` ("places by a count only where the board's own
marks show the count").

## Verifying a hint in-process

Test a hint's frame with the render-scenario harness
([`render-scenario.ts`](../src/engine/testing/render-scenario.ts)):
`renderPinnedHint(game, pinned(rung))` drives a real `Midend` to the frame of
a pinned position's step, whichever leg of its plan that is. Assert targeted
ops (the hint color present, clues still drawn) and `toMatchSnapshot`.
Exemplars: `src/skeleton/grid/skeleton-hint.test.ts`,
`palisade-render-scenario.test.ts`. The tiers are in
[`testing.md`](./testing.md).

- **Pin a position for every rung through `describeHintPins`**
  ([`testing/hint-positions.ts`](../src/engine/testing/hint-positions.ts)).
  It requires a pin for each of the game's `hintRungs`, and `npm run hint-scan
  -- <the test file>` finds and writes them. Do not write a scan of your own
  ([`testing.md`](./testing.md) § "Pinning a hint's positions").
- **A hint frame is a pin's, never a walk down a plan on a board kept by
  hand**, and a pin is keyed on a rung, never on a phrase: a phrase matches
  more than one deduction and goes blind when the sentence is reworded.
- **Validate grouping on a generated board.** A solver that tries techniques
  easiest first often fires another rule than a crafted board intended. Craft
  for the per-cell techniques, and for grouping scan a few seeds for a
  `continuesPrevious` leg and check it shares its predecessor's firing
  (`unruly-hint.test.ts`).

## Probe before trusting a diagnosis

When a hint misbehaves, write the smallest probe test that observes the
actual `activeHintStep()` and state before reasoning forward from a suspected
cause. A plausible diagnosis of the mechanism ("the plan is being dropped") is
often wrong, and a probe of about twenty lines settles it.
