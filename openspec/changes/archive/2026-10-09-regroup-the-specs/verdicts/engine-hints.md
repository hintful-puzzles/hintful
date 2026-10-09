# Verdicts: engine-hints

## keep `engine-hints`: A hint defect seen in two games is closed for every game

No guide says it. `docs/doctrine.md` § "Convention over configuration" has only "N games sharing a defect means the layer below them is wrong", and `AGENTS.md` only says to take the sibling defect on in the session. Neither says the fix is structural or a cross-game guard and never a rule in a document a port must remember, which is what a session fixing a hint defect checks its change against. Searched `docs/doctrine.md`, `docs/method.md`, `docs/games/hints.md`, `docs/games/testing.md`, `docs/games/README.md` and `docs/work-management.md` for "defect class", "recurr", "must remember", "each new port": nothing.

## keep `engine-hints`: Hint mechanics are engine-owned and cross-game guarded

It is the contract between the engine and a game's hint: which named mechanics a game inherits and may not re-derive. The doctrine line ("The framework owns a shared idiom") is general and names none of them, and `docs/games/hints.md` § "Engine mechanics" lists the hooks a game implements and not the boundary of what it must leave alone.

## keep `engine-hints`: The length check also walks the last preset at the hardest teachable tier

Two rules, and neither is `build-pipeline`'s. That the check covers the Custom-dialog corner, and leaves out a search tier, is a rule about hint narration. That this one assertion is deferred to push is the particular scoping, which `build-pipeline` ("No correctness check is removed or weakened to buy speed") only permits in general and does not record. `CORNER_WALKED` in `src/engine/hint-quality.test.ts` is the code it binds, and a session moving that flag would check against this.

## keep `engine-hints`: The narration ledger is asserted both ways, per listing

The `(entry, game, rung)` unit is a decision with a wrong alternative on record: asserted per entry, a game listed on a shared sentence it never speaks passes on the strength of the others (`docs/games/hints.md` § "Keep the narration terse", the Mathrax case). A session changing `LONG_NARRATIONS` or its close-out case checks against it, and its only other home is the test.

## keep `engine-hints`: The endgame database's completeness is asserted directly

The guide (`docs/games/hints.md` § "Sliding-permutation games") tells the incident, a signed hash losing half the database, and not the rule that completeness is asserted apart from the search's answers. The rule's only other home is the case "holds every board within its database depth, and can say so" in `src/engine/slide-planner.test.ts`, and a test is not a home. It is also what tells a session that the two searches agreeing is not that assertion.

## keep `engine-hints`: A necessity idiom is a predicate over the step

All three sentences bind. The predicate-over-step part is what lets an idiom be scoped to one leg, which the scenario holds and `IDIOMS` in `src/engine/hint-quality.test.ts` is typed for; a session adding an idiom as a regex over the text would be reversing it. The guide (§ "Necessity for deductions, imperative for moves") says only to add an idiom deliberately.

## keep `engine-hints`: Removing an em-dash keeps the sentence's substance

The sweep is finished and the rule is not: the guard fails any new narration that writes U+2014, and the rewrite that follows is what this governs. It is an owner-directed rule about what a hint says (`docs/games/hints.md` § "No em-dashes"), so it does not go on the guide's saying it too.

## keep `engine-hints`: Two rungs with one narration are told apart structurally

One game has the case today, Spokes (`docs/games/hints.md` § "The forcing boundary"; `src/games/spokes/spokes-hint.test.ts`), and none other was found. The rule is still general in form and is about which rung a hint may reach, where a wording check is blind: the next game to call one trial at two bounds reads this, and without it nothing says the equality needs a control.

## keep `engine-hints`: A joined mark inside the content box keys its repaint on its sides

The guide (`docs/games/hints.md` § "Where the band goes, and who rubs it out") says how it is met, through `MarkOutlines.packed`; the requirement says what must hold, that a square whose sides change repaints though its role did not. A stale side is a defect a player sees, and a game keying its own tile word is the one that can still get it wrong.

## keep `engine-hints`: A mark outside the content box is driven by the drawstate

Same as the joined mark: the guide's same section gives the mechanism (`HintMarks.eraseBeforeTiles`, restamping each frame) and the requirement gives the outcome a renderer is held to, that a mark outside the box survives a neighbor's repaint and is restored when dismissed. It is the engine's promise and the game's obligation, so it stays beside the mark rules.

## keep `engine-hints`: Hint explanation surfaces independent of the status bar

The sentence stays. `status-bar-change` is a variant of the notification type in `src/engine/types.ts` that `src/puzzle/puzzle.ts` switches on to fill the banner, so the name is the contract between the midend and the frontend and not construction; and the sentence also holds the rule that the midend emits it for a game with a `hint` and no status bar.

## keep `engine-hints`: Deduction runs out only where the tier permits search

Only its first sentence restates `engine-difficulty`, "The midend throws when deduction runs out below Unreasonable", which is the rule at run time. The rest is this spec's own and has no other home: that the permission is derived from the tier's name and never declared for a guard (`permitsSearch` in `src/engine/difficulty.ts`), and that the hint-resume walk asserts it of a game with no difficulty contract and does not skip it. The requirement the rewrite report paired it with, "One helper says which tiers permit search", is in no regrouped spec.

## note engine-difficulty no longer states that one helper says which tiers permit search

The rewrite report named `engine-difficulty`'s "One helper says which tiers permit search" as a twin of the requirement above. No regrouped spec has that title or the words "permits search" outside `engine-hints` (searched every `regrouped-v1/*/spec.md` and `openspec/specs/`). So `engine-hints`' "Deduction runs out only where the tier permits search" is now the only statement that the permission is read from the tier's name, which is one more reason it was kept whole.

## note the guide's hintGesture signature is short one argument

`docs/games/hints.md` § "Engine mechanics" lists `hintGesture(state, ui, ds, move)`; the requirement "A hint step is played by the pointer gesture that makes it" gives it a fifth argument, `step`, and so does `src/engine/game.ts`. The guide is the stale one.
