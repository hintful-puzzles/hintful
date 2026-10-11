# open-and-check-the-boards-the-spec-census-found-mishandled

**Status: filed 2026-10-11 by the session that archived
`state-what-a-games-spec-never-did`, whose census found these. What it says
of the code was true that day; re-check before relying on it.**

## Why

Writing each game's description format and refusals as requirements found
boards that load, check or solve wrongly. The strings and sentences are in
`openspec/changes/archive/2026-10-11-state-what-a-games-spec-never-did/found.md`,
§ "A board that loads, checks or solves wrongly". Three a player can meet
without typing a game ID:

- **Mines: a board the first click finishes does not open again, and its
  save does not restore.** On `9x9n1`, which the Custom dialog allows, the
  first click wins; the game ID it then shows is refused as needing trial
  and error, and loading its save answers "Could not restore this saved
  game". `finishesByDeduction` asks the hint for a plan, and the hint
  answers a won board with no steps, reported as deduction run out.
- **Subsets: Check & Save cannot point at a wrong letter that breaks no
  rule.** The board is not saved, and no letter turns red: the player is
  told "These entries contradict each other" and not which.
  `docs/games/solver-and-generator.md` § "The solvable-game contract" has
  `findMistakes` return every player cell that contradicts the one answer,
  and Subsets holds the answer.
- **Inertia: the route solver refuses a board two slides from won**, because
  the tour must come home even from the last gem. Found on typed boards
  only; not in 41,089 positions over 120 dealt boards.

And four that need a typed or pasted ID: Mines opens a first square with a
mine beside it, and refuses one that is a mine in the wrong words; Solo
loads a killer cage with two sums; Fifteen loads the solved arrangement.

## What the engine could do so that no game has this

- **A board that is already won finishes by deduction.** Mines' hole is in
  how "can this be finished" is answered for a position with nothing left
  to do. Every untiered game answers through the same engine walk of its
  hint (`finishesByDeduction`, and the midend's load verdict); the first
  task is to ask that walk the same question in every such game, on a board
  one move from won and on one won at load, and to mend it in the engine if
  more than Mines fails.
- **A pasted board that is already solved.** Fifteen loads one; the engine
  deals such a board again (`engine-difficulty`, "A board that comes solved
  is dealt again") and says nothing of a pasted one. One rule for every
  game, in `loadDesc`, and it is a question for the owner (below).
- **`findMistakes` against the answer.** Subsets is one game today. The
  cross-game guard that would hold every game with a stored answer to it is
  worth writing only if a sweep finds a second.

## A question for the owner, moved to a change of its own

Should a game ID whose board is already solved open? It is asked, with its
recommendation, in `decide-whether-a-solved-game-id-opens`, so that this
change does not wait on it. Nothing here changes what Fifteen does.

## What the work found (2026-10-11)

- **The engine's walk already answers a won board, and Mines had a walk of
  its own.** `hintFinishes` asks whether the board is solved before it asks
  the hint; Mines' `finishesByDeduction` asked the hint first. A sweep dealt
  the first gate preset of each of the 53 games with a hint (12 of them
  untiered), played the hint to the end, and asked of the won board and the
  one a move before it: `finishesByDeduction`, `hintFinishes`, a save
  restored, and the board's game ID opened. Nothing failed with Mines mended;
  with the old Mines planted back the sweep named it. So Mines now calls
  `hintFinishes`, and `untiered-load.test.ts` asks a won board of every
  untiered game that answers with a test of its own.
- **Subsets is not the one game.** A second sweep took the 43 games with
  `findMistakes`, `solve` and a hint, made 300 random single inputs on a dealt
  board of each, and kept the 3,084 that left an entry the answer contradicts
  (the same moves played on the solved board leave it unsolved). Where
  `findMistakes` returned nothing and the hint could not then finish the
  board: Subsets before its fix (37 of 37, the instrument's known positive),
  **Bricks** (71 of 102) and **Clusters** (88 of 97), each answering Check &
  save with "These entries contradict each other". No other game. The sweep
  made no wrong entry in Ascent, Boats, Bridges, Guess or Signpost, and Mines'
  hidden answer is not asked this way, so it says nothing of those six.
  Bricks and Clusters, and the guard, are
  `check-a-wrong-entry-against-the-answer-in-every-game`.
- **Subsets' hint compared the board with the answer and kept the cell to
  itself.** That comparison is `findMistakes`' now, as a `letter` mistake for
  a slot marked or crossed out against the answer, and the hint's copy is
  gone: the midend asks `findMistakes` first.
- **The second Inertia board `found.md` gives, `7x3:mbmbmbmbbbSbbbgwbbbwg`,
  has no solution**: each gem ends a slide the ball cannot leave. Its refusal
  is right and it is the test's still-refused case. A route may end on
  several gems one slide takes, and never on a slide that runs on to a mine.
  A dead ball used to get no route only because nothing comes home to a
  mine's square; the route solver now refuses it by name
  (`solve-finishes.test.ts` caught the first cut playing a route with one).
- **No generator writes what the two parsers now refuse.** Mines:
  `mines.c:1885` lays no mine in the first square's 3×3 block and `:1512`
  perturbs none into it. Solo: `solo.c:3536` (`compute_kclues`) writes one
  sum a cage, at its first cell. Ours do the same.
- **The refused-ID dialog does not wrap a long ID**: a Solo killer ID runs
  out of the box's right edge. Filed as
  `wrap-a-long-game-id-in-the-refusal-dialog`.

## What Changes

- The engine's answer for a won board, and Mines with it.
- Subsets' `findMistakes` reads the answer for a letter marked present.
- Inertia's tour need not come home from the last gem.
- Mines' parser refuses a first square that is a mine or has one beside it,
  in a sentence of the game's own; Solo's parser refuses a cage with no sum
  or two. Each refuses only an ID no generator of ours or upstream's writes;
  check that claim against upstream's C before relying on it, and stop for
  the owner if it is false.
