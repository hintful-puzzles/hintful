## Context

The second pilot of a game born from its description
(`archive/2026-11-22-a-game-from-its-description-alone`, design.md § 9).
That pilot left `fillGame` (`engine/fill/`) serving two games: Kakurasu
(born new) and Tents (moved). The hypothesis here: plain two-state cell
games with no links move for little engine work.

Read at `1057f5dc4` (2026-11-22): the three hand-written games, their
descriptions and compiled modules, and `engine/fill/`.

## The gap list

What each description already states: its rules (`shape`, `clues`, the
regions), its ladder and every step's words. Each compiled module has
`isAnswer`, `violations`, the techniques, `STATED` and (Norinori) `RULES_OUT`.
What `fillGame` lacks, by game:

**Unruly** (upstream; 1160 lines of TypeScript, 1162 of tests):

- *Givens*: values the deal shows on cells. Its `given: [value]` compiles to
  nothing; the hand-written game seeds them into the grid. The engine's
  `fixed` comes from `domainOf`, so the givens become a cell clue kind whose
  domain leaves the cell its one value, as Tents' tree does.
- *ID*: upstream's dot-runs (a letter a run of blanks, its case the given's
  piece, `engine/game-id/dot-runs.ts`), a desc segment the engine lacks.
  Upstream's IDs are pinned (`guards/__fixtures__/upstream-descs.json`).
- *A modifier as a param*: `unique` is written `u` in the params, reaches
  `isAnswer`, `violations` and the ladder as a variation, and bounds the
  size (A177790). `FillParams` has no flag, and the fill board passes the
  ladder no variations. Sizes are even.
- *Menu*: some boards offer fewer tiers (6x6), and one entry is a variant
  (8x8 unique). The fill menu is sizes alone. Tier letters `ten`.
- *Deal*: the answer is built forward (a random piece on a random open
  cell, the ladder run after each), then givens are hidden while the ladder
  still finishes at the tier. The fill deal samples and shows every clue.
- *Input*: a click cycles empty, one piece, the other (the right button the
  other way round); digits place pieces. The fill input toggles a value with
  empty and keys letters.
- *Render*: two pieces, a block and a disc in the pair's colors; a given on
  a lifted square; a run of three as a bar across it, an unbalanced line as
  a `!` on its cells, two alike lines as a bar; a placed piece grows. The
  fill renderer draws a two-cell break as a diamond and any other as a red
  piece, and does not draw `fixed`.

**Mosaic** (upstream; 1617 lines, 1910 of tests):

- *Cell clues drawn on the cell*, over its value, faded once the block is
  decided and agrees, a broken one as a red badge. The fill renderer draws
  only line clues, in the margins.
- *ID*: upstream's digit-and-letter run code (a digit a shown clue, a
  letter a run of hidden ones, trailing run kept). Params
  `WxH[h<0|1>][d<e|n|u>]`, a bare `W` square; `h` is the "aggressive"
  deal setting, defaulting by width.
- *Deal*: a picture at half shading, every clue shown, then clues hidden
  while the ladder still finishes (Easy hides those the ladder never read
  first). Unreasonable boards are those the ladder cannot finish and the
  answer search (`engine/solve/answer-search.ts`) certifies unique. The fill
  deal grades by ladder alone, and its Solve and Check need the answer the
  ladder reaches or `aux`.
- *Render*: a clear square has its own surface and a faint cross, none
  under a number; the hint outlines a block (`BLOCK`) and circles a number;
  the cursor recolors the cell's edges.
- *Status*: "Clues left: N"; input freezes once solved.
- *Text format*: the clues, not the values.

