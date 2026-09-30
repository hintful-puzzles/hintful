# add-net-hint — design

## D1. One engine, two projections

`deduce.ts` reasons from what a player records (side notes, locks) and what
the board shows (walls); an unlocked tile is unknown however it is turned. A
step adds one fact: a side every surviving turning of a tile agrees on, or a
tile only one turning survives for. A turning falls to a **side** it
contradicts, a **loop** its new wires would close through known wires, or a
group it would **seal** off (the tile, what known wires join to it, what its new
wires reach, none with a wire to spare that could lead out).

The hint projects it one step at a time; the generator projects it whole
(`finishes`). The engine rederives every tile's surviving turnings each step,
so a narrowed set is never a fact a step rests on without saying: that is
why the notation needed only sides (`add-net-notation` D1).

## D2. Measured

2026-09-30, 20 boards per preset, sound against the generator's solution on
every step (a note's side and a lock's wiring checked against `aux`):

| Preset | Finished | ms/board |
|---|---|---|
| 5×5, 7×7, 9×9, 11×11, 11×13 | 20/20 each | 2, 5, 16, 47, 72 |
| wrapping 5×5, 7×7, 9×9, 11×11, 11×13 | 15, 17, 19, 19, 18 | 1, 5, 19, 46, 74 |

Locks alone (`sweep-target-verb-input` design) finished 25/30 at 5×5 and 5/30
at 11×11, and took no step on a wrapping grid.

The wrapping boards it does not finish need upstream's dead-end counting — a
bound on how many tiles lie behind a side, propagated tile to tile — which is a
chain, not a fact a player can note. Rather than teach it, the generator keeps
only boards the engine finishes (D4).

## D3. The steps and their words

- **Easiest first**: walls alone, then notes and locks, then a loop, then a
  sealed group; a lock before a note of the same difficulty; then reading
  order. Steps with two premises (a fit and a loop or seal) are 2–3% of steps.
- **Only the turnings that would say otherwise are cited.** A note step names
  the reasons against the turnings that disagree about its side, not every
  turning that fell.
- **Claim only what was checked.** Beside a fit clause, several looping or
  sealing turnings are "any other way that fits", never "any other way", since
  some other ways fall to the fit and need not loop at all.
- **Marks**: the tile a lock decides, or the side a note decides (drawn as the
  note it places), is ringed; the notes and locks it reasons from, and the tile
  whose turnings a note reads, are outlined; a loop's route or a sealed group is
  striped. The help's piece names (dead end, straight, corner, T) are the
  sentences'.
- Two templates carry two premises and run to 157 characters; they are
  ledgered in `hint-quality.test.ts`'s `LONG_NARRATIONS` with that reason.

## D4. Generation

With `unique` set, a board the engine does not finish is dealt again with the
RNG where it is. This leaves upstream only on those seeds: one frozen
differential case (`net-trace-4`, 5×5 wrapping) is retired from the byte-match
and asserted instead to be exactly such a board. What replaces the byte-match
there is `net-hint.test.ts`: on every preset, a generated board is hinted to
the end, every step agreeing with the solution.

## D5. Moves through the verbs

A step's moves are made by the declared verbs (`targetVerbs` in `index.ts`,
passed to `netHint`): the turn is whichever of `A`, `C` or `F` reaches the
wiring, the lock is `S`'s. A lock step whose tile must turn is one journey of
two legs. Keep-track: a turn the other way round is on track, and the step's
move becomes the rest of the turn.

This is the finding the sweep asked the hint for: a hint written against the
model needs no move of its own. It did need the verbs passed in, since the
declaration lives beside `interpretMove`; a game whose hint lives in its own
file will want the same.
