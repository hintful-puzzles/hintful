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

## A question for the owner, which blocks only its own task

Should a game ID whose board is already solved open? Today Fifteen opens it
finished; refusing it refuses a description upstream reads. Recommendation:
open it, as today, and state that in `ts-engine`; a solved board harms
nobody and a shared link to one is a thing a player might send.

## What Changes

- The engine's answer for a won board, and Mines with it.
- Subsets' `findMistakes` reads the answer for a letter marked present.
- Inertia's tour need not come home from the last gem.
- Mines' parser refuses a first square that is a mine or has one beside it,
  in a sentence of the game's own; Solo's parser refuses a cage with no sum
  or two. Each refuses only an ID no generator of ours or upstream's writes;
  check that claim against upstream's C before relying on it, and stop for
  the owner if it is false.