**Norinori** (the fork's own; 1291 lines, 485 of tests):

- *A dealt partition*: `Dealt.region` is a `Partition`, not a `ClueList`,
  which the fill board's clue typing refuses. *ID*: wall runs
  (`engine/game-id/wall-runs.ts`), a one-square region refused. Tier
  letters `ent`.
- *Deal*: dominoes placed apart (an induced matching), a region grown round
  each, some dominoes closed as two-square regions by tier, mended until
  the ladder finishes at the tier and a search finds no second answer.
  The fill samplers cannot place dominoes apart, and the deal has no
  partition.
- *Render*: region walls and fills, a domino's two squares joined, both
  squares of a break red, a mistake as a wash.
- *Text format*: each square's region letter beside its value.

**Shared by all three**: the click cycle; `stroke: sweep`; the hint gesture
by the button that reaches the value.

## Decisions

### 1. The order: Unruly, Mosaic, Norinori

Unruly and Mosaic share most of what they add: a deal that hides clues, a
board's own tiers on the menu, a param flag, the click cycle. Norinori's
partition is its own. So the figure "capabilities added per game" can fall
only in that order; the tasks' order is changed to it.

### 2. A game keeps how it plays

Each game keeps its click cycle, keys and drag. `play.click: cycle` is a
declaration the engine reads, not a change to what a player does: three of
the five fill games cycle, and making them toggle is a player-visible
change no game asks for.

### 3. IDs and links keep loading; saves break

Each game's `id:` keeps its grammar, so every upstream desc and shared link
still loads. A save holds the hand-written game's moves
(`{type:"place",…}`, `{kind:"mark",…}`, `toggle`/`paint`/`fill`), which
`editOf` refuses. Keeping them would take a per-game translation of old
moves into `Edit`s: code that only an old save reads, about 30-60 lines a
game, written in the engine as a declared move grammar or kept beside the
description. The owner accepted the break for Tents (2026-11-21) and for
these three (2026-11-22).

### 4. What the engine gains, named before it is built

Each becomes a declaration the description states, and each counts as one
capability in § "Figures":

1. `play.click: cycle` (all three).
2. A cell clue kind that fixes its cell, with the dot-runs segment
   (Unruly's givens).
3. A modifier as a param letter, its variations passed to the module and
   the ladder; even sizes and a size bound (Unruly's `u`).
4. Per-board tiers and variant entries on the menu (Unruly, Mosaic).
5. `deal.hide`: show every derived clue, then hide each while the ladder
   still finishes at the tier (Unruly's givens, Mosaic's numbers).
6. `deal.sample.build`: an answer built by the ladder from random
   placements (Unruly).
7. Painters `block` and `disc` in the pair's colors, and a given's lifted
   surface (Unruly).
8. Line-shaped live errors: a run's bar and a line's badge (Unruly).
9. Cell clues drawn on their cell, faded when met, a badge when broken
   (Mosaic).
10. The digit-and-letter run segment, and a deal setting as a param flag
    (Mosaic's `h`).
11. A search tier: a deal certified unique by the answer search, and Solve
    and Check from the search's answer (Mosaic's Unreasonable).
12. A clear painter with its own surface and faint cross; the hint's
    `BLOCK` outline (Mosaic).
13. A status line ("Clues left") and freezing input once solved (Mosaic).
14. A dealt partition: in the board's clues, the wall-runs segment, walls
    and fills in the render, region letters in the text format (Norinori).
15. `deal.sample.dominoes` and a partition grown round the answer, with a
    mend until unique (Norinori).
16. A domino's join in the render (Norinori).

Several may turn out smaller than listed, or a game's look may move to an
existing engine one under the consistency pre-approval (2026-11-21); each
flip records what it actually added.

## Risks / Trade-offs

- **The hypothesis looks wrong before a line is written.** Tents added six
  capabilities; Unruly alone lists eight here, Mosaic six more, Norinori
  three more. Plain-cell games are not little engine work. What they need
  is what the plain-cell family needs (givens, hidden clues, regions, cell
  clues, the cycle), so the work serves the family's migration either way.
  The figures in 3.1 judge it. Asked whether to go on, the owner chose all
  three (2026-11-22).
- **Mosaic's huge boards.** Sizes reach 100x100; the generic renderer and
  deal must hold within 10% of the hand-written times there too.
- **Unreasonable.** The fill hint stops where the ladder does, as Mosaic's
  does; the search certifies the deal only.

## Open questions

None. Both of 1.2's were answered by the owner on 2026-11-22: the saves
break, and all three games move.
