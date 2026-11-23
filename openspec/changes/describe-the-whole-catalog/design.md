## Context

Read at `fd3611bcb` (2026-11-23). A game is hand-written when its directory
holds TypeScript besides tests:

```sh
for d in src/games/*/; do ls "$d"*.ts 2>/dev/null | grep -v -E 'test|\.d\.ts' \
  | xargs cat 2>/dev/null | wc -l; done | awk '$1>0{n++; s+=$1} END{print n, s}'
```

That gave 52 games and about 135,000 lines. Every one already has a
description whose ladder, rules and hint words are described; what a move
adds is the rest (`archive/2026-11-23-born-plain-cell-family/design.md`
§ "Context"). Each description's `freedom.kind` and `produces` sort them
into the groups below. The lists are as of that date, for ordering only:
each group's change reads its own population again with the query.

## The groups

**Latin squares and candidate notes.** Solo, Keen, Towers, Unequal,
Adjacent, Group, Mathrax, Salad; Undead and Magnets, sent here by
`born-plain-cell-family` for their candidate notes; Map, whose notes are
over colors. Needs: candidate notes on the board, which the ladder reads
as facts; mark-all; the keypad. The Latin solver is already shared, and
`engine/edge-clue-latin/` already carries Unequal and Adjacent, which is
where this group starts. This is stage 4 of
`archive/2026-11-21-architectural-review-blue-sky/design.md` § "The route".

**Regions and partitions.** Palisade, Filling, Separate, Galaxies, Rect,
Dominosa, Subsets, Wordtrail. Needs: an answer on edges or a partition of
the cells, not a value a cell, which the fill pilot left out on purpose
(`archive/2026-11-22-a-game-from-its-description-alone/design.md`
§ "Goals / Non-Goals").

**Lines and loops.** Loopy, Pearl, Tracks, Bridges, Spokes, Slant, Path,
Signpost, Rome, Net. Needs: edge answers, as the regions group does, and
the line-drawing input `engine/mechanics/line-drawing.ts` shares already.
Tracks' square-marking drag is `one-drag-for-fill-games`' straight drag.

**Numbers.** ABCD, Ascent, Crossing, Seismic. Mixed: each goes with
whichever group above its gap list fits, decided by the first of those
groups' changes to read it.

**Moving pieces.** Slide, Sokoban, Inertia, Ballsort, Fifteen, Sixteen,
Netslide, Twiddle, Cube, Flip, Flood, Numgame, Pegs, Samegame, Untangle.
Their `moves:` are described and compiled already (`describe/
compile-position.ts`). Needs: a position board, input and drawing built
from the moves, and planner hints (`engine/hint/slide-planner`).
`one-model-for-moving-pieces` is this group's first change, re-planned
against what the fill board taught before it starts.

**Hidden information.** Mines, Blackbox, Guess, Wordguess. Needs: a model
of what the player has and has not found out. Furthest from what exists.

## The order

The owner had no preference (2026-11-23). This one weighs games moved
against how ready the engine is:

1. `measure-cost-by-instructions`, small, so that every group is measured
   and judged the same way; then `a-game-is-tested-by-its-data`, so that
   every group's flips move their tests into one format.
2. Latin squares and candidate notes: the most games, a shared solver, and
   a start in `edge-clue-latin`.
3. Regions and partitions, then lines and loops: both need answers that
   are not a value a cell, and the first settles that for the second.
4. Moving pieces.
5. Hidden information.

A group's change may reorder what follows it, saying why.

## What every group does

As `born-plain-cell-family` did, with what the review of 2026-11-23 added:

- **A gap list first**, per game, against the engine at that commit;
  then an order inside the group that lets later games reuse what earlier
  ones built.
- **Each game its own commit**, the hand-written game playing on until its
  flip, and each flip run in the app before it is done (deal, input,
  hints, live errors, dark mode, a solve to the end).
- **Every capability adoptable** by another game (`docs/doctrine.md`). A
  capability with one user is fine; one only its game could use is not.
- **A game may change to fit the engine**: made consistent with games
  already moved, a little worse in play where the engine is simpler for
  it, never significantly worse (the owner, 2026-11-23). Each difference
  is listed in its flip's task.
- **Judged by the criteria `measure-cost-by-instructions` writes**, with
  its instrument, recorded in the group's design.md.
- **A new game is recommended, not required**: a game born from its
  description that the collection lacks, to measure what a new game
  costs, and, for a group whose games stand alone (Cube, Twiddle,
  Untangle), to give them family. A group that already moves many games
  may skip it and says so.
- **A flip moves the game's tests to data** (`docs/doctrine.md`, the
  owner's decision of 2026-11-23), in the format
  `a-game-is-tested-by-its-data` builds; a capability the group adds is
  tested on a description of its own.
- **No game stays hand-written.** A game that does not fit the group's
  shape gets the capability it needs, or moves to a later group that
  builds it.

## Risks / Trade-offs

- [A group too large for one change] → it splits by the gap list's
  order, as `born-plain-cell-family` followed its pilots.
- [The order guesses which engine work is cheapest] → each group's gap
  list is where that is measured, and a group may reorder the rest.
- [Games with heavy art (Net, Untangle, Cube, Map)] → the art becomes
  engine painters, as Boats' hull and Tents' tent did; the doctrine's open
  question on the engine drawing a game's art is answered there by the
  owner's decision.
