# Engine catalog

The shared-helper reference for game work: what lives in
[`src/engine/`](../../src/engine/), when to reach for each piece, and the traps
that have already cost real debugging. Organized by category; each entry is
deliberately short — **the module's own header comment is the authoritative
documentation**, and the entry's job is to make sure you know the module exists
before you re-roll it. Where a lesson below is not yet in the module's header,
this file is its home (and moving it into the header is a welcome tidy-up).

Companion docs: [`mechanics.md`](./mechanics.md) (the `Game` contract),
[`rendering.md`](./rendering.md) (cache/overlay discipline),
[`solver-and-generator.md`](./solver-and-generator.md) (deduction and
generation discipline), [`hints.md`](./hints.md) (hint authoring),
[`testing.md`](./testing.md) (the test tiers and harness).

## Reach for these, don't re-roll

**Leaf libraries are pulled in idiomatically and lazily.** When a game needs a
union-find, a sorted collection, a loop finder, a random omino partition —
check here first. Every helper below exists because at least two games needed
it; several exist because *five or more* games grew byte-identical private
copies before consolidation.

**The promotion rule: a game-local helper gains a second consumer → promote it
to `engine/`.** `Dsf` was Galaxies-local until Pegs; `shuffle` was
Galaxies-local until Mosaic; `obfuscate` was Guess-local until Black Box;
`divvy` was Solo-local until Palisade. Keep a genuinely single-consumer helper
local to its game — the rule is a trigger, not a mandate to pre-abstract.

**What decides whether something is shared at all**: *a shared helper is right
when the thing shared is a fact; a module owning a mechanic is right when the
thing shared is a shape; and something stays per-game only when we can say what a
game would legitimately want to do differently.* The test for the first two is
not "is this the same text" but *"would a change here have to happen in every
copy at once?"* — [`note-taking-cell.ts`](../../src/engine/note-taking-cell.ts)'s
header applies it, after [`border-grid.ts`](../../src/engine/border-grid.ts). A
fact splits cleanly from the answers beside it: which button codes are digit
keys is one fact (`digitOf` in [`pointer.ts`](../../src/engine/pointer.ts)),
and which characters are digits in a game ID is its twin
([`decimal.ts`](../../src/engine/decimal.ts)), while the bound a game puts on
them and whether `0` clears or means ten are the game's own and stay beside
each call (`share-the-digit-key-fact`, `share-the-desc-digit-fact`). "It would
touch a lot of files" measures how much an extraction is worth; it is never an
argument against one.

**Before proposing an extraction, measure — and read what the measurement is
actually counting.** A duplication tool counts *text*, and three quite different
things look identical to it. Measured across `src/games` on 2026-09-05: 982
cross-game duplicated lines, of which only some are candidates at all.

- **The `Game` object literal and the import blocks.** Every game implements one
  interface and imports the same helpers, so `id`, `defaultParams`,
  `interpretMove`, `executeMove` … in the same order in two files is the
  *contract looking like itself*. It is never the finding, and it is what the
  largest "clone" between two games usually turns out to be.
- **Real duplication of a shared mechanic**, which is what
  [`border-grid.ts`](../../src/engine/border-grid.ts) and
  [`note-taking-cell.ts`](../../src/engine/note-taking-cell.ts) came from.
- **Genuinely parallel but independent logic**, which stays put.

*Measured and declined, so it is not re-proposed:* the **three-state paint
games** (Clusters, Bricks, Sticks, Unruly, plus Tents and Pattern's
modified-arrow paint) look like a family and are not one. All six together carry
92 duplicated lines at a deliberately low threshold, and the two largest blocks
are the `Game` literal. Sticks' drag machine differs materially and has been
declined twice on its own merits (its `design.md` F7). There is no note-taking
cell hiding here; that family was the outlier, not the rule.

**Byte-match sensitivity is marked per entry.** Several helpers are
RNG-faithful ports whose draw order is observable in generated game
descriptions. The frozen differentials (see
[`testing.md`](./testing.md)) hold them in place: a refactor that changes a
draw order or a comparator changes which boards exist, and the fixtures catch
it. Where an entry says *byte-match critical*, treat its observable order as
API.

**Where a promoted helper lands: flat in `src/engine/`, unless it joins one of
the two families.** The engine is deliberately a flat namespace of independent
helpers, because a grouping that has to be argued for gets re-litigated at
every addition and files then land wherever the last argument ended. Exactly
two subdirectories exist — `engine/grid/` and `engine/color/` — and both earn
it by the same property: their members have no readership apart from each
other. The test for a third: *would a reader looking for this file know to
look there without being told?* If the answer needs the rationale explained,
leave it flat. Import shared things from where they live — re-exporting a
shared vocabulary through a game's `state.ts` recreates the private-copy
problem as re-export blocks. (Extraction criterion for borderline cases:
*would a change have to happen in both games at once?* — the border-grid
test.) One lint interaction to know when a helper touches dynamic keys:
`complexity/useLiteralKeys` is deliberately off because it inverts tsconfig's
`noPropertyAccessFromIndexSignature` — bracket access truthfully marks a key
as dynamic; when adding a lint rule, check it does not invert a compiler
flag.

## Board structure and geometry

### `dsf.ts` — union-find

`Dsf` (union-by-size) plus `FlipDsf`, the parity/flip variant (upstream
`dsf_new_flip`; each class tracks a same/opposite-sense bit) that Dominosa's
forcing-chain deduction needs. Exemplar consumers:
[`galaxies/state.ts`](../../src/games/galaxies/state.ts),
[`dominosa/solver.ts`](../../src/games/dominosa/solver.ts).

Two lessons, both byte-match surface:

- **`dsf_new_min` does not change what `dsf_canonify` returns.** The C's
  min-tracking dsf allocates a *separate* `min[]` that only `dsf_minimal`
  reads; canonify is the ordinary union-by-size root either way. A game that
  needs the minimal element (per-cage clue at its minimal cell — Keen)
  precomputes a `minimal[i]` map after all merges rather than extending the
  leaf; correct because generation never reads a minimal mid-merge, and
  byte-identical regardless of root choice because minimality is
  membership-determined. Exemplar: `buildMinimal` in
  [`keen/state.ts`](../../src/games/keen/state.ts).
- **Tell: a loop bounded by `dsf_canonify(...)` used as an index *value*
  rather than an identity to compare.** Rome's `rome_naked_pairs` skips region
  members below the canonical root — a real quirk baked into which puzzles its
  solver-gated generator emits, portable only because `Dsf` mirrors `dsf.c`'s
  tie-break. Don't "fix" such a scan to iterate the whole region.

### `border-grid.ts` — the shared border-marking mechanic

The tri-state edge grid (wall / not-a-wall / undecided) Palisade and Separate
share: edge bit vocabulary, tile-size geometry, and the input mechanic, which
is target verbs over an edge geometry (`borderGridVerbs`, `borderGridGeometry`,
`edgeEdits`). Each game keeps its own clue semantics, solver, generator,
completion test — and its own `Move` type (the shared code reports *which edge,
which cycle*, and the game's `toMove` wraps it, so two save formats aren't
coupled). Its header states the sharing test
worth reusing anywhere: not "are these the same text" but *"would a change here
have to happen in both games at once?"*

### `border-grid-render.ts` — that mechanic's look

The third layer: the error model over the two DSFs (a region over `k`, under
`k`, or a wall separating nothing), the half-grid cursor `border-grid.ts`
*moves*, the four edge rects, the tile skeleton (clip, body, content, edges,
unclip, update) and the board geometry. A game supplies its palette indices as
`BorderGridColors` and a `drawContent` callback for the middle of the tile, and
keeps its clue layer entirely — Palisade's digit, Separate's letter and region
shading. The hint's marks are the mechanic's: `hintTileBits` folds a displayed
step into the tile flags, and the tile draws its hatched region and outlined
squares under the game's content when the palette names `hintEdge` and
`hintEvidence`.

### `border-grid-hint.ts` — that mechanic's explained hint

The fourth layer, from `add-separate-hint`: the `BorderHint` highlight, the
journey one firing becomes (a leg per edge, each two-sided, the rest
`continuesPrevious`), and the keep-track verdict on a click. A game hands in its
forced edges, its sentence per leg and the squares it cites, and wraps the
edits in its own `Move`, keeping the input layer's rule that no two games' save
formats couple through the shared code. `EDGE` keys an edge the same from
either side, and `border-grid-render.ts`'s `hintTileBits` paints a leg's ringed
edges, outlined squares and striped region from its words (`stepMarks`). The
later-leg sentence is `edgeContinuation` in
`hint-text.ts`. Reach for it in any new border-grid game's hint; the deduction
and the sentence stay the game's.

Its header records **why a decline was reopened**, which is the part worth
reading before reopening another: `border-grid.ts` declined sharing "a loop over
`w*h` that reads a flag and draws a line", which is a true statement about
*generic* resemblance and simply does not reach the rendering of the mechanic
the module already owns. The decline was made when only the input had moved.

