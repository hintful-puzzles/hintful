# Report: describing Salad

Written 2026-10-31. The guide is `docs/descriptions.md`; the decisions are
`design.md`'s.

## The result

1. **Salad runs its ladder compiled from `salad.description.yaml`**, and the
   hand-written border scan and the engine's levels path (`LatinLevels`,
   `usersolvers`, `diffSimple`, `setGeneral`, its own wing and `elim`, the
   line counters) are gone. Every Latin game now runs a described ladder.
2. **The library reads a value's multiplicity** (`times(d)`, design § 1):
   `placed`, `hiddenSingle`, `set`, `fish` and `wing`, each guarded so a
   Latin square reads as before. The trace of every other Latin game's deals
   and hint walks is byte for byte HEAD's.
3. **A player meets the same boards**, and on Normal boards where the empty
   square repeats, sometimes another set or fish step for the same strike:
   the pattern every other Latin game's hint names (§ "What a player
   meets").
4. **Each technique is sound**: the library on a Latin square and on one
   with a value twice a line, Salad's border at every count of symbols of
   orders 3 and 4; each plant unsound (§ "Soundness").
5. **Salad's Normal ABC End View boards deal 2.5 to 5 times faster;
   Unequal and Group deal 5 to 13% slower at their hard tiers**, a few
   milliseconds, the cost of reading a multiplicity every Latin game now
   pays (§ "Speed").

## The comparison

