## Context

Read 2026-11-23. A game is born from its description when the description
carries `catalog:` (`src/describe/sources.ts`, `bornFiles`); the born games
are those, fourteen on that date: Boats, Bricks, Clusters, Kakurasu, Light
Up, Mosaic, Norinori, Pattern, Range, Singles, Star Battle, Sticks, Tents
and Unruly. Each holds one `<game>.test.ts`, 127 `it(` among them, plus one
`describeHintPins` call each (Pattern has none) and Pattern's and Singles'
`describeAbsentTiers` / `describeDealtTiers`.

## Decisions

### Where the data lives: `<game>.cases.yaml`, beside the description

Its own file, as `<game>.plants.yaml` is, never a section of the
description. The description's readers are the compiler (`npm run
describe`, and a dev server on every save), the help build, the Vite config
through the catalog entry, the lint and the soundness checks: none of them
wants a test's boards, and a description that held them would recompile its
game, and move its generated module, whenever a pin was rescanned. The
cases file is read by the engine's tests alone, through `import.meta.glob`
with a literal pattern, so the commit hook's selector
(`scripts/checks/select-tests.ts`) runs the reader's tests when one
changes.

`npm run hint-scan` takes the cases file as it takes a test file today, and
writes its pins into the file's `hint.pins`, keeping its comments (the
`yaml` package's document API, which the repo already depends on).

### What the file says

One YAML map, every section optional; the reader refuses an unknown key,
naming the file and the line.

- `values`: names for the game's cell values (`shaded: 1`), so a move or an
  expectation is written `[30, shaded]`. A name the description's `values`
  already gives is not repeated: the reader takes the description's first.
- `hint`: what `describeHintPins` takes: `params`, `seeds`, `unreached`,
  `pins`, and `kinds`, each kind a step shape the engine matches (a rung,
  whether the step sets or only marks, a value it sets), never a function.
- `tiers`: `absent` and `dealt`, the cells `describeAbsentTiers` and
  `describeDealtTiers` take.
- `ids`: game IDs, each with what it opens as (`opens: <params>`, or
  `refused:` a refusal constant's name, a `/regex/` or the message), whether
  its desc is written back byte for byte (`writesBack`), and what the board
  holds (`dealt:` a clue kind's `at` and `v`, `values`, `fixed`).
- `params`: params strings, each with what it is written back as (`full`,
  `brief`), its label in the menu, or its refusal (`refused`, when dealing;
  `loads: true`, a board that arrives with its desc).
- `positions`: an ID, moves, and what the engine reports there: `status`,
  `text`, `statusbar`, `mistakes` (the count Check & Save finds), the hint's
  first `step` or `steps` (rung, the cells and values set, a `says`
  pattern), and `draws`, a count of the ops of one shape and color.
- `input`: an ID, a cursor, and events (a key by name, a press at a cell),
  each with the cursor, the values, or the preference it leaves.
- `wordings`: a technique's stated wording rendered from terms, and the
  sentence expected, for a wording no walk reaches.

An expected value written from the engine's own output, rather than known
apart from it (an ID upstream's generator wrote, a count the rules give),
carries `recorded: true` (the `testing` spec's "An expected outcome
recorded from the engine's own output").

### Where the assertions live

`src/engine/testing/game-cases.ts` reads and checks a cases file;
`src/guards/born-game-cases.test.ts` takes every born game, derived from
the descriptions that carry `catalog:`, holds each to having a cases file
(and each cases file to being a born game's), and runs each section through
the engine. A case its section cannot state is an engine check missing,
written under § "The new guards" for any game to name.

## The cases, by kind

Each `it(` of the fourteen files, by what it becomes. "Data" names the
section; "guard" the cross-game test that holds it, new where marked.

### 1. The mistake outline (13 cases, guard, new)

"Outlines a square Check & Save finds wrong, which breaks no rule yet", in
every born game but Pattern, which is on `mistake-overlay-coverage`'s
`NO_OVERLAY_TEST` ledger for having none. Twelve loop over the answer's
cells for one whose wrong value breaks no live rule; Kakurasu and Star
Battle name the cell. One guard over every born game (Pattern included)
does what the loop does on a board the guard deals from a fixed seed, so no
board is written down: the first cell whose other value draws no live
error, played, is counted once by Check & Save and drawn in the error
color. `mistake-overlay-coverage` counts a born game covered by it, read
from the same population, and Pattern leaves its ledger.

### 2. IDs read, written back, refused (data `ids`, with one guard extended)

- Read as the right clues and values: Boats (hidden numbers, given
  segments), Bricks (hexagon store and holes, a run split, a 7 as a hole),
  Clusters, Light Up, Mosaic, Norinori (regions from walls), Pattern (lists,
  given squares), Range, Singles (a letter past nine), Star Battle (regions,
  stars), Sticks, Unruly. 14 cases. Data `ids` with `dealt` / `values` /
  `fixed`. Bricks' "holds a w by h hexagon in a store ⌈h/2⌉ − 1 wider" is the
  hexagon capability's, tested on a fixture (§ "Capabilities on their own
  descriptions"), and its store size and holes are data here.
- Written back byte for byte: Boats, Bricks, Pattern, Singles, each over its
  list of upstream's IDs. Guard, extended: `upstream-descs.test.ts` already
  loads every born game's corpus entries; for a game with an ID codec
  declared in its description it also writes each desc back. The four
  lists' IDs not in the corpus go into it, marked as the hand-written port's
  where that is where they came from.
- Refused, with the message or constant: Boats, Pattern, Range, Singles,
  Star Battle, Norinori, Bricks (a number past 7, several answers), Sticks
  and Pattern (several answers, none). 10 cases. Data `ids` with `refused`.
- Opened at the tier it needs: Pattern, Sticks, Bricks (Tricky read as
  Unreasonable). Data `ids` with `opens`.

### 3. Params (data `params`)

Read and written back, the brief form, upstream's bare letters, a missing
height or tier (Boats, Clusters, Light Up, Pattern, Star Battle, Sticks,
Bricks); refusals with their words (Boats, Clusters, Light Up, Range,
Bricks, Star Battle, Sticks, Unruly's unique-rows bound); a board too small
for its tier that loads with its desc (Light Up, Clusters); Light Up's
labels. 17 cases. `params-stability` holds encode and decode inverse for
every game already, so a case that only round-trips a preset is dropped,
and named so in its game's commit.

### 4. Deals (guard: `difficulty-contract`; data `tiers`; guard, new)

- "Deals each tier and opens each at its tier": Boats, Bricks, Pattern,
  Singles, Sticks. `difficulty-contract.test.ts` already deals every
  preset's tier, reloads it from its short ID and holds the tier it opens
  at. The boards off the menu these tests deal (Bricks' 2x3, Sticks' 2x3
  and 3x3 Unreasonable) are data `tiers.dealt`.
- What a deal holds beyond its tier: a deal's clues are its answer's
  (Boats' given segments the shape the answer gives them, its numbers all
  shown unless hidden; Singles' shaded numbers repeats), its symmetry (Range,
  Light Up), its fleet whole (Boats), its stars per line (Star Battle). One
  new guard over every born game's dealt board: the dealt clues are what the
  description's derivation gives from the answer (all of them, or a subset
  where the deal hides), and a declared symmetry holds of where they sit.
  The fleet and the stars are rules the answer keeps, which `status`
  already reads. Bricks' "at least two in five are bricks" is a property
  of its deal's sampler, kept as a `positions` case on a recorded deal if
  the description states no bound; otherwise dropped, named.
- `describeAbsentTiers` / `describeDealtTiers` (Pattern, Singles, Range's
  1x5 Unreasonable refusal): data `tiers`.
- Pattern's "no Unreasonable board up to 3x3" enumerates every picture: a
  loop, so an engine check, `tiers.absent` taking an `exhaustive: true`
  that runs the enumeration for any fill game's small size. Listed under
  "fits no kind" until written.

### 5. Hint (data `hint`, `positions`)

- The pins: every born game but Pattern. Data `hint`. Tents' two `kinds`
  are predicates; each becomes a step shape (`linkAlone`: sets nothing and
  marks a link; `betweenThem`: rung `lineCount.noSpareRoom`, sets value
  `grass`).
- A plan's first steps from a written board, with rung, cells and words:
  Bricks, Light Up, Sticks (two), Pattern, Singles. 6 cases. Data
  `positions` with `steps`.
- Mosaic's circles round the numbers a step names, Range's circle round
  none: the painter's hint marks on a pinned position. Data `positions` with
  `draws`, where a count says it; Mosaic's match of circled text to the
  numbers the sentence names is the hint-ink capability's, tested on a
  fixture.
- Unreached wordings rendered from terms: Clusters (3), Star Battle (4).
  Data `wordings`.

### 6. Text, status bar, status (data `positions`)

Boats' and Pattern's and Singles' text; the clues-left count (Bricks,
Mosaic, Sticks), and none (Range); Light Up's lit square solved open. 8
cases. Data `positions` with `text`, `statusbar`, `status`.

### 7. Drawing (data `positions` with `draws`; capability fixtures)

Norinori's domino (two polygons meeting) and its breaches (three red
polygons, no bar; four red lines, no diamond); Light Up's wash (four
squares the bulb's color, with and without the cross under the
preference), the red cross and the red bulbs; Clusters' dots; Star Battle's
star and its corner error. 8 cases. A count of ops by shape and color is
`draws`; "the same color as another op", "two polygons meeting" and "drawn
again under a preference" are the painter capability's, each tested on a
fixture, with the count kept as data.

### 8. Input (data `input`)

Bricks' press through the shear, its hexagon cursor, its stroke along a pad
step; Singles' wrapping cursor and the off-grid press that flips its
preference; Sticks' drag, keys and arrows. 6 cases. Data `input`; the
hexagon's shear and the axis-line drag are capabilities, also tested on
fixtures.

### 9. What a placement rules out (Tents, 2 cases)

The first is data: a placement and the edit it brings (`positions` with
`brings`). The second, each tent of an answer against the help's rule,
loops: a guard, `placement-brings.test.ts`, for every game that declares
`rulesOut`. Its oracle is the live rules, not the techniques `bring` walks
(which would agree with itself): a placement alone brings exactly the open
squares where the same value would break, with it, a statement neither
breaks alone. A washed square is left out (the board already shows it
holding none), and so is a matching (which partner a placement takes is
the whole board's to settle). Laid in order the answer's placements bring
a subset: Norinori's named techniques leave out a square between two
shaded ones, which the rules rule out.

### Fits no kind

- Pattern's exhaustive absence (§ 4), pending `tiers.absent.exhaustive`.
- Boats' "counts a boat found only once it is shut in by water": a
  tally-display question (`wholePieces`), the tally capability's. It needs
  no game: `engine/fill/tally-display.test.ts` holds it on plain values.

## The new guards

1. The mistake outline (§ 1).
2. Desc written back, in `upstream-descs.test.ts` (§ 2).
3. A deal's clues are its answer's, and its symmetry holds (§ 4).
4. What a placement brings (§ 9).
5. Absence over every picture of a small size (§ 4).

## Order of the work

The reader and the mistake-outline guard first, with Kakurasu moved (it is
only pins and the outline); then a game or a few a commit, each section's
reader added when its first game needs it, each guard seen to fail on a
planted defect before a game's case leaves for it.
