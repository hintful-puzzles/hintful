# Requirements that are reworded, and not only moved

Written 2026-10-09. `moves.md` moves a requirement with its words. These are
the ones a move could not carry as written: one rule that two games each
stated for themselves becomes one requirement of the capability they share.

Each entry is a heading, `cut`, `reword`, `edit` or `add`, then the capability
and the requirement's title; a line of reason; and for `reword` and `add` the
requirement as it will stand. An `edit` is a requirement that keeps its words
but for the run after `from:`, which becomes the run after `to:`; it is how a
reference to a moved requirement is repointed where the reference is not in
the form `` `capability`, "title" ``, which is repointed without an entry.

## edit `engine-hints`: A game narrates every deduction or rejects the board at generation

The policy it names moved to `engine-difficulty`.

from: (the `ts-migration` narratable-deduction
to: (the `engine-difficulty` narratable-deduction

## edit `app-shell`: A refused Solve is shown in the help banner

The requirement moved from `ts-engine`, and the one it quotes did not.

from: the collection's ("Solve failures are worded once for the whole collection").
to: the collection's (`ts-engine`, "Solve failures are worded once for the whole collection").

## edit `engine-hints`: The hint-resume walk excuses the games that can say a search ran out

It moved from `build-pipeline`, where the population it is separate from was
the requirement before it; that one is now `testing`'s.

from: separate population, `SEARCH_REACH_GAMES`:
to: population apart from a sweep's cost exemption (`testing`), `SEARCH_REACH_GAMES`:

## edit `engine-candidate-hints`: The candidate walk stamps the steps it builds

It moved from `engine-hints`, where the list it speaks of is defined ("A hint
step SHALL name the rung it speaks").

from: write its list and no stamp.
to: write its `hintRungs` list and no stamp.

## reword `app-shell`: The catalog labels a draft, and the help gives a section's reason

The title's second half named the rule of the requirement after it, which is
now `help-pages`, "A help page lists what is not in the game, with the game's
reason". The words are unchanged.

### Requirement: The catalog labels a draft

The home screen SHALL label each draft game's row "Draft", beside its name, and
the label SHALL say which features are still to come, by the names a player
knows them by. A draft SHALL stay listed and playable: the label says the game
is not yet complete and hides nothing. Which games are drafts SHALL be
computed from the registered games when the app is built, and SHALL NOT be a
field of the committed catalog.

#### Scenario: A hintless game is labeled

- **WHEN** the home screen lists a game that has no hint
- **THEN** its row carries a "Draft" label saying that Hints are still to come

#### Scenario: A complete game is not labeled

- **WHEN** the home screen lists Palisade
- **THEN** its row carries no draft label

#### Scenario: A draft gains its missing section

- **WHEN** a draft game implements the last section it lacked and the app is
  built
- **THEN** its row carries no draft label, and the committed catalog is
  unchanged

## add `app-shell`

Restored as the pruning found it. It was cut as a duplicate of two
requirements that cover the readout row and the Bar, and neither covers the
Game controls under the board in a tall phone window
(`verdicts/app-shell.md`, the first note).

### Requirement: The chrome does not overflow at a phone width

The puzzle screen's chrome SHALL lay out without horizontal overflow at 390 CSS
pixels.

#### Scenario: A narrow viewport

- **WHEN** the puzzle screen renders at 390 CSS pixels wide
- **THEN** no chrome element overlaps another, and no control's label is
  truncated to fewer characters than it needs

## cut `palisade`: Palisade shares its border-marking mechanic rather than owning a copy

duplicate: Separate stated the same rule of the same modules. Both are now
`border-grid`, "A border-grid game takes the mechanic from the engine and owns
no copy", which keeps this requirement's scenario.

## cut `separate`: Separate shares its border-marking mechanic rather than owning a copy

duplicate: Palisade stated the same rule of the same modules. Both are now
`border-grid`, "A border-grid game takes the mechanic from the engine and owns
no copy", which keeps this requirement's two scenarios.

## add `border-grid`

Merged from the two requirements cut above, with Separate's parenthesis on the
live error model, which is the shared module's for both games.

### Requirement: A border-grid game takes the mechanic from the engine and owns no copy

A game that marks a grid's edges SHALL take the mechanic from the shared
engine modules and own no copy: the edge bits and
direction tables, the nearest-edge hit test,
the three-state toggle, the paired edit of an edge's two cells, the half-cell
cursor, and its look: the geometry, the edge rects, the tile skeleton and the
live error model (a region over or under size, a wall separating nothing). A
change to what counts as a wrong wall SHALL take effect in every such game at
once.

#### Scenario: A fix to the shared mechanic reaches both games

- **WHEN** a defect is found in the edge hit test, the three-state toggle or
  the test for a wall that separates nothing
- **THEN** it is fixed once in the shared module
- **AND** both Palisade and Separate receive the fix, rather than one game
  silently retaining the defect

#### Scenario: Both games' edits come from the shared module

- **WHEN** a click and a cursor key address the same interior edge in Separate
- **THEN** both produce the paired edits the shared module computes for that
  edge

#### Scenario: The error model is the shared module's

- **WHEN** the player's no-wall marks join more than `k` cells in Separate
- **THEN** the edges between that region and its neighbors are drawn in the
  error color by the shared module's test, not by one of Separate's own

## add `border-grid`

The sentence about the shared renderer that each game's "clue layer stays its
own" requirement ended with, stated once.

### Requirement: The shared renderer does not know which game is drawing

The shared border-grid renderer SHALL take a game's palette indices and a
callback for the middle of a tile, and SHALL NOT branch on which game is
drawing.

#### Scenario: The middle of a tile is the game's callback

- **WHEN** the shared renderer draws a tile of Palisade or of Separate
- **THEN** the clue digit or the letter in the middle of the tile is drawn by
  that game's callback
- **AND** no branch of the renderer names either game

## reword `palisade`: Palisade's clue layer stays its own

The sentence about the shared renderer is now `border-grid`, "The shared
renderer does not know which game is drawing".

### Requirement: Palisade's clue layer stays its own

Palisade's clue semantics (each cell's count of adjacent walls), its solver,
its generator, its difficulty grading and its clue rendering SHALL remain
entirely its own: the digit, the clue-satisfaction test that decides when a
region is finished, and the explained hint's sentences.

#### Scenario: The explained hint survives the shared renderer

- **WHEN** a hint step is displayed
- **THEN** the edges it forces paint in the hint color, over their normal
  three-valued states
- **AND** the cells it references are marked inside the cell body
- **AND** its narration is Palisade's own

## reword `separate`: Separate's clue layer stays its own

The sentence about the shared renderer is now `border-grid`, "The shared
renderer does not know which game is drawing".

### Requirement: Separate's clue layer stays its own

Separate's region constraints (required region sizes and the cells that must
be kept apart), its solver, its generator and its clue rendering SHALL remain
entirely its own: the letter, the repeated-letter error inside a completed
region, and the test that decides when a region is finished.

#### Scenario: A repeated letter in a completed region is Separate's error

- **WHEN** a wall-bounded region of exactly `k` cells holds one letter twice
- **THEN** Separate's own tile callback draws both of those letters in the
  error color
