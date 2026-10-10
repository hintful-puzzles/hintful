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

Earlier changes to individual puzzles have since been accepted into the
original collection, so they are no longer differences.

The <command-link command="about:credits">credits</command-link> name everyone
whose work this collection is built on.
