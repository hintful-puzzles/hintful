## Context

Filed 2026-11-23 by `born-candidate-note-family` at its archive
(`openspec/changes/archive/2026-11-23-born-candidate-note-family/`), whose
design.md holds the gap list this change starts from (§ "The gap list
(1.1)", read at `153e4cf43`), its § "Shared" table of which capability
each later game takes from whom, and the figures it was judged by. The
population is the same query's, less what moved:

```sh
git grep -l -E 'note-taking-cell|candidate-hint' -- 'src/games/*.ts' \
  | cut -d/ -f3 | sort -u
```

with Magnets, whose notes are its own. At filing that leaves the nine of
proposal.md; Ascent went to lines and loops.

What the predecessor built, each tested on a fixture of its own under
`src/engine/testing/fixtures/` (`docs/descriptions.md` and
`docs/hints-candidates.md` say each): notes on the fill board with
mark-all, auto-pencil and the four prefs; `play.numbers` and its keypad,
reaching the board in play; the candidate walk built from the compiled
module, its regions the units and each partition the rules hold distinct;
givens from `given:`; a Latin answer; clues at edges, slots, corners and a
dealt partition's parts; done marks on any clue; a partition divided before
the answer and the answer searched under it; a ruleset by a bare letter; a
kind precedence switched by letters; a hide in turn, from a tier up, whole,
and ordered by a formula (`deal.hideBy`).

## Goals / Non-Goals

**Goals:**

- Every game of the nine played from its description, its directory holding
  no TypeScript but tests.
- The family judged by `docs/descriptions.md` § "Judging a family moved
  onto its description", with the predecessor's figures beside these.

**Non-Goals:**

- Answers on edges or partitions: a game that needs one waits for the
  regions group, and the gap list says so.

## The rules

The predecessor's design.md § "The rules", unchanged: a gap list first; a
game a commit, run in the app before it is done; every capability
adoptable; a game may change to fit the engine, never significantly worse,
each difference listed; judged by the criteria against a worktree of this
change's baseline; a flip moves the game's tests to its `cases.yaml`; no
game stays hand-written.

Learned there, for this order: the share of a flip's needs met by what is
built rises within a clue universe and falls at each new one (its § "The
figures (3.1)", criterion 3). An order that takes the games on a universe
already built first (Solo on parts and a divided partition, Salad and
Undead on slots, Magnets on edges) and a new universe's games together
meets more of each flip from the one before.

## The gap list (1.1)

Read at `0b0727c9d` (2026-11-23), each game's TypeScript and description
against `engine/fill/` and `describe/compile-fill.ts`. The query gives the
eight of proposal.md but Magnets, as before. Lines are non-test TypeScript.
No description has `catalog:`, `play:`, `id:` or `tierLetters:`, every
`deal:` is prose, and every ladder already runs compiled; each `catalog.ts`
moves into `catalog:` as it did for the first six. *Met* names what does it
now; *new* names the capability as a concept.

**What several games lack**, each a refusal in `compile-fill.ts` today:

- *The walk of the notes over any unit* (Solo): `checkWalkSteps` reads rows
  and columns, or the parts a rule holds distinct; Solo's blocks and
  diagonals are units, and its cages a distinct partition.
- *A walk of the notes with no region* (ABCD, Undead, Crossing): a board
  whose placements rule nothing out by a unit, its reach the placing
  techniques' alone (`notes.ts`'s `reachOf` is already the techniques').
- *A size the rules read that is a number, not a ruleset* (ABCD's and
  Salad's `n`): `settingsOf` takes every size past the grid as one field of
  rulesets.
- *Values drawn and typed as letters from A* (ABCD, Salad's Letters, Group,
  whose identity is `e`): `numeral()` draws 1 to 9, then `a` on.
- *A clue derived per value, or at the board* (ABCD's counts a letter a
  line; Undead's totals; Crossing's list; Magnets' counts a pole): the
  sampled deal derives a clue of one value at an element.
- *Notes on a board of painted values* (Undead's monsters, Rome's arrows):
  the compiler takes notes on `play.numbers` alone.
- *A glyph segment over several kinds, its last run written* (Undead, Rome,
  Salad's Numbers): `glyphs` maps one kind and leaves the last run off.
- *Slots in an order of the ID's own* (Salad's top, left, bottom, right;
  Undead's clockwise).

**Solo** (3,780): Standard is met but for the walk over its blocks:
`blocks(r, c)` units, givens as `digits` (upstream's `encode_grid` is the
`digits` runs), the alphabet past 9, `deal.symmetric` for the hide of one
kind. New: the walk over any unit (above); X's diagonals as units, drawn
as a stroke; the ID's `{c}x{r}` and `{n}j` sizes and the symmetry suffixes
(`a`, `r4`, `m2`, `md2`, `m4`, `md4`, `m8`, the default `r2` unwritten) as
a deal option of seven symmetries where `deal.symmetric` has the five of
`symmetric-blacks.ts`; a jigsaw's blocks as a partition divided into equal
parts of `n` (`deal.divide`'s sizes grow to drawn sizes, not to a tiling of
equal ones), written by `blocks` (met, Keen); killer's cages dealt on the
answer as Keen's are (met: `divide` with pairs), a second partition drawn
inset inside the blocks, the total at a cage's first cell (met, Keen's
label), the cages and totals written by `blocks` and `digits` (met);
grading on two scales, a board at the asked tier on each (`scales:` is
compiled to `SCALE`, and the fill deal grades on `tiers` alone); the
hint's words, `steps:` and `phrases:` today driven by `hint-reasons.ts`,
restated as `says` (Keen's shape).

**ABCD** (2,334): `count` at a line `per: value`, its shapes and the
no-diagonal variation already run. New: a number size `n`; letters A to I
typed, digits their aliases; deriving a `per: value` clue and its segment,
element by value, `-` hidden; a margin `n` deep for such a clue, a heading
a value; the walk with no region; small crosses at corners under the
variation; the variation's letter upper-case and its Custom box inverted
(`D`, "Allow diagonal touching"); `R`, a hide by flag that is the only hide,
written before the tier (Boats' `hideFlag` writes after it); a tier
refused by area and setting. Its sample is `build` (met), distributed
differently from upstream's reading-order fill.

**Salad** (3,545): slots and their clues (Towers), balls at cells, the
Latin library, givens, the repeated empty value (`answer.value.repeat`,
compiled, unused by a deal) are met. New: `n`; letters under one ruleset,
digits under the other; a ruleset that chooses which kinds are dealt and
which ID segments are written; the slot order of the ID; a Latin square
folded to `n` symbols; the empty value typed by `X`, drawn as a cross, its
note an X; the `O` cell, a symbol not yet named; a hide that weakens a
numbered ball to a bare one before it removes it; refusing a board a named
part of the ladder finishes; the walk where a unit holds the empty value
more than once; its 1,157 lines of hint stated as `says`.

**Group** (2,516): the Latin square, the `associative` rule, givens with
`_` apart (Range's `digits`), the square size are met. New: letters, and a
display permutation putting the identity first as `e`; a ruleset letter
after the tier (`i`); a keep-set for the hide (the identity's row and
column) and, under `i`, a hide that blanks lines first; tiers a ruleset
offers; a skipped tier in the menu; an answer drawn from shipped data and
relabeled; an associativity break drawn as its triple; and § "Open
Questions".

**Undead** (3,353): sightlines through mirrors (`sight`, compiled) and done
marks at slots (Towers) are met. New: notes on painted values; the three
totals as a dealt board clue drawn as a clickable counts row; mirrors as a
dealt clue at random, not derived; the glyph segment; clockwise slots;
deal settings varying by tier; an Easy tier capped by passes; the walk with
no region; monster and mirror painters and a pictures-or-letters
preference.

**Magnets** (3,423): the domino partition's walls and the tier letters,
`hideFlag` and variants are met. New: a whole-part placement (a move writes
both ends, partner `4 − d`); a mark on a part (its one note, `?`); counts a
pole on four margins with done marks on line clues; a per-line one-letter
segment and a domino segment; a domino tiling as a `divide`; a build with a
preferred value and a share drawn first; pole painters; its bespoke hint
(`hint.ts`, `reading.ts`, `speak.ts`, 1,536 lines) stated as `says`.

**Rome** (2,871): the areas, the arrows as a value a cell (`to`, `chain`,
`home`, `implied: noLoop`) and the goal clue derived are met. New: notes on
painted values, drawn as small arrows; the glyph segment over two kinds; a
sample with a fallback value where none fits; areas merged under a
predicate on the answer; a value chosen by a drag's direction and armed by
arrow keys; arrow and goal painters; a wash of cells by a formula behind a
preference; its `steps:` restated as `says`, its values named by
direction.

**Crossing** (3,923): the numbers, notes, `stretch` and the search tier are
met. New: a list at the board, derived, drawn as a panel struck as used,
and marked by hints; the wall segment of decimal open runs and letter wall
runs; walls opened until no 2x2 is open; a digit a cell at random as the
sample; a bare deal flag (`S`); typing that advances along a run, a whole
number placed at once, and the Numbers panel (`ReferenceAid`, which no
description supplies); the walk with no region.

**Map** (3,468): its notes over four colors and its techniques compile.
New: a space whose cells are a partition's parts, with input, drawing,
notes, mistakes and the walk addressed to parts; regions grown from seeds;
a four-coloring as the sample; a hide that keeps a color's last given; the
edge-list and color-run segments; a size `n` after a letter; quadrant
drawing; the walk over a graph. The regions group (route 1.3) does not
build that space: its games' answers are edges or partitions on a grid,
not parts as elements, and no open change builds one. Map does not wait
for it; it builds the space itself, last.

## Decisions

### 1. The order, and where this change stops (1.2)

1. **Solo**: on Keen's parts and blocks and the deal on the answer; adds
   the walk over any unit, a second scale, the diagonals and the
   equal-part division.
2. **ABCD**: the number size, letters, the walk with no region, a clue
   per value derived and drawn.
3. **Salad**: on Towers' slots and ABCD's number size, letters and empty
   cells; adds the ruleset that chooses kinds and the folded Latin square.
4. **Group**: on letters; its controls as § "Open Questions" decides.

That is the natural break: the four are Latin squares of letters or
numbers on rows, columns and units, and stand on what the first six built
and on each other. The other five need what none of the four does: notes on
painted values (Undead, Rome), a clue at the board (Undead, Crossing),
whole-part moves and marks (Magnets), and a space of parts (Map). Their
successor, filed when this change is archived, takes Undead, Rome,
Magnets, Crossing and then Map.

### 2. Group's controls, each built as an engine capability (2.4)

The owner kept all three (§ "Open Questions"). Read 2026-11-27 against
`31416a549`, each against what the engine has; built in this order, the
widest use first:

- **A selection typed once** (multifill). `Edit.set` is already a list of
  cells, so one move setting several needs nothing new in the save. What is
  missing is a selection on a typed board (`FillUi`'s `drag` and `path` are
  the button boards'), its highlight, and a walk and a judge that take a set
  of several cells. Stated as a shape a drag selects, `diagonal` for Group;
  any typed board can adopt a shape of its own (a free selection is what
  sudoku apps offer). A typed value passes over a given that already holds
  it, as Group's does.
- **A player's divider between two lines**, saved and undone as `done`
  marks are (`engine/fill/done.ts`), drawn as a rule across the board. Any
  board can offer it for marking a block the player has seen; that Group's
  is keyed by the pair of values on either side, and goes when they part,
  belongs to the display order below.
- **A display order of a square's lines**, rows and columns moved together
  by dragging a header (or Shift and an arrow), saved as a move. Nothing in
  the engine draws a cell anywhere but at its place, and the order reaches
  geometry, the cursor, target lookup, the hint's gestures and every layer.
  2.4 starts by tracing whether one remap in `render/geometry.ts`'s
  `Layout` and the target lookup carries it; where it cannot, the sites are
  the plan. Its users are the boards whose lines are symbols, not places (a
  clue at a line's end fixes the order). Built (2.4c) as a view, not a
  remap: thirteen `render/` modules take a cell's board neighbor as the one
  drawn beside it, so the renderer and the input are given the board
  permuted into its order (`engine/fill/order.ts`), and what the board says
  of its cells (live errors, mistakes, a hint's marks and gestures) is taken
  across, with each move taken back. No layer learns of the order; the cost
  is one permuted copy a frame and a press, a few dozen cells.

## What each flip changed for a player

For the family's figures (task 3.1) and its debrief; what each flip added
to the engine is in its commit.

- **Solo** (13f27ca01): saves break (pre-approved); the full params write
  Easy's `dt`; `kx`, an order upstream never writes, is not read; two runs
  of blanks in a row read as one, as upstream reads them, where the port
  refused them; the blocks are tinted with the region fills and the cages
  dashed in ink inside them; a label reads "3x3 Normal, X" for "3x3 X
  Normal"; the hint's words are the description's `says` and the walk's
  `steps`; a 4 Jigsaw has no Normal or Tricky and a 2x2 Killer nothing
  above Easy, as upstream's generator deals none; the text of a Killer
  board prints its blocks and each row's totals, not its cages; the Killer
  preset's full form is `3x3kdt`, the default symmetry, where it was
  `3x3ka` (Killer hides every given, so no board differs). Solo's sizes are
  named apart from `c`, which `given:` reads as its cell.
- **ABCD** (2.2f): saves break (pre-approved); IDs read and write back as
  before. The Custom box is "No diagonal touching", on for the rule, where
  "Allow diagonal touching" was on without it; 6x9 with 3 letters is on the
  menu's grid at both tiers, where it was an Easy variant. A label reads
  "no diagonal, clues hidden" where it read "clues hidden, no diagonal". A
  clue may be as large as its line is long, where it was refused past half
  the line and one; such a board still has no answer. The margin's heading
  letters are the engine's heading color, not upstream's blue. Mark-all
  strikes a letter beside its twin only, no longer one whose line holds its
  count (the help says so). The text format is the engine's boxed grid. The
  hint's words are the description's: a satisfied line strikes its letter in
  one step, "so the As must go"; the opening says "candidate letter".
  Against the hand-written game (`compare-cost --quick`, 11 boards): the
  same 618 steps, the walk 17% dearer in instructions, the deal 5%.
- **Salad** (2.3f): saves break (pre-approved); IDs read and write back as
  before, and every board the hand-written game dealt is finished by the
  born hint. The cross is the engine's, half a square wide, where upstream's
  spans the square; a ball is an unfilled ring, a given one in ink, a
  player's in the entry color; a placed number has no ball round it. A ball
  is a note, the empty square struck from the square's notes, so Undo,
  Clear and the mistake check treat it as one; `O` on a square holding a
  value types nothing, where upstream empties the square into a ball. A
  ball's notes sit inside its ring, as upstream fits them, smaller than the
  other squares' (against `noteGrid`'s one size a board: kept, it would
  shrink every note on the board to the ring's). A label reads "Letters: 5x5
  Easy, 3 symbols" for "Letters: 5x5 A~C Easy", and the status bar no
  longer shows the range of symbols, as no born game's does. The copied
  text prints a ball as `O`, and a Numbers board prints no border rim. The
  hint's words are the description's: the border clue in two arms (what is
  nearest it, and how far in its letter can sit), a line's empty squares
  and a square every symbol is ruled out of placing the empty square, a
  given ball striking its X, and a placed X that fills its line said as its
  line's last; the hint no longer marks a square as holding a symbol, which
  its notes say. Against the hand-written game (`compare-cost --quick`, 15
  boards): 1141 steps for 996, the walk 31% dearer in instructions, the
  deal 2.5 times (10.0 G instructions for 15 deals, some 50 ms each).
- **Group** (2.4h): saves break (pre-approved); IDs read and write back as
  before, and the params' encodings are unchanged. A label reads "Identity
  shown: 6x6 Normal" for "6x6 Normal", and "Identity hidden: 8x8 Normal"
  for "8x8 Normal, identity hidden", each mode its own section of the menu;
  a refusal names the mode. The Custom box chooses the mode, where a "Show
  identity" box was ticked. The copied text is the engine's boxed grid, and
  no solution aux is written. Drag-select works in pencil mode too: it
  notes the letter in each square of the diagonal, or strikes it from all,
  where it marked only the first square. The sticky pencil preference is
  offered. Shift and an arrow, `|` and `-`, the header drag, the dividers
  and the leading diagonal are as before, as engine capabilities. The
  hint's words are the description's; the not-identity step names the first
  of `o·a` and `a·o`, in reading order, that shows it. Against the
  hand-written game (`compare-cost --quick`, 7 boards): 236 steps for 239,
  the same Unreasonable board left to a search in both, the walk 2.3 times
  in instructions, the deal 2.6 times (4.9 G instructions for 7 deals).

## The figures (3.1)

Taken 2026-11-27 against `0b0727c9d`, the gap list's baseline, for the
three games flipped (Group's when it is). The baseline's lockfile differs
from this tree's by a dev-only type generator (`json-schema-to-typescript`,
`936f6a6b9`) that no bundle holds, so the cost runs took a worktree of the
baseline carrying this tree's lockfile (`--baseline`).

**1. Lines.** Each flip's hand-written TypeScript removed under
`src/games/<g>/`, tests excluded, against what `src/engine/` and
`src/describe/` gained net over the change's own commits for that game
(its capabilities and its flip), tests, `engine/testing/`, JSON and YAML
excluded. Between Solo's flip and ABCD's, three other changes landed (the
fill engine by concern, one way to say a setting, an answer on the edges),
so a range of commits would count theirs.

| Game | Removed | Engine net | Description | Cases |
| --- | --- | --- | --- | --- |
| Solo | 3,780 | +1,310 | 609 | 515 |
| ABCD | 2,334 | +716 | 272 | 206 |
| Salad | 3,545 | +1,009 | 284 | 241 |
| Group | 2,516 | +1,095 | 451 | 350 |
| All four | 12,175 | +4,130 | 1,616 | 1,312 |

Group's engine net is +1,654 for its capabilities less the 559 lines of
the Latin solver's driver and the row/column preset it was the last caller
of; its description holds the 76 groups' generators (`groupdata.ts`, 279
lines, was among the removed).

3.2 lines go for each one the engine gains, past the bar of two.

**2. Capabilities** are listed with their concepts in each flip's task.

**3. What earlier flips built is used.** Solo met its blocks, givens,
alphabet, cages and their totals from Keen's parts and deal on the answer,
and added the walk over any unit, a second scale, the diagonals, the
equal-part division and the eight symmetries. ABCD met little: its clue a
value, letters, the number size and the walk with no unit were all new.
Salad, on Towers' slots and ABCD's letters and number size, met most of
its board and added the ruleset choosing kinds, the folded square and the
empty value. Within the Latin squares the share rose from ABCD to Salad,
as the order meant it to.

**4 and 5. Cost and steps**, `npm run compare-cost` (five rounds, four
boards a menu board of at most 100 squares; baseline / working tree):

| Game | Walk instructions | Deal instructions | Steps |
| --- | --- | --- | --- |
| Solo | 53.84 / 42.48 G, −21.1% | 53.26 / 205.15 G, +285% | 5498 / 5064 |
| ABCD | 7.72 / 8.95 G, +15.9% | 3.23 / 6.78 G, +110% | 2392 / 2392 |
| Salad | 9.36 / 11.82 G, +26.3% | 16.61 / 31.08 G, +87.1% | 4080 / 4591 |
| Group | 2.93 / 9.62 G, +228.5% | 29.29 / 9.04 G, −69.1% | 933 / 924 |

Each spread is under 1%. Both trees leave the same boards unsolved by the
hint (Solo 8, ABCD 16, Group 4, each an 8x8 Unreasonable left to a search).
Group's row was taken 2026-11-28 against the same baseline, at
`191ab6a07`.

The deals in ms (`--quick --times 12`: each menu board twelve seeds, each
seed's least of three runs, bundled; baseline / working median):

- **Solo passes the bar on four menu boards** where the baseline did not:
  3x3 Intermediate 9 / 136, 3x3 Unreasonable 86 / 178, 3x3 Killer 6 / 136,
  9 Jigsaw Extreme 96 / 325. Those the baseline already passed are dearer
  too: 3x3 Advanced 163 / 516 (slowest 615 / 6,402), 3x3 Extreme 135 / 621,
  2x3 Intermediate 263 / 645. To be fixed in the engine (3.1a).
- **Fixed (3.1a).** Nearly all of it was the search for the answer under
  the blocks and cages (`sample: { search: true }`), which ran the ladder
  below Unreasonable at every position it tried: 41% of a profile's samples
  were `latin.set`, which walks each line's subsets of values, and 77% the
  search. Any answer will do there, so the search now deduces at the
  easiest tier alone (`samplers.ts`'s `ANSWER_SEARCH_CAP`); Seismic's ladder
  already capped it there, and the fixtures' one tier is the search's.
  `--quick --times 12` against `f5b6497c3` (before / after, median ms):
  3x3 Intermediate 86 / 14, Unreasonable 122 / 20, Killer 79 / 18, 9 Jigsaw
  Extreme 243 / 54, 3x3 Advanced 332 / 50, 3x3 Extreme 431 / 56, 2x3
  Intermediate 429 / 129 (the hand-written 263); deal instructions 86.7 /
  15.6 G, −82%. The walk, the steps and Seismic's figures do not move.
  2x3 Intermediate is the one menu board over the bar, as the hand-written
  game's was.
- **ABCD and Salad stay under it**: ABCD's largest median 17 ms (6x8 Hard),
  Salad's 159 on 5n4Bdx, which the baseline passed at 128.
- **Group passes the bar on one menu board** where the baseline did not:
  8x8 Tricky 74 / 127 (slowest 581 / 492, 5 / 8 of 12 seeds over 100).
  Every other menu board is at most 11 ms in both trees. To be fixed in
  the engine (3.1c), as Solo's was.

No walk comes near 100 ms on a menu board.

**The steps by rung (3.1b)**, `--quick` (one board a menu board; baseline
/ working), read 2026-11-27 step by step in both trees, each board walked
by its hint from the same ID:

- **Salad**, 996 / 1,141, and 957 fixed. `borderNear` 114 / 305 was the
  rise, and it was a firing cut into legs after all: the description said
  `shown: value`, so a firing striking B and C from the square nearest a
  clue was two steps ("so the B must go", "so the C must go") where the
  hand-written game's one said "so B and C must go". Both trees fire it on
  the same squares (12 on 5n3Lde). Its words name the square, not a value,
  so the fix drops `shown: value` there: `borderNear` 121, each step doing
  what the hand-written one did. The rest is the family's: `emptyLine` 121
  stands for the hand-written `countLettersDone` and `countHolesDone` (87
  and 76), and `crossNaked`, `circleXNote` and `xNoteGone` (64) are gone
  into `emptySquare` and `ball` (54).
- **Solo**, 1,329 / 1,234, and 1,231 with the split below. `note` 188 / 43
  is the fall and `intersect` 69 / 136 the rise, one cause: under the
  implicit reading an `intersect` striking a digit from a note-less cell
  writes that cell's notes without it ("so this cell can only be 2, 3, 5,
  6, 8 or 9"), a step a cell, where the hand-written game first spent a
  `note` step on each cell and then one `intersect` step striking all of
  them. 101 of the 136 are such folds. No step does less: the fold says
  in one step what took two.
- **The split.** Reading Solo showed the fill engine cut every described
  strike firing a leg a cell, where the library's strikes put the cells
  with notes written in one leg (`byWrittenCell`). A described technique
  now splits as the library's do unless its words are one cell's (they
  say `{ring}`, `{struck}` or a fact's own: Keen's cages, Mathrax's
  clues), compiled as `byCell`. It moves Solo's `intersect` and
  `digitSet` and Salad's `borderNear` and `ball`; Solo's three
  `intersect` firings over noted cells are one step each.

## Open Questions

- **Group's header drag, dividers and diagonal multifill**: they are
  Group's alone and kept in its saves. Kept, they are an engine capability
  one game uses (reordering a table's rows and columns); dropped, Group's
  controls change. The owner's call, asked when this change reaches Group.
  Read for 1.1: the drag moves an element's row and column together
  (`state.sequence`), and a click between two headers toggles a divider
  keyed by the pair of elements, not their places; both are undoable moves
  saved in the move log. Multifill is Ui alone: a drag along a diagonal of
  the display order, then one letter typed sets every cell on it in one
  move. Kept, the engine gains a display order of a square's lines, shared
  by rows and columns, with dividers keyed by value, and a set of several
  cells as one move. Recommended: keep them. The drag is how a player finds
  a group's structure (its subgroups line up as blocks), so dropping it
  makes Group significantly worse, which the rules refuse.
  Asked 2026-11-23 at 1.1. **Answered 2026-11-27: keep all three**, and
  first look for engine controls they can be built on, so other games gain
  them or there is less to maintain (§ "Decisions" 2).

## Risks / Trade-offs

- [Nine games and some 29,000 lines is a large change] → the gap list's
  order may split it again, as the predecessor's did.
- [Map's cells are a partition's parts] → its own capability, which the
  regions group does not build (§ "The gap list"): the successor's last.
