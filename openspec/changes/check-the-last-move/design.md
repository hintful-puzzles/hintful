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
- **Direct or chained** is the fact graph's answer: a fact whose parents are
  all roots rests only on what the board showed, and its firing's step is
  quoted. Otherwise the earliest firing in what it rests on that reads only
  roots is quoted, and the words say the move follows on from there.

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

The verdict, and a refusal, are the midend's `activeCheck`: words, the marks
the board paints for them (the hint's highlights), and a tone, `verdict` or
`refusal`. It is painted and sent as the displayed hint step is, and cleared
as a dead end's marks are, by the next move, a hint, undo or redo.

- Followed: "Your last move followed from the board:" and the step's
  sentence, its first letter lowered; chained, "…, and it follows on from
  there."
- Not reached: "Your last move was right, but nothing on the board forced
  {ring: it} yet."
- Refusals: the count of mistakes, or the dead end's sentence, and that
  nothing was saved.

## What the app shows

The words area under the board (`renderWords`) shows `activeCheck` where the
hint's explanation goes, styled as the hint with a "Check" lead in the place
of the hint's journey; a refusal in the warning color. The modal alert of a
refused save, and the toasts of Check without saving, go. A screen reader
hears the same words through the area's live region, and the button still
reads "Saved".
