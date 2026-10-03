# Design: judge-rivals-for-search-hints

Sokoban was the second search game to get a hint (owner, 2026-10-03: *"I
think that Sokoban will work well with it"*), in place of Same Game, which the
proposal named.

## D0. What is really shared (task 0.1)

Compared line by line with Pegs' `hint.ts` once Sokoban's hint was designed:

- **Shared, and now the engine's** (`src/engine/rival-judging.ts`): the loop
  that judges each rival within one counted allowance, the `Verdict` and
  `Allowance` types, and the table from verdicts to what a step may claim
  (`none`, `unsettled`, `every`, `only`, `onlyThese`, `alsoThese`) with the
  relation each claim's sentence uses. Pegs' copy of the table was five
  `if`s over three booleans, and Sokoban's would have been the same five.
- **The relation comes from the judging.** `Relation`'s forced variant carried
  `rivals: "lost"`, a string any game could type. It now carries `RivalsLost`,
  a value only `judgeRivals` makes, so "so" over a searched move needs the
  judging. Typing it found three more games that wrote the string by hand:
  Black Box (a firing proves the square's other content sends the laser
  elsewhere), Guess (a firing proves the rule-outs from the scores; one
  answer fitting proves the others misfit) and Inertia (every other direction
  slides onto a mine). Each judges its rivals through the helper now, the
  judge being the deduction or the rule that already ruled them out. The
  `Form` the hint-quality walk reads still says `rivals: "lost"`.
- **Stays the game's**: the judge itself (Pegs: two beams, then a capped proof;
  Sokoban: a visible stuck barrel, then the solver within the allowance), which
  rivals to judge, the traps that lead, and what to say when nothing is
  settled. Those are about the puzzle.
- **Not extracted**: one step per request. Both games do it, but it is a
  decision inside each game's `hint`, three lines, with nothing to share.

`drawMoveArrow` moved from Pegs' renderer to `engine/draw.ts`, since Sokoban
draws the same arrow for a push.

## D1. The solver (`sokoban/solver.ts`)

Measured on generated boards of every preset (2026-10-03, load 2–5):

- A best-first search over pushes, a position being the barrels and the
  player's region, guided by the sum of push distances to targets, solved 13
  of 24 openings within 300,000 positions. Pairing barrels with targets
  greedily (so two barrels are not both counted toward one target) raised it a
  little; an exact pairing (Hungarian) changed nothing, so the guide was not
  the limit.
- The searches stalled in lost positions they could not recognize: barrels
  sealed off where the player can never stand behind them. A **fence** check
  prunes those soundly: after a push, the squares the player can no longer
  reach next to the pushed barrel, and the barrels around them and one ring
  further, are searched alone (at most 8 barrels, 2,000 positions); taking
  barrels away only makes room, so if those cannot all reach targets, nor can
  the board. With freeze deadlocks and dead squares, this took the openings to
  20 of 24.
- A second search runs back from the finished board, pulling, which is how the
  generator built the level, and the two sides meet on a shared position. Each
  side alone solved openings the other could not.
- The remaining failures are congested endgames that need machinery of a
  different order (full corral pruning). They are `SEARCH_OUT_OF_REACH`.

`PLAN_BUDGET` is 100,000 positions. Along hint-guided play the search found
its line from every position of every opening it could start, in 1–20 ms per
push on 10×12 and up to ~1 s on the larger boards' worst positions.

## D2. Solve

Solve searches from the player's board, then from the dealt one, and leaves
the finished board: a `solve` move carrying the board as a game ID writes it,
which `executeMove` loads after checking its walls are this board's, as Pegs'
Solve snaps to its one peg.

## D3. Why the plans cannot cycle

Recomputing after every push, the plan's first push once moved a barrel up
and the next plan moved it back down, for ever (16×20, seed `s4`, at push 14):
best-first search is not shortest, so the line found after a push need not be
the rest of the line found before it. Caching the plan would hide it.

The fix: offer a push only if the line the search finds after it is shorter
than the one it finds now, else the rival whose line is shortest. The search
is deterministic and its budget only truncates it, so the length of the line
it finds is a function of the position, and every hinted push lowers it. A
rival judged as finishing already has its line's length, found within a
smaller budget, which a larger budget would only have found the same way.
Measured over 36 boards: no cycle, never without a push that lowers the
potential. The pinned cycling board walks to the end; with the rule removed
it comes back to a position after 17 pushes.

## D4. The hint

Refusals, in order: a barrel off its target already stuck for good (a dead
square, a corner, or frozen), outlined, as a marked dead end; the search's
proof of loss, `NO_SOLUTION_FROM_HERE`; past its reach, `SEARCH_OUT_OF_REACH`.

A step offers one push. Its **rivals are this barrel's other pushes.** The
first cut judged every push from the position: on these crowded boards some
other barrel's bad push was there on nine steps in ten, and naming it each
time ("the striped push would jam its barrel …") taught nothing about the push
offered; the claims then drew arrows over most of the board and took up to
1.5 s. Which way to push this barrel is the choice the step is about.

In order, a step says:

- **a trap**: another push of this barrel would wedge it in a corner, leave it
  where no push can bring it to a target, or jam it (or a barrel beside it) so
  it can never move. Striped, and answered as one way to avoid it.
- **the judging**: no other push of this barrel can finish (`only`), or it can
  finish only along the arrows (`onlyThese`), or along them but not every way
  (`alsoThese`).
- otherwise what the push does where the board shows it: *that puts it on a
  target*, or the bare push.

Measured over hint-guided play on 9 boards of the three presets (313 pushes):
60% *puts it on a target*, 19% bare, 20% traps, and the judging's claims once, because these
levels' barrels mostly sit a push or two from a target with every direction
still able to finish. That is what the boards are like, not a gap in the
judging.

The step's move is the push itself, walk included (`SokobanPush`), which
`executeMove` applies after checking the player can walk there, so the
cross-game walks recompute once per push. No input makes it: the gesture taps
each square of the shortest walk (diagonals where they save a step) and then
the barrel, and `hintKeepTrack` keeps the step through any walk, since walking
changes no barrel.

Marks: the barrel and the square it goes into are ringed; another push of it
is striped across its two squares; an arrow (outline) runs from the barrel
for each push that can finish; a stuck barrel is outlined.

## D5. Dealing boards the hint can see through

Every generated level is soluble, being made by playing backwards, but 7 of
20 16×20 levels (1 of 20 at 12×16, none at 10×12) were past the search from
their first move, and a hint that refuses from the opening never helps. So the
generator deals the first level the search finishes within 30,000 positions
(below `PLAN_BUDGET`, since a rejected level costs the whole trial budget). A
level found within it is within the hint's reach too, the search being the
same. Dealing took 20 ms on average at 10×12, 82 ms at 12×16 and 0.6 s at
16×20 (worst 1.9 s).

This changes which board a seed deals only where the C's first level is out
of reach, which is not a compatibility break (AGENTS.md § "Upstream policy").
The frozen C differential now pins `sokobanLevel`, the level before the check,
and still matches all twelve fixtures byte for byte; what replaces it for the
dealt board is the cross-game walks, which deal boards of every preset and ask
the hint from the opening.

The first version searched the level before its untouched squares became
walls, a roomier board than the one dealt; the overlay walk caught a dealt
16×20 board the hint refused.
