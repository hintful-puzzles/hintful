# Design: check-the-last-move

## The judge is the hint's own walk, aimed at the move

A move is judged by the same walk that writes the hint, from the position
before the move, so a verdict and a hint can never disagree about what
follows from a board, and its words are the hint's words for that firing.

- **The move's facts** are the difference between the description's marks
  before and after it (`CellMarks`): a value placed, a candidate struck, an
  edge's mark struck, a cell marked. Anything else (a value taken back or
  overwritten, a note added) is not a fact a deduction makes, and a move made
  only of such is not judged.
- **The walk is aimed.** `ladderWalk` takes an `aim`: a firing that makes one
  of the move's facts not yet made. Where one is on offer the driver takes it
  before the frontier's own choice, at any tier and under the rungs'
  `fallback` and `prerequisite` rules, which keep a rung's premise sound.
  Otherwise the walk goes on as the hint's would, until one is.
- **A fact is reached** once the walked marks hold it: the value placed, or
  the candidate or mark gone (a placement of another value counts). The move
  followed once every fact is reached. The walk ends at its fixpoint; a fact
  still not reached is the one the verdict marks.
- **Direct or chained**: the walk is aimed, so a fact the board as it stood
  makes is made by the walk's first step, and that step is quoted. A fact
  reached later is chained: the earliest step the fact graph's `restsOn` goes
  back to is quoted, under a lead that says so. Where the graph cannot say, no
  step is quoted (another would be named as the chain's start without being
  in it), and the words ring the square instead. Parents were first used to
  decide "direct", but a firing whose facts all have root parents can still
  read a fact the walk made, so the walk's first step is the test.

The plan cap does not apply: the judge walks until the move is reached or
nothing follows. Measured (proposal): a fixpoint from the board as dealt
costs at most 43 ms.

## Where it is built: the builders, behind one hook

`Game.judgeMove?(before, after)` returns the verdict or `null` where the move
is not judged. A builder that walks a compiled ladder (`describedFiringHint`
first, then `describedEdgeHint`, `describedHint`, and the candidate plan)
supplies it from what its spec already holds: `walk`/`marks`, `entries`, and
the step loop, which the judge drives with an aimed walk. A game writes
nothing. A game with its own hint has no `judgeMove`, and its Check & save
says what it says today.

## What the midend shows

`check()` judges the last move after a sound verdict: the position before the
last gesture (the entries `joined` ties to it, less the marks `rulesOut`
brought) and the position now. Only where the last thing done was a move: not
after an undo, a redo, a restart or a new board.

The verdict is the midend's `activeCheck`: a hint step of rung `check`, its
words and the marks the board paints for them, and whether it followed. It is
painted and sent as a displayed hint step is (`status-bar-change` carries
`activeCheck: "followed" | "unforced"`), takes a displayed hint's place (the
plan is kept), and is cleared as a dead end's marks are, by the next
transition. `CheckVerdict` gains `judged`, so the app knows the words area
already answers.

- Followed: "Your last move followed from the board:" and the step's
  sentence, its first letter lowered; chained, "Your last move followed from
  the board in a few steps, the first of them:" and the first step's
  sentence.
- Not reached: "Your last move was right, but nothing on the board decided
  {ring: the square} yet."

Refusals and the app's other notes are not the engine's words: they are the
app's (`Puzzle.showCheckMessage`), shown in the same place until the board
next changes.

## What the app shows

The words area under the board (`renderWords`) shows the verdict where the
hint's explanation goes, styled as the hint with a "Check" lead in the place
of the hint's journey; a refusal in the warning color, as an alert. The modal
alert of a refused save, and the toasts of Check without saving, go. A screen
reader hears the same words through the area's live region, and the button
still reads "Saved".
