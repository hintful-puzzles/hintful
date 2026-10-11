# Design

Written 2026-10-11 by the session that took the change up. Every figure here
was measured that day.

## How it was carried out

- **The population came from the registry.** A throwaway test asked each of
  the 57 registered games for what its spec owes: the params string of every
  preset, the fields of its Custom dialog, a description dealt from its first
  preset, its preference keys, its rung ids, and whether it has a status bar.
  That dump was what each game's spec was checked against, item by item. It
  is not in the tree; the census files hold what was concluded from it.
- **Ten writers, then ten reviewers, a batch of five or six games each**
  (`brief.md`). A writer read each game's code, spec and help page, wrote
  `census/<game>.md` (one row for each thing the spec owes, with a verdict of
  `stated`, `gap` or `not-owed`) and the game's delta. A reviewer who had not
  seen the writer's reasoning then read both against the code, ran every
  string and sentence a scenario quotes, and corrected the files.
- **The check of task 1.1 held.** Every item of the proposal's list was found
  by a writer's own reading. The census also found a description format never
  stated in Fifteen, Sixteen and Galaxies, which the list did not have.
- **A requirement the code contradicts is corrected here too.** Five
  sentences already in the tree said something the code does not do, on a
  subject this change covers, and each is a `MODIFIED` entry: Rectangles'
  "half-grid keyboard cursor", Salad's symbol encoding, Loopy's place for a
  note step, and the clear key in pencil mode in Keen and Mathrax. The other
  four `MODIFIED` entries only gained what was missing (Solo, Twiddle,
  Undead, Loopy's preferences).
- **The one rule added to a shared capability** is `engine-params`, "A grid
  too large for a game is refused in one sentence". Twenty-two games return
  the engine's `AREA_TOO_LARGE` and no requirement stated the sentence; the
  batches had recorded it three different ways.
- **`found.md` is what the census found and this change did not act on.**

## Where it ended

By the census files, counted by a script that also checked that every
preference key, status bar and hinted game of the dump has a row:

| Kind | stated | gap | not-owed |
| --- | --- | --- | --- |
| desc | 116 | 71 | 40 |
| params | 239 | 80 | 22 |
| pref | 27 | 18 | 55 |
| control | 266 | 84 | 133 |
| hint | 307 | 160 | 80 |
| words | 22 | 36 | 83 |

- **449 gaps became 336 added requirements and 9 modified ones**, in all 57
  games' capabilities and `engine-params`. Several rows often share one
  requirement.
- **The hint is where the specs said least**: 160 of the gaps, most of them a
  technique named nowhere by what it concludes, or the order the techniques
  are tried in.
- **What the reviewers changed.** Every batch had sentences corrected against
  the code. The commonest fault was a scenario saying what a hint's first
  step is, false whenever an earlier line fires first; next, a clear or
  cancel key stated without the case where it does nothing. Reviewers added
  about twenty requirements the writers had missed and removed one that
  presented a step that never does anything as a technique.

## Requirements the code does not meet yet

A requirement written from the code finds the code's bugs. Where it did, the
requirement states the rule the help page and the rest of the spec intend,
its scenarios keep off the broken case, and `found.md` has the bug:

- `sixteen`, "Ctrl or Shift with an arrow key slides the cursor's line": from
  the last column or row the line slides the other way.
- `signpost`, "A Signpost hint asks for no link the board already holds": the
  consecutive-numbers step always does.
- `palisade`, "Palisade regions are all one size, in the hint as on the
  board": a step can state a size the board's marks do not add up to.
- `galaxies`: Enter or Space on a dot that sits on an edge starts no drag,
  against "The association drag runs from either button, the keyboard, and
  either end", which was already in the tree.
- `ascent`, "Ascent's keys click at the cursor, and the number pad types or
  moves": under "Move cursor" a diagonal key moves and also types its digit.

## Risks

- A requirement states what an agent read and not what the code does → the
  reviewer ran every quoted string and sentence, and reported what it only
  read; those few are named in the census Notes of their game.
- 336 requirements make the games' specs longer → each is one behavior under
  500 characters, and none repeats a rule a shared capability states.
