## Context

Filed 2026-11-23 at `2a9b34cc1` by the route, `describe-the-whole-catalog`
(task 1.2). The family is every game whose hand-written code takes candidate
notes from the shared machinery, plus Magnets, which keeps its own:

```sh
git grep -l -E 'note-taking-cell|candidate-hint' -- 'src/games/*.ts' \
  | cut -d/ -f3 | sort -u
```

At filing that gave ABCD, Adjacent, Crossing, Group, Keen, Map, Mathrax,
Rome, Salad, Seismic, Solo, Towers, Undead and Unequal; with Magnets and
Ascent, whose notes are their own, sixteen games. The table in proposal.md
gives their lines. Read the population again with the query at task 1.1;
the list here is for ordering only.

What the engine shares already, read at filing:

- **`engine/solve/latin.ts`**, the Latin solver. Used by Adjacent, Ascent,
  Group, Keen, Map, Mathrax, Salad, Solo, Towers and Unequal.
- **`engine/mechanics/note-taking-cell.ts`** and
  **`engine/hint/candidate-hint.ts`**: the note-taking input, the note
  moves, mark-all and the candidate walk, with `docs/hints-candidates.md` as
  their guide and `engine-notes` and `engine-candidate-hints` as their
  specs. A game wires them by hand, in seven steps the guide lists.
- **`engine/edge-clue-latin/`**: Unequal and Adjacent share their state,
  generator, solver, play and drawing there. That is where the route said
  this group starts.
- **`engine/fill/`**: the fill board, which carries none of the above. Its
  cells hold one value or none; it has no notes, no keypad and no mark-all.

## Goals / Non-Goals

**Goals:**

- Every game in the family played from its description, its directory
  holding no TypeScript but tests, if any.
- Candidate notes as a capability of the fill board, so that a plain-cell
  game could adopt them by a key.
- The family judged by `docs/descriptions.md` § "Judging a family moved
  onto its description".

**Non-Goals:**

- Answers on edges or partitions. A game here that needs one (Rome's
  arrows are a value a cell, so it may not) waits for the regions group,
  and the gap list says so.

## The rules (from the route's design.md § "What every group does")

- **A gap list first**, per game, against the engine at that commit, with
  each need marked met by what is built or new (criterion 3); then an
  order that lets later games reuse what earlier ones built.
- **Each game its own commit**, the hand-written game playing on until its
  flip, and each flip run in the app before it is done: a deal, input,
  hints, live errors, dark mode, a solve to the end.
- **Every capability adoptable** by another game.
- **A game may change to fit the engine**: consistent with games already
  moved, a little worse in play where the engine is simpler for it, never
  significantly worse (the owner, 2026-11-23). Each difference is listed in
  its flip's task.
- **Judged by the criteria**, with `npm run compare-cost` against a
  worktree of this change's baseline, and the figures recorded here.
- **A new game is recommended**, born from its description, to measure what
  a new game of this kind costs (criterion 6). This family moves many games,
  and may skip it, saying so.
- **A flip moves the game's tests to data**, its `<game>.cases.yaml`; a
  capability the family adds is tested on a description of its own.
- **No game stays hand-written.** A game that does not fit gets the
  capability it needs, or moves to a later group that builds it, named in
  the route's tasks.

## The gap list (1.1)

Read at `153e4cf43` (2026-11-23): each game's description, `index.ts`,
state, generator, solver, render and hint, against `engine/fill/` and
`describe/compile-fill.ts`. The query gives the fourteen games of § "Context"
again; with Magnets and Ascent, sixteen. No description has `catalog:`,
`play:`, `id:` or `tierLetters:`, and every `deal:` is prose. Every solver
already runs its compiled ladder, so rules, techniques and `says` are the
description's.

**What every game lacks, the notes layer.** Each is written in every game
today, and is built once, for the first flip:

