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
  Asked 2026-11-23 at 1.1.

## Risks / Trade-offs

- [Nine games and some 29,000 lines is a large change] → the gap list's
  order may split it again, as the predecessor's did.
- [Map's cells are a partition's parts] → its own capability, which the
  regions group does not build (§ "The gap list"): the successor's last.
