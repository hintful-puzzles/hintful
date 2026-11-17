# Tasks

## 0. Before it starts (proposal § "Before it starts"), settled 2026-11-17

- [x] 0.1 The shape: `supply-techniques-by-kind-of-rule` (archived
  2026-11-17) answered it, tasks 2.2 and 2.9 there: the two changes are one,
  a game moves onto the kinds where its techniques fit them and its words
  are the kind's or a clause of its own; consistency is the measure, not
  lines.
- [x] 0.2 `add-norinori` § 2.2: every place the engine made Norinori say
  what it should not have was mended or filed there, and the filed changes
  are archived.
- [x] 0.3 Solo's baseline dump (exited 1 at `7a1223d3f`): at `4dd180d09`
  it runs, and is long: 718,763 lines in the 15 minutes `timeout 900`
  allowed at `DUMP_DEALS=8`, which killed it (exit 124). Take Solo's at
  fewer deals, under a time limit that fits.

## 1. Method, each game

A baseline word dump of every game below was taken at `4dd180d09`
(`research/hint-walk-dump`, `DUMP_DEALS=8`) into the session's scratchpad;
a later session takes its own at its HEAD. A game moves in one commit:
`hint-text.ts` goes, its sentences are `says` on its techniques (a kind's
where it places one) or `steps` spoken through the module's `voice`; the dump
is taken after and its diff read; every changed sentence is listed under the
game here; the game is read in the running app.

## 2. The games (re-derive with `ls src/games/*/hint-text.ts`)

Planning games (a `steps` block, Slide's form):

- [x] Flood (2026-11-17): dump byte-identical. The engine gained `|ring|` in
  a step's `when`, and a wording of a move alone said `bare` (the fill that
  joins no square, pinned by a test: no dumped walk meets it).
- [x] Fifteen (2026-11-17): dump byte-identical. The engine gained `aim`, a
  step's clause said first ("Working on tile 3:"), with the move serving it.
- [x] Sixteen (2026-11-17): dump byte-identical. A wording may read one
  ring sort's size (`|ringOnward|`); the engine's `HINT_SETTING_UP`, which
  only Sixteen said, went into its description.
- [x] Flip (2026-11-17): dump byte-identical. Stripes mark one region, so
  their count form is fixed: "the striped one" and "the striped ones" are
  two wordings by `|stripesCell|`.
