# Verdicts: clusters

## reword `clusters`: Clusters refuses to generate Normal on a board too small for it

Added the bound, which the requirement left as "too small": fewer than 12 squares, or a shorter side of less than two (`Math.min(p.w, p.h) < 2`, either way round). It is what `validateParams` in `src/games/clusters/state.ts` refuses behind `full`, in a sentence the player reads, and Magnets and Bricks state theirs. The half about `full` stays, because it is this game's case of `engine-params` "A generation-only bound is gated on full" and says why a small board still loads.

### Requirement: Clusters refuses to generate Normal on a board too small for it

Clusters SHALL refuse to generate at Normal on a board of fewer than 12
squares, or one whose shorter side is less than two, which is too small to
admit one. It SHALL
report this through parameter validation with `full` set, so that a saved game
or a game ID carrying its own description still loads at any size.

#### Scenario: A board too small for the harder tier refuses it

- **WHEN** a full, generation-capable parameter set requests the harder tier on a
  board admitting no such puzzle
- **THEN** parameter validation rejects it, naming the constraint
- **AND** the same parameters are accepted when a description is supplied instead

## keep `clusters`: Clusters is painted by click, drag and keyboard cursor

Every sentence of it is what a control does. The doubt is about what it leaves out, which is in the note below.

## keep `clusters`: A Clusters hint is refused where it cannot deduce

The words of the banner are the engine's (`engine-hints` "The refusals distinguish the situations a player must tell apart"), but when to say them is the game's: Clusters' `findMistakes` sees only a broken rule, so its `hint` re-solves and refuses a doomed board itself (`docs/games/hints.md` § "Refusal wording comes from one module" names it among the games that do). The last sentence, that a wrong tile on a dealt board always ends in that contradiction and never in a stall, is a fact about this puzzle and is stated nowhere else.

## note The three cuts the pruning was least sure of stand

"A completed candidate that is rejected is perturbed" (`how`): the reason and the measurement are in the comment at the retry loop in `src/games/clusters/generator.ts`, and the loop runs under `retryLimit`, so a regression fails and does not hang. A comment at the site is where the next reader of that loop looks. "Generation from a given seed SHALL be reproducible" (`collection`): the requirement it was cut to survives the regrouping as `testing` "The test suite is deterministic under parallel load", and no production promise is wanted, since the app hands out boards and never seeds. The bounded retry loop (`collection`): `engine-difficulty` "Every generate-until-success loop is bounded by the shared retry limit" is in the regrouped specs, and the generator calls `retryLimit`.

## note The modifier-arrow control is in no Clusters requirement

Shift or Ctrl held with an arrow paints the squares the cursor leaves and enters, and both together clear them (`interpretMove` in `src/games/clusters/index.ts`). "Clusters is painted by click, drag and keyboard cursor" does not mention it and has no room for it under the length bound. It is a control, so a follow-up change should give it a requirement of its own, as Pattern has in "Pattern's keyboard paints and cycles as the pointer does".

## note Clusters' mistake check is a rule validator

"The cluster rules decide when a board is solved" says `findMistakes` reports the cells that break a rule as the board stands, which is not the comparison with the one answer that `ts-engine` "A mistake check compares with the one answer, hidden or not" requires. The same is true of Bricks, and the note in `verdicts/bricks.md` sets out what a player gets: Check & Save still refuses a wrong-but-legal board, through the hint's own comparison, and marks no cell.
