## Context

Stage 3 of `archive/2026-11-21-architectural-review-blue-sky/design.md` §
"The route": the targets it pilots are 1, 2, 4, 7 and 8 of § "The target".
Stage 2 (`archive/2026-11-22-rules-say-where-they-break`) gave every
described game a compiled `violations`, which the layered render draws its
live errors from.

What the design rests on, read at `f89e11ba1` (2026-11-22):

- **The generic hint already exists.** `describedFiringHint`
  (`engine/hint/described-firing-hint.ts`) builds a step per firing from
  the description's `says` and `steps`. A game gives it eight small hooks:
  `width`, `size`, `valueAt`, `execute`, `foreign`, `target`, `want` and
  `move`. Norinori's whole hint is 64 lines of those hooks. Every hook is a
  read or a write of the board, so an engine board can supply all of them.
- **What it lacks**: it reads only `PLACE` facts. Tents' link is a `MARK`
  fact, and Tents runs its own walk (`readLinks`, `linkFor`) through the
  edge-hint path instead.
- **`says` arms exist.** A technique's `says.arms` splits one firing into
  step kinds by a condition on the binding (Boats' `satisfied`/`forced`).
  Tents does not use them: `hint.ts` recomputes the split of `lineCount`
  into `countMet`/`allOpen`/`noSpareRoom`/`betweenThem` from its own types,
  and every Tents `says` has `marks: {}`.
- **The engine owns no cell walk.** `TileCache` leaves the walk to the game
  on purpose (`engine/render/tile-cache.ts`, header). Each game turns
  `liveErrors` into its own tile bits. The skeleton's renderer is 301 lines,
  of which about 40 are the puzzle.
- **Registration and the catalog are per directory.** `src/games/index.ts`
  globs `./*/index.ts`, and about twenty modules glob or import
  `src/games/*/catalog.ts` (`git grep -ln 'catalog\.ts' -- src scripts`).

## Goals / Non-Goals

**Goals**

- An engine board for a fill game on a square grid, and every hook built
  from it, so a game of that shape is its description.
- One new game born that way, with no TypeScript of its own.
- Tents moved onto it, closing each gap in the engine.
- The figures that decide whether stage 4 goes ahead.

**Non-goals**

- The candidate family: notes, `markAll`, the keypad. That is stage 4's
  first batch.
- Edge, vertex and tiling answers.
- Drag-a-shape input.
- The art from the engine as declared pieces. The owner left that for a
  later conversation (`docs/doctrine.md`). Here a painter is an engine
  function named by the description, which is where that conversation can
  start.

## Decisions

### 1. The new game is Kakurasu

**Kakurasu.** Rules from the 2026-10-29 corpus, entry 13 (Janko,
Brainbashers, Demystify's model):

- Shade some cells of the grid.
- The columns weigh 1 to `w` from the left, and the rows 1 to `h` from the
  top.
- A row's clue is the sum of the weights of its shaded cells' columns, and
  a column's clue is the sum of the weights of its shaded cells' rows.

**Why Kakurasu:**

- It is a fill game, and the collection does not have it.
- It is well understood, and has nothing for the language to invent.
- **It shares with Tents what a second game should reuse**: the square
  grid, a clue on every line, two values and a blank, and line reasoning
  over "the ways to meet this clue".
- **It needs what Tents does not**:
  - a clue whose value is a weighted sum, not a count. The derived-clue
    path has to evaluate a `means`, not just count;
  - fixed labels in the margin, the weights, which are not clues;
  - a game-ID format of the engine's own, since it has no upstream;
  - a sampler of another kind, an independent shading;
  - no art: its painters are stock (a shaded square, a dot).

**Thermometers was weighed and not taken.** It needs a clue spanning an
ordered path of cells, which the language does not have. The pilot tests
the board, not the language, and a language gap would confound the figures.

### 2. Where a born game lives

A game born from its description has these files under `src/games/<id>/`:

- `<id>.description.yaml`;
- its icons;
- its tests, which are YAML scenarios or none at first (see "The ratchet"
  in § 9).

It has no `index.ts` and no `catalog.ts`. The description gains:

- `catalog:`, the entry's words;
- `play:` (§ 5).

The compiler writes `src/generated/games/<id>/<id>.game.ts`. That module
calls `fillGame(module, play)` and registers the result.

The registry and the catalog are found through one module,
`src/games/catalog.ts`. It globs both the hand-written entries and the
generated ones, and every reader that globs `catalog.ts` today reads it
instead. That is one obvious way, and it also serves stage 4.

`src/games/index.ts` globs the generated game modules beside `./*/index.ts`.

### 3. The board

`engine/fill/board.ts`:

```ts
interface FillBoard {
  readonly w: number;
  readonly h: number;
  readonly dealt: Dealt;            // the compiled module's, by clue kind
  readonly values: Int8Array;       // the description's values, 0 open
  readonly fixed: Uint8Array;       // 1 where the domain allows one value
  readonly mark: Int32Array;        // the element each cell's mark names, -1 none
}
```

- **One mark a cell.** The ladder's `CellMarks` holds one cell mark
  (`marked`), so the board holds one too. The first game with two kinds of
  cell mark widens both.
- **Open is not always undecided.** `play.blank` names the value an open
  cell reads as for the answer check, where the answer is the other values
  alone: Tents' grass, Kakurasu's unshaded. The live rules still read an
  open cell as undecided.

- **One encoding.** The values are the description's (Tents: 1 tent, 2
  grass, 3 tree). `GAME_VALUE`/`DESC_VALUE` and every index-order adapter
  go: the space's element order is the board's.
- **The board is the ladder's input.** A `CellMarks` is seeded straight
  from `values`, `marks` and `domainOf`, with no translation, and `dealt`
  is the ladder's `Dealt` itself.
- **A given is not a clue copied into the grid.** Where the domain leaves a
  cell one value (a tree), `newState` places it and marks it `fixed`.
  An edit never changes a fixed cell, and the renderer draws it as a given.
- **Immutable.** A move clones the arrays it touches, as every game does
  now.

### 4. `Edit`, and what an edit drops

```ts
type Edit = {
  readonly set?: readonly number[];   // cell, value, cell, value, ...
  readonly mark?: readonly number[];  // cell, element, ... (-1 clears)
};
```

- **The one move.** A flat number list keeps a save small and JSON-safe.
  Solve is an `Edit` that sets every open cell.
- **What a mark needs.** A mark kind may state `while:` in the
  description: a formula over `at` that the mark needs to stand. Tents'
  link needs `value(at) = 1`.
- **What an edit drops.** After an edit, the engine drops every mark whose
  `while` fails. That is Tents' "a square that stops being a tent lets go
  of its tree", stated once.
- **The link is one-sided.** The description's link is one-sided: a tent
  names its tree's clue. Tents' two-ended `links` go.

### 5. `play:`, the Ui and input by archetype

```yaml
play:
  values:                 # what the player places, in the description's values
    1: { does: place a tent, key: T, glyph: "//\\", paint: tent }
    2: { does: mark it as grass, key: N, glyph: "   ", paint: ground }
  given: { 3: { glyph: " T ", paint: tree } }
  primary: 1              # left click: open <-> 1
  secondary: 2            # right click: open <-> 2, the value that rules out
  blank: 2                # an open cell reads as grass for the answer check
  erase: B                # beside Backspace and Delete
  stroke: line            # a secondary drag paints along one row or column
  links: link             # the cell mark, drawn as a link to the clue beside
```

- **The Ui.** `FillUi` holds the cursor, the drag (button, anchor, `ok`)
  and the armed link key. No `changedState`: the armed key names a cell,
  and the arrow that fires it reads the board it is handed, which the
  contract calls safe (`Game.changedState`).
- **The secondary value always rules out**, so `play` has no flag for it:
  the engine's convention is that the right button rules a target out.
- **Input.** The engine builds the `TargetVerbs` from `play`:
  - the primary and secondary verbs, the latter `rulingOut`;
  - a key per value, and erase;
  - Shift/Ctrl-arrow painting with the secondary value. Today 7 games write
    this, about 170 lines.
- **`stroke`.** `line` is Tents' and Boats' drag along one row or column;
  `sweep` is the engine's existing sweep.
- **`links`.** It names a mark whose notation is `one of clues(K)`. The
  engine gives it:
  - a drag between a cell and the clue's cell, which places the primary
    value where the cell is open;
  - the `L` key and an arrow;
  - the hint's gesture for a `MARK` fact.
- **What the engine builds from the board and the compiled module:**
  - `executeMove`;
  - `status`, from `isAnswer`;
  - `solve`;
  - `findMistakes`, `clearMistakes` and `revealOne`, against the answer:
    the deal's `aux`, else a ladder solve at the top tier;
  - `newUi` and `changedState`;
  - `textFormat`, from the glyphs;
  - `rules`;
  - the `difficulty` contract.
- **A mark is a mistake** where `marksHold` fails with the answer and the
  marks before it in reading order. That generalizes Tents' `badLinks`.
  The marks reach `marksHold` as its last argument, after the clues, as
  Bridges' and Tracks' candidates already do. Tents' module has no
  `marksHold` yet: the compiler gains one for a cell mark's `means`
  (task 3.2).

### 6. Render by layers

`engine/fill/render.ts` owns the walk for a square-grid fill game.

**The key.** Each tile's key packs:

- the value;
- `fixed`;
- the live-error bits;
- the mistake;
- the cursor;
- the flash tone;
- the hint overlay;
- each mark's direction.

**The layers**, in z-order, each an engine function:

1. surface, grid and frame;
2. the value's painter;
3. the mark's painter (the link's half);
4. live errors from `liveErrors`;
5. the mistake outline;
6. the cursor.

