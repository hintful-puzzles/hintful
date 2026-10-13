# Engine catalog

Every shared helper under [`src/engine/`](../src/engine/): when a game
reaches for it, what it exports that a game calls, a game to read, and the
trap if there is one. An entry is short because the module's own header is
its documentation; read the header before using the module. An exemplar is a
path under `src/games/` unless it says otherwise. The normative rules are
the `engine-helpers` spec and the engine specs an entry names.
`node scripts/checks/engine-catalog.mjs` fails when a module under
`src/engine/` has no entry here.

## What every game does

1. **Start from the skeleton's imports.** `src/skeleton/grid/` already calls
   the helper for each common concern: `params-codec.ts`, `preset-grid.ts`,
   `desc-reader.ts` and `desc-error.ts` in `state.ts`; `target-verb.ts`,
   `pointer.ts` and `entry-mistakes.ts` in `index.ts`;
   `deduction-fixpoint.ts` and `step-budget.ts` in `solver.ts`;
   `retry-limit.ts` in `generator.ts`; `hint-plan.ts`, `hint-words.ts` and
   `hint-gesture.ts` for the hint; `hint-mark.ts`, `overlay-sidecar.ts`,
   `piece.ts`, `draw.ts` and `win-wave.ts` in `render.ts`.
2. **Before writing a helper of your own, scan the table below** for your
   situation. Read the entry, then the module's header.
3. **Import a shared thing from the module it lives in.** Do not re-export
   it through the game's `state.ts` or restate it beside the call.
4. **Keep a helper only one game uses in that game's directory.**
5. **When a second game needs it, promote it** to `src/engine/` in the same
   change, with its entry and table row here (§ "Sharing a helper").
6. **To see who uses a module, ask**: `git grep -l "engine/<module>" --
   src/games`, or `npm run refs -- src/engine/<module>.ts <Name>`.

## Sections

| Section | Read it when |
| --- | --- |
| Sharing a helper | you are about to write, extract or promote a helper |
| – What decides whether something is shared | two games hold the same code |
| – Measure before proposing an extraction | a duplication tool reports a clone |
| – Where a promoted helper lands | you are placing a new engine module |
| – Byte-match critical entries | you change a helper whose order reaches a desc |
| Board structure and geometry | you need connectivity, a board mechanic or pixel geometry |
| – `dsf.ts` — union-find | your state is a partition of cells |
| – `border-grid.ts` — the shared border-marking mechanic | the player marks edges between cells as walls |
| – `border-grid-render.ts` — that mechanic's look | you draw a border-marking game's tiles |
| – `border-grid-hint.ts` — that mechanic's explained hint | you write a border-marking game's hint |
| – `target-verb.ts` — aim at a target, apply a verb | each button does one thing to what it lands on |
| – `ui-snapshot.ts` — a `Ui` kept to be put back | your `Ui` holds more than plain data |
| – `same-value.ts` — whether two values hold the same thing | the midend throws comparing your state or `Ui` |
| – `note-taking-cell.ts` — the shared highlight-and-type mechanic | the player types values and pencils candidates |
| – `grid/index.ts` — planar-grid geometry (upstream `grid.c`) | your board is a tiling, not a square grid |
| – `geometry.ts` — cell ↔ pixel | you turn a pointer position into a cell |
| – `findloop.ts` — loop/bridge finding | you highlight a closed loop as an error |
| – `n-times-root-k.ts` — exact `round(n · √k)` | an irrational coordinate becomes pixels |
| Ordered collections and small leaves | you port a `tree234`, a shuffle or a combination loop |
| – `sorted-multiset.ts` — `tree234`, idiomatically | upstream's code uses a `tree234` |
| – `shuffle.ts` — Fisher–Yates + permutation parity | a generator shuffles or checks parity |
| – `combi/` — r-of-n combination iterator | you enumerate every r-subset of n |
| Generation | you are writing a generator |
| – `retry-limit.ts` — a bound on generate-until-it-works | a generator retries until a board passes |
| – `divvy.ts` — random equal-omino partition | a generator divides a rectangle into equal regions |
| – `redivide.ts` — divide a few regions of a partition again | a generator mends a division into regions of one size where it fails |
| – `divide.ts` — regions of unequal size | a generator divides a grid into regions that differ in size |
| – `laydomino.ts` — random domino tiling | a generator tiles a board with dominoes |
| – `symmetric-blacks.ts` — symmetric black-square placement | a generator places black squares symmetrically |
| – `loopgen.ts` — random loop generation | a generator needs a random closed loop |
| – `wires.ts` — the Net/Netslide wire model | your tiles carry wires from a source |
| – `obfuscate.ts` — solution masking in descs | your desc carries the answer |
| – `latin.ts` — Latin-square solver *and* generator | your board is a Latin square, or you need a matching |
| Solving and deduction | you write a solver, a tier or a board's verdict |
| – `deduction-fixpoint.ts` — the shared technique ladder | your solver runs ordered techniques to a fixpoint |
| – `step-budget.ts` — the fixpoint non-termination guard | a hint pass loops until nothing changes |
| – `difficulty.ts` — the cross-game difficulty contract | your game has difficulty tiers |
| – `hint-finishes.ts` — whether deduction finishes a board | your game is untiered, or has an Unreasonable tier |
| – `answer-search.ts` — a deductive game's Unreasonable tier | some boards need trial and error, or a generator wants a board's second answer |
| – `sections.ts` — contract sections and the draft label | your game leaves out a contract section |
| – `deduction-record.ts` — the recorded-firing shape | your solver records firings for a candidate hint |
| – `firing-replay.ts` — the premise audit | a candidate game has a solver of its own |
| Hint machinery | you are writing a hint |
| – `hint-plan.ts` — the plan-accumulation loop | a hint takes one forced firing at a time |
| – `hint-track.ts` — following a step that asks for several things | one step decides several squares or edges |
| – `hint-gesture.ts` — how the pointer makes a hint step | your game has a hint |
| – `apart-by-position.ts` — two things of one name, told apart | a sentence names two clues of one value |
| – `rival-judging.ts` — what a searched move's rivals let it say | a hint says something about the other moves |
| – `search-outcome.ts` — what a budgeted search for a line established | your game can be lost and is solved by search |
| – `candidate-hint.ts` — candidate-elimination plan plumbing | your hint strikes pencil notes |
| – `entry-mistakes.ts` — Check & Save for one value or a set of marks per cell | the player places one value a cell |
| – `candidate-plan.ts` — the candidate-elimination plan walk | you write a notes game's `buildSteps` |
| – `hint-frontier.ts` — which available firing a plan takes next | a candidate plan is not on a grid |
| – `latin-hint.ts` — truthful Latin single classification | a Latin game's hint narrates a single |
| – `hint-words.ts` — a hint's words bound to its marks | you write a hint step's sentence |
| – `hint-text.ts` — the sentences several games share | another game already says your sentence |
| – `slide-planner.ts` — sliding-permutation search | the player slides tiles into one arrangement |
| – `piece.ts` — a piece on its cell | a cell holds a piece, is shaded or is ruled out |
| – `hint-mark.ts` — the ring and the outline | you draw a hint's marks on cells |
| – `hatch.ts` — the stripes on the line a step names | a hint sentence names a row or column |
| – `hint-ordinal.ts` — where a cell falls in a forced chain | a hint step walks a chain of cells |
| – `hint-refusal.ts` — what a hint says when it will not give one | your `hint` returns an error |
| – `solve-failure.ts` — what Solve says when it will not solve | your `solve` returns an error |
| Input | you write `interpretMove` or the keypad |
| – `pointer.ts` — button codes and cursor helpers | you read a button, a digit or the cursor |
| – `key-labels.ts` — on-screen keypad builders | your game has an on-screen keypad |
| Game IDs: descs and params | you write a desc, a params string or the Custom dialog |
| – `run-length.ts` — the letter-run desc grammar | your desc is value characters and blank runs |
| – `wall-runs.ts` — a region layout as a run-length wall list | your desc ships regions as walls |
| – `dot-runs.ts` — blanks and dots of two kinds | your desc is sparse marks of two kinds |
| – `desc-alphabet.ts` — one character per small number | a desc character stands for a number over nine |
| – `desc-error.ts` — why a game ID will not load | you write `parseDesc`, or refuse a desc |
| – `desc-reader.ts` — the cursor a desc parser drives | you read a desc token by token |
| – `decimal.ts` — decimal digits in a game ID | a desc or params string holds a number |
| – `params-codec.ts` — the declared params codec | you write `encodeParams` and `decodeParams` |
| – `params.ts` — param-string decoding + config helpers | you declare `paramConfig` or validate params |
| – `param-label.ts` — the one label of a params set | you need a preset's or a board's name |
| – `preset-grid.ts` — the conventional preset menu | you write `presets()` |
| – `ruleset.ts` — the puzzles a game plays on one board | your game plays more than one puzzle |
| – `only.ts` — what one setting leaves of the others | one setting restricts another |
| – `config-narrowing.ts` — what a form offers of a narrowed field | a form or test reads a narrowed field |
| – `modifier.ts` — the settings that change one rule | a setting adds, removes or bounds a rule |
| – `param-help.ts` — the generated Parameters section | you write a help page's Parameters |
| Rendering and affordance helpers | you are writing `redraw` |
| – `overlay-sidecar.ts` — the overlay diff-key rule as a type | a tile shows a hint or a mistake |
| – `candidate-bits.ts` — one candidate encoding, range-checked | you hold candidates as a bit mask |
| – `draw.ts` — shared drawing primitives | you draw a bevel, outline, cursor, glyph or arrow |
| – `completion-status.ts` — the status bar's completion words | you write `statusbarText` |
| – `win-wave.ts` — the win flash | you draw the win flash |
| – `pencil-indicator.ts` — the pencil-mode indicator | your game has a pencil mode |
| – `pencil-prefs.ts` — shared pencil `GamePref` declarations | a notes game declares preferences |
| – `color/` — the palette | you need a color |
| RNG and persistence | you draw random numbers or dispatch on a move |
| – `random/` — the bit-identical RNG | a generator draws a random number |
| – `assert-never.ts` — refusing a move the dispatch has no arm for | a chain over move types ends |
| – The contract, and the engine's own modules | an engine file has no entry of its own |
| Testing harness | a test needs a draw record, a dealt board or a hint pin |

