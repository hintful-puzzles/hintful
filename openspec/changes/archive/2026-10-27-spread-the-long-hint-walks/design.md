# Design — spread-the-long-hint-walks

## What the measurement said (2026-10-27)

Gate run 40517483254, green in 35 minutes: 114 minutes of test time over
four workers, of which `hint-resume.test.ts` held 33.3 and
`hint-quality.test.ts` 25.6.

- **hint-quality's cost is spread over games.** No game holds more than 2.7
  of its minutes (Mosaic), so a share of games balances.
- **hint-resume's is not.** Loopy's walk to solved was 22 of its 33 minutes,
  in one test, and within it one board was most: Loopy's 7x7
  Great-Great-Dodecagonal (the grid type no preset offers, dealt on the first
  preset's size) plans 1018 steps, and the walk asked after every move took
  244 s of Loopy's 400 s locally. No share of games, or of boards, can split
  one board.

So the answer to "Measure first" was both: share the two files, and trim the
one walk that no share could split.

## Decisions

**Projects, not files.** vitest runs each file listed in `SPREAD`
(`vitest.config.ts`) once per share, as a project of its own that is
provided the share it is (`src/engine/testing/sweep-share.ts`). Splitting
the files instead would rename the two sweeps that docs, comments and the
selector cite by name, and leave a hand-kept set of share files that could
lose one in silence. A run outside the projects is provided nothing and walks
the whole sweep. The share count is CI's core count, 4.

**What a share holds.** The k-th item goes to share k mod 4, from lists
derived from `HINT_GAMES`. hint-quality shares games, every walk of a game in
one share. hint-resume shares its single-plan sweeps by game and its walk to
solved by board, since Loopy's boards are spread only that way. A check that
walks nothing (a ledger's reasons, the registry's population) runs in the
first share.

**Censuses held per share.** No share can see another's walk, and every game
is walked by exactly one share, so a census over a share's own games is the
census the whole sweep made: the long-narration ledger is held, listing by
listing, in the share that walks the listing's game. A vacuity floor on a
count is held at its share of the whole floor (`shareFloor`). The one check
that asked whether *any* game met a form ("met every form it checks on real
steps") is held on a game that meets each, measured, in the share that walks
it: a game that stops meeting its form fails the check, which never passes
over nothing.

**The Gate limit stays at 45 minutes.** Spreading takes the run to the
suite's total over the workers, near 29 minutes, and room for the 1.7x slow
runner seen on 2026-10-22 is about 49. The total still grows with every game;
what this change removes is one file setting the run alone.

**The trim: CI recomputes up to 512 times a board.** Every board whose first
plan is 512 steps or fewer, 307 of the gate's 311, is still asked after
every move on CI. The four longer (Loopy's Great-Great-Dodecagonal and
Great-Dodecagonal, Mosaic's 50x50, Pattern's 30x30) are asked at 512 evenly
spaced moves and followed between. What that can step over is a planner that
undoes its own last move between two of those moves, on those four boards.
Rejected: dealing a grid type no preset offers on a smaller board. That is
`unofferedValues`' rule for every game and every sweep, and its board is one
the Custom dialog deals.
