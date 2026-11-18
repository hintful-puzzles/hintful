# Design: add-wordtrail

Findings of 2026-11-18, made in `add-word-list-puzzles` and carried here
when Wordtrail was split from it.

## Wend's rules, confirmed

From LinkedIn's own game (linkedin.com/games/wend, puzzle No. 163, played in
Chrome on 2026-11-18). Its "How to play" reads, in full: "Find the 4 hidden
words — 3, 4, 5, and 6 letters long. Use every letter tile exactly once."
What the board showed beyond that:

- A rectangle of letter tiles with some squares blocked (gray, no letter).
  The day's board was 5×5 with 7 blocked squares and 18 letters.
- **Steps are orthogonal**: a drag from a letter straight to its diagonal
  neighbor is refused (the word stays one letter long). A tile already in a
  word cannot be entered by another.
- The lengths are listed, not the words; the lengths sum to the letters.
- A word that matches the hidden answer is ticked at once.

So a board is a division of the open squares into paths of orthogonally
adjacent letters, each spelling a word, with the word lengths given.

## What it inherits

Stated in `candidates/wordtrail.description.yaml` and reported on by
`research/technique-check/inherit.ts`
(`research/technique-check/results-inherit-wordpaths.txt`, run under the
earlier id `wordpaths`). Family `regions`, on Palisade's wall model: each
word a path (no square with three joins, n − 1 joins for n squares), the
lengths a board clue. Sound: Palisade's `noDanglingEdges` and `inside`,
Separate's `walledApart`; unsound: Dominosa's `squareOnly` and `parity`,
Separate's `sharedLetter`; the rest read clue kinds or sizes it does not
have. **No inherited technique reads the lengths or the letters**: its
ladder is its own (a letter with one way to continue, a pocket of open
squares no listed length fits, a word that fits one place only).

The description cannot state "is a word of the list": the language has no
table, and the corpus ruling counts a word list as a library table. A
technique sound without the list stays sound with it, since the list only
removes answers.

## Kind

**An edges game**: the player joins letters into words, as Palisade's border
model divides squares, so it starts from the `edges` skeleton, with Separate
on Palisade's wall model as the exemplar. Blocked squares are part of the
board.

## What Wordguess taught that applies here

- A planner's step may strike notes it rules out (`marks: { strike: [...] }`,
  `docs/descriptions.md`), and a word is said as a term of kind `word`.
- The game worker carries the list (3.58 MB) and is precached; nothing more
  is owed for offline play.