**After the walk:**

- `HintMarks.paint` and the link rings;
- the margins.

**A painter.** It is named in `play` and implemented in
`engine/render/pieces/`:

- `shade` and `dot`, which Kakurasu needs;
- `tent` and `tree`, Tents' art moved there and addressed to a piece, not
  to Tents;
- `ground`, the surface alone.

**The margins.** They draw each line clue as a number:

- on the side the description names;
- red when `liveErrors` names its clue;
- outlined when a hint marks it.

A `labels:` entry draws fixed margin text from a formula of the line's
index. Kakurasu writes `labels: { start: "i + 1" }`.

**Colors.** The palette is the roles each named painter declares. That is
the review's "a painter per value". The explicit walk stays for every game
that does not fit.

### 7. Clues derived from `means`; the deal

**Deriving the clues.** The compiler emits `clueHolds_<kind>(g, sp, at, v)`
from each clue's `means`. `deriveClues(g, sp)` deals:

- for a `complete` kind, at every element of its sort, the one value
  that holds;
- for any other kind, every (element, value) that holds.

Tents' trees and counts and Kakurasu's sums all come from this. Neither
game counts anything by hand.

**The sampler.** `deal:` gains `sample:`, a capability with parameters,
from `engine/fill/sample.ts`:

- **`scatter`**: a value on a share of the cells, optionally none within
  `apart` of each other, the rest another value. Kakurasu is a `scatter`
  with share one half and no `apart`.
