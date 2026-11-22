# Engine catalog

Every shared helper under [`src/engine/`](../src/engine/): when a game
reaches for it, what a game calls from it, a game to read, and the trap if
there is one. An entry is short: the module's header is its documentation.
An exemplar is in `src/games/` unless it says otherwise. The rules are
the `engine-helpers` spec and the engine specs an entry names.

## What every game does

1. **Start from the skeleton's imports.** `src/skeleton/grid/` already calls
   the helper for each common concern; what its files import is the list.
2. **Before writing a helper, scan the table below**: each heading names
   what its module does. An entry's first line says when to reach for it.
   Read the entry, then the module's header.
3. **Import a shared thing from the module it lives in.** Do not re-export
   it through the game's `state.ts` or restate it beside the call.
4. **Keep a helper only one game uses in that game's directory.**
5. **When a second game needs it, promote it** to the engine directory it
   belongs in, in the same change, with its entry and table row here
   (§ "Where a promoted helper lands").
6. **To see who uses a module, ask**: `git grep -l "engine/<dir>/<module>"
   -- src/games`, or `npm run refs -- src/engine/<dir>/<module>.ts <Name>`.

## Sections

| Section |
| --- |
| Sharing a helper |
| – What decides whether something is shared |
| – Measure before proposing an extraction |
| – Where a promoted helper lands |
| – Entries whose order deals the boards |
| `contract/` — the `Game` contract and its vocabulary |
| – `rules.ts` — the board as its description's rules read it |
| – `retry-limit.ts` — a bound on generate-until-it-works |
| – `deal-census.ts` — why a draw was thrown away |
| – `difficulty.ts` — the cross-game difficulty contract |
| – `sections.ts` — contract sections and the draft label |
| – `hint-track.ts` — following a step that asks for several things |
| – `hint-words.ts` — a hint's words bound to its marks |
| – `wording-rules.ts` — what a hint's words may not say |
| – `hint-refusal.ts` — what a hint says when it will not give one |
| – `solve-failure.ts` — what Solve says when it will not solve |
| – `desc-error.ts` — why a game ID will not load |
| – `assert-never.ts` — refusing a move the dispatch has no arm for |
| `board/` — a board's structure |
| – `dsf.ts` — union-find |
| – `square-edges.ts` — square-grid edges |
| – `grid/index.ts` — planar-grid geometry (upstream `grid.c`) |
| – `geometry.ts` — cell ↔ pixel |
| – `grid-text.ts` — a grid's plain-text board |
| – `findloop.ts` — loop/bridge finding |
| – `n-times-root-k.ts` — exact `round(n · √k)` |
| – `sorted-multiset.ts` — `tree234`, idiomatically |
| – `shuffle.ts` — Fisher–Yates + permutation parity |
| – `candidate-bits.ts` — one candidate encoding, range-checked |
| `input/` — pointer, keyboard and keypad |
| – `target-verb.ts` — aim at a target, apply a verb |
| – `hint-gesture.ts` — how the pointer makes a hint step |
| – `pointer.ts` — button codes and cursor helpers |
| – `key-map.ts` — what the keyboard sends |
| – `key-labels.ts` — on-screen keypad builders |
| `game-id/` — descs and params |
| – `obfuscate.ts` — solution masking in descs |
| – `run-length.ts` — the letter-run desc grammar |
| – `wall-runs.ts` — a region layout as a run-length wall list |
| – `dot-runs.ts` — blanks and dots of two kinds |
| – `desc-alphabet.ts` — one character per small number |
| – `desc-reader.ts` — the cursor a desc parser drives |
| – `decimal.ts` — decimal digits in a game ID |
| – `params-codec.ts` — the declared params codec |
| – `params.ts` — param-string decoding + config helpers |
| – `param-label.ts` — the one label of a params set |
| – `preset-grid.ts` — the preset menu, built from a game's boards |
| – `ruleset.ts` — the puzzles a game plays on one board |
| – `only.ts` — what one setting leaves of the others |
| – `config-narrowing.ts` — what a form offers of a narrowed field |
| – `modifier.ts` — the settings that change one rule |
| – `param-help.ts` — the generated Parameters section |
| `render/` — drawing, the tile cache and the hint's marks |
| – `live-errors.ts` — the live error marks |
| – `piece.ts` — a piece on its cell |
| – `pieces/` — the painters a description names |
| – `region-walls.ts` — the heavy walls round dealt regions |
| – `ring.ts` — the round ring |
| – `hint-mark.ts` — the ring and the outline |
| – `hatch.ts` — the stripes on the line a step names |
| – `tile-cache.ts` — the tile cache and its miss test |
| – `overlay-sidecar.ts` — the overlay diff-key rule as a type |
| – `draw.ts` — shared drawing primitives |
| – `drawing-rules.ts` — what a drawing accepts |
| – `win-wave.ts` — the win flash |
| – `easing.ts` — the curve a move animates along |
| – `pencil-indicator.ts` — the pencil-mode indicator |
| `mechanics/` — the mechanics several games share |
| – `line-drawing.ts` — drawn lines |
| – `border-grid.ts` — the shared border-marking mechanic |
| – `border-grid-render.ts` — that mechanic's look |
| – `border-grid-hint.ts` — that mechanic's explained hint |
| – `note-taking-cell.ts` — the shared highlight-and-type mechanic |
| – `code-rows.ts` — the code-breaking mechanic |
| – `wires.ts` — the Net/Netslide wire model |
| – `edge-clue-latin/` — the board Unequal and Adjacent share |
| – `fill/` — the board of a fill game, laid out from its description |
| – `edge-hint.ts` — a hint on an edge between squares |
| `generate/` — random partitions, tilings and placements |
| – `divvy.ts` — random equal-omino partition |
| – `redivide.ts` — divide a few regions of a partition again |
| – `divide.ts` — regions of unequal size |
| – `mend-division.ts` — mend a division until it has one answer |
| – `laydomino.ts` — random domino tiling |
| – `symmetric-blacks.ts` — symmetric black-square placement |
| – `loopgen.ts` — random loop generation |
| – `word-list/` — English words to deal and to accept |
| – `region-fill.ts` — a fill for each region of a division |
| `solve/` — the deduction ladder and what compiled descriptions run on |
| – `square-tiling.ts` — a square grid as a tiling |
| – `latin.ts` — Latin-square solver *and* generator |
| – `cell-marks.ts` — the marks a compiled technique reads |
| – `ladder-runtime.ts` — what a compiled ladder runs on |
| – `ladder-walk.ts` — a hint's walk over a compiled ladder |
| – `position-runtime.ts` — what a planning game's compiled rules give |
| – `described-rules.ts` — `Game.rules` from the compiled description |
| – `deduction-fixpoint.ts` — the shared technique ladder |
| – `step-budget.ts` — the fixpoint non-termination guard |
| – `hint-finishes.ts` — whether deduction finishes a board |
| – `answer-search.ts` — a deductive game's Unreasonable tier |
| – `fact-graph.ts` — what a fact rests on |
| – `deduction-record.ts` — the recorded-firing shape |
| – `wing.ts` — the XY- and XYZ-wing |
| – `hint-frontier.ts` — which available firing a plan takes next |
| – `permutation-planner.ts` — a staged plan over any permutation moves |
| `hint/` — the planners, judges and sentences of a hint |
| – `hint-plan.ts` — the plan-accumulation loop |
| – `described-hint.ts` — a described game's hint, built from its firings |
| – `described-firing-hint.ts` — the same, a step a firing |
| – `glance.ts` — marks a board shows at a glance, and asking for a deeper one |
| – `move-judge.ts` — whether the player's last move followed from the board |
| – `described-rules-out.ts` — `Game.rulesOut` from the description |
| – `described-edge-hint.ts` — the same, where the answer is on the edges |
| – `apart-by-position.ts` — two things of one name, told apart |
| – `rival-judging.ts` — what a searched move's rivals let it say |
| – `best-by.ts` — the best of equal moves, and whether it is best alone |
| – `search-outcome.ts` — what a budgeted search for a line established |
| – `finish-search.ts` — the depth-first search that finds a line or proves none |
| – `candidate-hint.ts` — candidate-elimination plan plumbing |
| – `entry-mistakes.ts` — Check & Save for one value or a set of marks per cell |
| – `candidate-plan.ts` — the candidate-elimination plan and its walk |
| – `candidate-judge.ts` — a notes game's last move, judged by its plan |
| – `latin-hint.ts` — regions and the reasons of a single |
| – `latin-notes.ts` — a Latin ladder run on the player's notes |
| – `stated.ts` — a step's words as its description states them |
| – `hint-text.ts` — the sentences several games share |
| – `slide-planner.ts` — sliding-permutation search |
| – `position-store.ts` — the positions a breadth-first search reached |
| – `pencil-prefs.ts` — shared pencil `GamePref` declarations |
| `midend/` — what drives a game |
| – `ui-snapshot.ts` — a `Ui` kept to be put back |
| – `same-value.ts` — whether two values hold the same thing |
| – `completion-status.ts` — the status bar's completion words |
| – `rules-out.ts` — the key and help words of `Game.rulesOut`'s preference |
| Libraries: `color/` and `random/` |
| – `color/` — the palette |
| – `random/` — the seeded RNG |
| Testing harness |

## Sharing a helper

Read this part before you write, extract or promote a helper, and check the
catalog before writing a union-find, a sorted collection, a loop finder or a
random partition. **A game-local helper that gains a second consumer is
promoted to `src/engine/`.** A helper with one consumer stays in its game:
the rule is a trigger, not a mandate to abstract ahead of need.

### What decides whether something is shared

Read it when two games hold the same code. A shared helper is right when
the thing shared is a fact. A module owning a
mechanic is right when the thing shared is a shape. Something stays per-game
only when you can say what a game would legitimately want to do differently.

- **The test is "would a change here have to happen in every copy at
  once?"**, not "is this the same text". The headers of `border-grid.ts`
  and `note-taking-cell.ts` apply it.
- **Split the fact from the answers beside it.** Which button codes are
  digits is one fact (`digitOf` in `pointer.ts`), and which characters are
  digits in a game ID is another (`decimal.ts`). The bound a game puts on a
  digit, and whether `0` clears or means ten, stay beside each call.
- **"It would touch a lot of files" measures how much an extraction is
  worth.** It is never an argument against one.

### Measure before proposing an extraction

When a duplication tool reports a clone, read what it counted. It counts
text, and three different things look the same to it:

- **The `Game` object literal and the import blocks.** Every game implements
  one interface and imports the same helpers, so two files with the same
  members in the same order are the contract. It is never the finding, and
  it is usually the largest "clone" between two games.
- **Real duplication of a shared mechanic**, which is what an engine module
  is extracted from.
- **Parallel but independent logic**, which stays where it is.

### Where a promoted helper lands

Put a promoted helper in the directory of what it is for: each section
below is one, and its entry goes in that section. Nothing sits at the top of
`src/engine/`. A module that moves is moved with `scripts/move-modules.mjs`,
which repoints whatever names it.

- **The directories are layered.** `src/engine/testing/engine-directories.ts`
  lists them bottom to top, and a module imports at run time only from its
  own directory or one below it (`src/module-layering.test.ts`); a type-only
  import goes anywhere. When the helper's purpose fits a directory its
  runtime imports would reach above, the imports decide, as they put
  `retry-limit.ts` in `contract/` because `board/grid/` reads it.
- **A directory inside a concern is one helper made of parts**, cataloged by
  the directory, as `board/grid/` and `generate/word-list/` are. Ask whether a
  reader looking for a part would know to look there without being told.
- **A new top-level directory is declared** in `engine-directories.ts`, with
  its place and its kind, or the layering guard fails.
- **`complexity/useLiteralKeys` is off in `biome.json` on purpose**: it
  inverts tsconfig's `noPropertyAccessFromIndexSignature`, under which
  bracket access marks a key as dynamic. When adding a lint rule, check that
  it does not invert a compiler flag.

### Entries whose order deals the boards

Where an entry says *its order deals the boards*, the helper's draw order,
comparator or emission order shows in generated descs. Changing it is
allowed, and moves which board a seed deals, so it is no pure refactor
([`testing.md`](./testing.md) § "When the boards a seed deals move").

## `contract/` — the `Game` contract and its vocabulary

