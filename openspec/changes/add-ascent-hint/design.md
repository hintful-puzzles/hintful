# add-ascent-hint — design

## D1. The candidate question: no notation, measured

The solver keeps a candidate bitmap (`marks[cell][number]`) and a bitmap of
possible path links per square. The player writes numbers and may draw lines,
and has no way to note candidates. So rule 6 asked which hidden facts a hint
needs, measured in layers as Tents did (scratch censuses, 2026-09-27).

**The solver, forgetful.** Before every rung, rebuild both bitmaps from the
numbers, walls, arrows and any lines it had itself drawn, and keep only a
placement or a newly forced corridor (drawn as lines). 368 boards, 16 seeds of
every preset:

| reading kept | Easy–Tricky | Hard | Edges |
|---|---|---|---|
| straight reach only | 100% | 0–31% | 0% |
| + one `overlap` per step | 100% | 69–100% | 88–100% |
| + `overlap` to its fixpoint ("routes") | 100% | 100% | 94–100% |
| + the path-number reading | 100% | 100% | 100% |

**The hint's ladder.** The same readings, one placement per step, easiest
technique first, needed **no path reasoning at all** on any preset (276 boards,
12 seeds each): touch, reach, one-number-can-reach, and routes finished every
one. Placing every single at once leaves different facts in place when each
technique is asked, which is why the two measurements differ.

**Past the presets.** 320 boards over custom options (ends hidden outside
Edges, symmetric clues, no diagonals, 10x10, honeycomb with hidden ends) brought
path reasoning back: a handful of hidden-ends boards stalled, and needed both a
drawn corridor and the path-number reading. Every stall was one pattern, a
**dead end**: a square the path can enter from one neighbor only must be 1 or
the last number. Read off the numbers directly, it finished 320 of 320. A plain
walking distance ("within 3 steps through empty squares") in place of the
`overlap` fixpoint left 10 to 60% of some Hard and Edges shapes unfinished: the
fixpoint also counts exact lengths and, in Edges, the arrows of the numbers in
between, so the hint uses the fixpoint.

So no notation: every step places a number, and every fact it rests on is a
number, a wall or an arrow. Lines stay the player's own, and the hint neither
reads nor draws them.

## D2. The techniques, and what each projects

| technique | reading | placing rung | tier |
|---|---|---|---|
| touch | `proximity-simple` | `single-position` | Easy |
| reach | `proximity-full` | `single-position` | Normal |
| dead end | the numbers (the conclusion of `update-path`, `adjacent-path`, `remove-endpoints`) | — | Normal |
| one number can reach it | `proximity-full` | `single-number`, simple then full | Tricky, Hard |
| route | `overlap` to its fixpoint | `single-position` | Hard; Normal in Edges |
| one number can step to it | the same | `single-number`, simple then full | Hard; Tricky in Edges |

Classification (`solver-and-generator.md` § "Check, Tactic, Search"): touch,
reach, dead end and one-number are direct readings of one constraint each. A
route is a Tactic bounded by the run it follows, and the step shows it whole:
its ends and every square the run may use are outlined.

Each reading is rebuilt from the board for every question, through the
solver's own rungs, so nothing survives between steps. The placing rungs take a
recorder (`SolverScratch.recording`) that stops them at their first placement;
the generator never sets it, and the ladder-equivalence test and the frozen
differential pass unedited. The ladder is sorted by `techniqueTier` in the
board's own mode, so an Edges board meets a route before a Tricky technique.

**One asymmetry the hint drops.** The reach rungs never measure the last number
from the one below it (`n < end - 1`). The generator's verdicts depend on it, so
it stays in the solver; the hint measures it (`reachLast`). It can only let an
easier technique fire first. On one Tricky board in the census, leaving it out
sent the hint to a Hard route; that board is pinned in the test.

## D3. Narration and picture

Every sentence is in `hint-text.ts`, at most 120 characters (115 measured), the
numbers named by value. The target square is ringed inside its own outline,
square or hexagon; the numbers and squares the step reasons from are outlined
the same way; an arrow's line, when the sentence needs it, is hatched with the
arrow outlined. A dead end's sentence says why the path's other end cannot be
there: it is placed, it cannot reach, or its arrow points elsewhere.

**A move with side effects ends the plan.** A line the player drew fills in the
next number when a number lands at its end (`applyPath`). Those numbers are the
player's to vouch for, so a step whose move fills more than its own square is
the plan's last; the next hint reads the board after the mistake check has seen
it.

`hintKeepTrack` completes a step on its number placed in its square, by any
gesture (a click, a drag, typing, the right-click cycle), and is off otherwise.
It is three lines of move-shape reading, like every single-target game's, so
there is nothing to share.

## D4. Refactor as you go

- **`strokeScaledPolygon`** (`engine/draw.ts`): a cell's own outline drawn a
  fraction of the way to its center. Loopy's clue outline was a private copy,
  and Ascent needs the same for square and hexagonal cells. Proved op-identical:
  the original Loopy code reproduces the snapshot the new one wrote. The proof
  needed a new frame, because **no Loopy test saw the outline**: a shifted
  corner left all 40 of its render and hint tests green. That frame and a direct
  test of the helper now fail on the same shift.
- **`stepDistance`** (`ascent/state.ts`): the solver's reach metric, moved out of
  `solverNear` so the hint's premises measure with exactly the same one.
- Declined: a shared single-target `hintKeepTrack`. See D3.

## Cost

`src/games/ascent/` runs in about 11 s, the hint tests in about 5 s.
