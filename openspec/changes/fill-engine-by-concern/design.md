## Context

Measured 2026-11-24 at d519cd580: `compile-fill.ts` 2,845 lines,
`render.ts` 2,367, `game-id.ts` 2,231 and `deal.ts` 1,137. Each was read
in full for task 1.1. What follows is the concept list per file, the
registry each file becomes, and what each registry's runner keeps.

## Goals / Non-Goals

**Goals:** a concept of the fill board is one module that registers with
the code that runs it. No behavior moves: the same desc, the same board
for a given seed, the same frame, the same hint walk.

**Non-goals:** new capability, and any change to what a generated module
says. The compiler's emitted text keeps its order byte for byte, since the
generated modules are checked in.

## Decisions

### 1. The desc: a segment kind is a module (`game-id.ts`, done in 2.1)

Concepts: the twelve segment kinds, `runs`, `walls`, `dots`, `lists`,
`cells`, `digits`, `numbers`, `glyphs`, `records`, `blocks`, `parts` and
`codes`. Each was one branch of `encodeDesc` and one of `decodeDesc`, with
its helpers.

Registry: `engine/fill/segments/<kind>.ts` exports a
`SegmentKind<S> = { encode, decode }`, where `S` is its `id:` entry.
`desc.ts` holds `SEGMENT_KINDS`, a record keyed by the key that names an
entry's kind. `IdSegment` is derived from that record, so a new kind is a
module and a registry line, and the type follows.

What the runner keeps:
- **The order is `id:`'s.** It is the desc's grammar.
- **One shared state, `out`:** the clues read so far. A `parts` segment
  and a `digits` segment at parts read their partition from it, so the
  compiler holds them after it.

### 2. The params: a setting is a module (`game-id.ts`, 2.1)

Concepts: the board's size, square or blocks (`FillBlocks`); the tally
(`FillTally`); the deal's options; the hide and only flags; the kind
letters; thorough; the tier flag and aliases; and the size bounds
(`MEASURES`, `beyond`). Each concept has up to three parts:
- its Custom fields;
- its params segments;
- its refusal in `validateParams`.

Registry: `engine/fill/params/<concept>.ts` exports those parts.
`fillParams` stays the runner, and it lists them **in an explicit order,
not as a loop**. The order of the params codec is upstream's grammar, and
one concept writes in two places: a tally's size follows the grid, and
its counts end the params. A homogeneous loop would have to encode that
order as a rank on each module, which says the same thing less plainly.

### 3. The deal: phases with steps (`deal.ts`, 2.3)

Concepts, in the order a draw runs them (`dealFill`):
1. sample the answer, a sampler per `Sample` kind;
2. partition it, by grow or divide;
3. derive the clues, then the latin renumber, `firstKind` and `oneKind`;
4. check the answer;
5. hide;
6. accept, by the tier checks, `scales`' below-tops and `hideFlag`.

Beside them run two others:
- the search tier's two runners;
- `climbFill`, with its own subset of the pipeline: `unpair`, and `mend`.

Registry and modules:
- **Samplers:** keyed by the `Sample` discriminant.
- **Clue steps:** latin, `firstKind` and `oneKind`, in a fixed array.
- **One module each, called by the runners, not steps:** the hide
  (`hideUpTo`, `hideOrder`, the orbit and units, `hiddenKinds`), climb,
  and the search runners. The hide's settings (`kinds`, `symmetry`,
  `whole`) feed every runner and the build sampler, so it cannot be one
  phase among others.

What the runner keeps:
- **The rng draws in the same order.** A seed must deal the same board,
  and the deal tests, the ID cases and the hint-walk fingerprints check
  it. The order is sampler, partition, the derive's `pick`, latin,
  `oneKind`'s shuffle, then the hide's.
- **The state across draws** lives in one context: `layouts`,
  `buildTier`, `shortOfLowest`, `spent` and `draws`.

The latin renumber is written twice, in `numbered` and in `buildAnswer`,
and each sits at its own point in the rng order. Both call the one
module.

As built (2.3): `deal.ts` is the runner, 110 lines: `dealt` runs the derive
and `CLUE_STEPS`, `draw` the sampler and the partition, then the search
tier's runners or the loop that hides and asks `accept.ts`. A sampler
returns the answer and, for `search`, the partition drawn with it, so
`search` is a sampler beside the rest. `draws` stays local to the stripped
search runner, the one reader. The base a climb shares (space, variations,
givens, `board`, `finishes`) is `dealBase`, and the climb takes no hide
settings, so a climb never meets the symmetric hide's refusal.
`one-kind.ts`, `first-kind.ts` and `latin-numbers.ts` moved into `deal/`
as the steps' modules; the hide's index arithmetic is `deal/keeping.ts`,
which the climb's `unpaired` shares.

### 4. The renderer: a core, cell layers and sites (`render.ts`, 2.2)

Concepts:
- **Palette slots.**
- **Geometry and margins.**
- **The frame and line labels.**
- **The parts:** walls, fills, inset and diagonals.
- **The surface and highlight.**
- **The piece and its animation.**
- **Cell layers:** joins, wash, part clues, typed numerals, notes, dots,
  live errors (diamonds and bars), numbers on cells, links, mistakes,
  cursor and win flash.
- **Raised and 3D.**
- **The hint pass.**
- **Sites outside the tiles:** gaps, slot clues, corner clues, line lists,
  line clues, the tally and the pencil indicator.

The registries:
- **Sites outside the tiles are a registry**, `render/sites/<site>.ts`,
  each a `FillSite = { size?, paint }` over a per-frame context. The
  context carries `shown`, the striped line, the marks, the tiles, the
  raised spill and the cursor. They paint in a fixed array order, since
  the order is behavior:
  - slots and the pencil indicator come after the margins repaint, which
    clears their caches;
  - corners come after the tiles and the marks, whose words they read.
