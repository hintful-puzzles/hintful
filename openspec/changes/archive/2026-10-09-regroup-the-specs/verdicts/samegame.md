# Verdicts: samegame

## cut `samegame`: Same Game does not turn its board

declared: `notApplicable.transposeParams` in `src/games/samegame/index.ts` gives the same decision with the same reason ("Squares fall down and emptied columns close up to the left, so a board turned on its side would be a different puzzle"), the engine reads it to keep the game out of the drafts, and the help page shows it. `engine-params`, "A game may turn its params, says why not, or is a draft", requires that declaration and names this very reason, and its "A deal turns the chosen params when the turned board fits better" is why a tall board then stays tall. The prose copy says nothing the declaration does not.

## edit `samegame`: A first click in Same Game selects the group

Which object holds the selection is how it is built. What a player and a session rely on is the consequence, which the requirement implied and did not say: selecting is no move, so it adds nothing to Undo. The clearing on every transition is already stated.

from: selection held in `SamegameUi` (not in the game state)
to: selection that is no move: selecting adds no step to Undo

## edit `samegame`: Same Game's keyboard cursor acts where it stands

What a control does stays, and the wrap is part of it: `interpretMove` in `src/games/samegame/index.ts` calls `moveCursor` with `wrap` true, so an arrow at an edge comes round to the far side and no press is a no-op.

from: SHALL move with the cursor keys
to: SHALL move with the cursor keys, wrapping at the board's edges

## note samegame: no hint and no Solve is work not done, not a refusal

The cut "SHALL NOT provide `solve` or `hint`" stays cut. `ts-engine`, "A not-applicable reason is a fact about the puzzle", says a hint can never be not applicable, the game declares no `solve` reason in `notApplicable`, and `openspec/changes/hintless-games-in-reserve/proposal.md` lists Same Game in the reserve of games still owed a hint. A spec sentence forbidding one would contradict all three.
