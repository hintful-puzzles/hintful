# fix-salad-number-ball-hint-throw

**Status: implemented (2026-10-05).** Found by
`name-the-rung-a-hint-step-speaks`, whose scan for Salad's rungs dealt the
board.

## Why

Salad's hint threw on a board its own generator deals, at a tier it ships.
Reproduced 2026-10-05, on the fresh board with no move played, under both
candidate readings:

- `5n3Bdx:c2b1aOXbXb3c1OOc` (Number Ball, 5x5, Normal, dealt from the seed
  `hint-scan-25`).
- `saladGame.hint(state)` threw: *"hint plan: placing 1 at cell 2 is neither
  a naked nor a hidden single in the notes, so the plan skipped a strike it
  rests on"* (`classifyPlacementInRegions`, `src/engine/latin-hint.ts`).

A player who pressed Hint on that board got a crash report and no hint.

## What was measured

The name is the one the fault was filed under. It is not a Number Ball fault.

Hint-guided play on boards dealt from fixed seeds, the throw caught and
counted, each board's plan played to its end. Boards that threw, of boards
dealt, before the fix:

| | Letters | Number Ball |
|---|---|---|
| Easy, six shapes from 4x4 to 7x7 | 0 of 900 | 0 of 900 |
| Normal 4x4, 3 symbols | 3 of 150 | 0 of 3, then the generator gave up (below) |
| Normal 5x5, 3 symbols | 0 of 150 | 4 of 21 |
| Normal 5x5, 4 symbols | 9 of 150 | 36 of 150 |
| Normal 6x6, 3 symbols | 0 of 150 | 2 of 39 |
| Normal 6x6, 4 symbols | 4 of 150 | 5 of 66 |
| Normal 7x7, 4 symbols | 2 of 127 | 6 of 39 |

71 of 1,195 Normal boards, across both modes, and none at Easy. Of the nine
shapes that threw, the first throw came within 28 boards on eight, within 6
on five of those, and on the 71st for 7x7 Letters. The counts are of boards,
on a loaded machine with a minute a shape, which is why the Number Ball
shapes dealt fewer.

**Why no guard met it.** Every one of Salad's eleven presets is Easy
(upstream's list, kept whole by the port), and every cross-game hint walk
deals from a game's presets (`engine/testing/presets.ts` says so of Salad by
name: its `difficulty` is "the standing case" of a field no preset varies).
Normal is reachable from the Custom dialog alone, so no cross-game guard had
ever dealt a Normal Salad board. `offer-salad-normal-presets` closes that.

## The cause

On the pinned board, three squares of column 2 can hold only a 2 and the
column's two empty squares, so the column's other squares are not empty. The
solver records that as a set elimination striking the hole symbol from (2,0).
`buildSteps`'s `record` dropped **every** strike of the hole symbol, on the
reasoning that a marker step teaches the same fact. A count teaches only one
of them: the strike a line makes once it holds all its empty squares. With
the set's strike dropped, the "might be empty" mark stayed in (2,0)'s notes,
row 0 never came to show three squares that hold numbers, its two empty
squares were never marked, and the 1 the solver places at (2,0) was neither a
naked nor a hidden single on the board the player had.

The lead in the scaffold was right about where and wrong about which: it is
not a placement resting on a dropped strike directly, it is a ball nothing
could explain, two steps upstream of the placement that threw.

## What Changes

- The plan drops a recorded strike of the hole symbol only where its line
  holds all its empty squares, which `countHolesDone` says. Every other one,
  a set's or a chain's, is a strike of the X note, taught like any
  candidate's.
- A new rung, `xNoteGone`: a square with notes and no "might be empty" mark
  among them holds a symbol. It is the mirror of `crossNaked`, and a mark the
  player can make.
- A set that strikes the X note names what the set holds: all the empty
  squares of its line ("The outlined squares account for 2 and both empty
  squares of their column, so we must cross out 2 and the X here.").
- The X note prints as X where a shared sentence lists a square's candidates,
  and a chain that runs through it counts "pencil marks" where it counted
  letters. **This one was already shipping wrong**: on a board with one empty
  square a line the X is an ordinary candidate a chain may run through, and
  the sentence printed it as the symbol past the board's last. The pinned
  4x4 A~C board in `hint-ordinal.test.ts` held "Square 1 is B or D" in its
  snapshot, on a board with no D.
- `repeatFull` leaves Salad's rungs. The plan could never speak it, since the
  count always says the same first, so it stood in `unreached` excusing a
  declaration.
- Salad's rung scan deals Normal Number Ball boards again, and `forcing`,
  which that scan now reaches, is pinned.

## What replaced the check that was missing

The pinned board, as a desc, in `salad-hint.test.ts`; the rung scan over
Normal boards of both modes; and, after the fix, the same seeds walked again
(2,991 boards) with no throw and every plan ending on a solved board, then
799 boards
walked one first step at a time, asking again after each, with no throw
either. `xNoteGone` was spoken on 67 of those 799, so the 48-board scan's
zero for it is a short sample and its pin is kept by hand.

## Found beside it

- **4x4 Number Ball at Normal mostly cannot be dealt.** 6 of 21 seeds ran the
  generator to its 50,000-attempt bound, about ten seconds each, and threw.
  Recorded in `bound-custom-sizes-by-their-deal`, with the deal cost of the
  other Normal Number Ball shapes.

## Hints to pull in

None.
