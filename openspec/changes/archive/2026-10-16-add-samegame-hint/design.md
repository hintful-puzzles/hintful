# Design: add-samegame-hint

Measured 2026-10-16 on 200 dealt boards a preset (seeds `m0`…`m199`), and on
the positions 5, 20 and 40 random removals leave on them. Re-measure before
relying on a figure.

## D1. What a step claims

The one thing the hint can prove is about clearing: a removal is on a line
that clears the board (the search found one), and a rival is not (the search
exhausted it). It never speaks of score, which it can prove nothing about, and
the help says so. A step, by rung:

- **last**: "Remove this group: that clears the board."
- **lastOfColor** / **stuck**, the traps a player can see, and so they lead: a
  rival that leaves a square the last of its color (outlined, rival striped),
  or that leaves no two squares of one color side by side. The nearest such
  rival to the offered group; the last-of-color one first.
- **only / onlyThese / alsoThese / anyGroup / none**: `judgeRivals` over every
  other group on the board, which is the choice a player faces, and only the
  claim it returns, with its relation. The groups that can still clear are
  outlined.
- **joins**, where nothing is settled: a square with no partner of its color
  that the removal brings one beside. A visible fact, worded as "one way to",
  never as the reason the search chose it.
- **plain**: the removal alone.

A plan read as a player (10x15c4, the hint followed): anyGroup steps while the
board is open, then joins and plain where the allowance settles nothing, then
lastOfColor traps as colors run low, onlyThese near the end, and last. On
15x20c4 joins is the common step (415 of 845 hints), since the allowance
rarely settles every rival on a full board.

A refused hint: a square the last of its color is `hasNoSolution`'s, outlined
(`markedDeadEnd`); a lost board with no such square is the search's proof,
`NO_SOLUTION_FROM_HERE`. The proposal's "name the removal that made it so" is
not done: `hint` sees the position and not the moves that led to it.

## D2. The search

A depth-first search over removals, children ordered by how few squares the
removal leaves with no partner beside them, with a memo of positions proved
lost and a cut at a square the last of its color. One such search is
heavy-tailed (rarest-color order: 6 of 50 15x20c4 openings past 100,000
positions), so it restarts 110 times at 500 positions, the ties broken another
way each time and the memo shared, and then takes what is left of 60,000 in
one last try. A try that finishes without clearing has searched everything,
which is the proof of loss.

| preset | openings found | after 20 removals | after 40 | worst opening |
| --- | --- | --- | --- | --- |
| 5x5c3 | 200/200 | 63 found, 137 lost | same | 1 ms |
| 10x15c3 | 200/200 | 200 found | 43 found, 157 lost | 16 ms |
| 10x15c4 | 200/200 | 199 found, 1 out of reach | 71 found, 129 lost | 136 ms |
| 15x20c4 | 200/200 | 200 found | 200 found | 167 ms |

Twenty restarts and a long last try lost an opening and four more positions;
the restarts are what find a line.

The brute-force check in `samegame-hint.test.ts` holds the verdict to an
enumeration with no ordering, memo or cut on small boards.

## D3. The rival allowance

4,000 positions a request, 400 a rival. A whole hint, followed to cleared on
ten boards a preset: mean 0 ms (5x5) to 136 ms (15x20c4), worst 425 ms. With
30% of moves strayed, worst 1.8 s on 15x20c4, and 2 of 782 requests out of
reach there.

## D4. Marks

The squares come in every hue, the hint's blue among them, so the ring and the
outline carry a black keyline on their inside (a thirty-second of a tile), and
the stripes are black: measured over every square color in both schemes, black
stripes are at least 1.44:1 and blue ones 1.00 on a blue square
(`hatch-contrast.test.ts`, "Same Game under the hatch"). A ring is one shape
round the group; outlined groups join only within a color.

## D5. Solve

The out-of-reach refusal sends the player to Show solution, so Same Game gets
a Solve: `{ type: "solve" }`, which empties the board and scores nothing,
found from the player's position and else from the dealt board
(`solveBySearch`). A new move type; older saves still open.

## D6. The potential

Every removal takes two squares or more, so the square count falls on every
hinted move and a recomputed plan cannot cycle. `hint-resume.test.ts` walks
the gate's boards; `samegame-hint.test.ts` walks a 15x20 board.
