# work-down-the-unreached-hint-rungs

**Status: scaffolded, not started (2026-10-05).** A follow-up from
`name-the-rung-a-hint-step-speaks`.

## Why

Every hinted game now pins a board for each rung its hint can speak, and a rung
no known board fires is excused in its test's `unreached`, with the reason.
Empty is the goal: an entry is a rung whose sentence, marks and move nothing
checks on a real board. Twelve entries stand in seven games. The query, which
is the list and cannot go stale as this file can:

    git grep -n -A12 "unreached: {" -- 'src/games/*/*-hint.test.ts'

They are not one kind of problem, and sorting them is the first task. As read
on 2026-10-05, each to be re-derived before it is acted on:

**A rung the game's list declares and its hint cannot speak.** The entry is
then excusing the list, not a shortfall of the scan.

- Salad `repeatFull`: `buildSteps`'s `record` drops every hole-symbol strike
  before the walk sees it. Either the plan should teach those strikes (see
  `fix-salad-number-ball-hint-throw`, which may be the same gap) or the reason
  should leave `SaladReason`.
- Salad `note` and `regionsFull`: Salad sets its notes up itself and always
  walks the populate reading, so the implicit reading's two rungs are in its
  list only because `LATIN_RUNGS` holds them and `PlanRung<Reason>` types them
  in. That is a question for the engine: whether a game on the populate
  reading alone should be able to say so and have its list and its step type
  lose those ids. Check who else is in Salad's position before building it.
- Bricks `localBreak`: argued unreachable from `validateThrees`,
  `validateGravity`, `validateCounts` and the symmetric `BRICKS_STEPS`. An
  argument from reading, not a proof. If it holds, the rung and
  `say.localBreak` go; if it does not, the board that breaks it is the pin.

**A rung that fires, on a board nobody has built.**

- Inertia `declined`: 0 of 11,992 positions. The entry says what position it
  takes (a one-slide grab `nextLeg` turns down while `unreachableGems` still
  sees every gem). Build it by hand.
- Boats `mustGrow`: 0 of 27,852 positions on 672 boards. The last Normal
  technique, and a cheaper one decides its squares first. Either a hand-built
  board, or the finding that it is shadowed on every board, which is a
  different entry from "rare".
- Loopy `related` and `closesLoop`, Tracks `looseEndsFill` and
  `wouldFinishEarly`: each agrees with a ledger its test file already kept.
  Read those ledgers first; they may already say which of the two kinds each
  is.
- Salad `forcing`: 0 of 2,914 on letters boards. The numbers boards at that
  tier were not walked, because the hint throws on one
  (`fix-salad-number-ball-hint-throw`). Rescan once that is fixed.

**A rung the pin cannot express.**

- Mines `restart`: spoken on a laid-out board with nothing open. A pin is a
  desc and the moves played on it, and a laid-out desc opens its first square.
  **And one thing to verify here, not yet checked through the midend:** a bare
  private desc (`m<hex>`, or upstream's `u<…>`, with no `x,y,` prefix) loads
  with nothing open and no start square, and `hint` there builds `restart`
  with the move `open (-1,-1)`. `name-the-rung-a-hint-step-speaks` fixed the
  save-and-load path into that state; a game ID of that form typed by hand may
  still reach it. If it does, that is a player-visible defect and comes first.

## What Changes

Each entry leaves `unreached` in the way its kind calls for: the rung leaves
the list, or a board is pinned, or the harness learns to hold the position. An
entry that stays says which kind it is and what was tried.

## Hints to pull in

None.

## What would show it worked

The query above returns fewer entries, none of them a rung its game cannot
speak, and each that remains names the board that was looked for and how.