## Sharing a helper

Check here before writing a union-find, a sorted collection, a loop finder
or a random partition. **A game-local helper that gains a second consumer is
promoted to `src/engine/`.** A helper with one consumer stays in its game:
the rule is a trigger, not a mandate to abstract ahead of need.

### What decides whether something is shared

A shared helper is right when the thing shared is a fact. A module owning a
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

A duplication tool counts text. Read what it counted, because three
different things look the same to it:

- **The `Game` object literal and the import blocks.** Every game implements
  one interface and imports the same helpers, so two files with the same
  members in the same order are the contract. It is never the finding, and
  it is usually the largest "clone" between two games.
- **Real duplication of a shared mechanic**, which is what an engine module
  is extracted from.
- **Parallel but independent logic**, which stays where it is.

### Where a promoted helper lands

Put a promoted helper flat in `src/engine/`, unless it joins a family that
already has a directory (`ls -d src/engine/*/`).

- **A subdirectory is for members with no readership apart from each
  other**, as in `engine/grid/` and `engine/color/`. Ask whether a reader
  looking for the file would know to look there without being told; if the
  answer needs explaining, leave the file flat.
- **`complexity/useLiteralKeys` is off in `biome.json` on purpose**: it
  inverts tsconfig's `noPropertyAccessFromIndexSignature`, under which
  bracket access marks a key as dynamic. When adding a lint rule, check that
  it does not invert a compiler flag.

### Byte-match critical entries

Where an entry says *byte-match critical*, keep the helper's observable
order in any change that means to deal the same boards: its draw order, its
comparator, its emission order. These are RNG-faithful ports whose order
shows in generated descs, and a frozen differential fails when one moves
([`testing.md`](./testing.md) § "The frozen differentials"). What is held,
and for whom, is § "`random/` — the bit-identical RNG".

## Board structure and geometry

### `dsf.ts` — union-find

Reach for `Dsf` for any partition or connectivity question, and `FlipDsf`
when a forcing chain needs to know whether two members have the same or the
opposite sense. Exemplars: `galaxies/state.ts`, and `dominosa/solver.ts`
for `FlipDsf`.

- **For a class's minimal element, precompute a `minimal[i]` map after all
  merges** (`buildMinimal` in `keen/state.ts`). A game that reads one while
  still merging makes its dsf with `Dsf.withMinimal(n)` and asks
  `minimal(i)`. Neither changes the canonical root.
