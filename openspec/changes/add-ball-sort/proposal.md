# add-ball-sort

**Status: filed on the owner's word (2026-10-29)**: "I'd be interested in us
adding a test tube color sort game", without the ad and micropayment
mechanics most implementations sell.

**Written from its description** (the owner, 2026-11-01: no new game
before every game is described). Its moves and finish compile on the position runtime, step 3
of that change's plan (`design.md` § "The plan"); its pours are guarded and
cannot always be undone, which `describe-guarded-moves` states.

## Why

Tubes of equal capacity hold colored balls, with some tubes empty. A move
takes the top ball of one tube and puts it on another that has room and is
empty or shows the same color on top. The puzzle is solved when every tube
is empty or full of one color. It goes by ball sort, water sort and color
sort; the owner's screenshot shows nine tubes of four, two of them empty.

Written in the language (`2026-10-29-investigate-a-language-for-puzzle-games/
corpus.md` § "Added after the test"), its moves are not always reversible, so
it is a **planning** game with **dead ends**, as Sokoban and Pegs are. It is
in scope (`theory.md` § "Scope"): no chance in play, no adversary, no clock.

## Decided (owner, 2026-11-18), after the measurements below

- **The way out of a dead end is undo, with the hint's rewind**: no added
  tube, as button or setting. The hint and Check & save name a dead end, and
  applying the hint goes back to the last position that can still finish.
  Difficulty comes from the deal, not from a rescue.
- **A move pours**: the top run of one color, as much of it as fits.

## Decisions for the session
- **Generation**: deals that are solvable, at tiers, and the measure a tier
  rests on.
- **The hint**: a planning game's hint, a stable subgoal and the next move
  serving it (`docs/hints-search.md`), which can also say when a position is
  a dead end and what undo reaches a live one.

## Measured (2026-11-18)

Random deals of tubes of four, every state reachable from the deal
enumerated and each marked live (a finish is reachable) or dead. "Ball"
moves one ball; "pour" moves the top run, as much of it as fits. A random
player plays uniformly random moves that never revisit a position, until
solved or out of new moves; its undos are the moves back to the last live
position when it stopped. Twelve to forty deals a row, fifty players a deal.

| Board | Rule | Deals solvable | States | Dead | Random players gone dead | Undos back, median (p90) |
| --- | --- | --- | --- | --- | --- | --- |
| 5 colors, 2 empty | ball | 100% | 1,866 | 1.0% | 11% | 4 (9) |
| 5 colors, 2 empty | pour | 100% | 1,383 | 0.9% | 9% | 2 (6) |
| 7 colors, 2 empty (the screenshot) | ball | 100% | 9,109 | 3.7% | 42% | 4 (11) |
| 7 colors, 2 empty (the screenshot) | pour | 100% | 5,505 | 5.6% | 40% | 3 (7) |
| 5 colors, 1 empty | ball | 20% | 78 | 17% | 63% | 3 (6) |
| 6 colors, 1 empty | pour | 10% | 71 | 37% | 88% | 2 (5) |

- **One added empty tube revived every dead position sampled**: about 2,200
  across all rows, both rules, none failed. An added tube is a universal
  escape, so it ends the puzzle's difficulty wherever it is used.
- **A dead end is rarely visible**: in 70–85% of the dead ends the random
  players reached on two-empty boards, legal moves remained; the player can
  shuffle without knowing the board is lost. Only the hint's search, or Check
  & save, would tell them. Both exist: a hint's dead-end refusal rewinds to
  the last live position (`WAY_FORWARD.rewind`), as Pegs' and Sokoban's do.
- **The two rules behave alike**: every two-empty deal is solvable under
  both, and dead-end rates are close. Pour reaches fewer states (each pour is
  a run of ball moves) and takes fewer taps.
- **The empty tubes are the difficulty knob**: two empties make every random
  deal solvable with few traps; one empty makes most deals unsolvable and the
  solvable ones dense with traps. Generation filters deals by search, which
  is cheap: the reachable graph is under ten thousand positions.

## What Changes

A new game, with its spec, help page, hint and tiers, following
`docs/new-game.md`.

## Acceptance

The owner's, in the running app.