- **`partner`**: beside each scattered cell, along a relation, a cell of
  another value, the two matched. Tents is a `scatter` (a fifth, `apart:
  adj8`) with a `partner` (value 3, `adj4`).

The prose `deal:` lines stay as the help's words for what is chosen.

**The tier gate.** The engine's deal loop runs these steps:

1. Sample.
2. Check `isAnswer`.
3. Derive the clues.
4. Run the ladder at the asked tier and the tier below. Keep the board
   where it finishes at the asked tier and not below.
5. Encode the board, with the answer as `aux`.

A retry limit bounds the loop, as `engine/contract/retry-limit.ts` does
now.

### 8. The game ID

**The codec.** `engine/game-id/` gains combinators after cspuz's
serializer:

- `runs(kind)`, upstream's `_`, `a`–`y`, `z` run code over a marker clue;
- `numbers(kind, { before: "," })`, a clue per element in the space's
  order.

The description's `id:` lists them. Tents keeps upstream's grammar
byte for byte: `[runs: tree, numbers: { count, before: "," }]`, in its
column-first order, given as `order: columns`. Its IDs and links do not
change.

**The default.** Without `id:`, the codec is `numbers` over every clue
kind.

**Params.** Params are `WxH` and `d<letter>`:

- the size bounds come from `sizes`;
- the tier list comes from `tiers`;
- the letters are `tierLetters:`, defaulting to each tier's initial. Tents
  keeps `et`.

### 9. The figures, and the ratchet

**Figures for 3.3, each against the parent of the change's first commit:**

- the TypeScript lines under `src/games/tents/`, and the lines added under
  `src/engine/` and `src/describe/`;
- frame time, `npm run probe`'s render timing;
- hint-walk time on 20 boards a size;
- the engine capabilities Kakurasu added and those Tents added after it.

The pilot holds if Tents needed fewer new capabilities than Kakurasu, and
frame time and hint-walk time are within 10%.

**The ratchet.** It is a gate check that counts the TypeScript lines under
`src/games/`, tests excluded, against a committed ceiling. It fails above
the ceiling, and lowering the ceiling is part of the change that lowers the
count.

## Risks / Trade-offs

- **Tents' hint quality.** Its walk reads links at a glance and offers a
  link only when it serves (`readLinks`, `linkFor`).
  - Moving it onto the firing hint needs those as engine capabilities:
    - a placement run once on the drawn marks;
    - a mark offered only where it lets a later technique fire.
  - If the hint is worse when judged in the app, Tents keeps an override
    for its walk, and the figures say so.
- **Kakurasu's deal rate.** Kakurasu may deal few unique boards from an
  independent half shading. Before tuning, measure the rate on 6x6 and
  8x8. The sampler's share is a parameter, not code.
- **Two paths.** `fillGame` beside the raw `Game` holds only if the second
  game needed little. That is the figure the pilot exists for.
- **Saves.** Tents' saves from before the move stop loading (the owner,
  2026-11-21). The help's and the spec's words say nothing about saves, so
  only the spec's move format changes.

## Open questions

None for the owner. Breaking saves was answered on 2026-11-21.
