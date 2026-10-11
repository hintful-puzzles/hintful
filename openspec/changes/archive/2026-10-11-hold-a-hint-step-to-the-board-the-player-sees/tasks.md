# Tasks

## 1. Reproduce

- [x] 1.1 Each of the four, on dealt boards (2026-10-11). Signpost: 11 of 82
  plan steps on four boards of the gate's slice drew nothing new, each a
  "must come right after" step. Palisade: 49 steps on twelve boards striped or
  outlined a region the board's no-wall marks did not make. Undead: the first
  step of a 4x4 Easy plan placed by a count with eight cells open for one
  monster. Galaxies: the sentence is read against
  `okToAddAssocWithOpposite`, which drops a dot for reach and for a finished
  galaxy as well as for its mirror.

## 2. The engine's check

- [x] 2.1 Decided on a census of every hinted game's plan at the gate's slice
  (about 19,000 steps), measuring both candidates:
  - **A step changes what the board draws** can be written for every game.
    Comparing the plain frame alone convicted Signpost (11) and Subsets (16);
    Subsets is innocent, since a set ruled out of a cell shows in the tally
    only while that cell is in focus. "The board the player sees" is
    therefore the frame with no hint on it or with the step on it, and a
    step fails only when neither moves.
  - **A step's premise is on the board** cannot be written from outside. A
    premise is in what the words mean, and a fresh hint from the same board
    runs the same private bookkeeping. Comparing each kept step with the
    first step of a fresh hint differed on thousands of honest steps in most
    games (a journey's later leg, a sweep's order). The candidate walk
    already has the premise audit; Palisade and Undead are off it and hold
    the property in their own tests.
- [x] 2.2 `hint-resume.test.ts`, "a kept hint plan's every step changes what
  the board draws": seen failing on Signpost before the fix, passing on the
  other hinted games. Palisade's and Undead's own guards were each seen
  failing before their fix.
- [x] 2.3 Nothing else convicted.

## 3. The games

- [x] 3.1 Signpost: the plan's copy makes the automatic links; the `follows`
  rung is gone; the help says the board makes that link.
- [x] 3.2 Palisade: the join is a firing with every undecided edge between
  the two regions marked open, and its own sentence when there are several.
- [x] 3.3 Undead: a counted placement is read off the player's marks. The
  help's order was already what the code now does.
- [x] 3.4 Galaxies: the sentence and the help's paragraph.
- [x] 3.5 Ran the app (Chrome) and followed the hint to a finished board on
  Signpost `4x4cde:1e9cfgddgadcaaabh16a`, Palisade `5x5n5:2j2a3d1c333`,
  Undead `5x5dn:10,3,6,cRfLRbRgLLa,…` and Galaxies `7x7dn:dikpfzjxgexcv`.

## 4. Close

- [x] 4.1 The spec deltas, `docs/games/hints.md` § "A plan's copy is the
  board, no further on and no further back", validate.
- [x] 4.2 The gate, commit, push, archive.

## For the owner

The structural form of the second check is a plan loop that advances its
copy with the game's own `executeMove` on the step's own move, so a plan
cannot run ahead of the board or behind it, and Undead moved onto the
candidate walk so the premise audit reads it. This change was filed by a
change, so it scaffolds neither (`docs/work-management.md` § "The backlog is
being drained").
