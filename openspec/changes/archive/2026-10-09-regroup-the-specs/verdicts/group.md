# Verdicts: group

## keep `group`: A diagonal drag fills a whole diagonal at once

"Filling a cell SHALL be idempotent" is a decision and not a test's concern: an entry sets and never toggles, which is what lets a multifill cross cells of the diagonal that already hold the element. `interpretMove` in `src/games/group/index.ts` returns a `set` move for a letter the cell holds, where `engine-notes` "The engine owns what a press and an entry do to the highlight" has other games make no move, so this is Group's departure and it is stated only here.

## keep `group`: Group draws its legend, marks and errors

The picture of one selected cell is `engine-notes` "The note-taking cell's highlight has one picture, drawn by the engine", and the flash is the declared `solvedFlash` with `engine-colors` "The solved flash is one role". But Group's selection can be a run of cells along a diagonal, which no shared requirement draws, so "highlight the selection" is not a restatement and the sentence stays whole.

## reword `group`: Group's solver has five tiers and no technique beyond them

port: the three techniques it forbids are the TODO list at the head of upstream's `unfinished/group.c`, and the port's own design recorded them as "a future strengthening change, not a port gap". Nothing was turned down, and upstream is not tracked, so the prohibition binds nothing and would stop a session adding a technique a hint could teach. What stays is the validator and the promise the scenario made, now in the body: `generator.ts` rejects a board the tier below solves.

### Requirement: Group's solver accepts only an associative grid and grades a board at its tier

The solver SHALL accept a completed grid only if it is associative. A board
dealt at a difficulty SHALL be solvable at that tier and not at the tier below.

#### Scenario: The solver grades a board at the intended difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** it is solvable at that difficulty and not at the tier below

## keep `group`: A Group description is validated against the grid area

`engine-params` "A description error kind says what went wrong for the player" fixes the words of each kind for every game (Group fails with `DESC_TOO_LONG` and the reader's kinds). Which conditions a Group description is refused for is part of its format, and stays.

## keep `group`: Group's own placements lead the eliminations

`engine-candidate-hints` "The walk owns the ladder" gives the frame. Where Group's associativity placement and identity fill come in it, and that Group starts on the implicit reading, are a hint's order and the game's own.

## keep `group`: Group's hint deduces from the placed entries, never the notes

No requirement of `engine-candidate-hints` or `engine-hints` says a recording solve is seeded from the placed entries alone (searched for "seeded", "placed entries" and "player's notes"). A shared capability is not added to from here, so Group keeps it.

## note The recording-gate rule now agrees across the candidate games

Group's "Recording leaves the solver's verdicts alone" was cut against `engine-hints` "The solver and the hint are two projections of one deduction engine", and Solo's "Recording leaves the solve path unchanged" is cut in this pass on the same ground. Mathrax keeps "Recording does not change what the Mathrax solver commits" because it states an invariant of its own.

## note Group's params encoding has no requirement

`encodeParams` in `src/games/group/state.ts` is hand-written, and the `group` spec does not state it. The snapshot of `engine-params` "The recorded params encodings do not move" holds its strings, but a snapshot does not say what was meant. A change should add to `group`: "Params SHALL be encoded as the grid size, then `d` and a difficulty letter when full (`t`, `n`, `h`, `x` or `u` for Easy, Normal, Tricky, Hard and Unreasonable), then `i` when the identity is hidden. Decoding SHALL skip a character it does not know." with a scenario that `{ w: 8, diff: Tricky, id: false }` encodes in full as `8dhi` and without as `8i`.

## note No shared requirement says a candidate hint's solve reads the placed entries only

Group, Solo, Keen, Towers, Unequal and Mathrax each state that the hint's deduction is seeded from the placed entries and never from the player's notes, in the same words. It is a rule of every game on the candidate walk and belongs in `engine-candidate-hints`.

## note The entries' other requirements were already cut

"A Group hint is refused on a solved or mistaken board", "Every hint step is monotone progress" and "A stored Group plan follows the player's moves" are not in the regrouped `group` spec; `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game" and `engine-candidate-hints` "The shared track and refresh read a game's move dialect" still stand.