- **Cell layers are modules called by `drawTile` in its paint order.**
  `drawTile`'s order is the one list of what lies over what.
- **The tile's four words keep fixed bit positions in one
  `tile-word.ts`.** A bit allocated at run time per layer would make
  every diff of the key unprovable by its shape.
- **The geometry that `redraw` mutates becomes one object per frame,**
  passed to the helpers: `depth`, `boardW`, `threeD` and `top`.
- **Raised and 3D stay one module with hook points.** It is a second
  tile renderer, and no layer can hold it.

As built (2.2): a site is `FillSite = { on, paint }`, and `on` filters
`SITES` once per board look. The sites' caches stay named fields of
`FillDrawState`, so `size?` was not needed. The hint's rings and the link
rings are sites as well, because they paint between the slots and the
corners. What the board's look decides once is `render/setup.ts`. The
geometry is `FillMetrics` plus a `Layout` built each frame
(`render/geometry.ts`, `render/cell-text.ts`). The cursor's corners stay
inline in `drawTile`, and the win flash is the surface's tone.

### 5. The compiler: modules beside a core (`compile-fill.ts`, 2.4)

Concepts:
- **The `id:` checks:** one per segment kind, plus `checkNamed`.
- **The clue locations:** the universes, `partsOf`, the line, slot and
  list exports, the gaps and the signs.
- **The hide.**
- **The partitions:** grow, divide and blocks.
- **The one-kind deal.**
- **The params:** settings, options, tally, tiers, the menu and bounds.
- **The derive.**
- **Play.**
- **Numbers.**

The modules live in `src/describe/fill/<concept>.ts`. `compile-fill.ts`
keeps the five emitters' order and the assembly of the `deal` object and
`clueMax`.

**One registry of letters in a shared compile context.** Five places
built their own list of the letters already taken. The registry replaces
them, and keeps both their order and their refusals' words.

**A segment kind's check is keyed by the same keys as
`SEGMENT_KINDS`,** typed so that a kind with no check fails to compile.
`description.ts`'s `IdSegmentJson` and `segmentKinds` are a second copy
of the segment kinds. That copy has already drifted: it lacks `always`
and `both`. So `IdSegmentJson` becomes `IdSegment`, and `segmentKinds` a
method of each kind.

As built (2.4, the move): `compile-fill.ts` is the runner, 312 lines:
`fillOf` writes the five parts in their order, `dealOf` assembles `deal`,
and `clueMaxOf` writes `clueMax`. `fill/` holds `emit.ts` (what every part
writes with), `values.ts` (a kind's values off its range), `id-checks.ts`,
`locations.ts` (universes, `partsOf`, signs, gaps and the margins'
exports), `hide.ts`, `partitions.ts`, `sample.ts`, `clue-steps.ts` (latin,
first kind, one kind), `params.ts`, `menu.ts`, `notes.ts`, `play.ts`,
`numbers.ts` and `derive.ts`, the largest at 450 lines. A sample's checks
moved out of `dealOf` as one call, so a description with a latin error and
a sample error now hears of the sample's first. Every born game's module is
the same byte for byte: HEAD's compiler, run over the split one's output,
writes none of 140.

As built (2.4, the registries): the compiler cannot load the engine's
segment modules, since `scripts/describe.ts` runs under node's type
stripping and they reach syntax it refuses (a parameter property). So each
kind's `names` sits beside its check in the compiler's `SEGMENTS`, keyed by
the engine's exported `SegmentKey` and typed by `SegmentOf<K>`, types alone;
`description.ts`'s `IdSegmentJson` and `segmentKinds` are gone, and a
code's meaning is `engine/fill/segments/code-said.ts`, which imports
nothing, read by both sides. `fill/letters.ts` is the registry of params
letters. It also holds the tally's and the hide flag's letters, which no
list held, and it holds the tier flag to every field's letters, where it
was held to the options' alone. Every born description compiles under it,
to the same bytes.

### 6. Clue locations (2.5): per registry, unless 2.4 shows otherwise

A location (lines, slots, corners, edges, parts) has a part in each of
the four registries: a site that draws it, the deal's universe, the
compiler's exports and checks, and the segment that writes it. Each part
needs its own runner's context.

A module per location across all four files would therefore import all
four runners' types to hold code that only one of them calls. The cut is
per registry. 2.5 is done if, after 2.4, a location's parts can be found
from its existing `engine/fill/<location>.ts` (`slots.ts`, `corners.ts`,
`gaps.ts`) by a reference, and that file names them. If they cannot, 2.5
gives each location a module of its own.

### 7. The bound (3.1)

**No file of the fill engine is over 800 lines.** The engine is
`src/engine/fill/**` and `src/describe/compile-fill.ts` with
`src/describe/fill/**`, tests excluded. A check under `scripts/checks/`
holds the bound, after `game-lines.mjs`.

The bound is 800 because the largest single concepts measure about
500–550 lines: the derive and the hide. 800 leaves room for a concept to
grow without letting a runner gather concepts again.

## Risks / Trade-offs

- **An rng draw moved in the deal deals a different board.** Nothing
  breaks, since the app hands out boards and not seeds. But the ID cases
  and fingerprints would churn, and churn hides a real change. The deal
  split must keep the order exactly, and it is checked by those tests
  passing unchanged.
- **The compiler's emitted text must not move.** The check is that
  `npm run describe` writes nothing after the split.
- **The renderer has no test of every frame.** The render snapshots and
  the app run on three born games (3.2) are the check, with the diff's
  shape: moved lines, not changed ones.
