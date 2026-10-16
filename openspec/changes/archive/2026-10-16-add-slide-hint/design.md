# add-slide-hint: design

Measurements below were taken 2026-10-16 with throwaway scripts over seeded
deals of the three presets; re-run before relying on a figure.

## D1. One search, budgeted in positions, shared by the hint and Solve

`solver.ts`'s `findExit` is the existing breadth-first search, from the
position on display, to the first board with the key block on the exit. It
returns a `SearchOutcome`: a shortest line, `lost` where the search ran out
of boards (an unsolvable desc), or `out-of-reach` past `SEARCH_BUDGET`.
Solve goes through `solveBySearch` with it, so the hint and Solve share the
one search, and the engine already makes that the one obvious way.

**The budget.** Slide's search is exhaustive, so it cannot be steered, only
capped. Over 48 deals of 6×8 (the largest board the game allows, 48 squares)
a search from the dealt board kept at most 189k positions, 0.7 s. A player
who wanders does not change that much: 150 random moves from each of 24
deals moved the count by under 20%. Exploring a whole board's positions, by
contrast, took up to 48 s, so a distance map over every position, which would
have made the plan the same on every recompute, is out. The budget is
600,000 positions, over three times the worst deal seen.

**Deal only what the search can finish.** The generator passes the same
budget to every search it runs, and a board past it counts as unsolvable, as
one past the move limit does: a singleton is removed, or a merge reverted.
The board it deals is the last one it searched, so the hint's search from the
opening is always inside the budget. No deal in the differential test's seeds
changes (that test still byte-matches the C), and a desc from elsewhere is
still accepted, so nothing the player holds changes.

## D2. What a step claims: which block it makes room for

Every other move from a position also finishes, since every slide can be
undone and the deal is solvable. So rival judging has one verdict, "every
move finishes", which teaches nothing, and the hint does not call
`judgeRivals`. What separates moves is distance, and what a player needs is
*why this block, now*.

The plan is a shortest line, so every move in it is there for a reason the
plan itself shows. For a move of block X that leaves squares V, the reason is
**the first later move of the plan that could not be made if V were still
filled** (each later move's own reachability is tested with V walled off).
In a shortest line one always exists, or the move could be dropped. Measured
over 1,750 non-key moves of 36 deals:

| the move makes room for | share |
| --- | --- |
| the very next move | 95% |
| a move 2 to 9 moves later | 5% |
| a later move of X itself (X stops part way) | 1 move in 1,750 |

So a plan reads as **chains**: each move makes room for the next, and every
chain ends in a move of the key block. Chains run from 3 to 45 moves.

A step says:

- a move of another block: *"Slide the ringed block into the striped space:
  that makes room for the outlined block."* The outlined block is the one
  whose move needs the room; "the key block" by name where it is the key
  block, which is blue and needs no outline;
- the one-in-1,750 case: *"…: it moves on from there later."*;
- a move of the key block: *"Slide the ringed key block into the striped
  space: from there it can be out in 17 moves."*, the plan's remaining length,
  which is the true minimum because the plan is a shortest line;
- the key block's last move: *"…: that brings it onto the exit."*

The relation is `effect`: no rule forces the move, and the sentence says
what it does.

## D3. The integer every hinted move lowers

The breadth-first distance from the position to the exit. Each hinted move is
the first move of a shortest line, so it lowers the distance by exactly one
whatever the tie-break, and a recompute after it may choose another line of
the same length without undoing anything.

A request from a board on the last line searched takes the rest of that line
rather than searching again: the rest of a shortest line is a shortest line.
So a chain asked again partway through reads the same, and a search runs only
when the player leaves the line. It also took Slide's walk in
`hint-resume.test.ts`, which asks again after every move, from 71 s to
0.6 s.

## D4. A request offers one chain

`hint` returns the steps up to and including the next move of the key
block: one subgoal (§ "Hold a stable subgoal"), and a bound on the plan by
the steps it shows. Each step has its own sentence; `continuesPrevious` is
not set, since each step is its own claim. `hintKeepTrack` answers
`"completed"` to the hinted slide and `"off"` to anything else, a part-way
slide of the hinted block included: the next request plans from there.

## D5. Marks

- **Ring**: the block to move, as one shape (`joinTargets` within a block).
- **Stripes**: where it goes, the squares it will cover (`the striped
  space`). Stripes and not a second ring, so "the ringed block" is one thing
  on the board; the stripes show on the floor the block moves onto and are
  hidden under the squares it already covers.
- **Outline**: the block the move makes room for, as one shape.

The band is inside each square (`outer = 0`), over the block's bevel:
Slide's squares tile exactly, so a square whose marks change repaints and
takes its mark with it. The marks are keyed on the position on display, so
while the player drags the ringed block the ring stays where it stood and the
stripes where it is to go.

**Colors.** Slide has spent blue on the key block, green on the exit and red
on the cursor, and the hint rings the key block, so the action color moves
(`hints-marks.md` § "When the game has already spent the hint hue") to
orange, opposite the key block in hue. The stripes take orange's bold step,
since the base step at the hatch's opacity is too near the light floor
(`hatch-contrast.test.ts` measured 1.20 against its 1.25 floor). The outline
keeps the collection's teal.

## D6. Engine questions

- *"This move is on a shortest route, and these rivals are longer by k"* is
  not said here (D2), so it is no third telling for `rival-judging`.
- Fifteen's *"slide tile N out of the way"* is the nearest sentence. It is
  Fifteen's own (a greedy solver's goal tile), Slide's names which block the
  room is for, read off the plan; what the two share is the word "way", not a
  shape worth a framework. Declined.
- The counterfactual "could the next move be made without the room this one
  made?" is the reusable idea for any move puzzle with a shortest-line
  search. It is written in Slide's terms (reachability of a block); filed
  nowhere until a second game would use it.

## A plan, read as a player

The first chain of the 6×7 seed `s-0` deal, with the key block 2×2 in the
top-left (printed by the hint test, "reads one chain out loud"):

1. Slide the ringed block into the striped space: that makes room for the
   outlined block.
2. Slide the ringed block into the striped space: that makes room for the
   outlined block.
3. Slide the ringed block into the striped space: that makes room for the
   outlined block.
4. Slide the ringed block into the striped space: that makes room for the
   key block.
5. Slide the ringed key block into the striped space: from there it can be
   out in 20 moves.

Each step's outlined block is the next step's ringed one, so the chain reads
as one errand run backwards from the key block, and the count after it is
what the errand bought.
