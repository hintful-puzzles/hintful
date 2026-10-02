# Design: play-only-boards-with-one-answer

## Where the rule lives

The owner asked for the uniqueness rule in the engine, so that no later game
re-decides it. Two halves of it could be engine-owned, and one could not:

- **Loading** is the engine's. `loadDesc` already builds every board a player
  can open, so it is where a board with several answers is refused. It needs to
  know the answer count, and the game already says it: `solve` returns
  `MULTIPLE_SOLUTIONS` or `NO_SOLUTION` only when its solver proved it
  (`solve-failure.ts`). So the engine consumes a declaration every game already
  makes, and a game joins by having one: the population is the games whose
  `solve` can return either (`npm run refs -- src/engine/solve-failure.ts
  MULTIPLE_SOLUTIONS`, and the same for `NO_SOLUTION`). Black Box joins in this
  change.
- **The population** is the games with `findMistakes`, read from the member
  itself. The rule exists because the check compares with one answer; a game
  without a check has nothing to compare, and a permutation puzzle's `solve` is
  a search worth not running on every load. `nonUniqueTiers` (Dominosa's
  Ambiguous) is honored by reading the tier the game already declares.
- **Dealing** stays the game's. Generators share no shape — a latin solver's
  uniqueness search and a ball layout's have nothing in common — and each game
  already owns its generator's promise. What the engine adds is that a dealt
  board the game's own `solve` calls ambiguous no longer loads from its own
  game ID, which the near-miss test (`desc-error-games.test.ts`, "a parser made
  strict must still read what its own generator writes") checks for every
  game.

The cost is one solve per loaded board, which `withBoardTier` already paid for
tiered games. A generated board is not re-judged: the midend builds it with
`newState` directly.

**Two verdicts, because they answer two questions.** `validateDesc` stays the
codec's: does this desc describe a board. `loadVerdict` is `loadDesc`'s: does
the board load, answers included. The first cut folded the answer into
`validateDesc`, and the gate failed 20 codec tests in twelve games, each
asserting that a hand-built grid with two givens parses — true, and not a
puzzle. A codec test asks about the parser; only the paths a player's game ID
takes, and the tests that stand for them (upstream's descs, a generator's own),
ask for the answer.

## Counting Black Box's answers

The answers are counted by the hint's own layout search (`walkLayouts` in
`hint.ts`) on a copy of the board with every laser fired at the real balls,
until a second layout turns up. Using the hint's search means the hint and the
generator cannot disagree about which boards the lasers pin down. The search now
settles what each guess forces before the next guess (the hint's `deduce`, as
unit propagation), which cut the dense boards' average but not their worst case.

Checked against trying every layout, on 450 boards of 4×4, 4×3 and 3×4 with
fixed and ranged counts: 316 with one answer, 134 with several, all agreeing.
`blackbox-answer.test.ts` keeps 80 of them.

A count that runs past its budget (20,000 steps) settles nothing: a deal builds
again, and a loaded board loads, since refusing it would refuse boards with one
answer that are merely slow to prove.

## Dealing a board with one answer

Upstream scatters balls at random. Two ways to keep only boards with one answer
were measured (20 boards each, 2026-10-02):

| Board | Scatter until unique | Build a ball at a time |
| --- | --- | --- |
| 8×8, 3–6 (preset) | 20/20, avg 4.5 balls | 20/20, avg 4.5 balls |
| 10×10, 4–10 (preset) | 20/20, avg 5.6 balls | 20/20, avg 6.7 balls |
| 8×8, 12 | 20/20, 586 ms | 20/20, 35 ms |
| 8×8, 16 | 0/20 in 2,000 scatters | 20/20, 192 ms |
| 10×10, 15 | 2/20 | 20/20, 1.3 s |

Building wins (the owner's suggestion). Scattering also skews a ranged preset
toward its fewest balls, because more balls hide more squares and a scattered
board with many is rarely unique; building keeps the count near the preset's
uniform average of 7.

**Uniqueness is not monotone in the balls**: a ball can shield squares from
every laser, or unshield them. So building is a guided search, not a proof. Each
ball goes on a random free square where the board so far has one answer at its
count, trying 30 squares before starting again; the last ball is judged against
the params' whole range, since the player knows the range and not the count.
The boards it deals are not uniform over all boards with one answer — they favor
those that stay unique at every count on the way — which no player can see.

How rare a scattered unique board is, by density (60 scatters each): 5×5 is 97%
unique at 3 balls and 0% at 10; 8×8 97% at 5, 32% at 8, 0% at 12; 10×10 95% at
5, 13% at 10.

## The ball limit

Dealing is bounded by the count's cost, which grows with balls and with lasers.
The slowest of four to six boards, dealt a ball at a time:

| Board | Fast | Slow |
| --- | --- | --- |
| 6×6 | 16 balls, 0.08 s | — |
| 8×8 | 20, 1.3 s | 21, 3.9 s; 24, ~5 s |
| 10×10 | 10, 0.11 s | 12, 3.8 s; 16, 15 s |
| 12×12 | 8, 0.02 s | 10, 6.5 s |
| 16×16 | 8, 0.05 s; 10, 0.3 s | 12, 10.8 s |
| 20×20 | 6, 0.00 s | 8, 4.3 s |
| 30×30 | 6, 0.01 s | 8, 8.3 s |
| 255×255 | 6, 4.4 s | — |

`ballLimit(w, h)` is that table: a third of the squares up to 20 balls on boards
of up to 64 squares, 10 up to 100, 8 up to 256, and 6 beyond. It binds only a
deal (`validateParams` with `full`), so a game ID with more balls still loads
when it has one answer. Every preset is within it. The largest board takes about
4 s at its limit, spent tracing 1,020 lasers rather than searching; it was left
alone, since lowering its limit would not help.

## The hints

Both hints wrote steps for marks the check now refuses first, and those go:
Black Box's two-move settle journeys (a guess off a square proved empty, a known
mark off a square proved a ball), its "take the ball off" step for balls beyond
the count, its "take the known mark off" lead to the last hidden ball, and its
layout's "unball" and "unlock" legs; Mines' "the flag must come off" leg.

Black Box's layout search now starts from the player's marks. On a board with
one answer, the marks the check passes agree with the only layout, so the search
only adds balls and the plan never removes a mark the player made. Where every
laser's path is settled and balls remain, the count fixes the squares no laser
reaches — all of them hold a ball or none does, or the board would have two
answers — so the hint places them without asking which.

Mines' hint still deduces from the opened numbers only. A flag the check passes
is on a mine, but the numbers may not prove it yet, and a hint that reasoned
from it would teach a guess.

## What replaces nothing

No oracle is dropped: the Black Box differential never existed, and the
upstream-descs fixture stays a load test, now one that states its params
correctly (see the proposal).
