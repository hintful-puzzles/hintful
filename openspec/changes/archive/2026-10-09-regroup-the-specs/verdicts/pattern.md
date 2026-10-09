# Verdicts: pattern

## keep `pattern`: Pattern names no hue of its own

`engine-colors` "A game that uses the pair names no hue or shape of its own" does not cover it. Pattern takes the pair's first member alone (`SHADED_NAME` in `src/engine/piece.ts`), and its second word is `UNSHADED_NAME`, "clear", which is no member of the pair and which the shared requirement never mentions. The hint-mark legend is also outside the shared requirement's list (palette, hint sentences, control words, help page).

## keep `pattern`: Pattern hint color legend

`engine-hints` "A hint marks beside the content, never behind it" says the acted-on cell is ringed and not filled. This one adds what that does not: the piece or the cross the move would place is not pre-drawn inside the ring, and the sentence is what says which state the cell must take. Both are rules about a hint's marks and words.

## keep `pattern`: Pattern's narration leads with the indication and concludes by necessity

The list is a bound on the conclusion and not a census of sentences. `src/games/pattern/hint-text.ts` says only `must be` today, which satisfies it, and `must stay` is in the shared necessity vocabulary (`docs/games/hints.md` § "Necessity for deductions, imperative for moves", and `NECESSITY` in `src/engine/hint-quality.test.ts`). Narrowing the list would forbid a sentence the collection's rule allows, which is a change to the rule and not a pruning.

## keep `pattern`: A multi-cell paint drag leaves placed marks

The `onlyBlank` flag is a field of the `fill` move (`src/games/pattern/state.ts`), and `ts-engine` "The engine uses a clean TS-native save format" saves the move list and restores by replaying it. A saved `fill` without the flag would replay as an overwriting fill, so the field is a promise to saves and stays named.

## keep `pattern`: Pattern's findMistakes flags marks against the unique solution

The first clause places the game under the shared hook, and the rest is its own: an `Unknown` cell is never flagged, so an unfinished board is not a wrong one, and the outline is drawn at the cell's edge beside the piece, which is a decision about how a mistake looks here.

## note R pattern 1 names a requirement that is already gone

"A Pattern hint is refused on a solved or mistaken board" is in neither `openspec/specs/pattern/spec.md` nor the regrouped spec: the pruning cut it as `collection` (`cuts/pattern.md` of the archived change). The cut is right. `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game" gives both refusals for every game, and Pattern's `hint` in `src/games/pattern/index.ts` writes neither. Nothing is left to settle.

## note engine-colors does not state the shaded-alone case

`src/engine/piece.ts` declares a second use of the pair beside the two-state one: "Shaded", the first member alone, with `UNSHADED_NAME` as the one word for a cell known not to be shaded (its comment names Pattern, Range and Singles; Mosaic and Bricks use it too). `engine-colors` has no requirement for it, so each such game restates "names no hue of its own" with the unshaded word. A shared requirement there would let those per-game requirements shrink to their departures.