### `target-verb.ts` — aim at a target, apply a verb

The input model of the click games: the game declares a geometry (pointer to
target, cursor to target, how the arrows move) and a verb per button, each a
function returning its own `Move`; `interpretTargetVerbs` owns the parking,
the reveal-first select, Enter and Space, and `controlsMarkdown` writes the
help's Controls paragraph from the same declaration. `squareGrid` is the common
geometry, and `letterKey`, `digitKey` and `ERASE_KEYS` the common keys. A drag
game's own arms call `pressTarget` and `buttonVerb`; a hint's click steps come
from `verbClicks`, which finds each target's button by the game's
`hintKeepTrack` (`hints.md` § "Every step is a gesture"). Reach for it in any
game whose buttons each do one thing to what they land on, a drag game's click
half included; `target-verb.test.ts` holds a declaring game's keys to its buttons.
How to adopt it is [`input.md`](./input.md) § "Targets and verbs".

### `note-taking-cell.ts` — the shared highlight-and-type mechanic

*Highlight a cell, type a value into it, pencil candidate marks in it* — the
pointer half and the picture — shared by every game that carries `ui.pencilMode`
and `ui.cursorFromKeyboard`. `pressNoteTakingCell` resolves a left or right press
against two predicates the game supplies — `canEnter` and `canMark` — and
reports `"moved"` / `"unmoved"` / `null`; `releaseHighlightAfterEntry` and
`noOpEntryResult` are what a symbol entry does to the highlight, which is where
the two pencil preferences meet the keyboard; `toggleNoteTakingMode` is the mode
switch itself — Enter on the showing highlight, or the keypad's Marks key from
anywhere — which was eleven identical copies before `add-loopy-notation`. Same test and same line as
`border-grid.ts`: the game keeps its coordinates, its symbol vocabulary and its
own `Move`. Its header records what was evaluated and declined.

**If the press might be a drag, the gesture is the engine's too** — the module's
§ "the select-or-drag gesture". The press changes nothing about the selection;
the release resolves it, through `tapNoteTakingCell` when it committed nothing
(the same rules as a click, with the release button mapped back) or
`dragEnteredNoteTakingCell` when it committed a move (an entry the pointer made,
so the highlight follows it and goes away). `TapTarget.onSelection` is the one
override: left out, the cell is the selection and the arm answers for itself;
Map supplies its region. The press must not move or hide the highlight, because
the release needs what it was on — `select-or-drag.test.ts` drives every
member's own `interpretMove`, press and release, and holds them to one answer
for the repeat tap and one for the sticky toggle.

**The picture** is `drawCellBackground(dr, rect, highlight, wash, background)`:
the cell's rect in the wash for an entry highlight, in `background` otherwise,
and for a notes highlight a right triangle over it in the top-left corner, legs
half the rect. `cellHighlight(ui, x, y)` reads the two-bit `CellHighlight` a
game packs into its tile key, and `highlightFill` is the fill alone, for Towers'
3D faces. The wash is `highlightWash` of the board's background at whatever
palette index the game keeps it; `note-taking-cell-render.test.ts` holds every
member to that color, to the triangle, and to repainting the cell when the
highlight leaves, excusing only a member whose selection is not a cell (Map,
which draws the pair as a band around a region). A game whose press starts a
drag (Rome, Map) joins through its tap. See [rendering](./rendering.md) § "The
note-taking cell's picture".

**Both pencil preferences are on by default across the family, and every member
offers both**, so a player who moves between two of these games meets the same
gesture doing the same thing. That was not true until `unify-the-note-taking-cell`:
five games kept the mouse highlight through a pencil mark with no preference at
all, and six offered the preference defaulted *off*. Guarded in
`note-taking-cell.test.ts` over the derived population, both halves — the
default and the preference's existence.

### `grid/index.ts` — planar-grid geometry (upstream `grid.c`)

`Grid`/`GridFace`/`GridEdge`/`GridDot` with full reference incidence (an edge
holds its two dots + two faces; a null face is the infinite exterior; faces and
dots carry clockwise rings), all 18 tilings (14 periodic + Penrose P2/P3, hats,
spectres under `tilings/`), plus `gridComputeSize`, `gridValidateParams`,
`gridNearestEdge`, `gridFindIncenter`, `gridTrimVigorously` and the
`gridNewDesc`/`gridValidateDesc` round-trip. **Import the barrel, not the
parts.** Consumers: Loopy (all 18 tilings), Pearl.

**The contract worth knowing before using any of it: `gridNewDesc` is the only
function in the module that consumes randomness; `gridNew` is a pure
deterministic function of `(type, width, height, desc)`.** That split lets
geometry and RNG fidelity be checked independently — a red differential means
"wrong geometry" or "wrong draw order", never "somewhere in 2,400 lines".

Four rules a new tiling must respect, each already paid for in debugging:

- **Integer arithmetic only.** Dot dedup is by *exact* coordinate equality, so
  a fractional coordinate silently splits a shared corner into two dots. Use
  `Math.trunc`, never bare `/`, where the reference used integer division.
- **Watch for negative zero.** A negative scale factor times a zero index
  gives `-0`, which passes `===` and stringifies to `"0"` yet fails
  `Object.is` — a structurally perfect grid that fails a structural
  differential. It bit the floret tiling; expect it wherever basis vectors are
  signed. Normalize once at the exact-arithmetic → pixels boundary (the
  aperiodic four) rather than scattering guards.
- **Emission order is observable.** Dot indices come from first-encounter
  order, so reordering face emission within a cell is a behavior change even
  when the geometry is identical. Verify with the index-exact differentials
  (`grid-differential.test.ts`, `grid-aperiodic-differential.test.ts`), never
  by eye.
- **A random draw is an observable side effect, not a computation.** The
  aperiodic tilings call `random_upto` *unconditionally even when the
  candidate list holds exactly one entry*. Skipping the draw when `n === 1`
  desynchronizes the stream and yields a different, entirely plausible-looking
  tiling with nothing asserting. The same rule forbids "fixing" weight
  constants that look wrong (hat's `starting_hats` uses `PROB_P` for its
  `TT_T` entry): they are what the reference drew against. This generalizes to
  **any** generator that must reproduce a seed.

### `geometry.ts` — cell ↔ pixel

`coord`/`fromCoord`, the upstream `COORD`/`FROMCOORD` mapping with the
per-game border supplied by the caller. `fromCoord` floors directly (correct
for border-region pixels without the C macro's truncating-division idiom).
Most games' `interpretMove` starts here.

### `findloop.ts` — loop/bridge finding

Tarjan bridge-finding for live loop-error highlighting. Consumers: Slant,
Bridges, Dominosa, Loopy, Tracks.

### `n-times-root-k.ts` — exact `round(n · √k)`

The bridge where the aperiodic tilings' exact irrational arithmetic becomes
integer pixels. **Do not substitute `Math.round(n * Math.sqrt(k))`** — its
header explains why the triple rounding is the wrong port even when today's
magnitudes happen to agree (a one-unit disagreement doesn't degrade a
coordinate, it splits a shared corner into two dots).

## Ordered collections and small leaves

### `sorted-multiset.ts` — `tree234`, idiomatically

**A `tree234` is almost always just a sorted set.** The games overwhelmingly
use four of its operations, and `SortedMultiset` has all four under upstream's
own semantics:

| upstream | here | note |
| --- | --- | --- |
| `add234` | `add` | |
| `del234` | `delete` | no-op when absent, so `find234`-then-`del234` collapses to a bare `delete` |
| `delpos234` | `removeAt` | indexes into *sorted order* |
| `count234` | `size` | |

Consumers: Flip, Pegs, Netslide. Three rules:

- **Port the comparator exactly** — `randomUpto(set.size)` → `removeAt(i)`
  indexes the sorted order, so the comparator is byte-match surface, not a
  tidy convention.
- **A `tree234` used as a worklist is a different question.** Check whether
  drain order can affect the result before reproducing it — a flood fill's
  reachable set cannot, so that one is a plain queue.
- **Count the roles before reaching for this at all.** **Tell:**
  `newtree234(NULL)`, or a comparator whose ordering the algorithm never reads
  back — that is not a sorted collection. Slide's `solve_board` builds two
  trees and neither is one: a `memcmp` comparator used purely for
  deduplication (→ a keyed set) and a null-comparator FIFO (→ a plain array).

**Then don't take the obvious key encoding on faith — profile it.** Slide's
"board is small, a full-board string key is acceptable" design assumption
measured at **35% of total generation time** (most candidates are duplicates
whose key is built and thrown away); a 32-bit FNV-1a hash bucketed to an exact
byte comparison kept `memcmp` semantics with no per-candidate allocation and
made the generator 3.4× faster. This is the safest place to optimize: the
byte-match differential proves the substitution changed nothing. Exemplar:
`hashOf`/`sameBoard` in [`slide/solver.ts`](../../src/games/slide/solver.ts).

### `shuffle.ts` — Fisher–Yates + permutation parity

RNG-faithful `shuffle` (upstream `misc.c`), plus `permParity` for the
sliding-tile generators' reachability check (parity *correction* stays
per-game). Byte-match critical wherever the shuffled order feeds a desc.