- [x] Netslide (2026-11-17): dump byte-identical. The engine gained a term
  declared as a list of words (the tile's shape, the heading).
- [x] Numgame (2026-11-17): dump byte-identical. The engine gained a ring
  of several sorts (two numbers and a sign), and a judged relation passed
  by the planner (`relation`, the rival judging's).
- [x] Cube (2026-11-17): dump byte-identical. Come-round's "Instead:" is
  the step's `answers` clause, added with Same Game; until then it had
  said "so" there.
- [x] Twiddle (2026-11-17): every sentence is the same. Each part of a
  run is a step; the lift and landing tails are description `phrases`.
  Where a sentence runs past 120 characters, `hint.ts` says it again
  without the returning tiles, as before: a `fit` cannot hold references.
  **One mark key changed form, not place:** the ring's block is keyed by
  the cell of its top-left square ("3", was "0,1"), so that one voice
  serves blocks and tiles. Render maps it back, and a ring-stripped diff of
  the dump is empty. **Fixed in passing, seen in the app:** a free turn's
  outline went on whichever tile that one turn brought to the stage's cell
  (the 4, beside "Working on tile 1"); it now traces the whole stage's
  turns and outlines the tile the words name. Carry steps' outlines move;
  no sentence changes.
- [x] Read in the running app (2026-11-17, Chrome): Twiddle, Pegs, Same
  Game, Inertia, Sixteen, Flip and Cube, one explained hint each; words
  and marks agree.
- [x] Inertia (2026-11-17): dump byte-identical. The slide's compass point
  is a word-list term, "One safe way" is `answers`, and a forced slide
  passes the rival judging's relation. A step with an aim and no judged
  relation serves the aim; with neither, its look forces the move.
- [x] Samegame (2026-11-17): dump byte-identical. "One way to avoid it" is
  the new `answers` clause; the judged relations come from `judgeRivals`.
- [ ] Untangle. Needs, read 2026-11-17: a sequence relation that carries
  the clauses' `effect` (today `statedOnce` turns an effect into an effect
  relation and drops a judged sequence), and count wordings for "its only
  crossing / both of its crossings / all {n} of its crossings" and "the
  outlined one / the outlined {n}". The ring holds a point (VERTEX) and a
  spot (SPOT, a RationalPoint): a ring by sort `[point, spot]`, and one
  voice over their union, as Pegs does.
- [x] Pegs (2026-11-17): dump byte-identical. One voice serves pegs,
  holes and whole jumps (`MarkKind`'s key is a method, so a kind of
  indices is a kind of the union). A ring of sort `move` is the move
  itself, the engine's MOVE kind ("go back for it"), and the lint lets its
  words be a clause. A sequence's later leg no longer capitalizes the look
  after its "Next,".
- [x] Sokoban (2026-11-17): dump byte-identical, marks included
  (`DUMP_DEALS=150`, 17,704 lines), every step met but a corner or dead
  trap on another barrel, which says the same `{it}` phrase as the jam
  that is met. Its sentences are `steps` spoken through one voice over
  `Push | number` in `hint.ts`; its marks and legend are `hint-marks.ts`,
  and a refusal's stuck barrel stays the hint's own words. The engine
  gained two things: a step that states an `effect` and is passed a
  `sequence` relation says both ("Last, push this barrel right: that puts
  it on a target"; `stated.ts` made it a lone effect), and a step's `when`
  compares a word term with one of its words (`why = corner`). Read in the
  app (10x12): a push that opens a way, a run's next and last pushes.

Logic games:

- [x] Pattern (2026-11-17): dump byte-identical. Its one technique is told
  four ways by what the runs' packings show, which no formula states, so
  the four are declared `steps` its planner names (Magnets' shape: the
  line a `unit` term, the line and clue sorts of their own). Read in the
  app: an overlap, row striped, clue outlined, squares ringed.
- [x] Filling (2026-11-17): every sentence is the same, and its marks; the
  rungs are the description's kinds (growth → `mustGrow`, blocked →
  `onlyWay`, lonely and bitmap → `onlyNumber.lonely` and `.bitmap`), and
  the dump is byte-identical with those renamed. The area kinds that place
  carry their sentence, a look alone; the engine says a wording with a look
  and no move as `evident`, as it says a move alone `bare`. Its own walk
  stays (a strike is no step where a player keeps no notes) and speaks
  `STATED`. Read in the app: the exact fit, region striped, square ringed.
- [x] Signpost (2026-11-17): dump byte-identical, marks included, every
  wording reached. Its two firings are `steps` spoken through the voice in
  `hint.ts`, ringing by sort (the arrow on `ARROW`, the square); the
  rivals' reasons are bits of a `why` term said by `{or why: …}`, and their
  verbs agree with the rivals' count by `when` (no engine change). Read in
  the app (4x4 Easy): the arrow ringed, its squares striped, the target
  ringed, "This arrow's other squares follow others or are in its chain".
- [x] Seismic (2026-11-17): its own sentences are `steps` spoken through
  the voice in `hint.ts`; the Latin library's (a lone note, an area's one
  place, the cull) stay the engine's, and its opening clean is the engine's
  `cleanObviousText` (which now takes no verb: a number is "already in" an
  area). The engine gained a `values` step term, a list said by the value
  words and counted by a count form ("Only 1 and 2 aren't …, so pencil
  them in"). **One sentence changed**, a starve whose struck cell has the
  note: "…, so this cell's 3 must go" is now "…, so its 3 must go" (152
  dump lines, all one-cell starves): the lint refuses an unmarked "this
  cell", and the cell is the one just named. Every rung reached in both
  modes; marks unchanged. Read in the app: the starve's area striped and
  cell ringed, a note step's cell ringed.
- [x] Rome (2026-11-17): its own sentences (a note, a full area, a four
  area's one home, the cull, the loop, the reach, the opposite neighbor,
  the shared pair) are `steps`; the setup and a lone mark stay every
  candidate game's. Its copy of the conclusions is gone: the engine's
  `candidateConclusions` takes a verb (`be: "point"`) and a word for a
  struck value (`note: "mark"`, which keeps "this square's down mark":
  hint-quality refuses "the down mark", an arrow word being no value
  that says which mark). **One ending changed**, to the engine's form:
  "so this square must point left or right" is "so this square can only
  point left or right" (1,708 dump lines). With that rewrite undone the
  dump is byte-identical, marks included. Read in the app: an opposite, a
  loop striking a mark, a reach and a hidden single.
- [x] Rect (2026-11-17): its sentences are `steps` spoken through the
  voice in `hint.ts`, its techniques saying only which firing it is: why
  each other rectangle fails is the game's reading (`reasonOf`). A step's
  number terms are clues by square, which the voice's `value` prints as
  the board draws them ("the tall 4", "the ? clue"), and a `values` term
  names several ("the 3 and 8"). The engine gained `{derived each …}`, a
  reference that counts a fact for each element (starve's clues and
  squares, a crossing's missed squares), which the depth test pins. The
  line rung's ledger entry in `hint-quality.test.ts` is now the step's
  `long:`. **One sentence changed**, a fit that would also take in other
  clues names them first (2,048 dump lines): "Elsewhere the 6 would run
  off the board, take in the outlined clues or cross a line" is "…would
  take in the outlined clues, run off the board or cross a line", since an
  `{or}` holds literal words and the outline is a reference. Marks
  unchanged. Read in the app (12x14 Unreasonable): a fit, a reach, a
  line's miss and a line's take, striped squares and both clues outlined.
- [x] Galaxies (2026-11-17): dump byte-identical, every rung reached. Its
  sentences are `steps` spoken through the voice in `hint.ts`, from what a
  step still paints (`painted`), so a step the player has partly made
  re-reads as before; a claim's ring is by sort (`focus`, `partner`,
  `dot`), and a dot's color and where it sits are word terms. Read in the
  app: a sole owner, a separation, a dot's own squares.
- [x] Guess (2026-11-17): dump byte-identical, every rung reached. Its
  deductions and probes are `steps` spoken through the voice in `hint.ts`,
  the judged relation passed as before; its mark kinds are `hint-marks.ts`.
  Its "is out" closing, an owner's exception, is `KEEPS_IS_OUT` in
  `wording-rules.ts`, which the describe lint now reads as the
  retired-phrase test does. Read in the app: an opening, a no-black
  deduction (row striped, colors framed), two probes.
- [x] Blackbox (2026-11-17): dump byte-identical, every rung reached. Its
  ray, fire, layout, hidden and done sentences are `steps` spoken through
  the voice in `hint.ts`; a layout's first leg rings the whole layout by
  sort (`all`), and its mark kinds and legend are `hint-marks.ts`. Read in
  the app: a pair's ends, a reflection, a laser to fire.
- [x] Bridges (2026-11-17): dump byte-identical, every rung reached. Its
  sentences are `steps` spoken through the voice in `hint.ts`, with the
  terms each technique says; a count of bridges is a word term (`over`,
  `most`), and its mark kinds are `hint-marks.ts`. Read in the app: an
  exact fit, every neighbor (focus, neighbors and lines marked apart).
- [x] ABCD (2026-11-17): its own sentences (a note, every other letter
  next to a cell, the cull's neighbors, a satisfied line, a line's only
  homes and its packed stretches) are `steps` spoken through the voice in
  `hint.ts`; the Latin library's stay the engine's. A packed run's later
  cell is the step's `later` leg, said with `again` ("for the same striped
  row"), which a step may now state (`description.schema.json`). **One
  sentence changed**, to the engine's: the opening clean says "cross out
  any letter already in its cell's four neighbors" (or "eight
  neighbors"), was "…already beside, above or below the cell" (or "…in a
  cell touching the cell, even at a corner"), 2,920 dump lines; its notes
  are referenced as struck, as every other candidate game's clean is, where
  they were ringed. Every other line is byte-identical. Read in the app: a
  zero line, a packed run and its later cell, the clean (neighbors' notes
  struck).
- [x] Map (2026-11-17): dump byte-identical, every rung and every
  conclusion form reached. Its pair, weighing, dead dots and premise dots
  are `steps` spoken through the voice in `hint.ts`, the three conclusions
  (color it, remove dots, dot what is left) wordings by flags; the
  weighing's "beside"/"by" is a `{fit}`, and a lone color stays the Latin
  library's. The engine gained `{either vs}`, a values term said as
  alternatives. Its two setup sentences stay in `hint.ts`, Map's notation
  being dots where the shared opening says "penciling". Read in the app
  (15x20 Tricky): premise dots, then a pair (region ringed, pair outlined).
- [x] Subsets (2026-11-17): its letter legs (an arrow either way, a hidden
  single, a collapse) are `steps` spoken through the voice in `index.ts`,
  each later leg its `again` and `later`; the move is a phrase (`act`), the
  letter a word term and a value a set as the tally draws it. A rule-out
  stays the `rel.support` kind's words. **Fixed in passing:** a collapse's
  example ("({A,B,C}, say, is already placed)") had two more forms, a
  horseshoe's and a missing horseshoe's, that `pickExclusion` ranked first
  but that never fit the sentence (the shortest is 131 characters), so where
  one existed the lead went without any example. It now picks only a set
  placed elsewhere. **112 dump lines changed**, each a collapse lead that
  gains that example and outlines its cell, e.g. "Only the outlined set
  fits this cell, and it contains A, so mark A present." is now "Only the
  outlined set fits this cell ({A,B,C}, say, is already placed), and it
  contains A, so mark A present."; every other line is byte-identical,
  marks included. Read in the app (Easy): that step, the set outlined in
  the tally, the cell striped, B ringed, the placed cell outlined.
- [x] Solo (2026-11-17): dump byte-identical, marks included
  (`DUMP_DEALS=2`, 358,960 lines in 196 s). Its own sentences (an
  intersection, a set inside one region, and a killer sum's single, bounds
  and sums by where the sum comes from) are `steps` spoken through the
  voice in the new `hint.ts`; the Latin library's stay the engine's. A
  region is a `unit` term striped whole, a total or sum `{numeral …}`
  since a value prints as the board's digit. The two forms no dumped walk
  meets (a fresh cage of one cell, a cage's sum left by a region) were
  checked against the old module, words and marks, by a throwaway test
  seen to fail on a planted difference. Read in the app (3x3 Killer Easy):
  a region's 45, a cage's last cell, a cage's bounds, each striped and
  ringed as said. **The dump harness skips a mistaken position**: some of
  a solve's ops lock a Net tile before its turns, a board the midend never
  asks a hint of, and Net's baseline threw on one ("tile 5 has every side
  known and 0 ways"), which is no fault of the hint.
- [x] Tents (2026-11-17): dump byte-identical, marks included. Its
  sentences are `steps` spoken through the voice in `hint.ts`, a tent's
  touch staying the `peer.touch` kind's; a link step rings by sort (the
  squares and the link), the tree's side is a word term (`to`), a line is
  striped whole with its number outlined, and the count wordings are
  `when`s. The forms no dumped walk meets (a tree with no open square, the
  grass between a full line's tents, no outlined tents) were checked
  against the old strings, word for word. `noSpareRoom` has one wording:
  one tent needed never decides a square that way. Read in the app: a
  line with no spare room, a tree's only square with its link.
- [x] Crossing (2026-11-17): dump byte-identical, marks included. Each
  firing is a `steps` kind spoken through the voice in the new `hint.ts`
  (`hint-marks.ts` holds the listed number's kind); a whole run's reason
  is four steps, a run's way and a crossing's far run word terms, and a
  listed number a number term (at most nine digits, `MAX_NUMBER_LENGTH`).
  A note strike's move is its `closing`, a strike reference, since a
  clause references no strike. The notes reason, which no dumped walk
  meets, was checked against the old words; the articles test now speaks
  through `narrateCrossing`. Read in the app: a run's digits, a crossing.
- [x] Mines (2026-11-17): dump byte-identical, marks included
  (`DUMP_DEALS=400`, 378,720 lines in 15 s). Its sentences are `steps`
  spoken through a voice `hint.ts` makes a sentence, whose `value` prints
  a number term (the number's square) as "outlined 3" or, beside another
  of its value, "upper 3"; every count is `{numeral …}`, and the
  conclusions are the phrases `safe` and `mines`. A pair's sides are
  clause steps, a number or a region by what the sentence says of it
  (what it needs, allows, its mines, its own squares, how the inner
  side's lie inside it); the sentence saying what a region holds goes
  before the pair's, joined by `hint.ts` from the voice's `premise` and
  `part`, as no step says two sentences. The forms no dumped walk meets
  (every region side, the shared squares named, a 0, no members' counts,
  the numbers' "need just") were checked against the old module, words
  and marks, 355 cases, by a throwaway test seen to fail on a planted
  word and a dropped mark. **Fixed in passing**, in those forms only: a
  striped region of one square inside a number said "The striped square
  all touch the outlined 2 too"; it says "touches". The count steps with
  several numbers carry `long:` (126 characters at their shortest: the
  numbers' needs add up only because none of their squares are shared).
  Read in the app (9x9, 35 mines): the first click, a split and its
  second leg, numbers outlined, the shared squares striped.
- [x] Slant (2026-11-17): dump byte-identical, marks included
  (`DUMP_DEALS=1000`, 2,906,836 lines in 97 s). Its sentences are `steps`
  spoken through the voice in `hint.ts`. The engine gained a step term of
  kind `clause` (`{ clause: [steps] }`): the planner names one of those
  steps with what it is told by (`{ step, said }`, typed `StepClause`), and
  the voice says its `move` in place, references and all; the lint reads
  it at the length of the steps it names. What a clue already has, why a
  pair can't meet in a v (a 1, a 3, a placed square, across a 2, and what
  holds the pair beyond), and the cap of a line of 2s are clause steps.
  markV's mixed reasons and vAcross, which no walk meets even at 1000 deals
  (the dumped v-shape steps are all a line of 2s or one kind of clue at
  both ends), were checked against the old module, words and marks, every
  combination, by a throwaway test seen to fail on a planted word and on a
  planted dropped reference. Read in the app (8x8 Normal): a mark step
  (clue outlined, pair ringed), a dead end, and a clue that "already has 2
  lines from the outlined squares" (the clause's outline drawn).
- [x] Net (2026-11-17): dump byte-identical, marks included
  (`DUMP_DEALS=100`, 457,330 lines in 38 s). Its sentences are `steps`
  spoken through the voice in `hint.ts`, by how the other ways fall: a fit
  alone (`*Fits`), one turning trapped or several with no fit beside them
  (`*Trapped`, `*TrappedFit` where the fit goes to the conclusion), or
  several among the ways that fit (`*Fitting`), for a tile (turn or lock)
  and a note. The fit, how the trapped turning lies and what it would do
  are clause steps; a direction is a value, several a `values` term. The
  steps carry `long:`, so the ledger entry in `hint-quality.test.ts` went.
  `piece` and `fit` are slot words, so the terms are `shape` and `known`.
  The forms no walk meets (a stranded neighbor, "or leave", "the other")
  were checked against the old module, words and marks, every combination,
  by a throwaway test seen to fail on a planted word and a dropped
  reference. Read in the app (Wrapping 5x5 Easy): a seal, the dead end
  ringed and the sealed squares striped.
- [x] Ascent (2026-11-17): dump byte-identical, marks included
  (`DUMP_DEALS=150`, 516,032 lines in 115 s), and so is a wider walk over every
  preset, Edges Hard and 6x6 Edges included (25,607 firings, 206 of them
  pointers, which no gate preset reaches). Its sentences are `steps` spoken
  through the voice in `hint.ts`, a run named by the clause steps `run` and
  `span`; its marks are `hint-marks.ts`. The engine gained a step term of
  kind `clauses` (`{ clauses: [steps] }`), several clause steps said as a
  list, for what a sentence joins as many of as the board has (the premises
  a lines step names, the rivals a pointers step rules out). Which form of a
  pointers, fill or whole-run sentence fits at a glance stays the hint's
  choice by length, as before. The dead end's two long forms carry `long:`,
  and the pointers forms that name every rival do, so their ledger entry in
  `hint-quality.test.ts` went. The forms no walk meets (a lines step with no
  arrow of its own, arrowless rivals, no rival at all, the last empty
  square) were checked against the old module, words and marks, by a
  throwaway test seen to fail on a planted word and a dropped stripe.
  **One change, in forms no walk meets:** a list of three is said with
  commas, "within a step of 20, 11's row and 13's column", was "20 and
  11's row and 13's column". Read in the app (5x5 Edges Hard, 5x5 Classic
  Normal): a pointers step with its four arrows, a touch on an arrow's
  column, a whole run's drawn route.

## 3. Revisited in the app as their words are touched

- [ ] Towers, Undead, Salad, Mathrax, Keen, Group (moved before the
  debrief, never read in the running app)

## 4. Engine

- [ ] A trial kind, once a second game's Checks suppose as Path's, Spokes'
  or Boats' do (proposal § "What Changes").
- [ ] When the last `hint-text.ts` goes, rewrite `docs/hints.md` § "The
  sentences live in one file per game", which still names that file as
  where a game's sentences live: they are its description's `steps` and
  `says`.
