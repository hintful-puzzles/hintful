# What’s different here

Most of these puzzles began in Simon Tatham’s Portable Puzzle Collection, and
if you know that collection you will feel at home. This app changes some things
on purpose. Here is what to expect.

::experimental|Experimental:: Items with this symbol are experimental: they
work, but they are likely to change in a future update, and might be removed.

## In every puzzle

* **[Hints explain themselves](features#hints).** Where the original’s hint
  reveals a move, this app’s tells you *why* that move is forced, so you can
  use the technique yourself next time. It can also play a puzzle out a step at
  a time, and it refuses to guess for you.

* **[Checking your work](features#checking).** Many puzzles can tell you
  whether what you’ve entered so far contradicts the answer, and will hold a
  saved position for you once it’s checked out.

* ::experimental|Experimental:: **[Checkpoints](features#checkpoints)** let
  you save several positions within a game’s undo history and return to any of
  them.

* **[Boards fit your screen](features#board-shape).** Where the original's
  sizes are wider than tall, this app's are taller than wide, for a phone held
  upright. On a wider screen, a new board that plays the same either way round
  is dealt turned to fit.

* **Links instead of command-line options.** The original’s desktop builds take
  options on the command line; here the same things go in the address. Add
  *?type=params* to a puzzle’s address to choose a variation, or *?id=id-or-seed*
  to open a specific game. The
  <command-link command="share:link">share dialog</command-link> writes these
  links for you.

## In particular puzzles

* **Dominosa, Mines, Net, Pearl, Rectangles and Same Game**: the original lets
  you switch off the check that a new board can be finished (*Ensure
  solubility*, *Ensure unique solution*, *Allow unsoluble*, and Dominosa's
  *Ambiguous* difficulty). This app has no such switch. Every board it deals
  has one solution, and outside a level named *Unreasonable*, one you can reach
  by reasoning alone. A game ID for a board that needs a guess, or that has
  several solutions, does not open here.

* **Light Up**: the difficulty the original calls *Hard* is named
  *Unreasonable* here, because those boards require trial and error by
  construction. That naming is a promise the whole collection keeps: see
  [Difficulty](features#difficulty).

* **Pattern**: there is a second difficulty, *Unreasonable*, which the
  original does not have. Its boards have one solution that no row or column
  reaches on its own, so somewhere you have to try a square. The original's
  boards are this app's *Easy* ones.

* **ABCD**: there is a difficulty, *Easy* or *Unreasonable*, which the
  original does not have. An Unreasonable board has one solution that the
  numbers do not lead to step by step, so somewhere you have to try a letter.
  The original's boards are this app's *Easy* ones, and what it calls *Hard*,
  a board with some of its numbers hidden, is named *clues hidden* here and
  can be had at either difficulty.

* **Crossing**: there is a difficulty, *Easy* or *Unreasonable*, which the
  original does not have. An Unreasonable board has one solution that no run
  on its own leads to, so somewhere you have to look across the whole list or
  try a digit. The original's boards are this app's *Easy* ones.

* **Filling**: there is a difficulty, *Easy* or *Unreasonable*, which the
  original does not have. An Unreasonable board has one solution that no
  forced square leads to, so somewhere you have to try a number. The
  original's boards are this app's *Easy* ones. A board of more than 300
  squares is not dealt: the original goes on trying to build one and, past
  about 25 by 25, never finishes.

* **Mosaic**: there is a difficulty, *Easy* or *Unreasonable*, which the
  original does not have. An Unreasonable board has one solution that no
  number on its own leads to, so somewhere you have to compare two numbers
  or try a square. The original's boards are this app's *Easy* ones. A long
  thin board is not dealt past a length that depends on its width (20 squares
  at 3 or 4 across, 100 at 10 across): the original goes on trying to build
  one and never finishes.

* **Palisade**: there is a difficulty, *Easy* or *Unreasonable*, which the
  original does not have. An Unreasonable board has one solution that no
  forced edge leads to, so somewhere you have to try an edge. The original's
  boards are this app's *Easy* ones. A board in a great many small regions, such
  as 21 by 21 in threes, is dealt in a few seconds: the original draws whole
  boards until one has a single solution, which at such a size next to none
  has.

* **Separate**: there is a difficulty, *Easy* or *Unreasonable*, which the
  original's unfinished version of the puzzle does not have. An Unreasonable
  board has one solution that no forced edge leads to, so somewhere you have
  to try joining two squares. The boards the original makes are this app's
  *Easy* ones.

* **Signpost**: there is a difficulty, *Easy* or *Unreasonable*, which the
  original does not have. An Unreasonable board has one solution that no
  forced link leads to, so somewhere you have to try a link. The original's
  boards are this app's *Easy* ones.

* **Sticks**: there is a difficulty, *Easy* or *Unreasonable*, which the
  original's unreleased version of the puzzle does not have. An Unreasonable
  board has one solution that no forced square leads to, so somewhere you
  have to try a line. The boards the original makes are this app's *Easy*
  ones.

* **Net**: there is a difficulty, *Easy* or *Unreasonable*, which the
  original does not have. An Unreasonable board has one solution that no
  forced square leads to, so somewhere you have to try a square one way.
  The boards the original makes with "Ensure unique solution" on are this
  app's *Easy* ones.

* **Range**: there is a difficulty, *Easy* or *Unreasonable*, which the
  original does not have. An Unreasonable board has one solution that no
  forced square leads to, so somewhere you have to try a square. The boards
  the original makes are this app's *Easy* ones.

* **Rectangles**: there is a difficulty, *Easy* or *Unreasonable*, which
  the original does not have. An Unreasonable board has one solution that
  no forced rectangle or line leads to, so somewhere you have to try a
  rectangle. The boards the original makes with "Ensure unique solution" on
  are this app's *Easy* ones.

Earlier changes to individual puzzles have since been accepted into the
original collection, so they are no longer differences.

The <command-link command="about:credits">credits</command-link> name everyone
whose work this collection is built on.