### `combi/` — r-of-n combination iterator

Lex-order combination enumerator (upstream `combi.c`); one consumer family.
Exhaustively property-tested (`C(n, r)` count, strict lex order, distinctness).

## Generation

### `retry-limit.ts` — bounded "generate until it works"

**Every synchronous retry loop needs a bound**: an unbounded one that never
succeeds owns its thread outright (test timeouts can't fire; vitest workers
orphan and spin a core forever). `retryLimit` turns "hangs the machine" into
"throws in seconds"; exhaustion throws rather than returning a fallback, so no
seed that used to converge can quietly produce a different desc. Its header
also records when a cap is *not* the answer (a legal-but-rare seed wants a
recovery path, with the cap outside it — Net's stalled-tie reshuffle).

### `divvy.ts` — random equal-omino partition

`divvyRectangle` (upstream `divvy.c`): divide a rectangle into equally-sized
connected ominoes. RNG-faithful; byte-match critical. Consumers: Solo
(jigsaw), Palisade, Separate.

### `laydomino.ts` — random domino tiling

`dominoLayout(w, h, rs)` (upstream `laydomino.c`): a random 2×1 tiling.
RNG-faithful (candidate-list shuffle + per-BFS-node neighbor shuffle
reproduce the reference draws). Consumers: Magnets, Dominosa.

### `symmetric-blacks.ts` — symmetric black-square placement

`placeSymmetricBlacks` (upstream `set_blacks`) plus the `SYMM_*` enum and
Custom-dialog labels. Byte-match critical (region sizing, rejection-sampling
draw order, symmetry copy order, the `SYMM_ROT4` odd-center `<=`). Callback-
parameterized over the caller's board; the caller clears its board first.
Consumers: Light Up, Sticks — the extraction was proven byte-safe by Light
Up's differential staying green through it.

### `loopgen.ts` — random loop generation

`generateLoop(g, board, rng, bias?)` (upstream `loopgen.c`) over a `Grid`.
Byte-match critical; its header records the exact draw order that must be
preserved. A `bias` callback's only observable effect is its return value, so
a **full-rescan** bias (recompute fresh each call) is provably byte-identical
to porting the incremental `tdq` machinery and far simpler — Pearl does this.

### `wires.ts` — the Net/Netslide wire model

Direction algebra, hex wire desc codec with `v`/`h` barriers, the
spanning-tree grower, barrier placement, and the `computeActive` power flood.
**Wire bits `0x0F` only — each game owns the high bits** (`0x10` collides:
Netslide `FLASHING`, Net `LOCKED`; the header's "0x10 trap"). Extracted from
Netslide when Net became the second consumer.

### `obfuscate.ts` — solution masking in descs

`obfuscate_bitmap` + `bin2hex`/`hex2bin` (upstream `misc.c`): the OAEP-style
reversible masking that keeps a shareable game id from spelling out the
answer. Consumers: Guess, Black Box, Mines, Mosaic.

### `latin.ts` — Latin-square solver *and* generator

`latinSolver` (candidate cube, generic deductions, guess-and-verify
recursion), `latinGenerate`/`latinGenerateRect`, and the RNG-faithful
bipartite `matching` (Hopcroft–Karp) — which is reusable outside the family:
Tents drives it both ways (`rs` for randomized matchings in generation,
`rs`-less for a deterministic existence check). Usage discipline — the cube
index space, `usersolvers`, the `seed` hook, `cubeOut`, the family's three
generator shapes — lives in
[`solver-and-generator.md`](./solver-and-generator.md).

## Solving and deduction

### `deduction-fixpoint.ts` — the shared technique ladder

`runDeductionFixpoint({ techniques, maxTier, budget, firings, settled })`: the
ordered-technique fixpoint loop behind "a generator and an explained hint are two
projections of one deduction engine". A technique is a **declaration** —
`{ id, tier, run }`, both `id` and `tier` required — so the grade is the highest
tier that fired and the cap excludes by tier, never by position in the array.
`settled` is the early-out, and it means "nothing left for the ladder to do", not
"solved" (most of its callers stop on a contradiction or a budget). A
conditionally-available technique guards itself in `run`; there is no `when`
predicate and there will not be one.

**Its header's list of known no-gos is as important as its call sites** — the
ladder *shape* is near-universal; the bookkeeping wrapped around it is per-game
and often decides which puzzles exist — and that list is **re-derived when the
contract changes, never copied forward.** Three hatch cases (Loopy, Lightup and
Boats), down from six no-gos: Unruly left when tiers became declarable, and
Singles, Clusters and Spokes left when someone read their solvers instead of
their recorded reasons (`re-derive-the-fixpoint-no-gos`); Boats joined when
`explore-the-deduction-engine-reach` read the remaining thirty and found its
reason to be the sharpest in the tree — latching flags, a `diff` running maximum
that a technique *reads*, and a grade meaning "deepest tier reached" rather than
"highest tier that fired".

**Sixteen call sites** as of `adopt-the-deduction-runner-where-it-rewires`
(2026-09-09), which added seven at once — Tracks, Seismic, Subsets, Rome, Ascent,
Galaxies and Bridges. **Do not quote that number without re-deriving it**: it is a
comment-stripped scan for `runDeductionFixpoint` under `src/games/`, and five
name-keyed counts of this population went wrong in one session, Loopy's and
Boats' headers *explaining why they do not use the runner* among them.

**`firings` is a caller-supplied tally, and it is how a rung's reachability is
observed at all** (`return-the-firing-tally-from-the-runner`). Omit it and the
runner allocates nothing, which is the generator path's standing rule; pass one
and each firing is counted by `id`, sharing the map the step budget uses for
attribution. It is a sink rather than a field on the result because the runner is
called *inside* a game's solver — a returned tally would have to be threaded back
out through each game's own return shape. It replaced seven hand-written
ladder-wrapping closures.

**`singleFirings({ techniques, maxTier, budget, beforeTechnique, settled })`
is the recording path's driver**: the same pass down the ladder, stopped after
each firing, returning the technique that fired (`null` when none does) with a
sticky `impossible()`. Every firing comes back, visible or not; hiding is
`deduceHintPlan`'s `showable`, never the driver's. The budget is required and
its attribution tally outlives a call. Callers: a reference query for
`singleFirings`. The followable form is [`hints.md`](./hints.md) § "Recording
the deduction".

A ladder is certified by a **ladder census** (`testing/ladder-census.ts`), not
by the game's byte-match differential alone — see
[`solver-and-generator.md`](./solver-and-generator.md) § "Proving an adoption",
and read it before adopting or "fixing" a game that doesn't use this.

### `step-budget.ts` — the fixpoint non-termination guard

A cooperative budget ticked once per fixpoint iteration on the
hint/recording path only; converts a progress-without-change regression from
an in-call hang into an immediate labeled failure. Generators run unguarded
(and byte-for-byte unchanged). Ticked through `runDeductionFixpoint`, the
failure also **names the techniques by firing count**, so the message's own
question — *"a hint rule is reporting progress without changing the board?"* —
answers itself.

### `difficulty.ts` — the cross-game difficulty contract

`difficultyItem`: the Custom dialog's difficulty field, which a tiered game
declares instead of writing one, and which `tierOf`/`withTier`/`tierNameOf` read
(eight games don't hold a number in their params at all). `DifficultyContract`:
a discriminated solve-at-cap verdict and the declared exceptions to the tier
guards. Declaring it enrolls the game in the shared guards (`difficulty-contract.test.ts`) — above all **cap-monotonicity**, which
Boats shipped without, silently breaking Check & Save on every Easy board.
Details: [`mechanics.md`](./mechanics.md) (declaring) and
[`solver-and-generator.md`](./solver-and-generator.md) (grading).

`tierNameOf` reads the name of the tier some params request, and
`permitsSearch` asks whether that name is `Unreasonable`. The midend's runtime
check and `hint-resume.test.ts`'s walk both use it to decide whether a board may
run out of deduction, so reach for it rather than comparing names yourself.

### `sections.ts` — contract sections and the draft label

`sectionState(game, section)` reads whether `hint`, `findMistakes`, `solve` or
`transposeParams` is implemented, not applicable (with the game's reason from
`Game.notApplicable`) or absent; `draftSections` is what the home screen's
"Draft" label is built from, and `notApplicableMarkdown` the help page's "Not in
this game" section. `SQUARE_GRID` is the shared `transposeParams` reason of a
game whose grid has one side. A guard that would excuse a game for lacking a
section reads `sectionState` rather than keeping a ledger. Details:
[`mechanics.md`](./mechanics.md) § "Contract sections, and what makes a draft".

### `deduction-record.ts` — the recorded-firing shape

`DeductionRecord`/`DeductionRecorder`: the seam between a game's recording
deduction pass and the shared candidate-hint mechanics. `reason` is `unknown`
precisely so each game attaches its own; `group` ties every record of one
firing together so one firing becomes one grouped hint step. A reason's
`reads` names cells the deduction reads beyond what the game's words outline,
and the candidate walk makes them premise.

### `firing-replay.ts` — the premise audit

A test-only instrument, idle unless `auditRecordedPremises` is running: it
checks that each recorded firing the candidate walk offers still follows once
every cell outside its premise is returned to the recording's start.
`FiringReplay` keeps the state before each firing and reruns its technique from
an edited copy; a solver joins through a `ReplayAdapter` (read its state as a
`CellBoard`, run one technique). `latinSolver` builds one for every Latin game,
and Rome and Solo write their own. The audit reports what it could not do (a
firing it could not reproduce, a recording it had no replay for) and how many
cells it actually tested. Guard: `firing-replay.test.ts`. See
[`hints.md`](./hints.md) § "A premise names everything its deduction reads".

## Hint machinery

The authoring discipline for all of these is
[`hints.md`](./hints.md); this section is only the inventory.

### `hint-plan.ts` — the plan-accumulation loop

`deduceHintPlan`: the "while unfinished, ask for the single next forced
firing, apply, record" loop that four games arrived at independently. Only the
loop is shared — every rung order, reason type and narration string stays in
its game. Takes both a `planCap` (UX bound) and a `StepBudget`
(non-termination bound) because they answer different questions.

`showable(board, firing)` hides a firing that is not worth a step: it still
advances the working board, but the plan never shows it, and the cap counts
**shown** steps so a run of hidden firings cannot turn into a refusal. Reach for
it whenever a sound deduction can land somewhere the player's board already
decides (Tracks) or somewhere the game would refuse the move (Galaxies); the
result's `hidden` count is what a test reads to prove it saw any. Hide only what
the player can already see — a later step may cite it. See
[`hints.md`](./hints.md) § "Show only what the board does not already say".

### `hint-track.ts` — following a step that asks for several things

`trackTargets`: the `hintKeepTrack` verdict for a step that decides several
squares or edges, judged by what the player's move changed rather than by its
ops. Every change must be a target set the way it asks; nothing changed is off;
otherwise `"completed"` once every target holds, else `"onTrack"` with the
targets left, which the game turns back into its own move and highlights.
`changedCells` is the changes of a board with one value per cell, diffed across
the move; a game whose elements are edges, links or flags writes its own diff.
Take the population with `npm run refs -- src/engine/hint-track.ts trackTargets`.
See [`hints.md`](./hints.md) § "Group one firing into one step".

### `hint-gesture.ts` — how the pointer makes a hint step

`PointerAction` and its builders `click`, `drag` and `key`: what a game's
`hintGesture` returns for a step's move. The midend plays a hint step by
sending the gesture through `interpretMove` and judging what it made with
`hintKeepTrack`, never by applying the step's move, so every hinted game writes
one. A `key` must be one the game's keypad offers, the Marks key, or mark-all
(`MARK_ALL_CODE`). See [`hints.md`](./hints.md) § "Every step is a gesture".

### `candidate-hint.ts` — candidate-elimination plan plumbing

The pure helpers for pencil-notes games: the naked singles, the recorded
strikes and placements a plan could take now (`availableFirings`, one rule for
both), lazy-populate check, next-place lookup, the
obvious-clean step (`emitObviousCleanStep`), what a placed value rules out
(`Reach`, and `regionReach` where that is a cell's regions whatever the value) — the
move dialect (`CandidateMoveAdapter`) and the generic
`keepCandidateHintTrack`/`refreshCandidateHintStep`. A board scan reads
`grid.length`, so a board need not be square; `w` is only the row stride.

Two members exist for a game whose notes are not the Latin family's, and both
default to what a Latin game would have done. `NoteEncoding.all(i)` is the full
note set of a *blank* cell — per cell, because Rome's is bounded by the grid
edge and Seismic's by its region's size — and it must agree with the game's own
fill-all move, or the plan teaches strikes on notes the player never had.
`CandidateMoveAdapter.populate()` builds that fill-all in the game's own move
shape, which a `kind`-keyed game needs because `read` had always been asked
through the dialect while three helpers wrote `{ type: "pencilAll" }` for
themselves.

`CandidateReading` names the two readings of a blank, note-less cell, with the
convention `DEFAULT_CANDIDATE_READING`; `impliedNotes` is the implicit one as a
board (notes where written, otherwise what the regions leave), and
`fillAllNotes` what a fill-all puts in a cell. `pencilAdd` is the shared move
dialect's note-writing mirror of `pencilStrike`, built through
`CandidateMoveAdapter.add`. `applyNoteMove` applies the three note moves to a
square board with the default encoding, so a Latin game's `executeMove` routes
them there rather than restating the bit arithmetic. See [`hints.md`](./hints.md) § "Two readings of an
unmarked cell".

### `entry-mistakes.ts` — Check & Save for one value or a set of marks per cell

`entryMistakes(board, at)` is the whole `findMistakes` loop of a game whose
player places one value per cell or pencils candidates there: a wrong entry is
a `cell` mistake, and a blank cell whose non-empty marks leave out its answer is
a `note` mistake. The game supplies the solved answer, its entry and note
arrays, the note bits as its `NoteEncoding` already declares them, a blank
cell's spelling (`empty`, for Map's 0-based colors), the cells it cannot change
(`fixed`), and `at`, which places a cell in its own mistake shape (`gridCell(w)`
for a row-major grid). A game with further marks of its own checks those in its
own loop and asks `entryMistake(board, i)` for the rest (Salad's crosses and
circles). The note half is what makes a candidate hint sound: the hint reasons
from the marks, so it must refuse on a mark set without its cell's answer.
Take the population with `npm run refs -- src/engine/entry-mistakes.ts entryMistakes`.

### `candidate-plan.ts` — the candidate-elimination plan walk

`runCandidatePlan` is a pencil-notes game's whole `buildSteps` walk: the naked
singles, the recorded strikes and placements as rungs around any rungs of the
game's own, populate and the obvious clean, a placement's row/column cull
(taught as a leg, or silent under auto-pencil), the journey flags, and each
next firing taken through a `HintFrontier`. A rung returns firings as **legs**
(a placement, a strike, or a step of the game's own), the walk builds every
step, and the frontier reads a firing's premise off those steps. The game
supplies its recording solver, regions, words and strike-split axis — see
[`hints.md`](./hints.md) § "Candidate-elimination games". Its `reading` is the
player's: under the implicit one there is no populate, and a firing first
writes the notes of every note-less cell its premise reads.

`runLatinCandidatePlan` is the same walk with the plain row/column square's
answers filled in — its regions, the reason a single narrates as, and a hidden
single's evidence line, none of which a Latin game can answer differently —
so such a game supplies its solver, its rungs and its words alone. A game whose
singles narrate otherwise (Solo's name a block or a diagonal) fails to
type-check against it and calls `runCandidatePlan`. See
[`hints.md`](./hints.md) § "The row/column preset".

### `hint-frontier.ts` — which available firing a plan takes next

`HintFrontier` takes, among the firings a candidate plan could make at once,
the one continuing from what the plan's latest steps wrote, with the ladder
order as the tiebreak; `runCandidatePlan` hands it each rung's candidates,
each reading the `area ∪ hatch ∪ reads ∪ targets` of the steps it would push.
It is keyed on
whatever a step acts on: a grid game passes `gridKey(w, h)`, and Map, whose
steps act on regions of a graph, keys a region by its index and drives the
frontier from its own plan. See [`hints.md`](./hints.md) § "Continue from the
last step" and § "A graph, not a grid (Map)".

### `latin-hint.ts` — truthful Latin single classification

Re-derives whether a recorded `single` is **naked** or **hidden** from the
working board, so no Latin game narrates "every other number has been ruled
out in this cell" at a cell visibly holding several candidates, and throws on a
placement that is neither, which is a strike the plan skipped.
`availablePlacements` lists the recorded placements a plan could take now (the
singles the board shows, and the placements `candidate-hint.ts`'s
`availableFirings` vouched for), and a single in a cell with no notes written is
`regionsFull`. `forcingChainArea` numbers a chain's cells, which the shared
chain sentence outlines. The sentences it classifies for are `hint-text.ts`'s,
and what they outline is what the walk outlines.

### `hint-words.ts` — a hint's words bound to its marks

The three mark roles (**ring**: what the step decides; **outline**: what it
reasons from; **stripes**: the line or region the sentence names) with their
engine-owned nouns and adjectives, the element kinds a mark is drawn on (`CELL`,
`NOTE`, and a mechanic's own, such as `border-grid-hint.ts`'s `EDGE`), and the
sentence builder: `phrase` composes a `Narration` from literal words and
`mark.this` / `mark.the` / `mark.paren` / `mark.as` references, each carrying the
elements of the mark it names. A literal saying "this", "these" or a role's
adjective throws, so an unbound "the striped row" cannot be written.
A step's words are a `Sentence`, made only by `sentence(said)` (its parts: an
`aim`, a `look`, what `follows`, the `move` and the `Relation` that picks the
engine's joining words), its shorthand `so({ look, move })`, or
`unshaped(words, kind)` for a declared exception; `mark.move(words)` rings the
step's own move (`MOVE`) so the words can leave it to the board. See
[`hints.md`](./hints.md) § "A sentence has parts".
`stepMarks(step)` is what a bound game's renderer paints the step's marks from,
and `testing/hint-binding.ts` holds the rendered frame to the words in the
hint-quality walk; `legendMarkdown` is the help's generated list of marks. See
[`hints.md`](./hints.md) § "Bind the words to the marks".

### `hint-text.ts` — the sentences several games share

The engine's half of the hint-text convention (a game's own sentences are its
`hint-text.ts`): `narrateLatinReason` and `latinPremise` for the row/column
games whose generic-arm wording is verbatim-identical (normative rule: the
`ts-engine` "shared narrator" requirement), `forcingChainPremise`, the
candidate games' `populateText`/`cleanObviousText`, the `Premise` a strike's
words are and the `Conclusions` the walk ends it with (`candidateConclusions`
for a game whose values print one way), the `LatinVocab` a value is spoken in, the
sliding-tile games' `HINT_SETTING_UP` (their "Working on tile N:" is a
sentence's `aim`), and the English list joiners
`joinNums`/`joinWith`. Nothing in it decides which sentence fires. See
[`hints.md`](./hints.md) § "The sentences live in one file per game".

### `slide-planner.ts` — sliding-permutation search

Bucket-queue A\* + exact bidirectional BFS + a memory-light deep search +
partial plans, over "the board as the player sees it" (one integer per cell —
two boards showing the same picture are the same position, which matters when
tiles are interchangeable). The exact search runs on **every** board, and a game
supplies its budget but never *when* to spend it; gating it is what made
Sixteen's hint cycle. `deepSearch` is the last resort past its reach — a kept
endgame database of the goal side plus a depth-first walk of the board side, so
it costs time rather than memory — and it may reach exactly **one** ply further
than the ungated search, which is what makes gating *it* safe. Sixteen uses it;
Netslide's ±1 move set already reaches deep enough without it (measured: 108
walked games, none stranded). `docs/games/hints.md` § "Sliding-permutation
games" lessons (b) 4 and 5 have the numbers. Consumers: Sixteen, Netslide.

### `hint-mark.ts` — the ring and the outline

The two board marks a hint draws: a **ring** around the cell the deduction acts
on, an **outline** around the region it reasons from. Both replace the cell's
*border*, never its background — a fill behind content cannot be rescued by
choosing a different color, and a joint search over both roles, every hue and
both schemes found no feasible arrangement. `MarkBand` is how a game says where
its border lives (outside the content box for the `COL_GRID`-backed games,
inside it for the ones drawing their own per-cell outline). A target spanning a
**piece** — a domino — is one ring around it when the game passes
`joinTargets` (and `joinEvidence` for evidence that is whole pieces);
`MarkOutlines` hands the resulting sides to a game whose tile cache has to key on
them (`hints.md` § "Shade vs ring"). `HintMarks.paint` stamps a frame's marks
after the tile loop and never erases; a game whose band has an `outer` part
also calls `HintMarks.eraseBeforeTiles` before the loop and dirties the tiles it
names (`hints.md` § "Where the band goes, and who rubs it out"). It is for a mark on a **cell**: Map's regions are polyominoes of half-cell triangles, so Map rings
and outlines them with its own region band instead (`hints.md` § "A graph, not
a grid (Map)").

### `hatch.ts` — the line a step calls "this row"

The third board mark: translucent diagonal bands over the squares, and the clue
slots, of the one row or column a step's sentence names. `GameDrawing.drawHatch`
draws them and every drawing takes its geometry from `hatchBands`, laid on the
canvas rather than the rect, so tiles hatched one at a time join into one strip.
Draw it **after a square's background and before its content**, and use
`hatchPeriod(tileSize)` for the pitch. It is not a fill: the bands leave half the
surface untouched and the content is drawn over them, and
`puzzle/hatch-contrast.test.ts` holds the opacity to both schemes. Why it exists
and when to reach for it: [`hints.md`](hints.md) § "Hatch the line the sentence
names".

### `hint-ordinal.ts` — where a cell falls in a forced chain

The small corner number that turns a Tactic's shaded set back into something
walkable. **Not an arrow**: an arrow claims *this cell forces that one*, which
is false in a third of Clusters' links; an ordinal claims only the order, which
is true in every game that draws one, and it stays inside one tile so it rides
the existing `OverlaySidecar` diff.

### `hint-refusal.ts` — what a hint says when it will not give one

The refusal messages, so the same situation says the same thing in every game:
`help/features.md` teaches "there is a mistake on the board" and "deduction has
run out" as a pair calling for opposite responses, which only works if the
wording is shared. `HintResult`'s error is `HintRefusal`, the union of these
constants' literal types plus `puzzleDeadEnd(sentence)`, the escape for a dead
end only one puzzle has (Inertia's dead ball); `markedDeadEnd(phrase…)` is the
same escape with words whose references mark the cause (Pegs' cut-off pegs).
`hint-refusal.test.ts` fails a sentence two games pass through either. Every
refusal says whether it is a dead end (`isDeadEnd`, its advice is to undo),
which is what the midend's `check` refuses a save on. Don't refuse a finished board or a
wrong one: the midend says `ALREADY_SOLVED` and `FIX_MISTAKES_FIRST` before it
asks, so `FIX_MISTAKES_FIRST` is not a `HintRefusal` at all. A game says
`ALREADY_SOLVED` only where its status would not call a finished board solved
(Fifteen's, Sixteen's and Netslide's sorted board at move 0), and `GAME_OVER`
on a lost board that takes no more moves.

### `solve-failure.ts` — what Solve says when it will not solve

`SolveResult`'s error is `SolveFailure`, the union of this module's constants'
literal types, so a `solve` cannot return a sentence of its own. Pick by what
the solver **established**: `NO_SOLUTION` and `MULTIPLE_SOLUTIONS` only from a
verdict that proves them, and `PUZZLE_NOT_REASONABLE` (from `hint-refusal.ts`)
wherever a failed search could mean either, since it is true in both cases.
`NO_SOLUTION_FROM_HERE` is for a game whose moves can lose, and a hint refusing
on the same fact says the same constant. Don't check for a finished board: the
midend refuses Solve with `ALREADY_SOLVED` before asking, and a game checks only
where its status would not call a finished board solved.

## Input

### `pointer.ts` — button codes and cursor helpers

Button constants, `stripModifiers(button)` (never redeclare `MOD_MASK`),
`isEraseKey`/`isCancelKey` and the `BACKSPACE`/`DELETE`/`ESCAPE` codes, and
`digitOf(button)` — the digit `0`–`9` a key stands for, or `null`, looking
through the modifier bits so a numpad digit is that digit. The **bound** and
the **meaning of `0`** are the game's own and stay beside the call: Seismic
caps at the region size and clears on `0`, Guess reads `0` as the tenth color,
Bridges as sixteen, Ascent as one more typed digit.

**The keyboard cursor lives here too, and every game holds one.** `GridCursor`
(`x`, `y`, `visible`) under `ui.cursor`, built by `newCursor(x?, y?, visible?)`
and driven by `moveCursor(cursor, button, w, h, wrap?)` — reveal *and* move in
one press, returning whether anything changed — plus `showCursor`/`hideCursor`.
`isCursorMove`, `cursorDelta` and the position-only `gridCursorMove` remain for
a bespoke traversal.

**Never restate any of it locally**, including a magic number where a named
button exists: `emittable-keys.test.ts` enforces that from `pointer.ts`'s own
export list — which is how nine games' private `moveCursor` (four of them
byte-identical) were found the day the shared one landed — and
`cursor-vocabulary.test.ts` fails the build for a cursor held under any other
field, finding it structurally rather than by name. The digit range is guarded
by its **codes**, not by a name, and since the desc side joined
([`decimal.ts`](../../src/engine/decimal.ts)) the scan in `decimal.test.ts`
reads any operand anywhere in a game source: a `48`, `0x39` or `- 48`, a
numeric `case`, a `c >= "0"`, whatever the value is called. A non-trivial *traversal*
(half-grid, lock modes, corner-skipping) still keeps its own logic, and so does
whatever a game does *while* the cursor moves; only the noun is shared.
Discipline: [`input.md`](./input.md).

### `run-length.ts` — the desc grammar eight games share

`scanRunLength(desc)` yields `{ blanks }` for a letter run (`a` = 1 … `z` = 26,
longer runs as repeated `z`s) and `{ value }` for anything else — including
characters the game will reject, because *which* value characters are legal, in
what range, and with what error message are the game's rules and stay there.
`encodeRunLength(count, emit)` is the other direction.

**`keepTrailingBlanks` is not a style option.** Palisade drops the run that
reaches the last cell; Slant and Mosaic keep it, because their parse
rejects a desc that does not fill the grid *exactly*. Encode a Slant desc
without it and the game refuses to load its own board.

**Do not try to extract the alphabet on its own.** It is the obvious sequel to
`decimal.ts` and it fails the same test that module passed. Measured 2026-09-12
(`record-the-letter-run-no-go`): 26 games outside this module spell a letter run
by hand across ~69 sites, and they disagree about what a letter is worth — `a`
is 0 in Clusters, 1 in Sticks, Range and Ascent, 2 in Tents, with three chunk
boundaries and two meanings for `z`. Those descs are frozen bytes, so the shared
form would take `base`, `chunk` and `zMeaning` as parameters. A digit is one
fact; a run letter is each game's own.

**Games with a richer desc do not use this**: Towers, Keen, Solo, Undead,
Unequal, Mathrax, Salad, Boats, Tents, Tracks and Pattern parse multi-digit
numbers, `_` separators, or two comma-separated sections whose boundary the
caller controls. **Bricks and Crossing belong with them** and were misfiled as
adopters first — the test is not "does it write `charCodeAt(0) - 97`" but "is
everything that is not a blank run a single value character". Bricks' other
token is a multi-digit clue with `_` separating two adjacent ones, over a padded
grid whose `F_BOUND` cells the desc index skips; Crossing has no value character
at all, its decimals being a second kind of *run*. Map is here for **half** its
desc: the clue list is this grammar, the edge list is a different run coding in
the same string.

The decode side has one shape. The encode side has five, and every one of them
writes the same bytes: Loopy tests `> 25` before the increment, Map and Bridges
test `=== 26` after it, Pearl grows a run by *incrementing the letter it already
wrote* and starts a fresh `a` at `z`, Palisade nested two `while`s. Five
spellings of one grammar is the argument for the module.

A desc is a player promise, so when the grammar was extracted the encoder was
fuzzed against the code it replaced, 4,000 trials biased toward long runs.
`run-length.test.ts` now pins the bytes at every run boundary and fuzzes the
round trip, because Palisade, the first game converted, has no frozen
differential; the other seven adopters have one and all seven are byte-clean.

Each adopter reads its desc in one parse (§ "`desc-reader.ts` — the cursor a
desc parser drives"), and the engine's verdict on a desc is that parse
(§ "`desc-error.ts` — why a game ID will not load"). What can still go wrong is the encoder and the parser disagreeing about
`keepTrailingBlanks`, and
[`desc-error-games.test.ts`](../../src/engine/desc-error-games.test.ts) loads
every desc a game's generator writes: flipping that option in Slant's encoder
turns it red.

### `wall-runs.ts` — a region layout as a run-length wall list

`encodeRegionWalls(regions, w, h)` / `readRegionWalls(r, regions, w, h)` write
and read the `⟨walls⟩` half of a `⟨walls⟩,⟨clues⟩` desc: every border between
adjacent cells, rows then columns, as decimal runs of walls and letters for a
run of gaps *plus the wall that ends it* (`z` is 26 gaps and no wall). The
reader is a `DescReader` call, so it composes with the clue half the game reads
itself, and it refuses a run past the last border. Rome and Seismic. Reach for
it for any desc that ships a region partition as walls; a desc that lists its
regions some other way has a different grammar.
`gapLetters(n)` is the letter run both clue halves share. Upstream's writer put
a run of 26+ gaps past `z`; this one chunks, byte-identical for every run of 25
or fewer.

### `dot-runs.ts` — blanks and dots of two kinds

`writeDotRuns(s, kindAt)` and `readDotRuns(r, s, place)`: one letter per dot,
its offset from `a`/`A` the blanks before it and its case the dot's kind, `z`/`Z`
chunks of 25 in the case of the dot that ends the run, and a lowercase letter
closing the board. Unruly's givens and Clusters' dots are this grammar letter
for letter, and each carried a copy of both halves. It is **not**
`run-length.ts`'s grammar — a letter is a run *and* a value, a chunk is 25 —
and Galaxies' letters, which look similar, write every chunk as a lowercase
`z` whatever dot follows and end at the last dot with no closing letter, so
Galaxies does not use it. The reader takes the
`DescReader`, so it sits inside a game's one parse.

### `desc-alphabet.ts` — one character per small number

`n2c(n)` writes `0`–`9`, then `a`–`z` for 10–35, then `A`–`Z` for 36–61;
`c2n(c)` inverts it and returns `null` for anything else. A **value** codec, not a
run-length one: every character stands for exactly one cell. Singles and Magnets
had a copy each, and Magnets' section header said *"cloned from singles.c"*.

The order is frozen into every shipped game ID, so no caller may reorder it —
which is also why no game could legitimately want a different one.

**A game's sentinel stays with the game.** Magnets writes `.` for "no clue" and
handles that itself before delegating; Singles has no such concept. Same line
`run-length.ts` draws.

**It owns the bound, and both games were over it.** `n2c` *throws* above 61
rather than walking into `[` — which is what both games silently did, producing
a desc their own `validateDesc` then rejected. Singles capped its dimensions at
`10+26+26` = 62, one past the largest value the alphabet can write; Magnets
(like upstream) capped nothing at all. Both now derive the cap from
`DESC_ALPHABET_SIZE`, and `desc-alphabet.test.ts` finds the largest board each
game admits and checks the largest number that board can need round-trips.

**A run-length desc has a second alphabet, `n2cUpper`/`c2nUpper`.** Such a desc
has spent `a`–`z` on blank runs, so a value above nine has nowhere to go but
the capitals: `0`–`9` then `A`–`Z`, thirty-six values. Loopy, Bridges, Tracks,
Flood and Pearl were five copies. Which alphabet a desc uses is decided by
whether its grammar has run letters, and the pair sits here rather than in
`run-length.ts` because the contrast is the documentation. The bound stays
with the game either way: Bridges rejects above `G`, Tracks above `F`.

The four names are reserved — `emittable-keys.test.ts` fails a game declaring
any of them — so a game's own codec is named for what it does: Unequal's
display-and-input pair is `displayChar`/`charValue` (it takes the puzzle's
`order`, shifts above order 9 and maps 0 to a space), Magnets' sentinel-aware
wrapper is `clueChar`.

### `desc-error.ts` — why a game ID will not load

A parse fails with a `DescError`, a branded string only this module makes:
`DESC_TOO_SHORT`, `DESC_TOO_LONG`, `DESC_OUT_OF_RANGE`, `DESC_REPEATED`,
`DESC_CONTRADICTORY`, `DESC_MALFORMED`, `DESC_NOT_UNIQUE`, `descBadCharacter(ch)` (pass the
character when the parser has it), and `descNeedsOne(noun, found)` for a board
that must have exactly one of something (a starting square, a main piece). A helper on the desc path returns
`DescError | null` too, so the brand reaches the message where it is written.
The scanners above report what they read and never word a refusal; their
callers pick the kind.

**`puzzleDescError(sentence)` is for the puzzle's own rules**, not the
description's shape: Inertia's two starting squares, Keen's two-cell
operations. One sentence about "this game ID". `desc-error.test.ts` fails a
sentence two games pass, because then it is a kind the module is missing: add
it here rather than rewording one of the two.

**A desc is read once, and the engine owns the verdict**: write one
`parseDesc(p, desc): DescParse<T>`, and have `newState` build from
`descValue(parseDesc(…))`. A failed parse makes `descValue` throw a
`DescRejection`, and `loadDesc(game, p, desc)` turns exactly that throw back
into a `DescParse<State>`; `validateDesc(game, p, desc)` is that reading's
verdict, the codec's, and `loadVerdict` is `loadDesc`'s, answers included. A game
writes no validator, so the verdict and the board cannot come from different
readings. A check that needs the parsed board belongs inside the parse: one
thrown after `descValue` is a bug, not a refusal, and propagates.

**The verdict also asks how many answers the board has**, for a game with
`findMistakes`: `loadDesc` calls the game's `solve` on the board it built, and
refuses one the solver proves has several (`DESC_NOT_UNIQUE`) or none
(`DESC_CONTRADICTORY`), except at a `nonUniqueTiers` tier. A game supplies
nothing for this beyond a `solve` that says `MULTIPLE_SOLUTIONS` or
`NO_SOLUTION` only when it has proved it
([solver-and-generator.md](./solver-and-generator.md) § "One answer, even when it
is hidden").

### `desc-reader.ts` — the cursor a desc parser drives

`readDesc(desc, (r) => …)` runs a parser and returns its `DescParse`. The
`DescReader` it hands you reads forward: `peek()`, `peekIs(ok)`, `accept(s)`,
`expect(s)`, `char(ok?)`, `int(lo, hi)`, `rest()`, `end()`, `fail(error)`. Each
read that cannot be made fails with the right kind on its own — the desc
**ended** is `DESC_TOO_SHORT`, **something else is there** is
`descBadCharacter(thatChar)`, leftover text at `end()` is `DESC_TOO_LONG`, a
number outside `[lo, hi]` is `DESC_OUT_OF_RANGE` — so a parser never writes
`i >= desc.length ? … : …` again. Exemplar: `games/fifteen/state.ts`.

**`int` has no unbounded form, on purpose.** An unbounded number reaches a
typed array and wraps, and two games read a different board from the one their
validator accepted that way. Pass the bound the board implies; where there
genuinely is none, pass a generous one and say why.

**It does not own a grammar.** Run letters, alphabets and separators are the
game's (the run-length header says why the letter alphabet does not
generalize); a grammar of one character per token, or a fixed-width or
obfuscated blob, gains nothing from it and still reads once through
`DescParse`. It fits exactly where the token iterator `run-length.ts` rejected
did not: a grammar that hands control back to the caller between tokens —
Keen's repeat counts, Solo's sections, Rome's walls — is a loop the caller
drives, and the cursor is that loop's position.

### `decimal.ts` — decimal digits in a game ID

`isDigit(c)`, `digitValue(c)` (`0`–`9` or `null`) and `parseLeadingInt(s, pos)`
(the maximal digit run at `pos` as `{ value, next }`, `atoi` semantics: `0`
with no advance on a non-digit, which is how a caller tells "no number here"
from "zero"). Both halves of a game ID spend digits — `10x7n12` and a desc's
clue list — so this sits *below* `params.ts` and `desc-alphabet.ts` rather than
in either; it is the desc-side twin of `pointer.ts`'s `digitOf`.

**What stays with the game**: the bound (Slant's clues stop at `4`, Bricks' at
`7`) and what an out-of-range value means, written beside the call —
`const v = digitValue(tok.value); if (v === null || v > 4) …`. A single digit is
*written* as `String(n)`; anything wider is one of the alphabets above. Hex
that is hex (Mines' bitmap, Cube's and Flip's grids) is `Number.parseInt(c, 16)`
and not this.

Before this existed, twelve files declared their own `isDigit` and some forty
loops read a digit run by hand in four spellings, while `parseLeadingInt` sat
exported from `params.ts` with sixteen importers and a spec scenario keyed on
its *name* — which is why none of the copies called `eatNum` or `readInt`
failed it. `decimal.test.ts` now keys on the **shape**: a digit code as an
operand, a relational comparison against a one-digit string, a private copy of
any export here. Read its header for the one shape it still cannot see.

### `params-codec.ts` — the declared params codec

`paramsCodec` derives **both** halves of `encodeParams`/`decodeParams` from one
ordered segment list, so the two cannot drift apart. A segment names a
`paramConfig` field by its `kw` and reuses that item's accessors, which makes
the Custom dialog and the codec one field list rather than two. A choices field
upstream writes as its stored number (Bridges' `i30`) goes through `num` with an
`IntAccess` pair; one written as a bare letter per choice (Salad's `L`/`B`) is
`letters`. **Moving a codec here is proven by a differential**, not by the
stability table alone: old against new decoder over the corpus, truncated, with
junk appended and with every legacy form the old decoder handles, since a
hand-written decoder accepts strings no encoder writes. Five grammars
genuinely escape it (a float param, a leading letter before the dimensions, a
`switch` over multi-character strings, a `while` loop over the tail, a boolean
encoded as an integer) — those are named in the `ts-engine` spec, and a game
taking one still owes the inverse property, which
`params-stability.test.ts` asserts over a registry-derived corpus.

### `params.ts` — param-string decoding + config helpers

`parseDimensions` (leading `WxH`-or-square, restoring the square fallback
that `indexOf("x")` mis-sliced on a bare `"4"`; built on `decimal.ts`'s
`parseLeadingInt`, which lived here until the desc codecs turned out to be
half its callers), `atof` and `formatG`
(C's `%g` — a full-precision float param reads back as a *different* number
and the game ID stops naming its board), the declarative
`dimensionParamConfig`/`numberItem`/`squareSize`/`parseConfigInt` helpers
behind `Game.paramConfig`, and **`paramsError`**, the one validity check: every
item's `bounds` and choice list, then the game's optional `validateParams`.
Call it wherever you would have asked `game.validateParams`.

### `param-label.ts` — the one label of a params set

`describeParams(game, p)` composes a label from the items' `label` slots
(`[lead: ]size[ kind…][ tier][, tail…]`), and `presetMenu(game)` titles every
unnamed preset with it. The preset menu, the type header of a custom board and
every test that reads a title go through here, so the menu and the header
cannot name one board two ways. Declaring: [`mechanics.md`](./mechanics.md)
§ "Params are declared once, on `paramConfig`".

### `param-help.ts` — the generated Parameters section

`parametersMarkdown(config)` renders a game's help Parameters list from its
items' `doc`s and `bounds`, Width and Height as one entry; the help build
(`vite-plugins/parameters.ts`) puts it where a page writes `{{parameters}}`.

### `key-labels.ts` — on-screen keypad builders

`digitKeys(n)` + `clearKey` for `Game.requestKeys`, resolving labels the way
the frontend expects (`"Clear"` maps to the clear icon).

`colorKeys(n, firstColor)` is `digitKeys` for a game whose element is a **color**
— each key carries a palette index the panel paints it in (`KeyLabel.swatch`),
because no character names a color. `colorKeysZeroIsTen(n, firstColor)` is the
same keypad for a game that stops at ten values and reads the tenth off the
`'0'` key rather than `'a'` (Guess). Reach for one of these rather than spelling
digit codes in a game: `decimal.test.ts` allows exactly one statement of them in
the tree, and it is here.

`pencilModeKey` is the marks toggle (`"Marks"` maps to the marks icon), and **a
game never lists it** — `Midend.requestKeys` appends it to any game `takesNotes`
recognizes, which reads a `pencil` array on the state or the mode flag on the
`Ui`. `takesNotes` is exported here and is the one definition of that
population.

## Rendering and affordance helpers

Discipline for all of these — the cache, the diff key, the doctrine — is
[`rendering.md`](./rendering.md).

### `overlay-sidecar.ts` — the overlay diff-key rule as a type

`OverlaySidecar` owns the repack/stale/commit dance for every overlay that
doesn't live in the packed tile value. **Never hand-write the two-array
dance.** Entry points by shape: `pack` (a hint step's highlights), `packCells`
(a `findMistakes` list), `clear()`+`add()` (an overlay with its own topology).
`pack` also keys an evidence cell on its outline sides, so a cell that stays
evidence while the area around it changes shape still repaints. A step's marks
land in a `struck` lane of their own, in the game's encoding (`valueBit(n)`
for a candidate), never in the word beside the roles: a candidate mask needs
every bit a cell's values reach.

### `candidate-bits.ts` — one candidate encoding, range-checked

Value `n` at bit `n` (`valueBit`), the full set 1..n (`valuesOneTo`), and the
largest value a 32-bit mask holds (`MAX_CANDIDATE_VALUE`, 31). Both functions
throw rather than wrap: a shift counts mod 32, so an out-of-range value lands on
another value's bit and a cache keyed on the mask repaints nothing. Take a
game's size limit from the constant rather than writing a number beside it.

### `draw.ts` — shared drawing primitives

`drawRecessedBorder` (the two-pentagon playfield bevel), `drawRaisedBevel` + its
companion `raisedBevelWidth` (the raised *tile* — its opposite number),
`drawRectOutline` (upstream `draw_rect_outline`), `drawThickRectOutline` (the
"this is wrong" frame, four filled bands), `drawRectCorners` (the four corner
brackets marking a keyboard cursor — promoted from **seven** byte-identical
copies; if you are typing eight `drawLine` calls around a center point, it
exists), `glyphFont(size)` (the text options for a glyph centered in a tile —
the only argument is the size), `strokeScaledPolygon` (a cell's own outline
drawn a fraction of the way in toward its center: the mark for a cell that is
not a square, where `hint-mark.ts`'s bands cannot go — Loopy's faces and
Ascent's hexagons).

**`glyphFont` is the one to reach for when drawing a digit or a letter.**
Measured 2026-09-12: 56 copies of `{ align: "center", baseline: "mathematical",
fontType: "variable", size }` stood in 40 game files, and three games had already
extracted it locally under three different names. It takes only the size and
grows no other parameter: a game drawing fixed-width or non-centered text writes
its own options, which eight sites do.

**Most of this module was promoted from private copies held by six to forty
games**, which is the pattern to notice rather than the individual helpers: if
you are writing vertex arithmetic for a shape that any other game also draws, or
an options object for text every other game also draws, look here first. The reverse direction is guarded —
`raised-bevel.test.ts` fails if a game re-derives the two triangles.

**Sizing belongs here too, not only shape.** `raisedBevelWidth(ts)` exists
because the six raised-tile games had four thickness formulas between them, so
the same idiom read 1px in one game and 3px in another at the same tile size.
When you extract a shape, check whether its *dimensions* were drifting as well.

Extractions of drawing code are cheap to verify: emitted op order unchanged ⇒ no
render snapshot moves. **The converse is not evidence** — an unchanged snapshot
can also mean nothing was watching, which is what
`promote-the-thick-rect-outline` found (deleting a side of the error frame
failed exactly one test across eight games). Break the helper deliberately and
see what goes red before believing a clean run.

### `completion-status.ts` — the status bar's completion words

`completionStatus(solved, cheated, rest)`: `COMPLETED!`, `Auto-solved.` or
`Auto-solver used.` (helped, then moved off the solution), then `rest` after a
space, and nothing at all on an unhelped unfinished board. **The midend calls
it, not a game**: it prefixes the words to whatever `statusbarText` returns,
from the board's status now and its own record that the solver was used. An
outcome that is not completion ("DEAD!", "FAILED!") is the game's own phrase.
`completion-status.test.ts` fails any game string that says the words.

The win flash has no helper any more: its trigger is the midend's and a game
supplies `solvedFlash` (`rendering.md` § "Animation and flash").

### `pencil-indicator.ts` — the pencil-mode indicator

The shared "pencil mode is on" glyph, drawn identically across the collection —
**and in the same place.** `pencilIndicatorBox(canvas, tileSize)` returns it:
the canvas's top-right corner, inset by a hair. `pencilIndicatorReach` is the
figure a game reserves there — the glyph *plus* both insets. That is about half a
tile on a coarse board, **but not on a fine one**: the glyph is clamped between
20 and 48 CSS pixels, because what makes it legible is its size against the
canvas, and a board of many cells has small tiles on a full-sized canvas (Map's
glyph was 9px on 417px). So a margin of exactly `ts / 2` does not hold it at a
small tile; reserve `Math.max(yourMargin, pencilIndicatorReach(ts))`. It is the
only size the module exports, because a game that reserved the glyph's own size
would be short by an inset at each edge and the glyph would clip the cell below.
`pencil-indicator-placement.test.ts` holds both halves: nothing of the board
reaches the box at any tile size, and the glyph is at least 3.5% of the canvas's
short side at phone and laptop sizes, for every preset. The position is the engine's, not the game's, because the cue's
whole job is to say *your typing goes into notes now*, and a cue that moves
between puzzles has to be re-learned in each; it had drifted into three answers
across the collection before `add-loopy-notation`. A game picks only its three
palette indices (`PencilIndicatorStyle`) and how it finds the room. **The `ink`
must contrast with the `background`**: it draws the outline and the graphite
point, and Map's, set to the background, left a black dash that did not read as a
pencil at any size. A game that must keep its answer colors out of the body
(Map) draws an outlined pencil: `body` the background, `ink` the grid.

`repaintPencilIndicator(dr, cache, on, box, style)` is the box, the glyph, the
invalidation **and** the repaint decision, so a game writes one call rather than
a private painter plus a hand-rolled cache. The cache is a
`pencilModeShown: boolean | null` on the draw state, and `null` — never painted —
is why there is no `firstFrame` argument: a fresh draw state has an empty canvas
under the box and must paint whatever the mode is. `drawPencilGlyph` stays
exported for a renderer that repaints every frame anyway (Loopy), where a cache
would skip the repaint that the background has just erased.

**Finding the room, in preference order:**

1. **A margin the game already has** — a border, a gutter, or a clue-ring corner
   at the top-right that nothing else paints. Check the *corner*, not the edge: a
   ring that holds clues along the top usually leaves its corners empty.
2. **A wider margin** — widen the border until the box fits. Loopy's gutter is
   the widest of its cursor disc, a corner note on a rim dot, and this box; Keen's
   half-tile border is the wider of half a tile and this box. A game whose origin
   is not one `border` term (Salad's clue ring sits at the canvas edge) pads
   outside what it has by whatever the reach exceeds it by.
3. **Grow the canvas rather than overlap the board**, when there is no margin at
   all: `pencilIndicatorCanvas` adds the reach on **every** side, so the corner
   exists and the board stays centered rather than sitting to one side of its
   canvas. The game adds that same reach to its own origin and subtracts it in
   `fromCoord`, on both axes — a margin on one axis alone would make a game's
   pixel→cell mapping differ per axis, and these games each have one
   axis-agnostic `fromCoord`. The board's own size is untouched, and the *fill*
   must come from `computeSize`, not from a board-sized expression, or the new
   margin is never painted.

The box sits in a margin, which is no tile's, so it cannot ride in a per-tile
cache key however convenient that corner looks: every game repaints it after its
tile loop, through `repaintPencilIndicator`. Towers packed it into tile `w + 1`
while the position was Towers' own to choose, and gave that up with the choice.

The glyph's body color is a palette index appended past the game's C-era
enum — safe only when the game has no dark-mode `paletteOverrides` touching
that index (check `augmentation.ts`).

### `pencil-prefs.ts` — shared pencil `GamePref` declarations

Sticky-pencil, keep-highlight and hint-notes (`candidateReadingPref`, how a
hint pencils) preference factories with per-field `Ui` constraints (a game
without the field fails to compile). `auto-pencil` is
deliberately *not* unconditioned — its label names per-game regions, so the
sentence is passed in.

### `color/` — the palette

Three layers: `colors.ts` (the twelve named colors), `palette.ts` (the
meanings — your default import), `palette-games.ts` (board-relative per-game
colors), plus `color-token.ts` (declaration/combination mechanism) and
`color-mkhighlight.ts` (upstream `game_mkhighlight` bevel derivation, with
the epsilon and near-extreme fixes the per-game copies shared). The
meaning-first discipline: [`rendering.md`](./rendering.md) § "The palette: three layers, meaning first".

## RNG and persistence

### `random/` — the bit-identical RNG

Upstream `random.c`, byte-for-byte: identical seeds produce identical
streams, which is what keeps shared game IDs reproducible across builds.
Frozen replay corpus in `__fixtures__/`. **Any generator that must reproduce
a seed treats every draw as an observable side effect** (see the grid rules
above).

### `assert-never.ts` — refusing a move the dispatch has no arm for

`assertNever` is the form to reach for at the end of a discriminated
`interpretMove`/`executeMove` chain: binding the value to `never` keeps the
compile-time exhaustiveness (add a move type, forget an arm, and it stops
type-checking) *and* adds a legible runtime refusal for the untrusted case — a
save written by another build, whose moves are cast rather than parsed. A bare
`default: throw` trades the first away for the second, because any `default`
makes the function total for the type checker. `rejectMove` is for a move type
with no union to narrow.

### Engine internals a game never imports

One line each, for orientation: `game.ts` (the `Game` contract —
[`mechanics.md`](./mechanics.md)); `midend.ts` (orchestration:
undo/redo/timer/hint+mistake lifecycles — games depend on the interface, never
the midend); `registry.ts` (`puzzleId` → implementation;
`catalog-registry.test.ts` holds it and the catalog together both ways);
`save.ts` (the versioned-JSON move-log save envelope); `types.ts` (the shared
vocabulary: `Color`, `Point`, `Rect`, config descriptions, change
notifications); `index.ts` (the public barrel); `fake-game.ts` (the midend
test suite's minimal game).

## Testing harness

[`src/engine/testing/`](../../src/engine/testing/) — the in-process harness:
`recording-drawing.ts` + `render-scenario.ts` + `svg-drawing.ts` (tier 2.5 —
**every render test drives `RecordingDrawing`; do not hand-roll a double.** A
local double records only the calls its author anticipated, so a game that
starts drawing something new leaves it green. `opsOfKind(ops, "rect")` narrows
the op union, which `Array.filter` will not do; `paintsWith(op, COL_X)` asks
whether any primitive paints in a color, reading a polygon's or circle's fill
and outline as well as a `color`; `dr.updates` holds the
`drawUpdate` rects, kept off `ops` so they are assertable without a line in
every snapshot),
`drive-midend.ts` (`driveMidend(game)` / `observeMidend(midend)` — **what a
midend told the app**: the notifications, `last(type)` typed by its argument,
`timerActive()` and `redraws()`. Every test that asks what a midend reported
goes through it; do not hand-roll a `setCallbacks` recorder, and do not set
all-no-op callbacks, which the midend does not need),
`differential.ts` (`describeDescDifferential`, the byte-for-byte desc shape +
the one statement that fixtures are frozen and unregenerable),
`enrollment.ts` + `hint-games.ts` (**how a cross-game guard finds its
population**: both derive it — from the registry, a game's `Ui`, or its own
comment-stripped source — so a game joins a guard by *having* the capability
and never by being listed; see [`testing.md`](./testing.md) § "How a cross-game
guard finds its population"), `engine-source.ts` and `test-source.ts` (the
engine's and the suite's own comment-stripped code, each in a module of its own
because importing one reads that whole tree, which makes the importer run whole
on the pre-commit hook; `code-lines.ts` is their shared stripper), `slow.ts` (the
once-per-refactoring-round expensive tier), and two deliberately-independent
yardsticks (`oklch.ts`, `polygon-yardstick.ts` — each exists so a test cannot
vacuously agree with the implementation it measures; never import the
implementation into them). Usage: [`testing.md`](./testing.md).
