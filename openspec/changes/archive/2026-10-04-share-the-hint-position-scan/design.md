# Design: the shared hint-position scan

## D1. The population is about six times the proposal's

The proposal named seven games. Read by shape (a loop over seeds near a hint
call, in any test file) on 2026-10-04, the population was about 45 scans that
run on every test run, across about 30 games, and nine groups of pins whose
scan had been deleted. The reading was a sweep by a subagent whose hits were
then spot-read, so take it again before leaning on a figure:
`move-the-hint-scans-onto-the-harness` carries the list and does that.

## D2. What the scans repeat, and what the harness takes

Most scans are one shape: deal a board from a fixed seed, ask `hint()`, test
a predicate on the step it opens with, apply that step, ask again. That is
`scanHintPositions`, and it is the walk `hint-resume.test.ts` makes, so a
position it reports is one a player following hints reaches.

- **A kind is a regex or a predicate.** A regex over the opening sentence is
  the commonest predicate (Sokoban, Pegs, Rect, Map, most `hintUntil` scans).
  A predicate takes the step and the board, for kinds read off marks,
  highlights or the move (Light Up's several-squares step).
- **A position is an input.** `params:desc`, with the moves played where the
  board mid-game is not a desc. A game that can write its board as a desc
  passes `descOf` and pins bare strings (Flip, Sokoban).
- **One pin a kind, by the types.** `pins` is a record over the kinds, so a
  kind without a pin does not compile, and the one declared test checks every
  pin still opens with its kind.
- **The scan is a mode of the test file**, `HINT_SCAN=1`, which fails with
  the pins to paste and the count under each. The failing pin's message is
  that command. A separate script would be a second thing to find.
- **The count is copied beside the pin**, as a figure a scan measured on a
  date. Nothing re-checks it on a normal run, by design: re-checking it is
  the scan.

## D3. What the scans differ in for a reason, left out until a caller asks

- **Play off the hint's line.** Pegs' trap and lost positions were found with
  random play mixed in, because hint-guided play keeps to winning lines.
- **A refusal as the kind** (Pegs' lost board, Sokoban's hand-built ones).
- **A solver firing as the kind**, where no step says it (Clusters, Boats,
  Spokes, Crossing, Sticks, Rect's `nextFiring`).
- **Moves before the first hint** (the candidate games' mark-all, Mines'
  opening click), and a `Ui` that is not the default (Group's reading).
- **A rendered frame.** `pinned(kind)` returns the `id` and `moves` a
  `renderScenario` takes, so the frame is the caller's one line.

## D4. The assessment the proposal asked for

*"If Flip's test is no shorter or no clearer for it, the harness is not worth
having."*

- **Flip**: four kinds, four pins, no scan in the file. The scan took 37 ms
  and reported 231, 123, 43 and 97 of 494 positions.
- **Sokoban**: its eleven pins were found again by one command in 12 seconds
  (937 positions on 40 boards). The change before this one wrote that scan
  from the test's regexes and deleted it. The rarest kinds are `trapDead`
  (5), `onlyThese` (6) and `fillFirst` (8), which nothing had recorded. The
  pins themselves were kept, since other tests in the file read properties of
  those boards; each now carries its count.
- **Light Up**: `multiCellStep`, which walked up to four boards on every run,
  is one pin (42 of 112).

A planted wrong pin failed with the command. So it stays.
