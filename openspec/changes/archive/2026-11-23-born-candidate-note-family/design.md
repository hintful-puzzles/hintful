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

`FillBoard` gains `pencil`, a bit a value a cell, where the description's
`marks:` declares the candidates (a cell mark that is `set of` the answer's
domain, with no `of` or `means`, compiled to `play.notes`); a board without
it has `null` and plays as before. The field is named `pencil` because every
note-taking board names it so, and `takesNotes` (`input/key-labels.ts`),
which offers the Marks key, reads a board by that name. Only a board of
numbers keeps notes: they are typed, a key a value, and the compiler refuses
them on a board of buttons.
The edits gain the note moves, the ones `applyNoteMove` applies today, so
the shared Mark-all, auto-pencil and keep-track read the born board as they
read a hand-written one. The ladder that grades and solves reads the values
only, as now; the hint reads the notes as candidates where the mistake check
vouches for them (`docs/hints-candidates.md` § "Deduce from the notes when
the mistake check vouches for them"). Notes are not a second `mark`: a cell
holds several, and the mark (a link, a cross) is one element.

The moves are the shared canonical ones (2026-11-23, read for 2.1b): a board
of numbers' move is an `Edit` or a `CandidateMove` (`set` with `pencil` and
`autoElim`, `pencilAll`, `pencilStrike`, `pencilAdd`,
`engine/hint/candidate-hint.ts`), so the default type-keyed dialect reads it
with no adapter, and `applyNoteMove`, `adaptiveMarkAllMove` over the space's
units, `entryMistakes` (a `note` kind beside `FillMistake`'s), keep-track,
the judge and `candidateGesture` serve it unchanged. Typed entries become
`CandidateMove`s; Solve, Clear and Reveal stay `Edit`s, and a value an edit
places clears its cell's notes. The `Ui`'s pencil fields are on a board
that keeps notes alone (`numbers.ts`'s `typedUi`), since the app and
`pencil-mode-key.test.ts` read a `Ui` with a pencil mode as one that takes
notes. What a placement rules out (auto-pencil, Mark-all's clean, the
walk's cull and implied notes) is one reach, `notes.ts`'s `reachOf`: the
cells sharing a unit with it (`GridSpace.peers`), and those the techniques
run on placing strike it from where every cell could hold anything (2.7c:
`zoning`'s and Seismic's `cull`, a `peer.placed`).

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

Built at 2.1c (`engine/fill/candidates.ts`) as far as the fixture needs:
the row/column preset (`runLatinCandidatePlan`), whose regions are the
units, and the Latin library's strikes as rungs, worded by the library.
It refuses what it cannot yet walk rather than stall on it: units beyond
rows and columns (Seismic's flip) and a technique of the description's own
(Unequal's flip, its first). The reading a fresh game starts on is the
description's `play.hintNotes`, the convention `populate` where it is left
out, since the games differ (§ "The gap list", the prefs).

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

## The figures (3.1)

Taken 2026-11-23 against `153e4cf43`, the change's baseline
(`docs/descriptions.md` § "Judging a family moved onto its description").

**1. Lines.** Each flip's hand-written TypeScript removed under
`src/games/<g>/`, tests excluded, against what `src/engine/` and
`src/describe/` gained net from the flip before it, tests and
`engine/testing/` excluded (`git diff --numstat`):

| Game | Removed | Engine net | Description |
| --- | --- | --- | --- |
| Unequal | 611 | +1,607 | 189 |
| Adjacent | 535 | −1,581 | 194 |
| Keen | 1,958 | +774 | 291 |
| Towers | 2,103 | +795 | 310 |
| Mathrax | 2,066 | +460 | 295 |
| Seismic | 2,138 | +414 | 198 |
| Family | 9,411 | +2,469 | 1,477 |

Unequal adds more than it removes: it built the notes layer, the candidate
walk from a description and the board of numbers, which every later game
of the family stands on. Adjacent's flip deleted `engine/edge-clue-latin/`
(§ 4). Across the family, 3.8 lines go for each one the engine gains.

**2. Capabilities** are listed with their concepts in each flip's task.

**4 and 5. Cost and steps**, `npm run compare-cost` (five rounds, four
boards a menu board of at most 100 squares; baseline / working tree):

| Game | Walk instructions | Deal instructions | Steps |
| --- | --- | --- | --- |
| Unequal | 8.02 / 8.63 G, +7.5% | 14.81 / 15.16 G, +2.4% | 2348 / 2367 |
| Adjacent | 11.62 / 12.11 G, +4.2% | 13.45 / 85.25 G, +534% | 2001 / 2001 |
| Keen | 15.68 / 17.89 G, +14.1% | 16.89 / 12.35 G, −26.8% | 3854 / 3854 |
| Towers | 10.45 / 11.68 G, +11.7% | 13.88 / 17.81 G, +28.3% | 2627 / 2659 |
| Mathrax | 9.21 / 11.66 G, +26.6% | 9.47 / 10.61 G, +12.0% | 2528 / 2522 |
| Seismic | 9.33 / 7.56 G, −19.0% | 50.57 / 13.53 G, −73.3% | 3319 / 3174 |

Each spread is under 1% but Keen's walk (±0.06 G). No walk comes near
100 ms on a menu board. The deals, a preset at a time (six seeds, the
least of two runs each, under vitest, which runs about 1.7 times the
bundle's time), put four presets over the bar where the baseline was not:

- Adjacent 5x5 Hard: 117 to 906 ms, median about 420, against 14 to 263,
  median about 110. Every seed is past the bar.
- Unequal 5x5 Tricky (tail 184 against 45), Unequal 7x7 Hard (233 against
  86) and Towers 5x5 Hard (172 against 65), each in its slowest seed.

Seismic's slow tails are gone (7x9 Tectonic Hard 37 ms against 1,387;
6x8 Tectonic Hard 82 against 1,948). Keen and Mathrax are as they were.
Unequal takes 19 more steps and Towers 32 more, which criterion 5 needs
explained or fixed, and Seismic 145 fewer, which it needs explained.

**The deal, fixed (3.1a).** Measured again on the bundle, as the criterion
says, and not under vitest (CPU time, the least of three runs a seed,
twelve seeds): Unequal was never over the bar there (its slowest preset
7x7 Hard, median 22 ms), nor Towers but one 6x6 Hard seed (214 ms).
Adjacent's Hard was: 5x5 a median of 172 ms against the baseline's 26,
every seed past 100, and 7x7 114 against 17. Counted per deal (5x5 Hard,
40 seeds): 475 draws, each trying its 25 givens one at a time at Hard, 26
solves a draw; the baseline 175 draws of 5 solves. Two causes, both fixed
in the engine:

- **The asked tier tried every clue one at a time.** A kind the lowest
  tier reads none of (every given, on a board shown every given) reaches the
  asked tier whole, and the halving search for the shortest run ran only at
  the lowest. The asked tier halves too now (`deal.ts`'s `hideUpTo`): 7 solves
  a draw, and across every game that hides, Boats' 10x10 Hard 99 to 49 ms
  and Towers' 6x6 Hard tail 214 to 45, Unequal 5x5 Tricky 32 to 41 and
  Sticks' 5x5 Unreasonable 12 to 27 the only rises, each far under the bar.
- **The born hide kept fewer givens, which the tier below finished more
  often.** Both trees grade every board alike (40 of each tree's 5x5 Hard
  deals, each Hard in both, and none with a given to spare), so the ladders
  agree; the baseline's boards keep 2 or 3 givens, the born ones 1, and the
  draws differed for that. Upstream adds a given where its cell is most
  open, ties to the cell with the fewest bars beside it, and that tie-break
  was what mattered: a most-open choice alone, transposed as upstream's
  cube read is, or at random, all kept 1 given and drew 400 to 520 times.
  The capability is `deal.hideBy` (a formula of `at` by kind; a higher value
  hidden first, the kinds left mixed as the shuffle put them), which
  Adjacent states as the bars beside a given, and `ordering` tests.

Adjacent after (bundled, twelve seeds, baseline / born): 5x5 Hard a median
of 26 / 51 ms, slowest 88 / 135; 7x7 Hard 17 / 51, slowest 116 / 198;
7x7 Unreasonable 15 / 10. Every median is under the bar. The draws are
still 1.2 times the baseline's (209 against 175 on 40 seeds), each
costing about as much, and a draw is a geometric wait: one 5x5 seed in
twelve and three 7x7 pass 100 ms, as one of the baseline's 7x7 does. An
early refusal was measured and dropped: the tier below finishes the
shortest run on 190 of 191 draws, and on 40% of the boards kept.

**The steps (3.1b)**, walked on the baseline's boards in both trees; a plan
is the walk to the end, so a step is a press of Hint:

- **Towers' 32 more were sets shown a cell a press.** The born walk cut
  every library strike by cell (`byCell`), where the hand-written hint
  struck a set in one step: 13 steps became 44. Under the implicit reading
  a cut by cell is right for a cell with no notes, whose step then writes
  its values left (Mathrax's notes fell 139 to 77 for it); for one with
  notes it only adds a press. The rung's context now carries the notes
  written (`RungContext.written`), and the born walk cuts a library strike
  into one leg over the written cells and one a cell over the rest
  (`byWrittenCell`). Towers 2,627 / 2,625; Adjacent 2,001 / 1,973; Keen
  3,854 / 3,823; Mathrax 2,528 / 2,514.
- **Unequal's are the walk's path, not a step doing less**: 2,348 / 2,359
  after the fix, 13 boards fewer and 10 more. Each `sign` step strikes one
  cell as `greater` and `lesser` did; two 7x7 Tricky boards take 23 and 14
  more, where the born walk strikes signs across the board (37 steps)
  before its first single and the hand-written one found one after 6, one
  sign rung's firings being chosen where two rungs' were.
- **Seismic's 145 fewer**: an area of one is placed from the deal (51
  `singleton` steps), and the born walk places a number its area or line
  leaves alone as `regionsFull` (895 to 938) where the hand-written one
  struck the placed numbers first (`dup` 294 to 269, `note` 332 to 250,
  `single` 313 to 274).

**3. What earlier flips built is used**, read off the gap list (§ "The gap
list (1.1)") and its § "Shared" table: Unequal met none of its needs, being
the first, and built the notes layer every later flip met. Adjacent met
nearly all of its own (edges, the gapped grid, done marks) and added the
records from both ends and the legacy letter. Keen, Towers and Seismic each
brought a clue universe or deal of their own (parts and the block
structure; slots, the hide from a tier up and the tower painter; a
partition dealt first and a bare-letter ruleset), so their share dips
where the universe is new; Mathrax met its one-kind-an-element from Keen
and built corners. The share does not rise along the order: it rises
within a universe and falls at each new one, which is what the successor's
order should weigh (Solo on Keen's and Seismic's pieces, Salad and Group
on Towers').

**6. A new game** is skipped: this family moves six games, and the next
group's first born game measures the kind.

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
