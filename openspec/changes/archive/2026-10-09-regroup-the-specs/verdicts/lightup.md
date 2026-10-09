# Verdicts: lightup

## keep `lightup`: Light Up's keyboard cursor

What a control does stays in the game's spec, restated or not: a session changing Light Up's keys reads this and not the four `engine-input` requirements it would otherwise have to assemble. The `I` key (`letterKey("I")` on the secondary verb in `src/games/lightup/index.ts`) and the cursor hiding on completion (`changedState`) are the game's own, and the sentence about the rejection rules ties the keys to the clicks.

## keep `lightup`: Light Up hint rendering follows the element-type legend

A hint's marks stay. `engine-hints`, "A hint marks beside the content, never behind it", gives the ring; that a bulb target and a mark target look the same, with the narration saying which, and that no bulb or cross is previewed, are Light Up's decisions about its own two actions.

## keep `lightup`: The generator adds walls when no board turns up

The ramp is told to the player in the Custom dialog (the `blackpc` field's `doc` in `src/games/lightup/index.ts`: "the generator adds more, 5% at a time, up to 90%, and then starts again"), and the count of 20 is what "no board turns up" means there (`MAX_GRIDGEN_TRIES` in `generator.ts`). Without the count the requirement says when nothing.

## keep `lightup`: Unreasonable adds depth-capped recursion

The cap is part of what the tier means and not only the solver's: a branch past depth 5 makes the verdict "unknown", so the cap decides which boards count as having one answer, and with that which boards the generator deals and `findMistakes` will check (`MAXRECURSE` in `src/games/lightup/solver.ts`).

## keep `lightup`: Light Up generates solver-gated boards

No shared requirement says a generator draws on nothing but its seed. `testing`, "The test suite is deterministic under parallel load", asks it of tests, and `random` holds the stream and not what a generator does with it. That the app hands out boards and not seeds means the board a seed deals may change between builds, and does not mean one build may deal two boards for one seed: the frozen differentials and every seeded test rest on it. The sentence and its scenario stay.

## reword `lightup`: Light Up accepts pointer and cursor input

The entry found the drag in no requirement. `targetVerbs.sweep` in `src/games/lightup/index.ts` limits the drag to the secondary button, for the reason its comment gives, and that limit is the game's decision; what a drag does once declared is `engine-input`, "A drag on from a press repeats the press". The sentence is added, and the two click sentences are joined to make room, with no rule changed.

### Requirement: Light Up accepts pointer and cursor input

A left-click SHALL toggle a bulb on an open square that carries no mark, and a
right-click the impossible-mark on an open square that carries no bulb. A
click on a wall or outside the grid SHALL be a no-op. A left-click on a marked
square, and a right-click on a bulb, SHALL be rejected without a history
entry. A right-drag SHALL repeat the right-click on the squares it passes that held
what the pressed square held, and a left-drag SHALL repeat nothing, because a
row of bulbs light each other.

#### Scenario: Left-click places and toggles a bulb

- **WHEN** the player left-clicks an empty open square, then left-clicks it
  again
- **THEN** a bulb appears (lighting its row and column to the nearest walls)
  and then disappears

#### Scenario: Marks block bulbs

- **WHEN** the player left-clicks a square carrying an impossible-mark
- **THEN** no move is produced and no history entry is created

#### Scenario: A right-drag crosses a row

- **WHEN** the player right-drags across three empty open squares
- **THEN** all three carry the impossible-mark
- **AND WHEN** the player left-drags across three empty open squares
- **THEN** only the first holds a bulb

## note lightup: the hint legend row in the guide and two source comments are stale

The Light Up row of the legend table in `docs/games/hints.md` (the table of each game's target and evidence marks) says the target takes a "blue `COL_HINT` fill" and that the driving clue's "digit recolors `COL_HINT`". The spec and the code say otherwise: `src/games/lightup/render.ts` rings the target and rings the clue's wall in `COL_HINT_CLUE` with the digit left white. The comments on `COL_HINT` and `DF_HINT_TARGET` in the same file still say "blue fill". The guide row and the two comments want correcting to a ring.

## note lightup: the two misfiled requirements are settled

"A Light Up hint is refused on a solved board and on a wrong one" and "Light Up's tile cache keys on one packed word" were cut by the pruning and both cuts are right. The first is `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game", which forbids a game to write either refusal. The second is which field caches what; the rule is `engine-drawing`, "A warm frame matches a fresh paint of the same state", and `docs/games/rendering.md` § "Overlay sidecars", and "Light Up ships findMistakes" still requires the overlay to repaint on the frame it is computed.

## note lightup: seed reproducibility has no shared home

Light Up and Tents each state that `newDesc` gives the same board for the same seed, and so do other games. It is true of every generator and is what the frozen differentials need, and no shared capability says it once. `dealing` or `engine-difficulty` could state it for the collection, after which the games' sentences would be `collection` cuts.
