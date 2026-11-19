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

**Superseded in the build (2026-11-19).** Wend lets a word run beside
itself: a U through a two-by-two block joins three of its four pairs, and
nothing in the rules forbids it. A division into words is therefore not a
division into regions walled apart, and Palisade's and Separate's techniques,
which take two squares side by side in one region as joined, are unsound
here. Wordtrail's ladder is its own, with nothing inherited.

## The ladder as built

The word list reaches the description as a dealt board clue, `trail`: every
path of the letters that spells a word of a listed length, each with a
`pos` field giving each square's place on it (Crossing binds its sets of
clues the same way). The clue's `means` states that a trail is a path, which
the checker cannot otherwise know; without it `onlyLength` was unsound on a
dealt set no path could be. Three techniques, each checked sound and each
caught on a planted defect:

- **oneWay** (Easy): a letter with no line and one edge left lays it.
- **onlyWord** (Easy): the trails still fitting through a letter agree on
  an edge. A line where all run along it; a cross only where every one holds
  the letter, none runs along the edge, and the letter is not yet filled, so
  a cross is laid only where it tells the player something.
- **onlyLength** (Normal): where the trails still fitting a length are as
  many as its listed words, they are all of them.

The pocket rung (a run of open letters no listed length fits) was measured
on 5×5 boards: onlyWord and onlyLength finish about 94% of unique boards,
and the pocket adds a few points more. It is not built: the generator deals
at the tier the ladder reaches, so a board it would have opened is dealt
again, and a player loses nothing.

Two tiers, Easy and Normal, as the ladder has two kinds of reasoning. The
generator writes answer-list words along random paths and keeps a board the
capped ladder finishes, so its one division is unique against the whole
guess list; a deal takes a few milliseconds at every preset.

## Decisions made in the build

- **A piece of lines that spells any common word is colored, and written
  into the list.** Wend ticks only the hidden answer's words. Here a board
  has one division against the common words, so a word that is not the
  answer's is shown for what the lines spell, and the player finds it out
  when it leaves letters no word can take.
- **Wordtrail judges by the common words, not the guesses** (owner,
  2026-11-19, after REE came up in play). The guesses are what Wordguess
  accepts typed, SCOWL size 80, and a board or hint showing one read as
  obscure. The common words are SCOWL size 40, the answers' size, with
  plurals and other forms, and without abbreviations, numerals, regional,
  informal or offensive words (`scripts/word-list.ts`). A smaller list makes
  a division unique more often, so Easy finishes more draws and Normal deals
  in more tries: at most 177 at 4×4 Normal (was 50) and 1405 at 3×3 Normal
  (was 328), 24 seeds a cell, every cell under 100 ms. An old board still
  loads and still has one answer, as fewer words can make no second one.
  BITCHY, found named in a hint, and the words like it are out of the
  answers and the common words (`word-list-exclude.txt`).
- **No alias.** The catalog's aliases hold no trademarks of the word games
  (Wordguess has none); the All-the-puzzles page names Wend under related
  puzzles, as it names Wordle.
- **Sides two to eight**, the range the generation tests deal at both
  tiers; a larger grid is left until a player asks for one.
- **Input is the engine's line drag, with no override.** Wend's drag starts
  a new word; here a drag carries a line, so one from the middle of a word
  extends it and one retracing its end takes it back, as in Path and Pearl.

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
