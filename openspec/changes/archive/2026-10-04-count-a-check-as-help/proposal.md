# count-a-check-as-help

Filed from `play-only-boards-with-one-answer`, where the owner said of Check &
Save: *"I'm not against saying that check&save will count as help, but it should
be consistent across games"*.

## Why

Check & Save compares the player's marks with the board's answer in every game
with a mistake check, Black Box and Mines included since
`play-only-boards-with-one-answer`. So it can tell a player something the board
has not shown them: whether a guessed mark is right. A hint step marked a board
as helped, and Solve marked it solved with help; a check that caught a mistake
did neither. Nor did the Hint button when it refused with "fix the mistakes
first" or named a dead end, which told the player the same thing a check does.

## What

Decided by the owner, 2026-10-04: **only a check that found something counts**,
because help is the app doing some of the solving and finding the mistake is
the app saving the player that time. A check that finds nothing says only to
carry on, so saving a sound board stays free.

- Mistakes highlighted and a dead end named both count, since both are the app
  finding something wrong with the position.
- Check, Check & save and the Hint button count alike: the rule sits where the
  midend shows mistakes (`findMistakes`) and takes a dead end (`showDeadEnd`),
  which every route reaches.
- A check the search cannot settle, and a hint refusal that is not a dead end
  ("deduction has run out"), do not count: neither says anything about the
  player's marks.

The mark is the one the hint already set: the timed solved message reads
"Finished in M:SS, with help". The save keeps its `hinted` key, so saves players
hold load unchanged.

## Not in scope

Progression of any kind (AGENTS.md § "No progression features"): this only
changes what the existing "helped" mark on one board says.