- *Notes on the board*: a note mask a cell beside its value, the note
  moves (`applyNoteMove`'s set, strike, add, all), pencil mode and sticky
  pencil (`mechanics/note-taking-cell.ts`), auto-pencil on a placement,
  and Mark-all (`adaptiveMarkAllMove`) over the cells a value rules out.
  `FillBoard` holds one value and one mark (`fill/board.ts`).
- *A value drawn as its numeral or letter*, entered by key or keypad, with
  the note grid in the cell. `play.values` gives each value a painter of its
  own; a Latin game's values are `1..n`, and past 9 they go on as letters
  (Unequal and Adjacent to 16, Solo, Group's and Salad's alphabets).
- *The candidate walk as the board's hint* (`runCandidatePlan`): the two
  readings, the setup, the cull after a placement, journeys, the judge, the
  keep-track and the refresh. `fill/hint.ts` walks firings over values and
  links only. Every game hands the walk its rungs as `techniqueRung`s, each
  firing split into legs a cell (or a value: Towers' `byHeight`) and worded
  by `statedParts` over the step's or the fact's wording: generic in shape.
- *The Latin library on the fill ladder*: `fill/board.ts`'s `ladderOf`
  passes `describedLadder` no library, so `use: latin.*` would not resolve.
- *A mistake check that reads notes* (`entryMistakes`'s `note` kind).
- *Givens*: `given: [value]` is in the schema and the lint, and no compiler
  reads it. Unequal, Adjacent, Towers, Mathrax, Group, Salad, Solo, Seismic,
  Rome, Map and Undead have them.
- *A Latin-square answer*: `deal.latin` numbers a clue (Singles), and no
  sample draws the answer as one.
- *Unreasonable*: the Latin solver's forcing chains and recursion today; the
  fill board's search tier on a born game, whose deals the flip measures.
- *The prefs*: auto-pencil, sticky pencil, keep-highlight and the
  candidate reading, whose default differs (Unequal and Adjacent
  `implicit`, the rest `populate`).

**Where a clue sits.** `compile-fill.ts` refuses a clue at anything but a
cell or a line ("a fill game's clue sits at a cell or a line"). The family
puts clues at edges (Unequal, Adjacent, Magnets), at slots, a clue at each
end of a line (Towers, Salad, Undead), at corners (Mathrax), at a dealt
partition's parts (Keen, killer Solo), and at the board (Crossing's list,
Undead's totals). Each is a universe of clues with its drawing, its ID
segment and its hint marks.

What each game lacks beyond those two:

**Unequal** (611 lines, and 1,681 in `engine/edge-clue-latin/`):
- *Clues*: `greater` at an edge, its value the edge's greater end.
- *ID*: `{order}d{tekxr}`; the desc a record a cell, its given then the
  letters `URDL` of its signs, comma-closed: a new segment. The size is
  `order`, which the fill ID reads as `w`: renamed.
- *Deal*: a Latin square, every sign and given derived, then hidden. The
  generator first adds clues until the easiest tier solves, then strips;
  the born deal hides from every clue, so boards stay minimal and the mix
  of givens and signs shifts (§ "Decisions" 5).
- *Render*: half-tile gaps between cells; the chevron in a gap, red when
  broken, gray when done.
- *Play*: a click or drag in a gap marks its sign done; Shift/Ctrl-arrow
  marks the sign toward that neighbor.
- *Hint*: the `sign` technique, a leg a cell, worded by its fact; the
  description already names its rungs `greater` and `lesser`.

**Adjacent** (535 lines, on the same layer): Unequal's, with `bar` at every
edge (`complete: true`), its desc flagging a bar from both cells, the legacy
`a` after the order read and never written, and a missing bar's breach
drawn as a red outline in the gap. Its deal hides givens alone.

**Keen** (1,958 lines):
- *Clues*: four kinds at a cage, one a cage; the description does not yet
  say that difference and quotient sit on two cells, which the desc parser
  enforces.
- *ID*: `{w}d{enhxu}[m]`, `m` a bare flag; the cages as upstream's block
  structure (verticals, then horizontals transposed, `a..y` a run and an
  edge, `z` 25 with none), which is not `walls`; then a letter and a number
  a cage, in least-cell order.
- *Deal*: a Latin square; dominoes at 3/4, leftover singles merged under 6
  cells; one operation a cage chosen in turn, each where it fits, good
  before bad; no clue hidden, redrawn until it grades.
- *Render*: the cage's thick outline, the clue at its least cell, the notes
  below the clue band.
- *Play*: no done marks today, where every other clued game has them: a
  born Keen gets them, for consistency.

**Towers** (2,103 lines):
- *Clues*: `sees` at both ends of every line.
- *ID*: `{w}d{ehxu}`; the slot clues joined by `/`, then optionally `,` and
  the givens as `digits` with `_` apart.
- *Deal*: a Latin square, every clue derived, givens hidden, and the clues
  hidden too above Easy only: a hide from a tier up.
- *Render*: the 3D tower, a solid that reaches into the tiles up and right,
  with a 2D/3D preference and a click on its drawn top retargeted to its
  cell: a painter that draws past its tile and owns its hit test.
- *Hint*: `fullLine` and `tallestNearest` are TypeScript and `steps:` only,
  not techniques: stated as techniques at the flip. `bounds` picks its rung
  by a term; a journey's later legs have an `again` wording; marks sit on
  slots.

**Mathrax** (2,066 lines): clues at corners, one a corner chosen by a kind
precedence, each kind switched by an option letter (`ASMDEO`, all on written
as nothing); a hide of givens before clues; one hint word read off the board
(the number across the clue). A broken quarter of a corner is drawn red.

**Seismic** (2,138 lines): areas a dealt partition the board draws already;
`walls`, then `,` and the givens as `digits`. Its areas are grown to drawn
sizes before the answer exists, and the answer filled onto them by search:
a partition dealt first, which Solo's jigsaw shares. `T` (Tectonic) is a
ruleset written as a bare letter. Its hint is already the candidate walk,
with reach read from the compiled `cull`.

**Solo** (3,780 lines): Standard and X fit. Jigsaw and Killer need a ruleset
choice, units read off a partition and units that differ by variation
(the diagonals), a grid `c*r` from the sizes, clues at a cage (Keen's),
upstream's block structure (Keen's), a division dealt first and an answer
searched under every unit (Seismic's, not `deal.grow`, which grows round one
value), grading on two scales, eight symmetries (Light Up and Sticks have
two and four), and digits then letters.

**Salad** (3,545 lines): clues at both ends of a line (Towers'), drawn in
four margins; two modes as a ruleset that picks the clue kinds and the
alphabet; a Latin answer folded down to `nums` symbols; a hole that repeats
in every line, placed by a cross, ruled out by a ball, its note an X; a hide
that weakens a numbered ball to a bare one (Light Up's `leaves`); a board
refused when holes alone solve it. Its hint walk (1,157 lines of its own) is
the most bespoke in the family.

**Group** (2,516 lines): no clues. An answer drawn from the 77-group table;
letters as values, renamed by the `i` setting, which also changes the deal
and the tiers on offer; cells kept or blanked by rule. Its row and column
reorder by a header drag, its dividers and its diagonal multifill are its
alone and kept in its saves (§ "Open Questions").

**ABCD** (2,334 lines): a number for each letter on each row and column
(`per: value`), which the compiler refuses to derive (`compile-fill.ts`
§ the derive), a slot a letter in the margins; `n` a plain size; an `R`
flag before the tier and a `D` flag of inverted polarity; a random legal
fill as its sample; small crosses at corners in no-diagonal mode.

**Undead** (3,353 lines): clues at slots seen through mirrors; monster
totals dealt in the desc, drawn in a counts row the player may click to
place; `glyphs` over several kinds (mirrors, givens); done marks at slots;
an Easy grade capped at three passes; a deal seeded from sightlines; a hint
that places before it strikes.

**Magnets** (3,423 lines): values on cells and a domino partition fit; its
only note is `?` on a whole tile (notes {+, −}); counts a value on four
margins, the neutral count derived and hidden an entry at a time; a domino
desc segment and a tiling deal; moves that write the whole tile from the end
pressed; a hint worded from the board (`reading.ts`).

**Rome** (2,871 lines): its arrows are a value a cell (1-4 the directions,
5 a goal its clue fixes), a cell's notes its domain less the goal; the
areas `walls`. It needs a clue kind for a given arrow, `glyphs` mapping
letters to two kinds, a build that turns a stuck square into a goal, areas
grown by merging while no arrow repeats, a drag whose direction picks the
arrow, an arrow painter that draws the notes too, and hint terms read off
the board (a loop's path, the squares that reach a goal).

**Crossing** (3,923 lines): values and notes, but the most of its own: a
list of numbers at the board, derived, written by a new segment, drawn as a
panel struck through as numbers are used, and marked by hints; typing along
a run that advances itself, and a whole number placed at once; a wall
grammar of decimal open runs and letter wall runs; walls dealt until no 2x2
is open.

**Map** (3,468 lines): its notes over four colors fit. Its cells do not:
the description makes the regions the cells (`cells: n`, a dealt `borders`
graph), so it needs a space whose cells are a partition's parts, with input
and drawing addressed to parts, its quadrant geometry, an edge-list desc,
regions grown first, and a hide that keeps the last region of each color.

**Ascent** (5,696 lines) is not of this family: it keeps no notes (its hint
is built not to), its play and drawing are a numbered path, its values run
past the 31 a cell's domain mask holds, and its deal is a Hamiltonian path
on true hexagons. It goes with Signpost and Path to lines and loops,
recorded in the route's design.md.

**Shared**, so each is built once, for its first game:

| Capability | First | Then |
|---|---|---|
| The notes layer (above) | Unequal | every game |
| Clues at edges, a gapped grid | Unequal | Adjacent, Magnets |
| Done marks on any clue | Unequal | Adjacent, Towers, Keen, Undead, Magnets |
| Clues at a partition's parts, labeled at the first cell | Keen | Solo, Map |
| Upstream's block-structure segment | Keen | Solo |
| A partition into small parts, sampled on the answer | Keen | Solo (killer), Rome |
| One clue kind an element, chosen in the deal | Keen | Mathrax |
| Clues at both ends of a line | Towers | Salad, Undead |
| A hide from a tier up, a hide in sequence | Towers | Mathrax, Salad, Solo |
| A partition dealt before the answer, the answer searched under it | Seismic | Solo (jigsaw), Map, Magnets |
| A ruleset written as a bare letter | Seismic | Solo, Salad, Group |
| A value alphabet past 9 | Unequal | Solo, Group, Salad, ABCD |

## Decisions

### 1. Notes are a mask a cell on the fill board

`FillBoard` gains `notes`, a bit a value a cell, where the description's
`marks:` declares `cand`; a board without it has none and plays as before.
The edits gain the note moves, the ones `applyNoteMove` applies today, so
the shared Mark-all, auto-pencil and keep-track read the born board as they
read a hand-written one. The ladder that grades and solves reads the values
only, as now; the hint reads the notes as candidates where the mistake check
vouches for them (`docs/hints-candidates.md` § "Deduce from the notes when
the mistake check vouches for them"). Notes are not a second `mark`: a cell
holds several, and the mark (a link, a cross) is one element.

### 2. A born game with notes hints through the candidate walk

The fill board has two walks: its own, one firing a step over values, and
the candidate walk, which every game of this family runs. A born game with
notes gets the candidate walk, built from its compiled module: the regions
a value is unique in from the units and the partitions its rules hold
distinct, the reach from the compiled `cull` where it states one (Seismic),
each ladder technique a `techniqueRung`, a firing split into legs a cell
unless its wording says otherwise, and the words `statedParts` over its
`step` or `fact` wording. That is what Keen's and Seismic's `buildSteps`
write by hand today; it becomes the engine's, so a born game writes none.
A game without notes keeps the fill walk.

### 3. A value is drawn as its glyph, and the keypad is the domain

`play.values` is how a game with a few painted values says each; a game
whose values are a number line says `play.numbers` instead (its first
value, its alphabet past 9), and the board draws each as its glyph, the
note grid in a blank cell, and offers a key a value of the domain.

### 4. `engine/edge-clue-latin/` folds into the fill board

Its clue kinds are the description's clues; its params, its desc and its
display alphabet the fill ID; its play and moves the notes layer; its render
a gapped layout and two painters (chevron, bar) under `render/pieces/`; its
solver `solveBoard`; its words the description's. The directory goes with
Adjacent's flip. What stays a layer under the fill board is what was one
already: `note-taking-cell.ts` and the candidate hint.

### 5. Unequal's deal hides from every clue

Upstream adds clues until the easiest tier solves, then strips. The born
deal derives every clue and hides (`deal.hide`), as every born game does:
boards stay minimal, and the mix of givens and signs shifts. Keeping the mix
would make "assemble" a deal of its own for one game; the shift is a little
difference in play, listed in the flip.

### 6. Givens are a clue kind the compiler writes from `given:`

`given: [value]` becomes the compiler's name for what born games write by
hand: a kind at a cell meaning `value(at) = v`, dealt holding it
(`play.dealt`), written by `digits` and hidden first by `deal.hide`.

### 7. The order, and where this change stops

Least first, and each game next to the one its needs share:

1. **Unequal**: the notes layer, numbers, the candidate walk from the
   description, givens, the Latin answer, clues at edges, done marks.
2. **Adjacent**: the records from both cells and the legacy letter;
   `edge-clue-latin/` goes.
3. **Keen**: clues at parts, the block structure, a small-part partition,
   a kind chosen an element.
4. **Towers**: clues at both ends of a line, a hide from a tier up, the
   tower painter.
5. **Mathrax**: clues at corners, a kind precedence by option letters.
6. **Seismic**: a partition dealt first and the answer searched under it,
   a bare-letter ruleset.

That is the natural break (1.2): the six are the Latin core and its clue
universes, each built on the notes layer the first builds. The successor,
filed when this change is archived, takes Solo (on Keen's and Seismic's
pieces), Salad and Group (on Towers' and the alphabet), ABCD, Undead,
Magnets, Rome and Crossing, in an order its own gap list sets from this
one, and Map last: a space whose cells are a partition's parts is a
capability of its own, which the regions group may build first, and the
successor says which.

## Open Questions

- **Group's header drag, dividers and diagonal multifill** (for the
  successor, which moves Group): they are Group's alone and kept in its
  saves. Kept, they are an engine capability one game uses (reordering a
  table's rows and columns); dropped, Group's controls change. The owner's
  call, asked when the successor reaches Group.

## Risks / Trade-offs

- [Sixteen games and about 44,000 lines is too large for one change] → the
  gap list's order splits it, as `born-plain-cell-family` followed its
  pilots: the first change takes the games up to a natural break and files
  the rest as its successor.
- [The candidate walk's words are pinned by many hint tests] → hint
  wording is free to change; a flip's hint pins move with its tests to data.
- [Solo's jigsaw and killer variants, Map's regions] → partitions the fill
  board already deals (`deal.grow`), read by the gap list before assuming
  new work.