- **Do not "fix" an upstream loop that uses the canonical root as an index
  bound** and not as an identity to compare. Which members the scan skips
  decides which boards a solver-gated generator emits (Rome's naked pairs).
  Byte-match critical: `Dsf` keeps `dsf.c`'s tie-break.

### `border-grid.ts` — the shared border-marking mechanic

Reach for it when the player marks each edge between cells as wall, not a
wall, or undecided. It gives the edge bits, the tile-size geometry and the
input (`borderGridVerbs`, `borderGridGeometry`, `edgeEdits`). The game
keeps its clues, solver, generator, completion test and its own `Move`: the
shared code reports which edge and which cycle and the game's `toMove`
wraps it, so no two save formats are coupled. Exemplar: `palisade/index.ts`.

### `border-grid-render.ts` — that mechanic's look

Reach for it to draw a border-grid game's tile: the error model, the
half-grid cursor, the edges, the tile skeleton and the board geometry. The
game supplies its palette indices as `BorderGridColors` and a `drawContent`
callback for the middle of the tile. `hintTileBits` folds a hint step into
the tile flags; the marks are drawn when the palette names `hintEdge` and
`hintEvidence`. Exemplar: `palisade/render.ts`.

### `border-grid-hint.ts` — that mechanic's explained hint

Reach for it in any border-grid game's hint: the `BorderHint` highlight,
the journey one firing becomes and the keep-track verdict on a click. The
game hands in its forced edges, its sentence per leg and the squares it
cites, and wraps the edits in its own `Move`. `EDGE` keys an edge the same
from either side; a later leg's sentence is `edgeContinuation` in
`hint-text.ts`. The deduction and the sentences stay the game's. Exemplar:
`separate/index.ts`.

### `target-verb.ts` — aim at a target, apply a verb

Reach for it in any game whose buttons each do one thing to what they land
on, the click half of a drag game included. The game declares a geometry
and a verb per button, each returning the game's own `Move`.
`interpretTargetVerbs` owns the parking, the reveal-first select, Enter and
Space, and `controlsMarkdown` writes the help's Controls paragraph from the
same declaration. `squareGrid` is the common geometry; `letterKey`,
`digitKey` and `ERASE_KEYS` the common keys. A drag game's own arms call
`pressTarget` and `buttonVerb`; a hint's click steps come from `verbClicks`
(`hints.md` § "Every step is a gesture"). `target-verb.test.ts` holds a
declaring game's keys to its buttons. Adopting it: [`input.md`](./input.md)
§ "Targets and verbs".

### `ui-snapshot.ts` — a `Ui` kept to be put back

A game calls neither `copyUi` nor `restoreUi`; the midend does, for a
canceled press ([`input.md`](./input.md) § "A canceled press is the
engine's"). Keep the `Ui` to what the copy can take: plain objects, arrays,
typed arrays, `Map`, `Set`, and classes whose content is their own fields.

### `same-value.ts` — whether two values hold the same thing

A game calls neither `sameValue` nor `sameShown`; the midend does, to keep
a move that changed nothing out of the history and to see whether an input
changed what the `Ui` shows ([`mechanics.md`](./mechanics.md) §
"interpretMove and UI_UPDATE"). Keep the state and the `Ui` to the kinds
`copyUi` takes; anything else throws by name.

### `note-taking-cell.ts` — the shared highlight-and-type mechanic

Reach for it in every game that carries `ui.pencilMode` and
`ui.cursorFromKeyboard`. The game keeps its coordinates, its symbols and its
own `Move`. Exemplar: `keen/index.ts`.

- **Input.** `pressNoteTakingCell` resolves a press against the game's
  `canEnter` and `canMark` and reports `"moved"`, `"unmoved"` or `null`.
  `releaseHighlightAfterEntry` and `noOpEntryResult` are what an entry does
  to the highlight, `toggleNoteTakingMode` the mode switch, and
  `noteEntryGesture` the taps and keys of a hint step's entries.
- **A press that might be a drag changes nothing about the selection.** The
  release resolves it: `tapNoteTakingCell` when it committed nothing,
  `dragEnteredNoteTakingCell` when it committed a move. The press must not
  move or hide the highlight, because the release needs what it was on.
  `TapTarget.onSelection` is the one override, for a selection that is not
  a cell. `select-or-drag.test.ts` drives every member's press and release.
- **The picture is `drawCellBackground`.** Pack
  `winHighlight(flash.win(p)) ?? cellHighlight(ui, x, y)` into the tile key
  as the `CellHighlight`; `highlightFill` is the fill alone, and the wash is
  `highlightWash` of the board's background.
  `note-taking-cell-render.test.ts` holds every member to it. See
  [`rendering.md`](./rendering.md) § "The note-taking cell's picture".
- **Offer both pencil preferences, both on by default**, so a gesture does
  the same thing in every member. `note-taking-cell.test.ts` holds both.

### `grid/index.ts` — planar-grid geometry (upstream `grid.c`)

Reach for it when the board is a tiling: `Grid`, `GridFace`, `GridEdge` and
`GridDot` with full incidence, every tiling under `tilings/`,
`gridComputeSize`, `gridValidateParams`, `gridNearestEdge`,
`gridFindIncenter`, `gridTrimVigorously` and the
`gridNewDesc`/`gridValidateDesc` round trip. **Import the barrel, not the
parts.** Exemplar: `loopy/state.ts`.

`gridNewDesc` is the only function that consumes randomness; `gridNew` is a
pure function of `(type, width, height, desc)`. A new tiling follows four
rules:

- **Integer arithmetic only.** Dots are deduplicated by exact coordinate
  equality, so a fraction splits a shared corner into two dots. Use
  `Math.trunc` where the reference divided integers.
- **Normalize negative zero once, where exact arithmetic becomes pixels.**
  A negative factor times a zero index is `-0`, so expect it wherever a
  basis vector is signed. It passes `===` and fails `Object.is`, and a
  structural differential with it.
- **Emission order is observable.** Dot indices come from first encounter.
  Verify with `grid-differential.test.ts` and
  `grid-aperiodic-differential.test.ts`, never by eye.
- **A random draw is an observable side effect.** The aperiodic tilings
  draw even when the candidate list has one entry; skipping that draw gives
  a different, plausible tiling and nothing fails. Do not correct a weight
  constant that looks wrong either.

### `geometry.ts` — cell ↔ pixel

Start `interpretMove` here: `coord` and `fromCoord` map between cells and
pixels, with the game's border passed in. `fromCoord` floors, which is
right for a pixel in the border.

**Read a press and its release with one function.** A floor or truncation
of a division by the tile size outside this module is a call to `fromCoord`
or an entry in `coord-conversion.test.ts`'s ledger, and the site says what
it does that the helper would not.

### `findloop.ts` — loop/bridge finding

Reach for it to highlight loop errors as the player plays: it finds a
graph's bridges, and an edge that is not a bridge is on a loop. A neighbor
reported twice is two edges, which are a loop of two. Exemplar:
`slant/state.ts`.

### `n-times-root-k.ts` — exact `round(n · √k)`

Use it where an aperiodic tiling's exact irrational arithmetic becomes
integer pixels. **Do not substitute `Math.round(n * Math.sqrt(k))`**: a
disagreement of one unit splits a shared corner into two dots.

## Ordered collections and small leaves

### `sorted-multiset.ts` — `tree234`, idiomatically

Reach for `SortedMultiset` where upstream uses a `tree234` as a sorted set:
`add` for `add234`, `delete` for `del234` (a no-op when absent), `removeAt`
for `delpos234` (an index into sorted order), `size` for `count234`.
Exemplar: `pegs/generator.ts`.

- **Port the comparator exactly.** `removeAt(randomUpto(set.size))` indexes
  the sorted order, so the comparator is byte-match critical.
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
the game's. Byte-match critical wherever the shuffled order feeds a desc.
Exemplar: `fifteen/state.ts`.

### `combi/` — r-of-n combination iterator

Enumerates r-of-n combinations in lexicographic order. Exemplar:
`lightup/solver.ts`.

## Generation

### `retry-limit.ts` — a bound on generate-until-it-works

**Bound every synchronous retry loop** with `retryLimit(label)`: an
unbounded loop that never succeeds owns its thread, and no test timeout
fires. **A generator passes it no count.** The app's deal arms one deadline
(`underDealDeadline`) and a direct call counts `MAX_REGENERATE` tries; pass
a count only where the number is part of the algorithm. Exhaustion throws
and returns no fallback, so a bound can end a deal and never choose its
board. A legal but rare seed wants a recovery path with the cap outside it;
the header says when. `retry-bound.test.ts` scans for the loops that owe a
bound ([`solver-and-generator.md`](./solver-and-generator.md) § "Every retry
loop is bounded"). Exemplar: `src/skeleton/grid/generator.ts`.

### `divvy.ts` — random equal-omino partition

`divvyRectangle` divides a rectangle into connected regions of equal size.
Byte-match critical. Exemplar: `palisade/generator.ts`.

### `redivide.ts` — divide a few regions of a partition again

Reach for it in a generator that mends a division where it fails and does
not draw a whole new one
([`solver-and-generator.md`](./solver-and-generator.md) § "Unlucky,
impossible, and load-bearing validation"). `redivide` divides the cells of
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
`regionNumbers` reads any division as a number for each cell. Which walk
suits which rule is
[`solver-and-generator.md`](./solver-and-generator.md) § "A division into
regions is the engine's". Byte-match critical: `mergeNeighbors` and
`growFromSeeds` are upstream's draws, which Rome's and Map's fixtures pin.
Exemplars: `rome/generator.ts`, `map/generator.ts`, `seismic/generator.ts`.

### `laydomino.ts` — random domino tiling

`dominoLayout(w, h, rs)` is a random tiling by 2×1 dominoes. Byte-match
critical. Exemplar: `dominosa/generator.ts`.

### `symmetric-blacks.ts` — symmetric black-square placement

`placeSymmetricBlacks`, with the `SYMM_*` values and their Custom-dialog
labels. It works through callbacks over the caller's board, and **the
caller clears its board first**. Byte-match critical, the `SYMM_ROT4`
odd-center `<=` included. Exemplar: `lightup/generator.ts`.

### `loopgen.ts` — random loop generation

`generateLoop(g, board, rng, bias?)` draws a random loop over a `Grid`.
Byte-match critical; its header records the draw order. A `bias` callback's
only observable effect is its return value, so one that recomputes from
scratch on each call is byte-identical to upstream's incremental one and
far simpler. Exemplar: `pearl/generator.ts`.

### `wires.ts` — the Net/Netslide wire model

Reach for it for tiles that carry wires: the direction algebra, the wire
desc codec with its barriers, the spanning-tree grower, barrier placement
and the `computeActive` power flood. `wireDistance`, a tile's distance from
the source along the wires, is the position to hand the win flash. **Only
the bits `0x0F` are wires; each game owns the high bits**, and the header's
"0x10 trap" says how they collide. Exemplar: `net/state.ts`.

### `obfuscate.ts` — solution masking in descs

Reach for it when a desc carries the answer: a reversible masking, with
`bin2hex` and `hex2bin`, so a shared game ID does not spell the answer out.
Exemplar: `mines/state.ts`.

### `latin.ts` — Latin-square solver *and* generator

`latinSolver`, `latinGenerate` and `latinGenerateRect`. Its bipartite
`matching` is usable outside the family: pass `rs` for a random matching in
generation and leave it out for a deterministic existence check
(`tents/`). The cube's index space, `usersolvers`, the `seed` hook, `cubeOut`
and the family's generator shapes are in
[`solver-and-generator.md`](./solver-and-generator.md). Exemplar:
`keen/solver.ts`.

## Solving and deduction

### `deduction-fixpoint.ts` — the shared technique ladder

Reach for `runDeductionFixpoint({ techniques, maxTier, budget, firings,
settled })` when the solver is an ordered list of techniques run until none
fires. Exemplar: `src/skeleton/grid/solver.ts`.

- **A technique is a declaration, `{ id, tier, run }`**, `id` and `tier`
  both required. The grade is the highest tier that fired, and the cap
  excludes by tier, never by position in the array.
- **`settled` means "nothing left for the ladder to do", not "solved".**
- **A technique that is only sometimes available guards itself in `run`.**
  There is no `when` predicate.
- **`firings` is a tally the caller supplies**, counted by `id`, and it is
  how a rung's reachability is observed. Leave it out on the generator's
  path and the runner allocates nothing.
- **`singleFirings` is the recording path's driver**: the same pass,
  stopped after each firing, returning the technique that fired or `null`,
  with a sticky `impossible()` and a required budget. It returns every
  firing; hiding one is `deduceHintPlan`'s `showable`. See
  [`hints.md`](./hints.md) § "Recording the deduction".
- **Read the header's no-gos before adopting it or "fixing" a game that
  does not use it**, and re-derive that list when the contract changes. The
  bookkeeping around a ladder is the game's and often decides which boards
  exist ([`solver-and-generator.md`](./solver-and-generator.md) § "Where
  the fixpoint does not fit").
- **Certify an adoption with a ladder census** (`testing/ladder-census.ts`),
  not with the game's differential alone
  ([`solver-and-generator.md`](./solver-and-generator.md) § "Proving an
  adoption: the fixtures are not enough").
- **Find the callers with a comment-stripped scan for
  `runDeductionFixpoint` under `src/games/`.** A header explaining why a
  game does not use the runner matches the name.

### `step-budget.ts` — the fixpoint non-termination guard

Pass a `StepBudget` to every fixpoint on the hint or recording path. Ticked
once per iteration, it turns a rule that reports progress without changing
the board from a hang into a labeled failure, which names the techniques by
firing count when ticked through `runDeductionFixpoint`. Generators run
without one.

### `difficulty.ts` — the cross-game difficulty contract

Reach for it in any tiered game. Declaring: [`mechanics.md`](./mechanics.md);
grading: [`solver-and-generator.md`](./solver-and-generator.md).

- **`difficultyItem`** is the Custom dialog's difficulty field; declare it
  and write no field of your own. `tierOf`, `withTier` and `tierNameOf`
  read it.
- **`DifficultyContract`** is a solve-at-cap verdict. Declaring it enrolls
  the game in `difficulty-contract.test.ts`, cap-monotonicity above all: a
  game that breaks it fails Check & Save on its easier boards.
- **`permitsSearch`** asks whether the params request `Unreasonable`. Use
  it and do not compare tier names yourself.
- **`noSuchTier(what, tier)`** is the sentence `validateParams` returns for
  a size none of whose boards needs the tier
  ([`solver-and-generator.md`](./solver-and-generator.md) § "A size that
  cannot carry a tier"). **`tooRareToDeal(what, tier)`** is the sentence for
  a tier whose first board is a longer wait than a player would sit
  through; a tier that only takes seconds is dealt, with nothing written.
- A game never calls `dealGaveUp`, nor `generate` and `dealBoard` in
  [`deal.ts`](../src/engine/deal.ts): they are the midend's and the deal
  worker's.

### `hint-finishes.ts` — whether deduction finishes a board

`nothingToDeduce` is `Game.finishesByDeduction` for an untiered game that
moves, searches or guesses. `hintFinishes(game, state)` follows the hint a
whole plan at a time to a solved board; a deductive game asks it at the
tier beneath Unreasonable
([`solver-and-generator.md`](./solver-and-generator.md) § "Giving a
deductive game an Unreasonable tier").

### `answer-search.ts` — a deductive game's Unreasonable tier

Reach for it in a deductive game with the two tiers Easy and Unreasonable
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
- `DIFF_EASY`, `DIFF_UNREASONABLE`, `searchTierItem` and
  `searchTierSegment`: the tiers, their Custom field and their params
  segment.
- **Write no retry loop for the tier.** `dealUnreasonable({ label, draw,
  strip?, deduced, answer })` owns the loop, its bound and the test that
  keeps a board, within `DEALING_BUDGET`. `difficulty-contract.test.ts`
  holds every game with a `searchTierContract` to it.

### `sections.ts` — contract sections and the draft label

`sectionState(game, section)` reads whether `hint`, `findMistakes`, `solve`
or `transposeParams` is implemented, not applicable (with the reason from
`Game.notApplicable`) or absent. `SQUARE_GRID` is the shared
`transposeParams` reason of a game whose grid has one side. `draftSections`
and `notApplicableMarkdown` build the home screen's "Draft" label and the
help's "Not in this game" section. **A guard that would excuse a game for
lacking a section reads `sectionState`** and keeps no ledger. See
[`mechanics.md`](./mechanics.md) § "Contract sections, and what makes a
draft".

### `deduction-record.ts` — the recorded-firing shape

`DeductionRecord` and `DeductionRecorder` are the seam between a game's
recording deduction pass and the shared candidate-hint mechanics. `reason`
is `unknown`, so each game attaches its own. `group` ties the records of
one firing together, so one firing becomes one hint step. A reason's
`reads` names the cells the deduction reads beyond what the game's words
outline, and the candidate walk makes them premise. Exemplar:
`rome/solver.ts`.

### `firing-replay.ts` — the premise audit

Test-only, and idle unless `auditRecordedPremises` runs: it checks that
each recorded firing the candidate walk offers still follows once every
cell outside its premise is returned to the recording's start. A solver
joins through a `ReplayAdapter`. `latinSolver` builds one for every Latin
game; a game with its own solver writes one (`solo/solver.ts`). Guard:
`firing-replay.test.ts`. See
[`hints-candidates.md`](./hints-candidates.md) § "A premise names everything
its deduction reads".

## Hint machinery

How to write a hint is [`hints.md`](./hints.md). These entries are the
inventory.

### `hint-plan.ts` — the plan-accumulation loop

`deduceHintPlan` is the loop "while unfinished, ask for the next forced
firing, apply it, record it". The rung order, the reason type and the
sentences stay the game's. It takes a `planCap`, which bounds what the
player is shown, and a `StepBudget`, which bounds non-termination.
Exemplar: `src/skeleton/grid/hint.ts`.

**Hide with `showable(board, firing)` a sound deduction that lands where
the player's board already decides, or where the game would refuse the
move.** A hidden firing still advances the working board, and the cap
counts shown steps. Hide only what the player can already see, because a
later step may cite it. A test reads the result's `hidden` count to prove
it saw one. See [`hints.md`](./hints.md) § "Show only what the board does
not already say".

### `hint-track.ts` — following a step that asks for several things

`trackTargets` is the `hintKeepTrack` verdict for a step that decides
several squares or edges, judged by what the player's move changed and not
by its ops. `changedCells` is the diff for a board with one value per cell;
a game whose elements are edges, links or flags writes its own. Exemplar:
`tents/hint.ts`. See [`hints-marks.md`](./hints-marks.md) § "Group one
firing into one step".

### `hint-gesture.ts` — how the pointer makes a hint step

Every hinted game writes `hintGesture`, returning a `PointerAction` built
with `click`, `drag` or `key`. The midend plays a step by sending the
gesture through `interpretMove` and judging the result with
`hintKeepTrack`; it never applies the step's move. A `key` must be one the
game's keypad offers, the Marks key, or mark-all (`markAllPress`). See
[`hints.md`](./hints.md) § "Every step is a gesture".

### `apart-by-position.ts` — two things of one name, told apart

`apartByPosition(things, at, name)` names each thing a sentence points at
when two would get the same words ("the upper 3", "the lower 3"). Build it
over every such thing the one sentence names. Exemplar:
`mosaic/hint-text.ts`. See [`hints.md`](./hints.md) § "Name a square by its
value".

### `rival-judging.ts` — what a searched move's rivals let it say

`judgeRivals(rivals, allowance, judge)`: the game judges each rival of the
move its hint offers as finishing, lost or unsettled, within one allowance
counted in positions, and gets back the verdicts and the claim they allow,
each with the relation its sentence must use. **The relation that says "so"
over a searched move's rivals (`RivalsLost`) is made only here.** A game
whose rivals are ruled out by a deduction or a rule judges them through it
too. The judge, the search behind it and what to say when nothing is
settled stay the game's. Exemplar: `pegs/hint.ts`. See
[`hints-search.md`](./hints-search.md) § "Judge the rivals of a searched move".

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

### `candidate-hint.ts` — candidate-elimination plan plumbing

The pure helpers of a pencil-notes game's hint: `availableFirings`,
`emitObviousCleanStep`, `Reach` and `regionReach` (what a placed value
rules out), the move dialect `CandidateMoveAdapter`, and
`keepCandidateHintTrack` and `refreshCandidateHintStep`. A board scan reads
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

### `candidate-plan.ts` — the candidate-elimination plan walk

`runCandidatePlan` is a pencil-notes game's whole `buildSteps` walk: the
singles, the recorded strikes and placements as rungs around the game's
own, populate and the obvious clean, a placement's cull, and each next
firing taken through a `HintFrontier`. A rung returns firings as legs and
the walk builds every step. The game supplies its recording solver,
regions, words and strike-split axis. See
[`hints-candidates.md`](./hints-candidates.md) § "What every game does".

- **Its `reading` is the player's.** Under the implicit one there is no
  populate, and a firing first writes the notes of every note-less cell its
  premise reads.
- **A plan with a `setUp` of its own walks the populate reading alone** and
  is typed so (`PlanRung<Reason, "populate">`, `LATIN_POPULATE_RUNGS`). See
  [`hints.md`](./hints.md) § "Name the rung a step speaks".
- **A plain row/column square calls `runLatinCandidatePlan`** and supplies
  its solver, rungs and words alone. A game whose singles narrate otherwise
  fails to type-check against it and calls `runCandidatePlan`
  (`solo/index.ts`). See [`hints-candidates.md`](./hints-candidates.md) §
  "The row/column preset".

### `hint-frontier.ts` — which available firing a plan takes next

`HintFrontier` takes, among the firings a candidate plan could make at
once, the one that continues from what the plan's latest steps wrote, with
the ladder order as the tiebreak. `runCandidatePlan` drives it for a grid
game, keyed by `gridKey(w, h)`. A game whose steps act on something other
than grid cells keys it on that and drives it from its own plan
(`map/hint.ts`). See [`hints-candidates.md`](./hints-candidates.md) §
"Continue from the last step" and `hints-candidates.md` § "A graph, not a
grid (Map)".

### `latin-hint.ts` — truthful Latin single classification

It re-derives from the working board whether a recorded `single` is naked
or hidden, so a game never says every other number is ruled out of a cell
that visibly holds several candidates. It throws on a placement that is
neither, which is a strike the plan skipped. `availablePlacements` lists
the recorded placements a plan could take now, and `forcingChainArea`
numbers a chain's cells. The sentences are `hint-text.ts`'s.

### `hint-words.ts` — a hint's words bound to its marks

Write every step's words through it. Exemplar:
`src/skeleton/grid/hint-text.ts`.

- **The three mark roles** are ring (what the step decides), outline (what
  it reasons from) and stripes (the line or region the sentence names). The
  element kinds a mark is drawn on are `CELL`, `NOTE` and a mechanic's own,
  such as `EDGE`.
- **`phrase` composes a `Narration`** from literal words and `mark.this`,
  `mark.the`, `mark.paren` and `mark.as` references. A literal that says
  "this", "these" or a role's adjective throws.
- **A step's words are a `Sentence`**, made only by `sentence(said)`, by
  `so({ look, move })`, or by `unshaped(words, kind)` for a declared
  exception. `mark.move(words)` rings the step's own move (`MOVE`). See
  [`hints.md`](./hints.md) § "A sentence has parts".
- **`stepMarks(step)` is what the renderer paints from**, and
  `testing/hint-binding.ts` holds the rendered frame to the words.
  `legendMarkdown` is the help's list of marks. See
  [`hints.md`](./hints.md) § "Bind the words to the marks".

### `hint-text.ts` — the sentences several games share

The engine's half of the hint-text convention; a game's own sentences are
its `hint-text.ts`. Nothing here decides which sentence fires. See
[`hints.md`](./hints.md) § "The sentences live in one file per game".

- `narrateLatinReason` and `latinPremise`, for the row/column games
  (normative: `engine-candidate-hints`, "A shared narrator for generic Latin
  placements and strike premises").
- `forcingChainPremise`, and `confinedPremise` for one value confined
  across several lines.
- `populateText`, `cleanObviousText`, the `Premise` a strike's words are,
  the `Conclusions` the walk ends it with (`candidateConclusions`) and the
  `LatinVocab` a value is spoken in.
- `HINT_SETTING_UP` for the sliding-tile games, and the list joiners
  `joinNums` and `joinWith`.

### `slide-planner.ts` — sliding-permutation search

Reach for it when the player slides tiles toward one arrangement. It
searches the board as the player sees it, one integer per cell, so two
boards that show the same picture are one position. **The exact search runs
on every board: a game supplies its budget and never when to spend it.**
Gating it makes a hint cycle. `deepSearch` is the last resort past the
exact search's reach, and it may reach exactly one ply further than the
ungated search, which is what makes gating it safe. Exemplars:
`sixteen/index.ts` with `deepSearch`, `netslide/hint.ts` without. See
`hints-search.md` § "Sliding-permutation games".

### `piece.ts` — a piece on its cell

Take a piece's shape and name by index, and name neither a hue nor a shape
of your own ([`rendering.md`](./rendering.md) § "What a board looks like:
pieces on a quiet surface"). `drawPiece` draws what a cell holds, with
`grown` for one being placed or taken away. `TWO_SHAPES` goes with `TWO`
and `TWO_NAMES` (`colors.ts`), and `expandPair` is what a help page's
`{{pair:0}}` becomes. `SHADED_SHAPE`, `SHADED_NAME` and `UNSHADED_NAME` are
the same for a game whose cells are shaded or not. **`drawRuledOutCross` is
every game's mark for a cell ruled out**, a game with no pieces included.
Exemplar: `src/skeleton/grid/render.ts`.

### `hint-mark.ts` — the ring and the outline

Draw a hint's two cell marks with it: a ring around the cell the deduction
acts on, an outline around the region it reasons from. Both replace the
cell's border, never its background: no fill behind content stays readable
in every hue and both schemes. Exemplar: `src/skeleton/grid/render.ts`.

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

The third board mark: translucent diagonal bands over the squares, and the
clue slots, of the row or column a step's sentence names.
`GameDrawing.drawHatch` draws them from `hatchBands`, laid on the canvas
and not the rect, so tiles hatched one at a time join into one strip.
**Draw it after a square's background and before its content**, with
`hatchPeriod(tileSize)` for the pitch. `puzzle/hatch-contrast.test.ts`
holds the opacity in both schemes. When to use it:
[`hints-marks.md`](./hints-marks.md) § "Hatch the line the sentence names".

### `hint-ordinal.ts` — where a cell falls in a forced chain

The small corner number on each cell of a chain a step walks. **Number a
chain; do not draw arrows.** An arrow claims that this cell forces that
one, which is not true of every link; an ordinal claims only the order. It
stays inside one tile, so it rides the `OverlaySidecar` diff. Exemplar:
`clusters/render.ts`.

### `hint-refusal.ts` — what a hint says when it will not give one

Return one of its constants from a refusing `hint`: `HintResult`'s error is
`HintRefusal`, the union of their literal types, so one situation says one
thing in every game.

- **For a dead end only one puzzle has, use `puzzleDeadEnd(sentence)`**, or
  `markedDeadEnd(phrase…)` when the words mark the cause.
  `hint-refusal.test.ts` fails a sentence two games pass through either.
- **Every refusal says whether it is a dead end** (`isDeadEnd`; its advice
  is to undo), and the midend's `check` refuses a save on one.
- **Do not refuse a finished board or a wrong one.** The midend says
  `ALREADY_SOLVED` and `FIX_MISTAKES_FIRST` before it asks the game, and
  `FIX_MISTAKES_FIRST` is not a `HintRefusal`.
- **A game says `ALREADY_SOLVED` only where its status would not call a
  finished board solved** (a sliding game's sorted board at move 0), and
  `GAME_OVER` on a lost board that takes no more moves.

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

## Input

How to write input is [`input.md`](./input.md).

### `pointer.ts` — button codes and cursor helpers

Take every button, key and cursor fact from here, and **never restate one
locally**, a magic number where a named button exists included. Exemplar:
`src/skeleton/grid/index.ts`.

- **Buttons and keys.** The button constants, `stripModifiers(button)`
  (never redeclare `MOD_MASK`), `isEraseKey`, `isCancelKey` and the
  `BACKSPACE`, `DELETE` and `ESCAPE` codes.
- **`digitOf(button)`** is the digit a key stands for, or `null`, looking
  through the modifier bits. The bound and what `0` means are the game's
  and stay beside the call.
- **`numpadDirection(button)`** is the step a number-pad digit names where
  the pad is a direction pad, all eight, and `null` for 5 and 0. **Take it
  before `digitOf`**, or a diagonal both moves the cursor and types.
- **`shearedHexStep(step, y, h)`** is a square-grid step on a hexagonal
  board held as a sheared grid.
- **Every game holds the keyboard cursor as a `GridCursor` under
  `ui.cursor`**, built by
  `newCursor` and driven by `moveCursor(cursor, button, w, h, wrap?)`,
  which reveals and moves in one press and returns whether anything
  changed, with `showCursor` and `hideCursor`. `isCursorMove`,
  `cursorDelta` and `gridCursorMove` are for a traversal of the game's own
  (half-grid, lock modes, corner-skipping), which keeps its own logic.

`emittable-keys.test.ts` enforces the vocabulary from this module's export
list. `cursor-vocabulary.test.ts` fails a cursor held under any other
field, whatever it is named. `decimal.test.ts` finds a digit code in a game
by its value: a `48`, a `0x39`, a numeric `case`, a `c >= "0"`.

### `key-labels.ts` — on-screen keypad builders

Build `Game.requestKeys` from these and do not spell digit codes in a game;
`decimal.test.ts` allows one statement of them in the tree, and it is here.

- `digitKeys(n)` and `clearKey`.
- `colorKeys(n, firstColor)` for a game whose element is a color: each key
  carries a palette index (`KeyLabel.swatch`). `colorKeysZeroIsTen` is the
  same for a game that reads its tenth value off the `0` key.
- **Never list `pencilModeKey`.** `Midend.requestKeys` appends it for any
  game `takesNotes` recognizes, by a `pencil` array on the state or the
  mode flag on the `Ui`. `takesNotes` is the one definition of that
  population.

## Game IDs: descs and params

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

`writeDotRuns(s, kindAt)` and `readDotRuns(r, s, place)`: one letter per
dot, its offset the blanks before it and its case the dot's kind. The
reader takes the `DescReader`, so it sits inside a game's one parse. **It
is not `run-length.ts`'s grammar**: a letter is a run and a value, and a
chunk is 25. A grammar that writes every chunk in lowercase, or ends at the
last dot with no closing letter, is a different one again (Galaxies').
Exemplar: `unruly/state.ts`.

### `desc-alphabet.ts` — one character per small number

A value codec, one character per cell: `n2c(n)` writes digits, then
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

### `desc-error.ts` — why a game ID will not load

**Read a desc once.** Write one `parseDesc(p, desc): DescParse<T>` and have
`newState` build from `descValue(parseDesc(…))`; write no validator. A
failed parse makes `descValue` throw, `loadDesc(game, p, desc)` turns that
throw into a `DescParse<State>`, and `validateDesc` and `loadVerdict` are
verdicts of that one reading. A check that needs the parsed board belongs
inside the parse: a throw after `descValue` is a bug and propagates.
Exemplar: `src/skeleton/grid/state.ts`.

- **A parse fails with a `DescError`**, a branded string only this module
  makes: `DESC_TOO_SHORT`, `DESC_TOO_LONG`, `DESC_OUT_OF_RANGE`,
  `DESC_REPEATED`, `DESC_CONTRADICTORY`, `DESC_MALFORMED`,
  `DESC_NOT_UNIQUE`, `DESC_NOT_DEDUCIBLE`, `DESC_NO_SINGLE_ANSWER`,
  `DESC_NO_SOLUTION`, `descBadCharacter(ch)` and `descNeedsOne(noun,
  found)`. A helper on the desc path returns `DescError | null` too. A
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

### `desc-reader.ts` — the cursor a desc parser drives

`readDesc(desc, (r) => …)` runs a parser and returns its `DescParse`. The
`DescReader` reads forward: `peek()`, `peekIs(ok)`, `accept(s)`,
`expect(s)`, `char(ok?)`, `int(lo, hi)`, `rest()`, `end()`, `fail(error)`.
Each read that cannot be made fails with the right `DescError` on its own,
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

`isDigit(c)`, `digitValue(c)` (`0`–`9` or `null`) and `parseLeadingInt(s,
pos)`, the maximal digit run at `pos` as `{ value, next }`: `0` with no
advance on a non-digit, which is how a caller tells "no number here" from
"zero".

- **The bound and what an out-of-range value means stay beside the call.**
- **Write a single digit as `String(n)`**; anything wider is one of the
  alphabets in `desc-alphabet.ts`. Hex is `Number.parseInt(c, 16)`.
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

- **Call `paramsError` wherever you would have asked
  `game.validateParams`.** It is the one validity check: every item's
  `bounds` and choice list, then the game's optional `validateParams`.
- `dimensionParamConfig`, `numberItem`, `squareSize` and `parseConfigInt`
  are the declarative helpers behind `Game.paramConfig`.
- `parseDimensions` reads a leading `WxH` or a bare square size.
- **Write a float param with `formatG` and read it with `atof`.** A
  full-precision float reads back as a different number, and the game ID
  stops naming its board.

### `param-label.ts` — the one label of a params set

Take every label of a params set from here, so the menu and the header
cannot name one board two ways. `describeParams(game, p)` composes it from
the items' `label` slots, and `presetMenu(game)` titles every unnamed
preset with it. A leaf's `title` is its line in the menu, without the
ruleset's name under that ruleset's heading; its `label` is the whole name.
`choiceName(config, kw, index)` is a choice's one name. Declaring:
[`mechanics.md`](./mechanics.md) § "Params are declared once, on
`paramConfig`".

### `preset-grid.ts` — the conventional preset menu

`presetGrid(paramConfig, boards, { tiers?, variants? })` is a game's
`presets()`: each board at every tier of its difficulty item, then one
board for each modifier or kind. `MENU_SECTION_LINES` is the most lines a
section holds. `preset-menu-shape.test.ts` holds the shape for every game.
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

A ruleset's `only` and a `modifierItem`'s `only` are one declaration with
three readers, none of which a game calls: `onlyError` (the refusal, for
`paramsError` and the midend), `configNarrowing` (the dialog's side) and
`onlySentences` (the help). **A declaration no form could show throws
wherever it is read**: a field that is not there or is the wrong kind, a
deciding field narrowed by another, two deciding fields that leave nothing
of a third.

### `config-narrowing.ts` — what a form offers of a narrowed field

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

## Rendering and affordance helpers

How to write a renderer is [`rendering.md`](./rendering.md).

### `overlay-sidecar.ts` — the overlay diff-key rule as a type

**Never hand-write the two-array dance** for an overlay that is not in the
packed tile value: `OverlaySidecar` owns the repack, the stale test and the
commit. Use `pack` for a hint step's highlights, `packCells` for a
`findMistakes` list, and `clear()` with `add()` for an overlay with its own
topology. A step's struck marks go in the `struck` lane, in the game's
encoding (`valueBit(n)` for a candidate), never in the word beside the
roles: a candidate mask needs every bit a cell's values reach. Exemplar:
`src/skeleton/grid/render.ts`.

### `candidate-bits.ts` — one candidate encoding, range-checked

Value `n` is bit `n` (`valueBit`), and `valuesOneTo` is the full set 1..n.
Both throw on a value out of range, where a bare shift counts mod 32 and
lands on another value's bit. **Take a game's size limit from
`MAX_CANDIDATE_VALUE`** and write no number beside it.

### `draw.ts` — shared drawing primitives

Look here before writing vertex arithmetic for a shape another game also
draws, or a text options object. `src/puzzle/bevels.test.ts` fails a bevel
in a game's frames that no call to these helpers drew.

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

When you extract a shape, check whether its dimensions were drifting too.
An extraction that leaves the emitted op order unchanged moves no render
snapshot, but an unchanged snapshot can also mean nothing was watching:
break the helper on purpose and see what fails.

### `completion-status.ts` — the status bar's completion words

**A game never writes `COMPLETED!`, `Auto-solved.` or `Auto-solver used.`**
The midend calls `completionStatus` and prefixes the words to whatever
`statusbarText` returns. An outcome that is not completion ("DEAD!",
"FAILED!") is the game's own phrase. `completion-status.test.ts` fails a
game string that says the words.

### `win-wave.ts` — the win flash

The whole win flash but for what a lit element looks like: the `Flash`
that `redraw` is handed, and the position a game gives each element.
`sweepStep(x, y)` is for a game with no route of its own, `sweepRanks` for
a board with no grid, `loopSteps` for a closed route, and `walkLoop` puts
unordered links in route order first. The rules and the table of routes:
`rendering.md` § "Animation and flash". Exemplar:
`src/skeleton/grid/render.ts`.

### `pencil-indicator.ts` — the pencil-mode indicator

The "pencil mode is on" glyph, the same in every game and in the same
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

### `pencil-prefs.ts` — shared pencil `GamePref` declarations

The factories for the sticky-pencil, keep-highlight and hint-notes
(`candidateReadingPref`) preferences, each constrained to a `Ui` field, so
a game without the field fails to compile. The auto-pencil preference takes
its sentence from the game, because its label names the game's regions.

### `color/` — the palette

Import `palette.ts`, the meanings. Beneath it `colors.ts` holds the named
colors, and beside it `palette-games.ts` the board-relative colors of
single games; `color-token.ts` is how a color is declared and combined, and
`color-mkhighlight.ts` derives a bevel's highlight and lowlight. The rules:
[`rendering.md`](./rendering.md) § "The palette: three layers, meaning
first".

## RNG and persistence

### `random/` — the bit-identical RNG

Draw every random number a generator uses from here. Two things are held
bit-identical today, both for the test suite and neither for a player: the
app hands out boards, never seeds, so changing which board a seed deals
breaks no save and no shared ID ([`doctrine.md`](./doctrine.md) §
"Upstream").

- **The stream.** A seed gives the same numbers on every run, which every
  seeded test, pinned position and `dealt` board rests on. `random.test.ts`
  holds it to the C-recorded corpus in `__fixtures__/`: correct the module,
  never the corpus.
- **A generator's draws, while a frozen differential pins that generator.**
  For that fixture every draw is an observable side effect, so a change
  that means to deal the same boards never skips, adds or reorders one. A
  change that means to deal other boards states its player-visible benefit
  and retires or re-founds the fixture ([`testing.md`](./testing.md) § "The
  frozen differentials";
  [`solver-and-generator.md`](./solver-and-generator.md) § "Divergence and
  what it costs").

### `assert-never.ts` — refusing a move the dispatch has no arm for

End a discriminated `interpretMove` or `executeMove` chain with
`assertNever`. Binding the value to `never` keeps the compile-time
exhaustiveness and adds a legible runtime refusal for a save written by
another build, whose moves are cast and not parsed. A bare `default: throw`
loses the first, because any `default` makes the function total for the
type checker. `rejectMove` is for a move type with no union to narrow.

### The contract, and the engine's own modules

What every game imports:

- `game.ts`: the `Game` contract ([`mechanics.md`](./mechanics.md)).
- `types.ts`: the shared vocabulary (`Color`, `Point`, `Rect`, config
  descriptions, change notifications).
- `registry.ts`: `registerGame`. `catalog-registry.test.ts` holds it and
  the catalog together both ways.

What no game imports:

- `midend.ts`: undo, redo, the timer, the hint and mistake lifecycles. A
  game depends on the `Game` interface, never on the midend.
- `save.ts`: the versioned save envelope.
- `index.ts`: the app's barrel.
- `fake-game.ts`: the midend test suite's minimal game.

## Testing harness

[`src/engine/testing/`](../src/engine/testing/) is the in-process harness.
How to use it is [`testing.md`](./testing.md). The modules a game's own
test or a cross-game guard reaches for:

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
- **`differential.ts`.** `describeDescDifferential` is the byte-for-byte
  desc check ([`testing.md`](./testing.md) § "The frozen differentials").
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
- **`hint-chain-pins.ts`.** The pinned position of each game whose hint
  numbers a chain, and `declaredOrder`, by which `hint-quality.test.ts`
  tells a game that owes one.
- **`ladder-census.ts`, `hint-binding.ts`.** The census that certifies a
  ladder, and the check that a rendered frame matches a step's words.
- **`slow.ts`.** `itSlow` and `describeSlow` defer a case to the slow tier
  ([`testing.md`](./testing.md) § "Running the slow tier").
- **`oklch.ts`, `polygon-yardstick.ts`.** Independent yardsticks, so a test
  cannot agree vacuously with the implementation it measures. Never import
  the implementation into them.
- **`presets.ts`, `preferred-draw-state.ts`, `win-flash.ts`.** A game's
  presets as a population, the draw state for a direct `redraw`, and a
  flash with no midend.

The rest serve one cross-game guard each (`ls src/engine/testing`).
