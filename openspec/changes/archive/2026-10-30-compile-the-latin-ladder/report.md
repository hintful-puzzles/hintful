# Report: compiling the Latin ladder

Written 2026-10-30. How it was built is `design.md`; the guide is
`docs/descriptions.md`.

## The result

1. **The Latin library and Unequal's two modes run compiled from their
   descriptions**, and the hand-written layer they replace is gone: `set`,
   the fish's `confinedSet`, the strikes in `place`, and Unequal's
   `solverLinks`, `solverAdjacent` and `solverAdjacentSet`.
2. **A player sees the same boards, grades and hints.** Before the
   hand-written layer was removed, both ran side by side on every Latin
   game's deals and hint walks, and agreed exactly in every solver call.
3. **Every compiled technique is checked sound against its description's
   rules**, by the checker ported to TypeScript, and the gate refuses one
   whose statement or rules changed since its check.
4. **Deals are up to about twice as slow on the hardest presets** of Unequal
   and Group, and as fast or faster elsewhere (§ "Speed").

## The comparison

With a switch on, every `latinSolver` call ran the hand-written ladder and
the compiled one on copies and compared what each returned, the grid, the
final cube and every hint record, in order, with its reason. The walk dealt
three boards of every preset of each Latin game and followed up to 60 hint
steps on each (it ran under `research/describe/`, and was removed with the
hand-written layer; it is in this change's history).

| Game | Boards | Hint steps | Solver calls compared | Differences |
| --- | --- | --- | --- | --- |
| Unequal | 48 | 2,095 | 64,656 | 0 |
| Towers | 39 | 1,759 | 37,782 | 0 |
| Keen | 30 | 1,646 | 58,823 | 0 |
| Group | 24 | 901 | 65,728 | 0 |
| Mathrax | 36 | 1,461 | 43,219 | 0 |
| Salad | 48 | 2,579 | 168,160 | 0 |

Salad's count runs mostly through its repeated-symbol path, which stays
hand-written; its ordinary placements run the compiled `placed`, compared
in a run of their own.

**It found one difference, and it was the description's.** In Adjacent
mode, the first statement of `set` dropped a check the hand-written search
made before looking for a set: a cell with no candidate left, placed cells
included. A clue can strike a placed cell's own value, Unequal's Adjacent
`valid` skips the last row and column (as upstream's does), and so the
recursion accepted a broken grid as a second answer and graded a board
ambiguous that has one. `set` and `fish` now make that check on their empty
subset, which their count reaches first.

**It was seen to fail**: `single` restated to scan rows before columns
deals the same boards and grades, and was caught in Towers' hint records on
the first board.

The last comparison ran on the compiler as it is now, after every speed
change below.

Two unit tests in `latin.test.ts` named methods that are gone: three cells
sharing two values is a contradiction (`set`), and a value confined across
lines is recorded with the fewer lines (`diffSet(true)`). Each keeps its
situation and its expectations and calls the library's compiled technique.

## The pilot's comparisons

Rerun with the restated descriptions against the game's solver, which is now
the compiled ladder (`research/describe/results-*.txt`):

- **Closures and grades**: Unequal 600 of 600 closures equal cell by cell
  and 150 of 150 grades; Adjacent 480 of 480 and 120 of 120. The counts of
  boards each technique fired on move between `single` and `hiddenSingle`,
  because the library now tries hidden singles first, as the engine did.
- **Firings**: 1,342 of 1,342 and 1,288 of 1,288 matched by one binding,
  the file unchanged.
- **The planted defects** of the pilot are all still seen.

## Soundness

`research/technique-check/results-describe.txt`: every compiled technique,
read from its description, at orders 3 and 4, against the description's own
rules (library techniques on a plain Latin square), every clue layout at
once.

| Description | Techniques sound | Planted defects found unsound |
| --- | --- | --- |
| Latin library | placed, hiddenSingle, single, set, fish, wing | 6 of 6 |
| Unequal | sign | 1 of 1 |
| Adjacent | adjacent, adjacentSet | 2 of 2 |

Each check takes under three seconds. Three plants first came out sound and
were right to: two dropped a condition that consistent marks already give,
and one only made its technique strike less. Each was replaced with a plant
that claims a strike the rules do not force.

**The port.** The checker (`research/technique-check/`) is TypeScript with
`z3-solver` 5.3.3, the Python removed. Its runs agree with the Python's
verdicts on every check that finishes: `planted` 7 of 7, `planning`,
`symarea`, `run_a`'s 68 lines and `run_c`'s 108 checks, and `validate`'s 34
without its Range 6x6 checks, which settle in neither version. Two planted
fillings in the Python `validate` could never come out unsound, so the
earlier cut report's "every plant caught" was not so; the port plants ones
that are. **Left open**: `validate` still includes the 6x6 checks, so a full
run of it does not finish; they should move to a run of their own.

## Speed

Generator time per deal, six seeds a preset, each ladder run twice and the
second pass kept, on the same seeds (both dealt the same boards on every
preset):

| Preset | Hand-written | Compiled |
| --- | --- | --- |
| Unequal 5x5 Tricky | 4.5 ms | 13.5 ms |
| Unequal 7x7 Tricky | 10.7 ms | 22.1 ms |
| Unequal 7x7 Hard | 32.1 ms | 64.1 ms |
| Unequal 7x7 Unreasonable | 36.9 ms | 68.1 ms |
| Unequal 7x7 Adjacent Hard | 48.0 ms | 84.2 ms |
| Group 8x8 Tricky | 126.5 ms | 196.9 ms |
| Group 12x12 Normal | 12.6 ms | 16.7 ms |
| Salad 5x5 Balls Normal | 217.1 ms | 268.1 ms |

On the measurement before the last change (which only removed work), every
Towers, Keen and Mathrax preset was at 0.4 to 1.3 times the hand-written
time (Mathrax 9x9 28 ms against 69), and Salad's other presets at about 1.

What closed the gap from the first measurement (up to 5.6 times):

- **A solve makes each fact as it concludes it** and goes on through every
  binding; only a hint is told each firing and stops there (`design.md`
  § 5). This and `placed` stated as one firing a placement were most of it.
- Each cell's candidate mask kept within a call; one buffer a technique for
  its facts and masks; a quantifier over a set of values compiled to one
  bitwise test; `fish` over row indices; `set`'s open cells and
  `hiddenSingle`'s placed values bound once a unit.

**What is left** is general loops against hand-fused ones: a value read for
every binding of an inner loop that does not depend on it. A compiler pass
that hoists such reads out of their loop would close most of it. It is not
in this change; the largest cost left is about 70 ms on a Group 8x8 Tricky
deal.

## The app

Run in Chrome: Unequal 4x4 Easy and 5x5 Hard, Adjacent 5x5 Tricky (the
app's own labels), dealt
and hinted. The sign's step ("The larger side of this greater-than sign
can't hold the smallest number, so this cell can only be 2, 3, 4 or 5") and
the bar's ("A bar joins this cell to its neighbor with nothing open one
away from 5, so this cell can only be 1, 2, 3 or 4") read as before, with
their outlines on the sign's or bar's two cells.

## What was not checked

- **Boards above order 4** for soundness, and the clue techniques against
  any rules but their own game's.
- **A counterexample read back** through the interpreter, as the Python
  tool's `verify` did for its own encodings; the planted defects show the
  checker sees what it should.
