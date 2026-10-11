# refuse-a-same-game-board-with-no-move

**Status: answered by the owner 2026-10-11, and ready to start. Filed
2026-10-10 by the session that archived
`prove-no-solution-cheaply-in-the-games-that-search`. What it says of the code
was true that day; re-check before relying on it. It has no `tasks.md` yet:
the session that takes it up writes one.**

## The owner's answer (2026-10-11)

**Refuse the board, if there really is nothing that can be done on it.** The
compatibility break is accepted on that condition, so the session that takes
this up first confirms the condition in the code and the running app: that on
such a board no input makes a move at all, in every ruleset the params allow.
A board on which something can still be done keeps loading.

## Why

Same Game opens a board on which no two tiles of a color touch. Nothing can be
removed, the status bar says "Cannot move! Score: 0" at move 0, and there is
nothing to undo. Opened in the running app, 2026-10-10:
`/samegame?id=5x5c3s2:1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1`.

The proof is one pass over the board, `check(...).impossible`, which the game
already computes for its status bar. `hasNoSolution` could say it in a line.

## The question

**Refusing such a board refuses a description upstream's generator can
write**, which is a compatibility break and so the owner's call.

- Upstream's legacy generator (`gen_grid_random` in `samegame.c`, chosen by
  turning "Ensure solubility" off) scatters colors at random after placing two
  of each. Nothing stops it dealing a board with no move.
- How often, reckoned and not measured: on 5x5 with three colors each of the
  forty touching pairs must differ, which at two chances in three apiece is
  around one board in ten million. It is likelier the smaller the board: a
  2x3 with three colors is two of each in six squares.
- This app never deals one. Its only generator is upstream's soluble one, and
  its params codec does not read the `r` that asks for the other
  (`samegame/state.ts`).
- What a player holding such an ID loses: a board they could make no move on.

`prove-no-solution-cheaply-in-the-games-that-search` took the half that breaks
nothing: a tile that is the only one of its color, which neither upstream
generator deals. `samegame.test.ts` pins the board with no move as one that
loads.

**Recommendation: refuse it.** The board cannot be played at all, so the
refusal's sentence is more use to the player than the board.

## What Changes

- If yes: `hasNoSolution` also holds where `check(...).impossible` does on a
  board with tiles left, the pinned board in `samegame.test.ts` flips, and the
  comment on `hasNoSolution` loses its last sentence.
- If no: delete this change.

## Capabilities

### Modified Capabilities

- `samegame`: one scenario, if yes.
