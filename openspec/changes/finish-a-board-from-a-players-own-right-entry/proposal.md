# finish-a-board-from-a-players-own-right-entry

**Status: filed 2026-10-11 by the session that archived
`check-a-wrong-entry-against-the-answer-in-every-game`, whose guard found
this with its filter turned round. What it says of the code was true that
day; re-check before relying on it.**

## Why

A hint carries on from wherever the player is. In Range it does not: one
entry the answer agrees with can leave a board the hint runs out on, and on a
tier that allows no trial and error the midend throws, which the player sees
as the crash dialog.

- Board `6x9de:4j5a9b7b11a7j12a11b9b6a4j7` (Range, 6x9 Easy, the first board
  the hook deals). From the opening position the hint finishes it in 42
  steps.
- Mark the cell in row 5, column 5 white (rows and columns from 0;
  `{"sets":[{"r":5,"c":5,"value":"white"}]}`). The answer has it white, and
  `findMistakes` reports nothing.
- Ask for hints. Fifteen are played, and the sixteenth throws: "range: the
  hint ran out of deduction at move 16, but the board's tier, Easy, does not
  allow trial and error". Row 4, column 5 does the same.

Seen through `Midend.executeHint` in a test, not yet in the browser: do that
first (task 1.1). The cause was not read. The likely shape is a rung that
reads a cell as a fact only while it is undecided, so a cell the player
decided first is a premise the plan can no longer use; that is a guess, and
the first task is to find out.

`hint-resume.test.ts` cannot see it. Its walk reaches only positions the
hint's own moves make, and this one takes an entry the hint would have made
later, or for another reason.

## How it was found

The wrong-entry guard (`src/engine/wrong-entry-check.test.ts`) plays blind
gestures on a dealt board of each game with `findMistakes`, `solve` and a
hint, and looks at the positions where the gesture's moves leave the solved
board unsolved. With that filter dropped, every position one gesture deep is
asked: `findMistakes` empty, and `hintFinishes` false. At 300 gestures a game
over 43 games, two games answered: Mines, whose opened mine is a wrong entry
it names in its own words, and Range, three times, each a right white mark.
So the sample says one game in 43, on one board each, one gesture deep.

## What the engine could do so that no game has this

- **The guard is the engine's**, and it is the one that exists with a second
  question: where a gesture's moves leave the solved board solved (a right
  entry) or the position has no mistake, the hint finishes the board. It
  shares the gestures, the dealt board and the heard moves, so it belongs in
  the same file or beside it. See it fail on Range before the fix.
- **Ask whether one gesture deep is enough.** A plan that depends on the
  order facts arrive in may need two right entries to break. Measure what a
  second gesture costs and finds before choosing.
- **Then Range's fix**, in its solver's recording pass or its hint, wherever
  the reading turns out to be.

## What Changes

- Range's hint finishes a board from any position with no mistake on it.
- The cross-game guard asks that of every game.
- `docs/games/hints.md` says what the walk in `hint-resume.test.ts` does not
  reach, and what does.