With `COMPARE.on` every solve not made inside another ran the hand-written
ladder on a copy beside the compiled one, and compared the grade, the grid,
the final cube and every record, groups numbered by first appearance; each
params and seed was also dealt by each ladder alone
(`research/describe/compare-salad.test.ts` in the change's first commit).
Over the presets and both rulesets at 4×4 of two and three, 5×5 of two,
three and four, 6×6 of three and four, 7×7 of four and 8×8 of five, each at
Easy and Normal (a two-symbol Number Ball board at Normal takes most of a
minute to deal, and was left out), three seeds each:

- **With two switches set**, 93 boards, 6,661 hint steps, **1,020,759 solves,
  none different**, and every deal the same. The hand-written records
  compared: `single` 2,746,805, `dup` 1,606,701, `borderFar` 972,479,
  `borderNear` 755,381, `repeatFull` 282,820, `set` 76,393, `wing` 1,260.
- **The switches** have the compiled ladder's `set` and `fish` run the
  engine's own multiplicity code where the empty square repeats
  (`handSet`, `handFish`). A third, for the wing, found no difference over
  402,442 solves and was removed: the library's wing with its guards is the
  engine's.

**Without them**, 12,563 of 1,021,824 solves differ, every one at Normal
where the empty square repeats, and **no deal**:

- 11,981 in records alone: a set or fish step names another pattern for the
  same strike. The engine's `setGeneral` enumerated subsets of a line's
  cells, placed ones included, and for one value subsets of columns; the
  library's set enumerates subsets of the unplaced values, and its fish
  subsets of rows, and records the smaller of a fish's two readings. On a
  7×7 board of four letters, striking D from a square of the first column,
  the engine's step named four squares of the column; the library's names
  two, which between them hold the column's D and its last empty square.
- 582 in the fixpoint, all on the compiled side and all at the Normal cap:
  the library's fish counts copies, and so concludes where columns that
  owe the empty square its last copies place them in rows that owe as many,
  which `setGeneral`, counting each column's placed copies too, missed. No
  grade moved from unfinished to solved in these, so no deal changed.

**Two plants were caught**: the border technique's near reading stopping a
square short (1,175 of 1,622 solves differ, and the deal, on 5×5 of three
letters at Easy), and the library's hidden single reading the empty square
as once a line (1,087 of 1,460 differ, in records, on the same board).

## The hint walks

`research/describe/trace-latin.test.ts`, every Latin game: after the first
commit, every Unequal, Towers, Keen, Group, Mathrax and Solo line is HEAD's
(21,531 lines), and Salad's differ only on four Normal ABC End View walks,
at a set or fish step (§ "The comparison"). After the hand-written ladder
went, and with the two compiler changes of § "Speed", every Latin game's
trace was byte for byte the first commit's.

## What a player meets

- **The same deals** on every board the comparison dealt.
- **On a Normal board where the empty square repeats** (5×5 of three and
  6×6 of four letters on the menu; Number Ball's Normal preset, 5×5 of four,
  has one empty square a line and is unchanged), a set or fish step may name
  another pattern, the one any other Latin game's hint names; and on Number
  Ball, now and then, a fish the engine missed.

## Soundness

`research/technique-check/results-describe-latin-salad.txt`. The library is
checked on a Latin square and on one whose last value appears twice a line,
at orders 3 and 4: each technique sound in both, its plant unsound, and a
second plant for each that reads a multiplicity (the hidden single not
counting placed copies, the set its surplus, the fish counting lines, the
wing weighing the repeated value) unsound where a value repeats. Salad's
border technique is checked at order 3 with two letters and at order 4 with
two and with three, the empty square once a line and twice; sound, and its
plant (one square less reach) unsound.

The answer check (`results-answer-salad.txt`): 51 boards, each with one
answer by the rules and it the game's; `status()` compared on 1,453 full
boards and `findMistakes` on 306, no disagreement; a border read as anywhere
in its line, and a ball read as nothing, each seen.

## Speed

Generator time per deal on every Latin game's presets, four seeds, the
second of two passes kept (`research/describe/speed-latin.test.ts`), the
build before this change in a scratchpad worktree and this one, one after
the other:

- **Salad**: its Normal ABC End View deals, where the empty square repeats,
  are 2.5 to 5 times faster (5×5 of three 25.1 → 9.9 ms, 6×6 of four
  52.2 → 9.8 ms): the engine's `setGeneral` enumerated every subset of a
  line's cells and of its symbols, the library's set the subsets of the
  unplaced values. The rest is within a millisecond either way, but Number
  Ball's Normal preset, 5×5 of four, 244 → 291 ms.
- **Towers, Keen, Mathrax and Solo**: within a few percent, either way.
- **Unequal and Group**: 5 to 13% slower at their hard tiers, steady over
  four alternated runs of eight seeds (Unequal 7×7 Extreme 56 → 61-63 ms,
  Group 8×8 Hard 139-141 → 156 ms). Restoring `placed`, `set` and the
  hidden single to their old statements one at a time found no one of them
  the cause: the old hidden single gave back about 3%, the others nothing
  measurable; the rest is spread over the guarded statements. Two changes
  that read as cheaper and measured as no different stayed, being the
  simpler code: `times(d)` compiles to two field reads rather than a method
  call, and a term moved to a binder is computed past the binder's `where`,
  so a binding the filter skips pays for none of it (it had put the set's
  multiplicity term ahead of its size filter). No player waits on a deal of
  tens of milliseconds.

## The app

Run in Chrome. On a 6×6 ABC End View board of four letters at Normal, where
each line has two empty squares, the hint walked from an empty board to the
solved grid with no stall; on a second deal it reached a fish step: "These 2
columns fit A only in the outlined squares, taking the A of 2 rows, so the A
must go", the two columns hatched, A's four places outlined in two rows, and
the struck A marked in the first square of the second row, the library's
pattern where the engine's would have named columns or rows by its own
enumeration. Border steps read "This clue sees A first past 1 empty square,
which leaves only A for this square, so B and D must go" and "This clue sees
C first, after at most 1 empty square, keeping it in the first 2, so the C
beyond that must go". A 6×6 Number Ball board of three walked to COMPLETED
in 47 steps, its balls' and crosses' steps among them.

## What was not checked

- **A two-symbol Number Ball board at Normal**, which takes most of a minute
  to deal; at Easy it is compared.
- **Above order 4 in the checker**: Salad's border reads one line, and the
  comparison covers 5×5 to 8×8.
