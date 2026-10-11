# decide-whether-a-solved-game-id-opens

**Status: answered by the owner 2026-10-11: it opens, as it does today.**
Filed the same day, moved out of
`open-and-check-the-boards-the-spec-census-found-mishandled` so that change
did not wait on it.

## Why

**Should a game ID whose board is already solved open?** The engine deals such
a board again (`engine-difficulty`, "A board that comes solved is dealt
again"), and no requirement said what a pasted one does.

The owner's answer: it opens, and the player sees the finished board as one
they had just solved, to restart it or move on to another.

## What the work found (2026-10-11)

- **The specs had already assumed the answer.** `ts-engine`, "A game's status
  is judged from the board alone" and "A board's status follows the board on
  display", both say a board typed in already solved is solved at move 0
  (`derive-completion-from-the-position`, 2026-10-01), which is only true of a
  board that opens. What was missing was the requirement that it does.
- **Refusing would be a compatibility break in the strict sense: generators
  write these boards.** Asked directly, over 300 seeds each, Rectangles at
  `3x3` wrote 28 solved boards (`3x3:h9` is one) and Netslide at `3x3m1`
  wrote 26. Those generators are ports of upstream's, so upstream hands out
  the same IDs.
- **In the running app** (Chrome), `/fifteen?id=3x3:1,2,3,4,5,6,7,8,0` opens
  the sorted board, the status bar reads "COMPLETED! Moves: 0", Hint and both
  solve commands are disabled, and the end notification offers New game,
  Share, Change type and Other puzzles. Mines dealt at `9x9n1` is won by its
  first click.
- **The notification's heading praises a board nobody played**: "Awesome!
  Solved in 0:00" with the timer on. It is what a reopened finished board
  shows too, since the notification follows the status and has no record of
  who solved the board. Left as it is: the owner asked for the same state as
  a board just solved, and the case is reached only by typing such an ID.
- **A typed solved board has no history**, so Start over has nothing to undo
  there; a saved solved game keeps its moves.

## What Changes

- `ts-engine` gains "A game ID whose board is already solved opens".
- `desc-error-games.test.ts` holds it: five typed IDs in games whose
  description is the position (Fifteen, Sixteen, Twiddle, Flip, Flood), and
  every solved board the Rectangles and Netslide generators write at the
  params above. Seen to fail, all seven cases, against a refusal planted in
  `loadDesc`.
- `loadDesc`'s comment and `docs/games/solver-and-generator.md` say the rule
  is dealing's alone.

No code that runs changes, so nothing a player sees does.