Read this part when you implement a `Game` member, or name what one
returns or refuses. What every game imports from here:

- `game.ts`: the `Game` contract ([`mechanics.md`](./mechanics.md)).
- `types.ts`: the shared vocabulary (`Color`, `Point`, `Rect`, config
  descriptions, change notifications).
- `catalog.ts`: `PuzzleData`, the shape of the game's own `catalog.ts`
  entry, and the families it names one of.

### `rules.ts` — the board as its description's rules read it

`RulesOf`, the shape of `Game.rules`: the board's values as the
description reads them, and where they break its rules
([`rendering.md`](./rendering.md) § "Live errors are the rules'").

### `retry-limit.ts` — a bound on generate-until-it-works

`retryLimit(label)` is the guard a "generate until it works" loop calls
once a pass, and `RetryLimitExceeded` what it throws when spent. Where it
goes, what it is passed and what `retry-bound.test.ts` holds are
[`solver-and-generator.md`](./solver-and-generator.md) § "Every retry loop
is bounded".

### `deal-census.ts` — why a draw was thrown away

**Name the stage where a draw is thrown away** with `return
drawRejected("<game>: <why>")`, which counts it where a census is taken and
returns `null`. Add no counter or debug export of your own: the guards'
tries, `divide.ts`'s and `solvableAtExactlyTier`'s refusals and each mend's
end are counted already, and `npm run deal-walk` prints them for a named
cell ([`solver-and-generator.md`](./solver-and-generator.md) § "Bound a
generator by its tail, not its median"). Where no census is taken, as in
the app, a count costs one test of a `null`. Exemplar:
`norinori/generator.ts`.

### `difficulty.ts` — the cross-game difficulty contract

Reach for it in any tiered game. Declaring: [`mechanics.md`](./mechanics.md);
grading: [`solver-and-generator.md`](./solver-and-generator.md).

- **`difficultyItem`** is the Custom dialog's difficulty field; declare it
  and write no field of your own. `tierOf`, `withTier` and `tierNameOf`
  read it.
- **`DifficultyContract`** is a solve-at-cap verdict
  ([`solver-and-generator.md`](./solver-and-generator.md) § "The difficulty
  contract").
- **`permitsSearch`** asks whether the params request `Unreasonable`. Use
  it and do not compare tier names yourself.
- **`noSuchTier(what, tier)`** is the sentence `validateParams` returns for
  a size none of whose boards needs the tier
  ([`solver-and-generator.md`](./solver-and-generator.md) § "A size that
  cannot carry a tier"). A tier that is only rare or slow is dealt, with
  nothing written: the deal's deadline answers it
  ([`solver-and-generator.md`](./solver-and-generator.md) § "A Custom size is
  not refused for its wait").
- A game never calls `dealGaveUp`, nor `generate` and `dealBoard` in
  [`deal.ts`](../src/engine/midend/deal.ts): they are the midend's and the deal
  worker's.

### `sections.ts` — contract sections and the draft label

Read it when your game leaves out a contract section.
`sectionState(game, section)` reads whether `hint`, `findMistakes` or
`transposeParams` is implemented, not applicable (with the reason from
`Game.notApplicable`) or absent, a hint being absent when it is `DRAFT_HINT`. `SQUARE_GRID` is the shared
`transposeParams` reason of a game whose grid has one side. `draftSections`
and `notApplicableMarkdown` build the home screen's "Draft" label and the
help's "Not in this game" section. **A guard that would excuse a game for
lacking a section reads `sectionState`** and keeps no ledger. See
[`mechanics.md`](./mechanics.md) § "Contract sections, and what makes a
draft".

### `hint-track.ts` — following a step that asks for several things

`trackTargets` is the `hint.keepTrack` verdict for a step that decides
several squares or edges, and the targets left. `changedCells` is the diff
for a board with one value per cell. `keepTrackBy` is the whole
`hint.keepTrack` from a codec: how the game executes a move, diffs two
boards, keys and values a target, rebuilds the shrunk move (or leaves the
step whole, as a Tents link is) and keys a target's ring. Exemplar:
`pearl/hint.ts`. What the verdict and the shrinking owe:
[`hints-marks.md`](./hints-marks.md) § "Group one firing into one step".

### `hint-words.ts` — a hint's words bound to its marks

Write every step's words through it.

- **The three mark roles** are ring (what the step decides), outline (what
  it reasons from) and stripes (the line or region whose contents it reasons
  from). The
  element kinds a mark is drawn on are `CELL`, `NOTE` and a mechanic's own,
  such as `EDGE`.
- **`phrase` composes a `Narration`** from literal words and `mark.this`,
  `mark.the`, `mark.paren` and `mark.as` references. A literal that says
  "this", "these" or a role's adjective throws. A color's `ColorWord`
  (`color/color-word.ts`) is a part too, so `text` is the light scheme's
  words and `textIn("dark")` the dark's. `listOf` lists words or narrations,
  as `joinWith` and `joinOr` list strings.
- **A step's words are a `Sentence`**, made only by `sentence(said)`, by
  `so({ look, move })`, or by `unshaped(words, kind)` for a declared
  exception. `mark.move(words)` rings the step's own move (`MOVE`). See
  [`hints.md`](./hints.md) § "A sentence has parts".
- **`stepMarks(step)` is what the renderer paints from**, and
  `testing/hint-binding.ts` holds the rendered frame to the words.
  `legendMarkdown` is the help's list of marks. See
  [`hints.md`](./hints.md) § "Bind the words to the marks".

### `wording-rules.ts` — what a hint's words may not say

The one copy of the rules a sentence's words are held to: the length limit,
the role adjectives, place words outside a reference and the retired
phrases. `hint-words.ts` throws on them as it renders, and the describe
compiler checks every wording against them before any board speaks it. It
imports nothing, so `npm run describe` runs it under Node's type stripping.
See [`descriptions.md`](./descriptions.md) § "What the compiler checks of a
wording".

### `hint-refusal.ts` — what a hint says when it will not give one

Return one of its constants from a refusing `hint`: `HintResult`'s error is
`HintRefusal`, the union of their literal types, so one situation says one
thing in every game. `puzzleDeadEnd(sentence)` and `markedDeadEnd(phrase…)`
make a dead end only one puzzle has, and `isDeadEnd` reads whether a
refusal is one. Which refusal a game says, and when the midend says one
first: [`hints.md`](./hints.md) § "Refusal wording comes from one module".

### `solve-failure.ts` — what Solve says when it will not solve

Return one of its constants from a failing `solve`: `SolveResult`'s error
is `SolveFailure`, the union of their literal types. **Pick by what the
solver established.**

- `NO_SOLUTION` and `MULTIPLE_SOLUTIONS` only from a verdict that proves
  them.
- `PUZZLE_NOT_REASONABLE` (from `hint-refusal.ts`) wherever a failed search
  could mean either.
- `NO_SOLUTION_FROM_HERE` for a game whose moves can lose; a hint refusing
  on the same fact says the same constant.
- Do not check for a finished board: the midend refuses Solve with
  `ALREADY_SOLVED` before asking. A game checks only where its status would
  not call a finished board solved.

### `desc-error.ts` — why a game ID will not load

`DescParse`, `descValue` and `loadDesc` are the one reading of a desc
([`mechanics.md`](./mechanics.md) § "Read a desc once"); `validateDesc` and
`loadVerdict` are verdicts of it. Exemplar: `src/skeleton/grid/state.ts`.

- **A parse fails with a `DescError`**, a branded string only this module
  makes; its `DESC_*` constants and `desc…` builders are the kinds. A helper on the desc path returns
  `DescError | null` too. A
  scanner reports what it read and never words a refusal; its caller picks
  the kind.
- **`puzzleDescError(sentence)` is for the puzzle's own rules**, not the
  description's shape: one sentence about "this game ID".
  `desc-error.test.ts` fails a sentence two games pass: that is a kind the
  module lacks, so add it here.
- **`loadDesc` also asks the game about the board it built**: how many
  answers it has, and whether the game's own solver solves it. What a game
  owes each is [`solver-and-generator.md`](./solver-and-generator.md) §
  "One answer, even when it is hidden" and `solver-and-generator.md` § "No
  option switches the generator's checks off".

### `assert-never.ts` — refusing a move the dispatch has no arm for

`assertNever` ends a discriminated dispatch, and `rejectMove` refuses a
move type with no union to narrow ([`mechanics.md`](./mechanics.md) § "A
move you do not recognize is refused, never guessed").

## `board/` — a board's structure

Read this part when you need connectivity or a board's geometry, or port a
`tree234` or a shuffle. A loop over every r-subset of n is a technique's
`T in subsets(S) where |T| = r`
([`descriptions.md`](./descriptions.md) § "What a technique compiles to").

### `dsf.ts` — union-find

Reach for `Dsf` for any partition or connectivity question. Exemplar:
`galaxies/state.ts`. Where a description must know whether two edges have
the same or the opposite value, it states the relation and the runtime keeps
it (`EdgeRelation` in `describe-runtime/marks.ts`).

- **For a class's minimal element, precompute a `minimal[i]` map after all
  merges** (`buildMinimal` in `keen/state.ts`). It does not change the
  canonical root.
- **An upstream loop that uses the canonical root as an index bound**, and
  not as an identity to compare, decides by which members it skips which
  boards a solver-gated generator emits: its order deals the boards. `Dsf`
  keeps `dsf.c`'s tie-break.

### `square-edges.ts` — square-grid edges

Reach for it before writing a direction, a `DX`, or "the edge between these
two squares". A direction is `RIGHT`, `UP`, `LEFT` or `DOWN`, and `1 << d` is
upstream's `R`/`U`/`L`/`D` bit, so a mask of a square's sides (Net's wires,
Pearl's lines, Tracks' rails) uses the module's mask algebra as it is.
`squareEdges(w, h)` numbers a board's edges once: **store a mark per edge
by that number, never on both squares**, which is how two copies come to
disagree. `edgeAt` and `pointAtEdge` are the press side of it, given the
tile and border, with a still middle a game can turn off. `pieceThrough`
walks the piece of line a square is on. Exemplars: `skeleton/edges/`,
`path/`.

**A game whose stored bits are in another order keeps its own index**,
named by the bit each direction is saved in, and maps to the module's at
the pointer: `border-grid.ts`'s `SQUARE_DIRS`. Changing a stored order is a
save format change.

### `grid/index.ts` — planar-grid geometry (upstream `grid.c`)

Reach for it when the board is a tiling, not a square grid: `Grid`,
`GridFace`, `GridEdge` and `GridDot` with full incidence, every tiling under
`tilings/`, and the sizing, params, geometry, trim and desc helpers. **Import the
barrel, not the parts.** Exemplar: `loopy/state.ts`.

`gridNewDesc` is the only function that consumes randomness; `gridNew` is a
pure function of `(type, width, height, desc)`. A new tiling follows four
rules:

- **Integer arithmetic only.** Dots are deduplicated by exact coordinate
  equality, so a fraction splits a shared corner into two dots. Use
  `Math.trunc` where the reference divided integers.
- **Normalize negative zero once, where exact arithmetic becomes pixels.**
  A negative factor times a zero index is `-0`, so expect it wherever a
  basis vector is signed. It passes `===` and fails `Object.is`, and a
  structural comparison with it.
- **Emission order is in every Loopy game ID.** Face, edge and dot indices
  come from first encounter, and a Loopy desc lists a clue per face in face
  order, so a renumbering opens every shared link on another board. Verify
  with `grid-numbering.test.ts` and `grid-aperiodic-numbering.test.ts`, never
  by eye.
- **A random draw is an observable side effect.** The aperiodic tilings
  draw even when the candidate list has one entry; skipping that draw deals
  a different, plausible tiling and nothing fails. Which patch a seed deals
  is free to change, but not what a dealt patch's desc builds.

### `geometry.ts` — cell ↔ pixel

Start `interpretMove` here, to turn a pointer position into a cell: `coord`
and `fromCoord` map between cells and pixels, with the game's border passed
in. `fromCoord` floors, which is right for a pixel in the border.

**Read a press and its release with one function.** A floor or truncation
of a division by the tile size outside this module is a call to `fromCoord`
or an entry in `coord-conversion.test.ts`'s ledger, and the site says what
it does that the helper would not.

### `grid-text.ts` — a grid's plain-text board

Write `textFormat` with it: the game gives each place's text, and the walk
writes the rows, the lines between them and the newlines. `gridText` for
cells in rows, joined by edges (`slant/state.ts`) or with a clue at each
end (`magnets/state.ts`); `boxedGridText` for a rim round every cell
(`rect/moves.ts`). A clue row above or below is the game's own line.

**A game whose text is not a walk over its places keeps its own and says
why** at its `textFormat`, as Bricks and Dominosa do.

### `findloop.ts` — loop/bridge finding

Reach for it to highlight loop errors as the player plays: it finds a
graph's bridges, and an edge that is not a bridge is on a loop. A neighbor
reported twice is two edges, which are a loop of two. Exemplar:
`slant/state.ts`.

### `n-times-root-k.ts` — exact `round(n · √k)`

Use it where an aperiodic tiling's exact irrational arithmetic becomes
integer pixels. **Do not substitute `Math.round(n * Math.sqrt(k))`**: a
disagreement of one unit splits a shared corner into two dots.

### `sorted-multiset.ts` — `tree234`, idiomatically

Reach for `SortedMultiset` where upstream uses a `tree234` as a sorted set;
the methods' comments name the upstream calls they replace. Exemplar:
`pegs/generator.ts`.

- **Port the comparator exactly.** `removeAt(randomUpto(set.size))` indexes
  the sorted order, so the comparator's order deals the boards.
- **Count the roles first.** A `newtree234(NULL)`, or a comparator whose
  ordering the algorithm never reads back, is not a sorted collection: one
  that only deduplicates is a keyed set, and a null-comparator FIFO is a
  plain array. The header of `slide/solver.ts` is the worked case.
- **A `tree234` used as a worklist is a plain queue** when drain order
  cannot affect the result, as in a flood fill. Check before reproducing it.
- **Profile a key encoding before keeping it.** A string key built per
  candidate can dominate generation; a hash bucketed to an exact comparison
  keeps the semantics (`hashOf` and `sameBoard` in `slide/solver.ts`).

### `shuffle.ts` — Fisher–Yates + permutation parity

`shuffle` for a random order in a generator, and `permParity` for a
sliding-tile generator's reachability check; correcting the parity stays
the game's. Its order deals the boards wherever the shuffled order feeds a
desc.
Exemplar: `fifteen/state.ts`.

### `candidate-bits.ts` — one candidate encoding, range-checked

Reach for it when you hold candidates as a bit mask. Value `n` is bit `n`
(`valueBit`), and `valuesOneTo` is the full set 1..n.
Both throw on a value out of range, where a bare shift counts mod 32 and
lands on another value's bit. **Take a game's size limit from
`MAX_CANDIDATE_VALUE`** and write no number beside it.

## `input/` — pointer, keyboard and keypad

Read this part when you write `interpretMove` or the keypad. How to write
input is [`input.md`](./input.md). `touch-help.ts` is the sentence opening
every help page's Controls, said from `ignoresSecondaryButton` and
`requestKeys`; the renderer places `{{touch}}` and the help build fills it
([`help-pages.md`](./help-pages.md) § "A page stands alone for a newcomer").

### `target-verb.ts` — aim at a target, apply a verb

Reach for it in any game whose buttons each do one thing to what they land
on, the click half of a drag game included. The game declares a geometry
and a verb per button, each returning the game's own `Move`.
`interpretTargetVerbs` owns the parking, the reveal-first select, Enter and
Space, and `controlsMarkdown` writes the help's Controls paragraph from the
same declaration. A game with no input beyond its verbs spreads
`playedByTargetVerbs(targetVerbs)` and writes no `interpretMove`. `squareGrid` is the common geometry; `letterKey`,
`digitKey` and `ERASE_KEYS` the common keys; `rulingOut` declares a right
button that marks a target as holding nothing. A drag game's own arms call
`pressTarget` and `buttonVerb`; a hint's click steps come from `verbClicks`
(`hints.md` § "Every step is a gesture"). `target-verb.test.ts` holds a
declaring game's keys to its buttons. Adopting it: [`input.md`](./input.md)
§ "Targets and verbs".

### `hint-gesture.ts` — how the pointer makes a hint step

A hinted game names a step's targets (`hint.targets`), which `hintGesture`
in `target-verb.ts` clicks through its verbs, or writes `hint.gesture`,
returning `PointerAction`s built with `click`, `drag` or `key`. The midend
plays a step by sending the
gesture through `interpretMove` and judging the result with
`hint.keepTrack`; it never applies the step's move. A `key` must be one the
game's keypad offers, the Marks key, or mark-all (`markAllPress`). See
[`hints.md`](./hints.md) § "Every step is a gesture".

### `pointer.ts` — button codes and cursor helpers

Every button, key and cursor fact. How a game uses them, and the guards
that hold it to them, are [`input.md`](./input.md) § "Button codes and a
key held with Shift", `input.md` § "The numeric keypad never arrives" and
`input.md` § "Keyboard cursors". Exemplar: `src/skeleton/grid/index.ts`.

- **Buttons and keys**: the button constants, `stripModifiers(button)`,
  `isEraseKey`, `isCancelKey` and the `BACKSPACE`, `DELETE` and `ESCAPE`
  codes.
- **Digits**: `digitOf(button)` and `numpadDirection(button)`.
- **`shearedHexStep(step, y, h)`** is a square-grid step on a hexagonal
  board held as a sheared grid.
- **The cursor**: `GridCursor`, `newCursor`, `moveCursor`, `showCursor`,
  `hideCursor`, and for a traversal of the game's own `isCursorMove`,
  `cursorDelta` and `gridCursorMove`.

### `key-map.ts` — what the keyboard sends

`puzzleKeyMap`: each named key the view maps to a button code, read by the
view and by `emittable-keys.test.ts`, which fails a game testing a code
neither this map nor the game's own keypad sends. A game reads none of it:
test the named button from `pointer.ts`.

### `key-labels.ts` — on-screen keypad builders

Build `Game.requestKeys` from these and do not spell digit codes in a game;
`decimal.test.ts` allows one statement of them in the tree, and it is here.

- `digitKeys(n)` and `clearKey`.
- `colorKeys(n, firstColor)` for a game whose element is a color: each key
  carries a palette index (`KeyLabel.swatch`). `colorKeysZeroIsTen` is the
  same for a game that reads its tenth value off the `0` key.
- `letterKeyboard()`: the alphabet in QWERTY rows (`KeyLabel.row`), for a
  game that types words.
- **`pencilModeKey`** is the Marks key the midend appends
  ([`input.md`](./input.md) § "The on-screen keypad"); `takesNotes` is the
  one definition of the games it goes to.

## `game-id/` — descs and params

Read this part when you write a desc, a params string or the Custom dialog.

### `obfuscate.ts` — solution masking in descs

Reach for it when a desc carries the answer: a reversible masking, with
`bin2hex` and `hex2bin`, so a shared game ID does not spell the answer out.
Exemplar: `mines/state.ts`.

### `run-length.ts` — the letter-run desc grammar

Reach for it when everything in the desc that is not a run of blanks is a
single value character. `scanRunLength(desc)` yields `{ blanks }` for a
letter run (`a` is 1, `z` is 26, longer runs as repeated `z`s) and
`{ value }` for anything else, illegal characters included: which values
are legal and the refusal are the game's. `encodeRunLength(count, emit)`
writes. Exemplar: `slant/state.ts`.

- **`keepTrailingBlanks` is not a style option.** A game whose parse
  rejects a desc that does not fill the grid exactly must keep the last
  run, or it refuses its own board. `desc-error-games.test.ts` loads every
  desc a game's generator writes and catches a disagreement.
- **Do not extract the letter alphabet on its own.** Games that spell runs
  by hand disagree about what a letter is worth, where a chunk ends and
  what `z` means, and those descs are frozen bytes. The header has the
  measurement.
- **A richer desc does not use this**: multi-digit numbers, `_` separators,
  sections whose boundary the caller controls, or decimals that are a
  second kind of run. Use `desc-reader.ts`. A desc may use it for one half
  (`map/map-data.ts`, for its clue list).
- **A desc is a player promise.** `run-length.test.ts` pins the bytes at
  every run boundary.

### `wall-runs.ts` — a region layout as a run-length wall list

Reach for it for a desc that ships a region partition as walls.
`encodeRegionWalls(regions, w, h)` and `readRegionWalls(r, regions, w, h)`
write and read the walls half of a `walls,clues` desc. The reader takes a
`DescReader`, so it composes with the clue half, and it refuses a run past
the last border. `gapLetters(n)` is the letter run of the clue half.
Exemplar: `rome/state.ts`.

### `dot-runs.ts` — blanks and dots of two kinds

Reach for it when your desc is sparse marks of two kinds.
`writeDotRuns(s, kindAt)` and `readDotRuns(r, s, place)`: one letter per
dot, its offset the blanks before it and its case the dot's kind. The
reader takes the `DescReader`, so it sits inside a game's one parse. **It
is not `run-length.ts`'s grammar**: a letter is a run and a value, and a
chunk is 25. A grammar that writes every chunk in lowercase, or ends at the
last dot with no closing letter, is a different one again (Galaxies').
Exemplar: `unruly/state.ts`.

### `desc-alphabet.ts` — one character per small number

Reach for it when a desc character stands for a number over nine. It is a
value codec, one character per cell: `n2c(n)` writes digits, then
lowercase, then capitals, and `c2n(c)` inverts it, with `null` for anything
else. Exemplar: `singles/state.ts`.

- **The order is frozen into shipped game IDs.** No caller reorders it.
- **A sentinel stays with the game**, handled before delegating.
- **Derive the size cap from `DESC_ALPHABET_SIZE`.** `n2c` throws above it,
  and `desc-alphabet.test.ts` checks the largest number each game's largest
  board needs.
- **A desc with run letters uses `n2cUpper` and `c2nUpper`**, digits then
  capitals, because the lowercase letters are spent on blank runs. The
  bound stays with the game.
- **The four names are reserved.** `emittable-keys.test.ts` fails a game
  that declares one, so name a game's own codec for what it does.

### `desc-reader.ts` — the cursor a desc parser drives

Reach for it to read a desc token by token. `readDesc(desc, (r) => …)` runs
a parser and returns its `DescParse`. The `DescReader` reads forward, and
each read that cannot be made fails with the right `DescError` on its own,
so a parser writes no length check. Exemplar: `fifteen/state.ts`.

- **`int` has no unbounded form.** An unbounded number reaches a typed
  array and wraps. Pass the bound the board implies; where there is none,
  pass a generous one and say why.
- **It does not own a grammar.** Run letters, alphabets and separators are
  the game's. It fits a grammar that hands control back to the caller
  between tokens (repeat counts, sections, walls). A grammar of one
  character per token, or a fixed-width or obfuscated blob, gains nothing
  from it and still reads once through `DescParse`.

### `decimal.ts` — decimal digits in a game ID

Reach for it when a desc or params string holds a number: `isDigit(c)`,
`digitValue(c)` (`0`–`9` or `null`) and `parseLeadingInt(s, pos)`, the
maximal digit run at `pos` as `{ value, next }`: `0` with no
advance on a non-digit, which is how a caller tells "no number here" from
"zero".

- How a game reads and writes digits:
  [`mechanics.md`](./mechanics.md) § "Digits and numbers in a desc are one
  fact, and it is not yours".
- `decimal.test.ts` keys on the shape: a digit code as an operand, a
  comparison against a one-digit string, a private copy of an export here.
  Its header names the one shape it cannot see.

### `params-codec.ts` — the declared params codec

`paramsCodec` derives `encodeParams` and `decodeParams` from one ordered
segment list, so the two cannot drift. A segment names a `paramConfig`
field by its `kw` and reuses that item's accessors. A choices field written
as its stored number goes through `num` with an `IntAccess` pair; one
written as a letter per choice is `letters`. Exemplar:
`src/skeleton/grid/state.ts`.

- **Prove a move to the codec by a differential**, old decoder against
  new, over the corpus truncated, with junk appended and with every legacy
  form the old decoder handles. A hand-written decoder accepts strings no
  encoder writes.
- **The grammars that escape it are named in the `engine-params` spec.** A
  game taking one still owes the inverse property, which
  `params-stability.test.ts` asserts.

### `params.ts` — param-string decoding + config helpers

Reach for it when you declare `paramConfig` or validate params.

- **Call `paramsError` wherever you would have asked
  `game.validateParams`.** It is the one validity check: every item's
  `bounds` and choice list, then the game's optional `validateParams`.
- `dimensionParamConfig`, `numberItem`, `squareSize` and `parseConfigInt`
  are the declarative helpers behind `Game.paramConfig`.
- **Set `maxShown` on a `bounds` whose max is a limit a player meets**, the
  colors a game has: the Custom dialog's label then says it, "Colors (up to
  10)" (`fieldLabel`). Leave it off a cap no sensible board reaches, which
  would only clutter the label.
- `parseDimensions` reads a leading `WxH` or a bare square size.
- `formatG`, `parseLeadingFloat` and `atof` are a float param's codec
  ([`mechanics.md`](./mechanics.md) § "Float params round-trip through
  %g").

### `param-label.ts` — the one label of a params set

Take every label of a params set from here, so the menu and the header
cannot name one board two ways. `describeParams(game, p)` composes it from
the items' `label` slots, and `presetMenu(game)` titles every unnamed
preset with it. A leaf's `title` is its line in the menu, without the
ruleset's name under that ruleset's heading; its `label` is the whole name.
`choiceName(config, kw, index)` is a choice's one name. Declaring:
[`mechanics.md`](./mechanics.md) § "Params are declared once, on
`paramConfig`".

### `preset-grid.ts` — the preset menu, built from a game's boards

`presetGrid(paramConfig, menu)` builds the menu a game's `Game.menu`
declares (`{ boards, tiers?, variants?, more?, title? }`): each board at
every tier of its difficulty item, then one board for each modifier or
kind, then the `more` section. `presetMenu` (`param-label.ts`) calls it;
a game never does. `MENU_SECTION_LINES` is the most lines a section holds. `preset-menu-shape.test.ts` holds the shape for every game.
Choosing the boards: [`mechanics.md`](./mechanics.md) § "The preset menu is
a grid". Exemplar: `src/skeleton/grid/state.ts`.

### `ruleset.ts` — the puzzles a game plays on one board

`rulesetItem(rulesets, field)` is the `paramConfig` item of a game with
more than one puzzle, each ruleset a `name` and its `rule`.
`rulesetField(game)` finds it, for the label, the menu's sections and the
help, and `rulesetsMarkdown` is what a page's `{{rulesets}}` becomes. A
ruleset's `only` is what it offers of the other fields (`only.ts`).
Exemplar: `seismic/state.ts`.

### `only.ts` — what one setting leaves of the others

Read it when one setting restricts another. A ruleset's `only` and a
`modifierItem`'s `only` are one declaration with
three readers, none of which a game calls: `onlyError` (the refusal, for
`paramsError` and the midend), `configNarrowing` (the dialog's side) and
`onlySentences` (the help). **A declaration no form could show throws
wherever it is read**: a field that is not there or is the wrong kind, a
deciding field narrowed by another, two deciding fields that leave nothing
of a third.

### `config-narrowing.ts` — what a form offers of a narrowed field

Read it when a form or test reads a narrowed field.
`offeredOf(description, values, id)` is what the deciding fields leave of
one field, and `offeredValues(description, values)` the values a form shows
and submits. It reads the `ConfigDescription` alone, so the form on the
page and a test in the engine work out one answer. `only.test.ts` holds it
for every declaring game.

### `modifier.ts` — the settings that change one rule

`modifierItem(spec)` is the `paramConfig` item of a setting that adds,
removes or bounds a rule and combines with others: the value at which the
rule applies, the words a title says then, the rule, and with `only` what
it leaves of the other fields. It writes the field's help entry and label
words. `modifiersOf(game)` and `modifiersMarkdown` are what a page's
`{{modifiers}}` becomes. Exemplar: `net/index.ts`.

### `param-help.ts` — the generated Parameters section

Write `{{parameters}}` in a help page and declare a `doc` on each item:
`parametersMarkdown(config)` renders the list from the items' `doc`s and
`bounds`, and the help build (`vite-plugins/parameters.ts`) puts it there.
`expandChoices(config, source)` replaces each `{{choice:<kw>:<index>}}`
with that choice's name and throws on one that names no choice.

## `render/` — drawing, the tile cache and the hint's marks

Read this part when you are writing `redraw`, or drawing what a hint
points at. How to write a renderer is [`rendering.md`](./rendering.md).

### `live-errors.ts` — the live error marks

Reach for it when the game marks a broken rule as the board is filled:
`liveErrors(rules, state, g?)` gives the pairs, the elements and the clues
to paint, from `Game.rules` ([`rendering.md`](./rendering.md) § "Live
errors are the rules'"). Exemplar: `src/engine/fill/render.ts`.

### `piece.ts` — a piece on its cell

Reach for it when a cell holds a piece, is shaded or is ruled out. Take a
piece's shape and name by index, and name neither a hue nor a shape
of your own ([`rendering.md`](./rendering.md) § "What a board looks like:
pieces on a quiet surface"). `drawPiece` draws what a cell holds, with
`grown` for one being placed or taken away, and `drawPiecePart` a cell's
part of a piece over several cells, a domino or a boat, joined on the
`JOIN_*` sides (`joinToward` names the side a neighbor is on). Exemplar:
`src/games/dominosa/render.ts`. `TWO_SHAPES` goes with `TWO`
(`colors.ts`) and `PAIR_NAMES`, each piece's word by its shape, and
`expandPair` is what a help page's `{{pair:0}}` becomes. `SHADED_SHAPE`, `SHADED_NAME` and `UNSHADED_NAME` are
the same for a game whose cells are shaded or not. `drawRuledOutCross` is
the cross for a cell ruled out, and who takes it is in the same rendering
section.
Exemplar: `src/skeleton/grid/render.ts`.

### `pieces/` — the painters a description names

A painter draws one piece in a cell and declares the colors it is drawn
in, so a board drawn from painters has no palette of its own. A fill
game's `play:` names one per value by `paint:` (`PAINTERS`), and
`fill/render.ts` gives each its slots. A new piece is a painter here,
addressed to the piece, never to a game.

### `region-walls.ts` — the heavy walls round dealt regions

Reach for it where a board's regions are dealt and drawn as heavy walls
inside a tile-cached grid. `regionWalls(w, h, regions)` in `newDrawState`
keeps each square's walls; `drawWalledSquare` paints a square's box, its
halves of the walls and its corners round the surface the game lays, and
`walledBoxes` gives that surface, for a hint's band. Exemplars:
`starbattle/render.ts`, `norinori/render.ts`.

### `ring.ts` — the round ring

When a hint rings, the ring is the engine's: a game calls
`GameDrawing.drawRing(box, clear, thickness, { room, inside, centered })`,
and every drawing strokes the shape
`ringShape` fits, the one nearest `box` at the roundest that clears the
text: a circle or a pill where it can, a rounded square where text sits in
the corners, and a throw where nothing at least `RING_MIN_ROUNDNESS` round
fits (`ringFits` asks without throwing). `centered` keeps it on the box's
middle; `ringContentBox` is the box text keeps inside for a centered ring to
go round it. `clear` is `{ enclose, avoid }`, built from `textBox`, which takes what
a game passes `drawText`; `NOTHING_TO_CLEAR` where there is no text.
`inside` draws the move's shape within the ring in its ink, the only way to
that ink. `MARK_EDGE_PX` is the app's edge round a mark, which a ring keeps
off text too. When to use it: [`hints-marks.md`](./hints-marks.md) § "Shade
vs ring".

### `hint-mark.ts` — the ring and the outline

Draw a hint's two cell marks with it: a round ring around the cell the
deduction acts on, through `drawRing`, and an outline around the region it
reasons from, a band on the cell's border (why neither is a fill:
[`hints-marks.md`](./hints-marks.md) § "Shade vs ring"). The game
says what text each cell shows (`HintMarkStyle.text`, a `RingClear`;
`NOTHING_TO_CLEAR` for none), and lays its notes and corner clue out in the
cell's `ringTextBox`, so the centered ring on the cell goes round them.
Exemplar: `src/skeleton/grid/render.ts`.

- **`MarkBand` says where the game's border lives**: outside the content
  box for a `COL_GRID`-backed game, inside it for one that draws its own
  per-cell outline.
- **A target that spans a piece is one ring** when the game passes
  `joinTargets`; `joinEvidence` does the same for evidence. `MarkOutlines`
  hands the sides to a game whose tile cache keys on them (`hints-marks.md` §
  "Shade vs ring").
- **`HintMarks.paint` stamps the marks after the tile loop and never
  erases.** A game whose band has an `outer` part also calls
  `HintMarks.eraseBeforeTiles` before the loop and dirties the tiles it
  names (`hints-marks.md` § "Where the band goes, and who rubs it out").
- **It is for a mark on a cell.** A game whose regions are not whole cells
  draws its own band (`hints-candidates.md` § "A graph, not a grid (Map)").

### `hatch.ts` — the stripes on the line a step names

Reach for it when a hint sentence names a row or column. It is the third
board mark: translucent diagonal bands over the squares, and the clue slots,
of that row or column.
`GameDrawing.drawHatch` draws them from `hatchBands`, laid on the canvas
and not the rect, so tiles hatched one at a time join into one strip.
**Draw it after a square's background and before its content**, with
`hatchPeriod(tileSize)` for the pitch. `puzzle/hatch-contrast.test.ts`
holds the opacity in both schemes. When to use it:
[`hints-marks.md`](./hints-marks.md) § "Hatch the line the sentence names".

### `tile-cache.ts` — the tile cache and its miss test

Reach for it whenever a board is painted as tiles. `TileCache` holds what
each tile shows (a key of one to four words), the first frame, and the
overlay sidecars registered on it; `changed(i, key)` is the miss test and
the record in one call, so no frame tests the key and forgets an overlay.
The walk over the tiles stays the game's. Exemplars:
`src/skeleton/grid/render.ts`, and `src/games/towers/render.ts` for a clip
that paints its neighbors. The palette's shared roles, which a tiled board
paints with, are `color/roles.ts`.

### `overlay-sidecar.ts` — the overlay diff-key rule as a type

Reach for it when a tile shows a hint or a mistake
([`rendering.md`](./rendering.md) § "Overlay sidecars"). A step's struck marks go in the `struck` lane, in the game's
encoding (`valueBit(n)` for a candidate), never in the word beside the
roles: a candidate mask needs every bit a cell's values reach. Exemplar:
`src/skeleton/grid/render.ts`.

### `draw.ts` — shared drawing primitives

Look here before writing vertex arithmetic for a shape another game also
draws, or a text options object. `src/puzzle/bevels.test.ts` fails a bevel
in a game's frames that no call to these helpers drew.

- `drawStrike`: a hint's strike through a note, in the note's ink: an X, or
  one "\" with `slant` for a note that is a shape.
- `drawRecessedBorder`: the playfield bevel.
- `drawRaisedTile`: a raised tile, bevel and face in one call.
  `raisedBevelWidth(ts)` is the one thickness of its border, and
  `drawRaisedBevel` the two triangles alone.
- `drawRectOutline`, and `drawThickRectOutline` for the "this is wrong"
  frame.
- `drawRectCorners`: the four corner brackets of a keyboard cursor.
- **`glyphFont(size)` for a digit or letter centered in a tile.** It takes
  only the size; a game drawing fixed-width or non-centered text writes its
  own options.
- `strokeScaledPolygon`: a cell's own outline drawn inward, the hint mark
  for a cell that is not a square, where `hint-mark.ts`'s bands cannot go.
- `drawMoveArrow`: a hint's arrow from one tile to another, drawn by each
  tile it crosses under its own clip.
- **`path-arrow.ts` for which way a path runs between squares**: the
  one arrowhead (`drawArrowHead`, which `drawMoveArrow` wears too), a
  link's whole arrow, a thin shaft and the head filling the gap between the
  discs its squares' numbers or letters sit on (`drawPathArrow`), and the
  ring on a path's first square (`drawPathStart`). Draw the arrow after the
  grid line it crosses. A game showing a path's direction
  draws it with these and no shape of its own, so it reads alike in every
  game (owner, 2026-11-19).

Extracting a shape: [`rendering.md`](./rendering.md) § "A shape another
game also draws".

### `drawing-rules.ts` — what a drawing accepts

The canvas drawing and the test recorder both call it, so a test fails on a
color the app would refuse, and records nothing the canvas would not paint.
A new `GameDrawing` calls it too.

### `win-wave.ts` — the win flash

The whole win flash but for what a lit element looks like: the `Flash`
that `redraw` is handed, and the position a game gives each element.
`sweepStep(x, y)` is for a game with no route of its own, `sweepRanks` for
a board with no grid, `loopSteps` for a closed route, and `walkLoop` puts
unordered links in route order first. The rules and the table of routes:
`rendering.md` § "Animation and flash". Exemplar:
`src/skeleton/grid/render.ts`.

### `easing.ts` — the curve a move animates along

`easeOut` is the curve the midend applies to every move animation's
`animTime`. What a game does with the eased time: `rendering.md` §
"Animation and flash".

### `pencil-indicator.ts` — the pencil-mode indicator

Reach for it when your game has a pencil mode. It is the "pencil mode is
on" glyph, the same in every game and in the same
place: the canvas's top-right corner. The position is the engine's; a game
picks its three palette indices (`PencilIndicatorStyle`) and finds the
room. Exemplar: `keen/render.ts`.

- **Reserve `Math.max(yourMargin, pencilIndicatorReach(ts))`.** The reach
  is the glyph plus both insets, and the glyph is clamped between 20 and 48
  CSS pixels, so a margin of `ts / 2` does not hold it at a small tile.
  `pencilIndicatorBox(canvas, tileSize)` is the box.
- **Repaint it after the tile loop with `repaintPencilIndicator(dr, cache,
  on, box, style)`.** The box is in a margin, which is no tile's, so it
  cannot ride in a tile's cache key. The cache is a `pencilModeShown:
  boolean | null` on the draw state, `null` meaning never painted.
  `drawPencilGlyph` is for a renderer that repaints every frame.
- **The `ink` must contrast with the `background`**: it draws the outline
  and the graphite point. A game that keeps its answer colors out of the
  body draws an outlined pencil, `body` the background and `ink` the grid.
- `pencil-indicator-placement.test.ts` holds that nothing of the board
  reaches the box at any tile size, and that the glyph is at least 3.5% of
  the canvas's short side at phone and laptop sizes, for every preset.

Find the room in this order:

1. **A margin the game already has**: a border, a gutter, or a corner of a
   clue ring at the top right. Check the corner, not the edge.
2. **A wider margin**: widen the border until the box fits. A game whose
   origin is not one `border` term pads outside what it has by whatever the
   reach exceeds it by.
3. **A larger canvas, when there is no margin.** `pencilIndicatorCanvas`
   adds the reach on every side; its doc comment says what the game then
   does to its origin and `fromCoord`. The fill must come from
   `computeSize` and not from a board-sized expression, or the new margin
   is never painted. Adopting it: [`input.md`](./input.md) § "A notes mode
   added to a game".

## `mechanics/` — the mechanics several games share

Read this part when your game plays a mechanic another game already has.
The module owns the mechanic's shape, from input to look to hint, and the
game writes only what is its own.

### `line-drawing.ts` — drawn lines

Reach for it when the player draws lines along the edges between squares by
dragging through them: it is the whole input, the drag, the click, the cross
sweep and the keys. `OPEN`, `LINE` and `CROSS` are what an edge holds. The
game declares `LineRules` (`mark`, `takes`, `loops`, and `fixed` for an edge
the board owns, as Path's walls) and its saved move;
`dragPreview` gives its render the drag as it would be released, and
`hintGesture` the clicks that make a step's edges. `edgeMistakes` is the
mistake check of a game that stores a mark per edge. A game whose lines run
one way declares `directed`, and its `EdgeChange`s carry the square a line
runs from; it stores that in its own edge code, which `edgeMistakes`
compares whole. Draw such a line with `path-arrow.ts`. Adopting it:
[`input.md`](./input.md) § "The line drag". Exemplars: `skeleton/edges/`,
`path/`, `pearl/`, and `wordtrail/` for directed lines.

### `border-grid.ts` — the shared border-marking mechanic

Reach for it when the player marks each edge between cells as wall, not a
wall, or undecided. It gives the edge bits, the tile-size geometry and the
input (`borderGridVerbs`, `borderGridGeometry`, `edgeEdits`). The game
keeps its clues, solver, generator, completion test and its own `Move`: the
shared code reports which edge and which cycle and the game's `toMove`
wraps it, so no two save formats are coupled. Exemplar: `palisade/index.ts`.

### `border-grid-render.ts` — that mechanic's look

Reach for it to draw a border-grid game's tile: the rules' live errors as
red edges (`borderErrorMarks`), the
half-grid cursor, the edges, the tile skeleton and the board geometry. The
game supplies its palette indices as `BorderGridColors` and a `drawContent`
callback for the middle of the tile. `packHintMarks` packs a hint step onto
the draw state's sidecar and returns an `edge-hint.ts` word a cell; key the
tile cache on the word and pass it to `drawBorderTile`. Exemplar:
`palisade/render.ts`.

### `border-grid-hint.ts` — that mechanic's explained hint

Reach for it in any border-grid game's hint: the `BorderHint` highlight,
the journey one firing becomes and the keep-track verdict on a click. The
game hands in its forced edges, its sentence per leg and the squares it
cites, and wraps the edits in its own `Move`. `EDGE` keys an edge the same
from either side; a later leg's sentence is `edgeContinuation` in
`hint-text.ts`. The deduction and the sentences stay the game's. Exemplar:
`separate/index.ts`.

### `note-taking-cell.ts` — the shared highlight-and-type mechanic

Reach for it in every game that carries `ui.pencilMode` and
`ui.cursorFromKeyboard`: the player types values and pencils candidates. The
game keeps its coordinates, its symbols and its
own `Move`. Exemplar: `keen/index.ts`.

- **Input**: `pressNoteTakingCell`, `tapNoteTakingCell` and
  `dragEnteredNoteTakingCell` resolve a press, a release and a drag;
  `releaseHighlightAfterEntry` and `noOpEntryResult` are what an entry does
  to the highlight, `toggleNoteTakingMode` the mode switch, and
  `noteEntryGesture` the taps and keys of a hint step's entries. When each
  is called is [`mechanics.md`](./mechanics.md) § "Pencil marks: the full
  note-taking UX", and `select-or-drag.test.ts` drives every member's press
  and release.
- **The picture**: `drawCellBackground`, `cellHighlight`, `highlightFill`
  and `highlightWash` ([`rendering.md`](./rendering.md) § "The note-taking
  cell's picture").
- **The notes' layout**: `noteGrid`
  ([`hints-marks.md`](./hints-marks.md) § "Shade vs ring").

### `code-rows.ts` — the code-breaking mechanic

Reach for it when a hidden answer is guessed a row at a time and the player
rules values out of an answer row. The answer row's rule-outs are state
(`withRuleOuts`, `ruleOutMistakes` for Check & save); the working row is the
`Ui`'s `WorkingRow`, edited by `enterValue` and `rubOut`. The game keeps its
score, keys, picture, hint and the routing of taps and keys onto these, and
chooses what a value typed onto a full row that cannot go does (`FullRow`).
A hint that rules values out keeps track of the player's marks through
`ruleOutProgress` and drops those already made with `pendingRuleOuts`.
Exemplar: `guess/index.ts`; `wordguess/index.ts` uses the working row alone,
its dictionary standing in for an answer row.

### `wires.ts` — the Net/Netslide wire model

Reach for it for tiles that carry wires: the step across the torus, the
wire desc codec with its barriers, the spanning-tree grower, barrier placement
and the `computeActive` power flood. `wireDistance`, a tile's distance from
the source along the wires, is the position to hand the win flash. **Only
the bits `0x0F` are wires; each game owns the high bits**, and the header's
"0x10 trap" says how they collide. Exemplar: `net/state.ts`.

### `edge-clue-latin/` — the board Unequal and Adjacent share

A Latin square whose clues sit in the gaps between neighboring cells is
`edge-clue-latin/`: the board and its desc, the moves, the input with its
spent-clue drag, the cell drawing, the solver's driver and the generator
(its order deals the boards). The game declares its clue as a `ClueKind` (what it
says, whether every true one is dealt, whether both ends flag it, its
compiled ladder and rules, its drawing and its text glyph) and writes its own `Game`,
its reasons and its hint's sentences. Exemplars: `unequal/`, `adjacent/`.

### `fill/` — the board of a fill game, laid out from its description

The whole of a game born from its description, which writes no TypeScript.
The board (`board.ts`) holds the description's own
values in the space's own order, one mark a cell and the dealt clues, so
the ladder reads it with no adapter. `edit.ts` is the one move, and
`answer.ts` the hooks that judge a board against its answer and its rules.
`play.ts` is the input the description's `play:` declares, and the engine's
`FillUi`. `render.ts` draws the board by layers from the painters `play:`
names, and `marks.ts` holds the hint's mark kinds beside the cells.
`deal.ts` deals a board from the answer `sample.ts` draws, and
`game-id.ts` is its params and desc, from the description's `id:`.
`hint.ts` is the hint, `describedFiringHint`'s hooks read off the board,
the walk begun at the lowest tier that finishes the board as dealt; a step
decides values (`PLACE` facts) and, where the game's mark is a link, marks
(`MARK` facts), which its words ring as `{ring mark}` and its gesture drags.
`game.ts` is `fillGame`, every hook of the contract from these, which a
game born from its description registers.

### `edge-hint.ts` — a hint on an edge between squares

Name an edge a step decides or reasons from by its `EDGE` kind, keyed by
the `square-edges.ts` edge number, so one edge is one mark from either
square; a side on the board's rim is named by its square and direction.
`stepEdgeHints` reads a step's edges from its words, its move and the
edges its sentence gives a shape (`ShapedEdge`), and `trackEdgeStep` is the
`hint.keepTrack` of a step that sets edges, shrinking its move and its rings together.
`edgeHintWords` gives each square its tile-key word for those edges, set on
both squares. In the tile, `drawEdgeHints` asks the game's declared
`EdgeShapes` for its own line and cross in the outline's ink, and for where
an asked side's ring goes (`ring`), drawing the ring with the asked shape
inside, under the square's content. The word's low
`EDGE_HINT_BITS` bits are the module's; a game keeps its own hint bits
above them. Exemplars: `path/render.ts`, with shaped edges; `tracks/render.ts`,
whose outline role draws a bar.

## `generate/` — random partitions, tilings and placements

Read this part when you are writing a generator. Its bound on retrying and
the census of the draws it threw away are the contract's (`retry-limit.ts`,
`deal-census.ts`).

### `divvy.ts` — random equal-omino partition

`divvyRectangle` divides a rectangle into connected regions of equal size.
Its order deals the boards. Exemplar: `palisade/generator.ts`.

### `redivide.ts` — divide a few regions of a partition again

Reach for it in a generator that mends a division where it fails and does
not draw a whole new one
([`solver-and-generator.md`](./solver-and-generator.md) § "A draw that
fails often is mended, not retried"). `redivide` divides the cells of
some neighboring regions among them again at random, `regionsBeside` names
the neighbors to widen it by, and `ringless` grows each piece as a tree.
Exemplar: `separate/generator.ts`.

### `divide.ts` — regions of unequal size

Reach for it in a generator whose regions differ in size: the game supplies
its rule and the module walks. `mergeNeighbors` joins neighboring regions
wherever the rule allows, `mergeToCount` joins them toward a number of
regions and returns `null` where the rule cannot be met, `growFromSeeds`
grows a region round each cell it is given (`scatterSeeds` draws them), and
`growToSize` grows one region at a time to a size the game draws.
`regionNumbers` reads any division as a number for each cell, and
`regionForest` turns those numbers back into the `Dsf` a desc is written
from. Which walk
suits which rule is
[`solver-and-generator.md`](./solver-and-generator.md) § "A division into
regions is the engine's". The order of `mergeNeighbors` and
`growFromSeeds` deals the boards; both are upstream's draws.
Exemplars: `rome/generator.ts`, `map/generator.ts`, `seismic/generator.ts`.

### `mend-division.ts` — mend a division until it has one answer

Reach for it in a generator whose regions are the board's only clue, after
the division is dealt round the answer. `mendDivision` moves one cell at a
time into a region beside it, each region staying connected and no smaller
than the game's least size, until the game's deductions finish the board and
its easier tier does not. The game hands it a judge: what its deductions
leave open, the second answers its search meets (as the cells that break
each), and whether the tier below finishes the board too. It also names the
cells that never move, where the answer has what a region counts. The search
is usually `solvedPositions` from `answer-search.ts`. Exemplar:
`starbattle/generator.ts`.

### `laydomino.ts` — random domino tiling

`dominoLayout(w, h, rs)` is a random tiling by 2×1 dominoes. Its order
deals the boards. Exemplar: `dominosa/generator.ts`.

### `symmetric-blacks.ts` — symmetric black-square placement

Reach for `placeSymmetricBlacks` when black squares are placed
symmetrically; the `SYMM_*` values and their Custom-dialog labels are beside
it. It works through callbacks over the caller's board, and **the
caller clears its board first**. Its order deals the boards, the
`SYMM_ROT4` odd-center `<=` included. Exemplar: `lightup/generator.ts`.

### `loopgen.ts` — random loop generation

`generateLoop(g, board, rng, bias?)` draws a random loop over a `Grid`.
Its order deals the boards; its header records the draw order. A `bias`
callback's only observable effect is its return value, so one that
recomputes from scratch on each call deals what an incremental one would,
and is far simpler. Exemplar: `pearl/generator.ts`.

### `word-list/` — English words to deal and to accept

Reach for it when a board is made of words: `drawAnswer` deals a common
word of a length, `isGuess` says whether a word the player typed is one,
`isCommon` whether a word a board shows counts (no rare, rude or
abbreviated word, so a hint never names one), and `isAnswer` whether a game
may deal it; `answerWords` and `guessWords` list a length's words, for a
hint that counts them. `commonSpan` and `narrowCommon` walk a length's
common words a letter at a time, so a search over paths of letters drops a
path once no word begins with it (Wordtrail's trails). The answers are
among the common words, and those among the guesses. The
lists are `data.ts`, generated by `scripts/word-list.ts` from pinned
releases and committed; the script's header says what each list holds and
why, and edit only it, or `scripts/word-list-exclude.txt`, then rerun it.
**An answer check is against the guesses**: a board whose solution is a
choice of words is unique only if no other choice of accepted words fits.

### `region-fill.ts` — a fill for each region of a division

Reach for it wherever regions are colored so that two sharing a side
differ; pieces that outnumber their colors take `spread-colors.ts` instead
(below). There is one walk,
`colorRegions(beside, fills, choice)`: the region with the fewest fills
left goes next, a fill that leads to a dead end is
taken back, and `choice` says which of the tied regions and in what order
its fills are tried. Two callers, which differ only in that choice:

- **A renderer coloring the regions the puzzle gives** calls
  `regionFills(regions, w, fills)` in `newDrawState`, with each cell's
  region as a number (`regionNumbers`, `divide.ts`). It draws nothing, so a
  board wears the same colors each time it is opened, and it spreads the
  fills by area. The colors are `REGION_FILLS` (`color/colors.ts`), one palette
  slot each; [`rendering.md`](./rendering.md) § "What a board looks like:
  pieces on a quiet surface" says what a game owes when it takes them.
  Exemplar: `starbattle/render.ts`.
- **A generator whose answer is a coloring** passes a `choice` that draws.
  Its order deals the boards there: the walk asks once for the region and
  once for its fills at every step, which are the draws of upstream's
  four-coloring. Exemplar: `map/generator.ts`.

**Pieces that outnumber a set's colors** are not a division, and take
`spreadColors(boxes, colors)` (`spread-colors.ts`) instead: where a number
or letter tells repeated colors apart, as Path's pairs on `FREE`
(`color/colors.ts`). It takes each piece's box of given squares and keeps
pieces near each other on different colors. **Give it what the puzzle
gives, never the answer**: colors spread by where the answer's lines run
tell a player which pairs do not touch. Call it in `newDrawState`, so a
board wears the same colors each time it is opened. Exemplar:
`path/render.ts`.

**Colors that run in an order**, a line that changes as it goes, take
`FREE_RAMP` (`color/colors.ts`): `FREE`'s members in order of hue, one a
hue, by index into it. Exemplar: the Path ruleset's line in
`path/render.ts`.

## `solve/` — the deduction ladder and what compiled descriptions run on

Read this part when you write a solver, a tier or a board's verdict.

### `square-tiling.ts` — a square grid as a tiling

Reach for it when a description reads a square grid as a tiling
(`space: { tiling: true }`): squares are the dots, the sides between them
the edges, and a face where four squares meet, so two sides of a square
meet at a corner exactly where they bound a face. A wrapping board is a
torus. `sideEdge` maps a square's side to its edge, -1 where it joins no
square. **A dimension of 2 wraps to two edges between the same pair of
squares**, one each way round, so key on the edge, never on the pair.
Exemplar: `net/solver.ts`.

### `latin.ts` — Latin-square solver *and* generator

Reach for `latinSolver`, `latinGenerate` and `latinGenerateRect` when the
board is a Latin square. Its bipartite `matching` is usable outside the
family: pass `rs` for a random matching in generation and leave it out for a
deterministic existence check (`tents/`). A repeated symbol, the `seed`
hook, `cubeOut` and the family's generator shapes are in
[`solver-and-generator.md`](./solver-and-generator.md). Exemplar:
`keen/solver.ts`. Its singles, sets, fish and wing are
`latin.compiled.ts`, compiled from `latin.description.yaml` by
`npm run describe` and never edited by hand; `latinLadder` pairs each with
its reason, and runs a described game's own on its clues
([`descriptions.md`](./descriptions.md); exemplar `unequal/solver.ts`).
`describe-runtime.ts` is what compiled code reads, and the modules under
`describe-runtime/` hold it: the marks' interface, the numbered grid
(`describedSpace`, `latinSpace`), kept by shape, and a game's `ClueList`s
(`cluesWhere` deals one off a board's array) and `ListClues`; `perBoard`
keeps a deal for the life of the object it is read from. `marks-made.ts` numbers the kinds of fact `Marks.made` counts,
which the compiler reads to check a binding again before it fires.

### `cell-marks.ts` — the marks a compiled technique reads

Reach for `CellMarks` when a game's techniques are stated in a description:
a value a cell and the values each may still hold, and the edges' and
cells' marks where the description keeps them. `WideCellMarks` holds a
domain whose values run past 31 (`ascent/solver.ts`). A game's solver
extends `CellMarks` only to keep a Search no description states. Exemplar:
`unruly/solver.ts`; the guide is [`descriptions.md`](./descriptions.md)
§ "The runtime a ladder runs on".

### `ladder-runtime.ts` — what a compiled ladder runs on

Reach for `describedLadder` when a game's techniques are stated in a
description: the pairing of each technique with its reason, and
`ladderTechniques` and `runLadder` to run it on the marks capped per scale.
`withSearch` puts a Search no description states after the ladder, and
`keptRung` makes a hint rung of the compiled firings that serve another.
Exemplars: `unruly/solver.ts`, `seismic/solver.ts`; the guide is
[`descriptions.md`](./descriptions.md) § "The runtime a ladder runs on".

### `ladder-walk.ts` — a hint's walk over a compiled ladder

`ladderWalk` is a hint's walk over a ladder's firings for a game with no
notes, one firing a call, the next chosen through `hint-frontier.ts`.
`Taken` is a firing it took. Exemplar: `slant/solver.ts`; see
[`hints.md`](./hints.md) § "Recording the deduction".

### `position-runtime.ts` — what a planning game's compiled rules give

Reach for `PositionRules` when a game's moves and finish are stated in a
description: the module `npm run describe` writes builds one for a board,
and the game asks it which moves are legal, what one does, and whether a
position is finished, lost or a dead end. `moveEffect` reads a move that
moves pieces the same way on every board as the `Effect`
`permutation-planner.ts` takes. Exemplars: `fifteen/state.ts`,
`twiddle/solver.ts`; the guide is [`descriptions.md`](./descriptions.md)
§ "A planning game's position and moves".

### `described-rules.ts` — `Game.rules` from the compiled description

Reach for `describedRules(module, { grid, size, deals })` when a game draws
its live errors: the game says how its state reads as the description's
values, and what its board deals and the variations it has on, and the
module's `violations` and
`isAnswer` do the rest. Exemplar: `rulesOf` in `engine/fill/answer.ts`; the guide is
[`rendering.md`](./rendering.md) § "Live errors are the rules'".

### `deduction-fixpoint.ts` — the shared technique ladder

The loop every compiled ladder runs on, ordered and restarted from the top on
each firing. A game reaches it through `ladder-runtime.ts`'s `runLadder`
and `ladder-walk.ts`'s `ladderWalk`; it takes only a ladder that file built from a compiled
description (`CompiledTechniques`), so a hand-written one does not
typecheck. Exemplar: `src/skeleton/grid/solver.ts`.

- **`firings` is a tally the caller supplies**, counted by `id`, and it is
  how a rung's reachability is observed. Leave it out on the generator's
  path and the runner allocates nothing.
- **`singleFirings` is the recording path's driver**: the same pass,
  stopped after each firing, returning the technique that fired or `null`,
  with a sticky `impossible()` and a required budget. It returns every
  firing; hiding one is `deduceHintPlan`'s `showable`. See
  [`hints.md`](./hints.md) § "Recording the deduction".
- **With `continuing`, the hint stays where its work is**: a compiled
  technique's `available()` lists the firings it could make (the engine
  builds it), and the driver takes the firing that continues
  from the plan's latest steps (`hint-frontier.ts`, below). Without it a
  plan takes whichever firing the scan meets first, and wanders.
- **Certify a ladder with a census** (`testing/ladder-census.ts`): the
  soundness check says a technique is right, and only the census says a
  board reaches it
  ([`solver-and-generator.md`](./solver-and-generator.md) § "Proving an
  adoption: a census and a plant").

### `step-budget.ts` — the fixpoint non-termination guard

`StepBudget`, ticked once an iteration, turns a fixpoint that never settles
into a labeled failure, naming the techniques by firing count when ticked
through `runDeductionFixpoint`. Where it goes:
[`hints.md`](./hints.md) § "The step budget".

### `hint-finishes.ts` — whether deduction finishes a board

`nothingToDeduce` is `Game.finishesByDeduction` for an untiered game that
moves, searches or guesses. `hintFinishes(game, state)` follows the hint a
whole plan at a time to a solved board; a deductive game asks it at the
tier beneath Unreasonable
([`solver-and-generator.md`](./solver-and-generator.md) § "Giving a
deductive game an Unreasonable tier").

### `answer-search.ts` — a deductive game's Unreasonable tier

Reach for it where some boards need trial and error (a deductive game with
the tiers Easy and Unreasonable), or where a generator wants a second answer
([`solver-and-generator.md`](./solver-and-generator.md) § "Giving a
deductive game an Unreasonable tier"). The deduction, what to assume where
it stops, the search's budget and what a deal draws and strips stay the
game's. Exemplar: `mosaic/solver.ts`.

- `searchAnswers({ start, deduce, assume, solution, budget })` counts a
  board's answers to two over the game's own deduction and returns an
  `Answer`: one, several, none, or out of reach.
- `solvedPositions(search, limit)` hands the answers to a generator that
  mends a board with a second one.
- `answerCache()`, `solveFromAnswer(answer, move)` (Solve) and
  `searchTierContract({ newState, deductionFinishes, answerOf })` (the
  `difficulty` contract).
- `DIFF_EASY`, `DIFF_UNREASONABLE`, `searchTierItem(<game>.tiers, …)` and
  `searchTierSegment`: the tiers, their Custom field and their params
  segment. The names are the description's, Unreasonable last.
- **Write no retry loop for the tier.** `dealUnreasonable({ label, draw,
  strip?, deduced, answer })` owns the loop, its bound and the test that
  keeps a board, within `DEALING_BUDGET`. `difficulty-contract.test.ts`
  holds every game with a `searchTierContract` to it.

### `fact-graph.ts` — what a fact rests on

`ladderWalk` keeps a `FactGraph` of the facts a hint's walk made, each with
its firing. A fact's parents are derived from the firing's `says.reads`
(the earlier facts about any element read), so no game writes a parent list;
`restsOn(id)` gives the facts it rests on, the board's own marks it reached
(roots), and whether every firing in the chain reported its reads. Read it
before building a trace, a note's placement or a verdict's explanation.

`placeNotes(graph, { isNote, expired? })` is the placement of the notes (the
facts a player cannot see as marks): each note a step rests on goes just
before the first step that does, in firing order, one journey with it; a
note nothing cites goes nowhere; an `expired` note (its sentence quotes the
board) goes at its own tick; a note is never placed after one resting on it.
A game says only what a note is.

### `deduction-record.ts` — the recorded-firing shape

Reach for it when your hint records its ladder's firings through
`CellMarks.recorder`. `reason` is `unknown`, so each game attaches its own.
`group` ties the records of one firing together, so one firing becomes one
hint step. A candidate game records nothing: it runs its techniques on the
notes ([`hints-candidates.md`](./hints-candidates.md) § "Deduce from the
notes when the mistake check vouches for them"). Exemplar:
`lightup/solver.ts`.

### `wing.ts` — the XY- and XYZ-wing

Reach for it when your hint can be a wing: it holds what a help page says
of one, and a game whose hint can be a wing writes `{{wing}}` on its help
page. The technique is stated in a description, over whatever "sees" is
there: the Latin library's `wing` over `peers`, worded by `wingPremise`
(`hint-text.ts`), and Map's `weigh` over `borders`.

### `hint-frontier.ts` — which available firing a plan takes next

Read it when a plan wanders, or is not on a grid. `HintFrontier` takes,
among the firings a candidate plan could make at
once, the one that continues from what the plan's latest steps wrote, with
the ladder order as the tiebreak. `runCandidatePlan` drives it for a grid
game, keyed by `gridKey(w, h)`. A game whose steps act on something other
than grid cells keys it on that and drives it from its own plan
(`map/hint.ts`). See [`hints-candidates.md`](./hints-candidates.md) §
"Continue from the last step" and `hints-candidates.md` § "A graph, not a
grid (Map)".

A deduction ladder's hint takes it through `singleFirings`' `continuing`,
which keeps the frontier, a fresh one a plan, over the firings a compiled
technique makes available
([`hints.md`](./hints.md) § "Recording the deduction").

### `permutation-planner.ts` — a staged plan over any permutation moves

Reach for it when every move permutes the cells the same way whatever the
board holds (and may turn the pieces it moves), and the hint should place
pieces in reading order, keeping the finished ones. The game supplies its
generator moves as `Effect`s (a described game's are its compiled moves', by
`moveEffect`; `effectOf` runs a move function on an identity board), the
board and the finished board; `planByStage` returns
segments whose `roles` name each move's part in a technique for the
narration. Move `2i` is generator `i` and `2i + 1` undoes it. Pieces that
share a value are interchangeable. A move that depends on the board, such as
Fifteen's gap, does not fit. Exemplar: `twiddle/solver.ts`, narrated in
`twiddle/hint.ts`.

## `hint/` — the planners, judges and sentences of a hint

Read this part when you are writing a hint. How to write one is
[`hints.md`](./hints.md); these entries are the inventory.

### `hint-plan.ts` — the plan-accumulation loop

Reach for it when a hint outside the description takes one forced firing at
a time; a described game's plan loop is the engine's.
`deduceHintPlan` is the loop "while unfinished, ask for the next forced
firing, apply it, record it". The rung order, the reason type and the
sentences stay the game's. It takes a `planCap`, which bounds what the
player is shown, and a `StepBudget`, which bounds non-termination.
Exemplar: `src/games/loopy/hint.ts`.

`showable(board, firing)` hides a firing, and the result's `hidden` counts
them ([`hints.md`](./hints.md) § "Show only what the board does not
already say").

### `described-hint.ts` — a described game's hint, built from its firings

Reach for `describedHint` when a game's techniques are stated in a
description and a placement is a fact: give it the state as the
description's marks, the ladder, the move a fact makes, and a sentence for
each technique as a function of its `says` terms and the cells it marks. It
returns the part of `Game.hint` it can make, `plan`, `judgeMove`, `keepTrack`
and `rungs`, which the game spreads into its hint; a step's kind is the
technique's id, its marks are the `says` marks, and a firing that fills
several cells is a journey. Exemplar: `unruly/index.ts`. The `says` block is
in [`descriptions.md`](./descriptions.md).

### `described-firing-hint.ts` — the same, a step a firing

`describedFiringHint` is the other shape, for a
game whose step is a firing: one step decides every cell the firing does, and
`hint.keepTrack` shrinks it as the player makes some (`hint-track.ts`). The
game gives the walk, how a fact is its highlights' target and the move that
makes some, and a sentence a technique, which an `arms` technique reads by
`spoken.arm`. It returns the hint's part (`plan`, `judgeMove`, `keepTrack`,
`refreshStep`) as `hint`, which the game spreads, and `rulesOut` beside it.
Exemplar: `singles/index.ts`.

### `glance.ts` — marks a board shows at a glance, and asking for a deeper one

`glanceWalk` turns a ladder whose player draws marks as notes into the walk a
hint takes: the description's `play.glance` techniques are read once on the
drawn marks before each firing (the walk's `settle`), and stand in the ladder
as asks that offer a deeper mark only where it lets a technique above them
fire, one before each `play.askBefore` technique and one at the end. The fill
hint builds it from the description; Tents is the first to declare one.

### `move-judge.ts` — whether the player's last move followed from the board

The pieces a builder's `judgeMove` is made of: the facts a move made, read
from the marks before and after it; whether walked marks hold each; which
techniques made it, direct or chained; and the one table of words a verdict
names them in (`verdictOf`). `describedFiringHint`, `describedEdgeHint`,
`describedHint` and the candidate plan (`candidate-judge.ts`) drive them
through `judgeByWalk` with an aimed walk. A game whose hint walks the ladder
from its own code passes its marks and its aimed walk to `judgeWalked`
(`docs/hints.md` § "Judging the last move").

### `described-rules-out.ts` — `Game.rulesOut` from the description

`describedFiringHint` returns `rulesOut` where its spec has the module's
`RULES_OUT`: the named techniques' conclusions whose firing reads a square the
move placed, brought as one move. The game writes no `bring`
(`descriptions.md` § "What a placement rules out").

### `described-edge-hint.ts` — the same, where the answer is on the edges

`describedEdgeHint` is the shape for a game whose facts are on edges, a step a
firing: it walks from the board's own tier, caps the plan, names the kind from
the technique and arm, and calls the game's `step` with the marks before and
after the firing, to make the move and highlights from. A game whose words
read the firing's premise itself gives one `say` for every technique, and the
squares a premise reads are the description's `marks.reads`; the `reads` hook
is for what no term names, such as the hubs a Check's trial breaks
(`spokes/solver.ts`). The plan's length is the engine's unless a game states
its own reason. Keep-track is the game's, `keepTrackBy` where its step names
its targets; a step reached a little at a time toward a count (a bridge a
drag, a dot a press) judges progress itself. Exemplar: `pearl/hint.ts`.

### `apart-by-position.ts` — two things of one name, told apart

Reach for it when a sentence names two clues of one value.
`apartByPosition(things, at, name)` names each thing a sentence points at
when two would get the same words ("the upper 3", "the lower 3"). Build it
over every such thing the one sentence names. Exemplar:
`mines/hint.ts`. See [`hints.md`](./hints.md) § "Name a square by its
value".

### `rival-judging.ts` — what a searched move's rivals let it say

Reach for it when a hint says something about the other moves.
`judgeRivals(rivals, allowance, judge)`: the game judges each rival of the
move its hint offers as finishing, lost or unsettled, within one allowance
counted in positions, and gets back the verdicts and the claim they allow,
each with the relation its sentence must use. **The relation that says "so"
over a searched move's rivals (`RivalsLost`) is made only here.** A game
whose rivals are ruled out by a deduction or a rule judges them through it
too. The judge, the search behind it and what to say when nothing is
settled stay the game's. Exemplar: `pegs/hint.ts`. See
[`hints-search.md`](./hints-search.md) § "Judge the rivals of a searched move".

### `best-by.ts` — the best of equal moves, and whether it is best alone

Reach for `bestBy` where a hint chooses among equally good moves by a
secondary measure, and where its sentence claims the chosen one is the most
or the fewest of something: `alone` says no other ties it, so the claim is
true. Exemplar: Ball Sort's room, in `ballsort/solver.ts` (`nearer`) and
`ballsort/hint.ts`.

### `search-outcome.ts` — what a budgeted search for a line established

Reach for it in a game that can be lost and is solved by searching.
`SearchOutcome<Step>` is a line that finishes, a proof that none does, or
neither when the budget ran out. `searchRefusal` is the hint's refusal for
the two without a line, `searchVerdict` the verdict on a rival for
`judgeRivals`, and `solveBySearch(orig, curr, find, finish)` is Solve, from
the player's position if a line is found there and else from the board as
dealt. The search, its budgets (counted in positions) and the move Solve
makes stay the game's. A game that hands its outcome to `searchRefusal` is
in `SEARCH_REACH_GAMES` (`testing/hint-games.ts`). Exemplar:
`sokoban/solver.ts`.

### `finish-search.ts` — the depth-first search that finds a line or proves none

Reach for it when a hint must prove a position lost by searching every line
from it. `searchFinish(start, game, plan, allowance)` owns the memo of
positions proved lost, the budget in positions, the shared `Allowance` and
the restarts, and returns a `SearchOutcome`. The game's `FinishSearch` gives
an exact key, the finished test, a sound and cheap lost-at-a-glance cut, and
its moves in the order to try them with the position after each; the salt
it is handed breaks ties another way on each restart. `exhaustive(budget)`
is one try; a `Plan` with `tries` restarts cures the heavy tail of an
ordered search where ties are many.

- **One board changed in place is allowed**, and is what Pegs does: yield
  the same position after each move and change it back in a `finally`,
  which runs when the search stops drawing moves, early or not. Keep any
  count the finished test needs on the position rather than recounting it.
- **Restarts do not help a proof of loss**: every position a cut does not
  stop is expanded whatever the order, so a short try only repeats work
  (measured on Pegs in `own-the-finishability-search`, task 1.2). Where
  they help is [`hints-search.md`](./hints-search.md) § "Find with one
  search, prove with another".

Exemplars: `pegs/solver.ts` (in place, one try) and `samegame/solver.ts`
(a new board a move, with restarts).

### `candidate-hint.ts` — candidate-elimination plan plumbing

Reach for it when your hint strikes pencil notes. These are the pure
helpers of a pencil-notes game's hint: `nakedSingles`,
`emitObviousCleanStep`, `Reach` and `regionReach` (what a placed value
rules out), the move dialect `CandidateMoveAdapter`, `valuesOf` (the values
a strike names), `evidenceOf` (what a step's words outline and stripe),
`populateThenClean`, and `keepCandidateHintTrack` and
`refreshCandidateHintStep`. A board scan reads
`grid.length`, so a board need not be square; `w` is only the row stride.
Exemplar: `keen/index.ts`.

- **`NoteEncoding.all(i)` must agree with the game's own fill-all move.**
  It is the full note set of a blank cell, per cell, for a game whose notes
  are bounded by something other than the board's order. Where they
  disagree, the plan teaches strikes on notes the player never had.
- **A game whose moves are not the shared dialect's supplies
  `CandidateMoveAdapter.populate()`**, the fill-all in its own move shape.
- **`CandidateReading`** names the two readings of a blank cell with no
  notes; `DEFAULT_CANDIDATE_READING` is the convention. `impliedNotes` is
  the implicit one as a board, and `fillAllNotes` what a fill-all puts in a
  cell. See [`hints-candidates.md`](./hints-candidates.md) § "Two readings
  of an unmarked cell".
- **A Latin game's `executeMove` routes the three note moves to
  `applyNoteMove`** and does not restate the bit arithmetic.
  `CandidateMoveAdapter.add` builds `pencilAdd`, the mirror of
  `pencilStrike`.

### `entry-mistakes.ts` — Check & Save for one value or a set of marks per cell

`entryMistakes(board, at)` is the whole `findMistakes` loop of a game whose
player places one value per cell or pencils candidates there. A wrong entry
is a `cell` mistake; a blank cell whose non-empty marks leave out its
answer is a `note` mistake. The game supplies the solved answer, its entry
array, its note array where it has one, the note bits as its `NoteEncoding`
declares them, a blank cell's spelling (`empty`), the cells it cannot
change (`fixed`) and `at`, which places a cell in its own mistake shape
(`gridCell(w)` for a row-major grid). A game with further marks of its own
checks those in its own loop and asks `entryMistake(board, i)` for the rest
(`salad/solver.ts`). **The note half is what makes a candidate hint
sound**: the hint reasons from the marks, so it must refuse on a mark set
without its cell's answer. Exemplar: `src/skeleton/grid/index.ts`.

### `candidate-plan.ts` — the candidate-elimination plan and its walk

Reach for it when you write a notes game's `buildSteps`.
`runCandidatePlan` is a pencil-notes game's whole `buildSteps` walk: the
singles the notes show, then the game's rungs, populate and the obvious
clean, a placement's cull, and each next firing taken through a
`HintFrontier`. A rung returns firings as legs and the walk builds every
step. `techniqueRung` makes a technique of the game's ladder a rung run on
the notes, gated by its place in the ladder and the board's tier. The game
supplies its rungs, regions and words; the walk itself is
`candidate-walk.ts`'s, which no game imports. See
[`hints-candidates.md`](./hints-candidates.md) § "What every game does".

- **Its `reading` is the player's.** Under the implicit one there is no
  populate, and a firing first writes the notes of every note-less cell its
  premise reads.
- **A plan with a `setUp` of its own walks the populate reading alone** and
  is typed so (`PlanRung<Reason, "populate">`, `LATIN_POPULATE_RUNGS`). See
  [`hints.md`](./hints.md) § "Name the rung a step speaks".
- **A plain row/column square calls `runLatinCandidatePlan`** and supplies
  its rungs and words alone. A game whose singles narrate otherwise
  fails to type-check against it and calls `runCandidatePlan`
  (`solo/index.ts`). See [`hints-candidates.md`](./hints-candidates.md) §
  "The row/column preset".
- **`buildSteps` hands its plan the prefs' `judging`**, and the game wires
  `judgeMove` as `candidateJudge` over the same `buildSteps`.

### `candidate-judge.ts` — a notes game's last move, judged by its plan

`candidateJudge(before, after, ui, buildSteps)` is the `judgeMove` of a game
whose hint is `candidateHint`: the plan walked from `before` under the
player's preferences, aimed at the move's facts. See
[`hints.md`](./hints.md) § "Judging the last move".

### `latin-hint.ts` — regions and the reasons of a single

Reach for it when a game's hint narrates a single. `CellRegion` is a
region a value may not repeat in, `rowColRegions` a Latin square's two,
and `SingleWhy` the kind of single the walk read off the notes (naked,
hidden in a region, or a note-less cell whose regions hold every other
value), which `singleReasonOf` names for a row/column game. The sentences
are `hint-text.ts`'s.

### `latin-notes.ts` — a Latin ladder run on the player's notes

Reach for it when a Latin game's hint deduces from the notes.
`latinNotesLadder` runs the game's ladder on
`LatinSolver` marks over the walk's grid, and `latinStrikeRungs` makes the
library's set, fish and wing rungs of the plan, so the game writes legs
only for its own techniques; `byCell` cuts a firing a leg a cell, for a
game whose sentence names one cell's notes. Exemplars:
`src/games/salad/hint.ts`, `src/games/unequal/index.ts`.

### `stated.ts` — a step's words as its description states them

Read it when a technique states `look`, `follows` or `move` in its
description. `stated-clauses.ts` is the clause grammar, which the compiler
checks a description's clauses with, and `stated.ts` renders a clause over
what a firing says into `hint-words.ts` references. A step a description
declares under `steps` is spoken through `step-voice.ts`, which the compiled
module binds as `voice`. See [`descriptions.md`](./descriptions.md) § "A
firing's reason is built from its binding".

### `hint-text.ts` — the sentences several games share

Read it when another game already says your sentence. It is the engine's
half of the hint-text convention; a game's own sentences are
its description's. Nothing here decides which sentence fires. See
[`hints.md`](./hints.md) § "The sentences live in the description".

- `narrateLatinReason` and `latinPremise`, for the row/column games
  (normative: `engine-candidate-hints`, "A shared narrator for generic Latin
  placements and strike premises").
- `confinedPremise`, for one value confined across several lines.
- `populateText`, `cleanObviousText`, the `Premise` a strike's words are,
  the `Conclusions` the walk ends it with (`candidateConclusions`) and the
  `LatinVocab` a value is spoken in.
- The list joiners `joinNums` and `joinWith`.

### `slide-planner.ts` — sliding-permutation search

Reach for it when the player slides tiles toward one arrangement. It
searches the board as the player sees it, one integer per cell, so two
boards that show the same picture are one position. A game supplies the
exact search's budget and `deepSearch`, and never when to spend them.
Exemplars:
`sixteen/index.ts` with `deepSearch`, `netslide/hint.ts` without. See
`hints-search.md` § "Sliding-permutation games".

### `position-store.ts` — the positions a breadth-first search reached

Reach for it when a hint searches breadth-first and stores what it has
seen. The game packs a position into a fixed number of words in a buffer it
reuses, and the store keeps them in one pool with an open-addressed index,
parent links and `lineTo`; a level's frontier is the index range the level
before appended. Measured, it is several times faster than a string key in
a `Map`. Exemplars: `cube/solver.ts`,
and the exact search in `slide-planner.ts`.

### `pencil-prefs.ts` — shared pencil `GamePref` declarations

Reach for it when a notes game declares preferences. It holds the
factories for the sticky-pencil, keep-highlight and hint-notes
(`candidateReadingPref`) preferences, each constrained to a `Ui` field, so
a game without the field fails to compile. The auto-pencil preference takes
its sentence from the game, because its label names the game's regions.

## `midend/` — what drives a game

Read this part when a change reaches undo, a deal, a save or the registry.
A game imports `registry.ts` alone from here: `registerGame` is the last
line of its `index.ts`, and `src/games/index.ts` refuses a directory that
registers no game under its name. A game depends on the `Game` interface,
never on the midend.

- `midend.ts`: undo, redo, the timer, the hint and mistake lifecycles. Its
  collaborators, each owning its own fields, are `midend-params.ts` (the
  params the next New game deals at), `midend-prefs.ts`, `midend-save.ts`
  (the run record and the save written and read) and `midend-animation.ts`.
- `save.ts`: the versioned save envelope.

### `ui-snapshot.ts` — a `Ui` kept to be put back

Read it when your `Ui` holds more than plain data. A game calls neither
`copyUi` nor `restoreUi`; the midend does, for a
canceled press. What the copy can take is [`input.md`](./input.md) § "A
canceled press is the engine's".

### `same-value.ts` — whether two values hold the same thing

Read it when the midend throws comparing your state or `Ui`. A game calls
neither `sameValue` nor `sameShown`; the midend does, to keep
a move that changed nothing out of the history and to see whether an input
changed what the `Ui` shows ([`mechanics.md`](./mechanics.md) §
"interpretMove and UI_UPDATE"). Keep the state and the `Ui` to the kinds
`copyUi` takes; anything else throws by name.

### `completion-status.ts` — the status bar's completion words

Read it when you write `statusbarText`. **A game never writes
`COMPLETED!`, `Auto-solved.` or `Auto-solver used.`**
The midend calls `completionStatus` and prefixes the words to whatever
`statusbarText` returns. An outcome that is not completion ("DEAD!",
"FAILED!") is the game's own phrase. `completion-status.test.ts` fails a
game string that says the words.

### `rules-out.ts` — the key and help words of `Game.rulesOut`'s preference

Read it when a placement rules squares out at a glance. It holds the
`auto-cross` key the midend offers to a game declaring `rulesOut`, and
the help sentence `{{rules-out}}` writes from the game's words for it. The
behavior is the midend's (`docs/mechanics.md` § "Preferences").

## Libraries: `color/` and `random/`

Read this part when you choose a color or draw random numbers. Each is one
helper made of parts, cataloged by its directory.

### `color/` — the palette

When you need a color, import `palette.ts`, the meanings. Beneath it
`colors.ts` holds the named colors, and beside it `palette-games.ts` the board-relative colors of
single games; `color-token.ts` is how a color is declared and combined, and
`color-mkhighlight.ts` derives a bevel's highlight and lowlight. The rules:
[`rendering.md`](./rendering.md) § "The palette: three layers, meaning
first".

### `random/` — the seeded RNG

Draw every random number a generator uses from here. A seed gives the same
numbers on every run, which every seeded test and `dealt` board rests on;
`random.test.ts` holds that, a draw's range, and a copied or encoded state
continuing the stream. The stream is a port of upstream's `random.c`, but
nothing holds it to upstream's or to its own past: the app hands out boards,
never seeds, so changing which board a seed deals breaks no save and no
shared ID ([`doctrine.md`](./doctrine.md) § "Upstream"). A change to the
stream moves every seeded deal, so the hint walks re-record
([`testing.md`](./testing.md) § "When the boards a seed deals move").

## Testing harness

Read it when a test needs a draw record, a dealt board or a hint pin.
[`src/engine/testing/`](../src/engine/testing/) is the in-process harness.
How to use it is [`testing.md`](./testing.md). The modules a game's own
test or a cross-game guard reaches for:

- **`fake-game.ts`.** The midend test suite's minimal game.
- **`recording-drawing.ts`, `render-scenario.ts`, `svg-drawing.ts`.** The
  `RecordingDrawing` every render test drives, with `opsOfKind` and
  `paintsWith` to read its ops ([`testing.md`](./testing.md) § "Render
  scenarios" and `testing.md` § "Render-op vocabulary"). `dr.updates` holds
  the `drawUpdate` rects, off `ops`.
- **`painted-neighbors.ts`.** `paintedNeighbors(ops, size, background)`
  reads which palette indices sit side by side. Reach for it when the
  question is about two colors a player has to tell apart.
- **`drive-midend.ts`.** `driveMidend(game)` and `observeMidend(midend)`
  are what a midend told the app: the notifications, `last(type)`,
  `timerActive()` and `redraws()` ([`testing.md`](./testing.md) §
  "Observing a midend").
- **`absent-tiers.ts`.** `describeAbsentTiers` covers the cells a game
  refuses because no board of that size needs the tier.
  `describeDealtTiers` covers the cells that deal boards whose lowest
  solving cap is the tier asked for, with `seldom` for a cell that takes
  seconds a board.
- **`dealt.ts`.** `dealt` and `beginDealt` give a cross-game sweep its
  boards ([`testing.md`](./testing.md) § "Deal through `dealt`").
- **`enrollment.ts`, `hint-games.ts`.** How a cross-game guard derives its
  population ([`testing.md`](./testing.md) § "How a cross-game guard finds
  its population").
- **`engine-source.ts`, `test-source.ts`, `code-lines.ts`.** The engine's
  and the suite's comment-stripped code, and their shared stripper
  ([`testing.md`](./testing.md) § "A cross-game guard the hooks can
  narrow").
- **`hint-positions.ts`.** `describeHintPins` pins the position each hint
  rung is tested on, and `describeHintKindPins` a test file's further
  positions ([`testing.md`](./testing.md) § "Pinning a hint's positions").
  `hint-scan-report.ts` is the report a scan fails with.
- **`ladder-census.ts`, `hint-binding.ts`.** The census that certifies a
  ladder, and the check that a rendered frame matches a step's words.
- **`slow.ts`.** `itSlow` defers a case to the slow tier
  ([`testing.md`](./testing.md) § "Running the slow tier").
- **`oklch.ts`, `polygon-yardstick.ts`.** Independent yardsticks, so a test
  cannot agree vacuously with the implementation it measures. Never import
  the implementation into them.
- **`presets.ts`, `preferred-draw-state.ts`, `win-flash.ts`.** A game's
  presets as a population, the draw state for a direct `redraw`, and a
  flash with no midend.

The rest serve one cross-game guard each (`ls src/engine/testing`).
