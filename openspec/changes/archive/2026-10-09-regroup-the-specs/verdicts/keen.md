# Verdicts: keen

## keep `keen`: Keen flags mistakes against its unique solution

`ts-engine` "A candidate note that excludes the answer is a mistake" holds the note rule. What Keen re-solves from (the cage clues alone) and the empty result on a board that is not uniquely solvable are Keen's own, and no shared requirement states the `"cell"` and `"note"` kinds `entryMistakes` returns.

## keep `keen`: Keen provides on-screen key labels

No shared requirement says a digit game's keypad is its digits and then Clear: `engine-input` "A key label carries its resolved text" shows `digitKeys`' shape only in a scenario about labels. The keypad is a control, and which digits Keen's holds is Keen's.

## keep `keen`: Keen's parameters

The mismatch is real and is a trap: `Difficulty` in `src/games/keen/state.ts` is `"easy" | "normal" | "hard" | "extreme" | "unreasonable"`, so the Tricky tier is `"hard"` and `DIFF_HARD` is Tricky (`validateParams` reads "above Tricky" as `level > DIFF_HARD`). Towers' keys were cut because nothing in them misleads; uniformity across games is not needed.

## keep `keen`: Keen selects a cell through the shared note-taking cell

Which cells take an entry and which a mark is Keen's answer to the mechanic. The select key toggling pencil mode is a gesture `engine-notes` "One way into note-taking across the collection" only permits and does not state, so it stays with the game that has it.

## keep `keen`: Every Keen hint step is monotone progress

The shared walk promises that following hints from any reached position solves the board (`engine-hints` "The hint walk SHALL cover every preset a game offers"), but no shared requirement says a step is never undone by the hint or that a recompute skips what the board already shows. That is hint behavior, and it stays.

## keep `keen`: Keen generates boards uniquely solvable at exactly the requested difficulty

The clue-quality sentence describes what `src/games/keen/generator.ts` does on purpose: it deals the operations in turn and takes a clue marked low-quality (a sum with one option, a product with too few above Normal, a difference of `w − 1`) only when no good one is left. A session changing the generator would want to know that is meant, and nothing else says it.

## keep `keen`: Keen keeps a hint plan while the player follows it

The shared requirement does not state the rule. `engine-candidate-hints` "The shared track and refresh read a game's move dialect" names the helper in its body and gives only the pencil toggle's two verdicts, in a scenario. Neither it nor `engine-hints` "A player move is classified against the stored plan" says that a `pencilStrike` of all the step's marks completes it, nor that every other move is `off`: the midend's scenario drops the plan on a "conflicting" move, and `keepCandidateHintTrack` in `src/engine/candidate-hint.ts` drops it on any move that is not the step's, a placement answering a strike step among them. Keen's `hintKeepTrack` is one call of that helper, so the rule is the family's, but a shared capability is not added to from here and this is a hint's behavior, so the game keeps it.

## note Keen's refusal of a multiplication-only 9x9 above Tricky has no requirement

`validateParams` in `src/games/keen/state.ts` refuses, when a board is to be dealt, a 9x9 with multiplication only at Hard or Unreasonable, through `tooRareToDeal`. The spec has only the 3x3 refusal. A change should add to `keen`, beside "A 3×3 Keen is not dealt above Normal": "When a board is to be generated, `validateParams` SHALL refuse a multiplication-only 9×9 above Tricky as too rare to deal, in the collection's sentence for that, and SHALL accept the same params when a description comes with them."

## note The shared requirements Keen's earlier cuts rest on still stand

In the regrouped specs: `engine-candidate-hints` "A naked single shades its cell and a hidden single its region", "The walk owns the setup", "A placement's cull continues its journey", "The shared track and refresh read a game's move dialect"; `engine-drawing` "A per-cell overlay reaches the render cache through the shared sidecar" (it has moved there from `engine-hints`) and "A warm frame matches a fresh paint of the same state". Nothing of Keen's needs restoring.

## note `engine-candidate-hints` states the keep-track verdicts only in a scenario

"The shared track and refresh read a game's move dialect" names the two helpers in its body and gives the `onTrack` and `completed` verdicts of a pencil toggle only in its scenario. Its body could say what Keen's, Towers' and Unequal's copies said: a toggle clearing one of a strike step's marks is `onTrack` and shrinks the step, clearing the last is `completed`, a `pencilStrike` of all the marks or a placement of the hinted value is `completed`, and any other move is `off`.
