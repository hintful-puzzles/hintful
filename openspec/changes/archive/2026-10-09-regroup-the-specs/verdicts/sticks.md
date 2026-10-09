# Verdicts: sticks

## keep `sticks`: The Sticks generator keeps only what the solver completes

No shared requirement states that a seed deals one board (read: `dealing`,
`engine-params`, `ts-engine`, `ts-migration`, `app-shell`). That the app hands
out boards and never seeds does not retire it: `app-shell` "A seed ID still
deals a game" and every fixed-seed test need a generator that is a function of
its seed. The sentence stays here until a shared one exists; `verdicts/spokes.md`
carries the note.

## keep `sticks`: Uniqueness is established by a witness independent of the solver

This is the reason for a guard, which stays, and no guide is its home: neither
`docs/test-strength.md` nor `docs/games/testing.md` says that a solver's
"complete" is no evidence of uniqueness, or that the witness must be shown able
to report two. It also binds more than the test: Sticks has one tier and no
difficulty contract, so this witness is the only thing that checks the
promise of "Every generated Sticks board has one solution, reached without
guessing". Where a test-method rule lives is a question of form, and it is
answered: this one is about one game's promise and stays with the game.

## reword `sticks`: A Sticks hint names the clue a tentative line would break, and how

The last sentence, that the failing clause is recorded where the contradiction
is detected and not re-derived at narration, goes as `how`. What it protects is
kept in the spec by "The Sticks hint shows its evidence, and the marks count
out against the words" ("that run or span SHALL be the one the deduction
actually walked"), and the way it is built is said at the site: the comment on
`SticksReason` in `src/games/sticks/solver.ts` ("recorded at the point
`sticksValidate` detects it ... written inside the oracle rather than
re-derived from its verdict"), which cites `docs/games/hints.md` § "Read the
reason off the validator". The rule about the hint's words is untouched.

### Requirement: A Sticks hint names the clue a tentative line would break, and how

A step's explanation SHALL name **which clue** the tentative line would break
and **how** it would break it, distinguishing at least: a line exceeding its
number, a line that could no longer reach its number, a line covering two
numbers, a block's clue gaining more lines than it counts, and a block's clue
losing a side it still needed.

#### Scenario: A forced line is explained by the clue it would break

- **WHEN** a hint is requested on a board where one orientation of a square
  would violate a clue
- **THEN** the step names that clue and the way the tentative line breaks it,
  and concludes that the square must take the other orientation

## keep `sticks`: One clue ruling out several Sticks squares is one journey

It is a Sticks decision and not the shared rule restated. `engine-hints` "One
deduction firing is one journey" leaves each game to say what one firing is,
and gives later legs abbreviated narration; this says a firing is one clue and
one rule, and that each later leg keeps its own square's specifics, because one
clue can pen different squares into different amounts of room
(`docs/games/hints.md`, the paragraph beginning "Whether several forced squares
are one step or a journey of legs", and the comment on the firing function in
`src/games/sticks/solver.ts`).

## keep `sticks`: A Sticks hint concludes in the necessity voice and names a clue by its number

Kept whole. `engine-hints` "The necessity-voice rule applies to every hinting
game not ledgered as narrating moves" says how a guard finds its games, and
Sticks is not on its ledger, but this requirement is the hint's own words
("this 2 must be vertical"): the conclusion names the clue by its number and
says what it must be, in one sentence that one scenario holds. Trimming the
necessity half would leave a wording rule with no conclusion to apply it to.

## note The cut of "Sticks hint recording is confined to the hint path" holds

The reviewer's question was whether anything but its own test relies on
generation being the same with the recorder present. Nothing does, and it
cannot differ: the hint's deduction is a parallel function and not a recorder
threaded through `sticksTry` (the comment on it in
`src/games/sticks/solver.ts` says "the generator's deduction is then untouched
by construction"), and `sticksValidate` records a reason only when it is
handed somewhere to put one. The frozen differential fixtures would fail on a
generator that moved. The requirement is not in the regrouped spec, so there is
no verdict to give it.

## note Sticks loads a board its solver cannot finish

`engine-params` "A board loads only if the game's own solver solves it" is not
true of Sticks as the code stands. See the note in `verdicts/signpost.md`: the
same reading of `src/engine/desc-error.ts` applies, since Sticks declares
neither a difficulty contract nor `finishesByDeduction`.
