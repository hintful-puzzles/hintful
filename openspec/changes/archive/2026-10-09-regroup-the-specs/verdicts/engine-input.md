# Verdicts: engine-input

## keep `engine-input`: gridCursorMove moves a position on a bounded grid

A doc comment is not `type`: the compiler holds the signature, and nothing but this requirement and `pointer.test.ts` holds that a clamped no-op answers `null`, which is what a caller returns in place of `UI_UPDATE`. Sixteen games' `index.ts` call it directly (`git grep -c gridCursorMove -- src/games`), so it is a shared helper's promise to a game and stays.

## keep `engine-input`: The secondary-button probe observes the frame and the save

It is not only how the guard is built. It fixes what "observable" means in "The secondary-button declaration is held to the behavior": a meaning kept in `Ui` a game never saves counts, and an unchanged board does not convict. That decides which games must declare `ignoresSecondaryButton`, and so which lose the long press on touch. `docs/games/input.md` § "A touch hold arrives as the right button" tells the story of it; the spec is where the definition is checked against.

## keep `engine-input`: An incidental secondary effect is the guard's stated bound

A refusal that still binds: the comparison "does the secondary do something the primary does not" is the obvious tightening and would be proposed again, and it convicts a game that folds the secondary onto the primary by design. The guide says the same in `docs/games/input.md` § "A touch hold arrives as the right button", but a turned-down design is on the prune brief's list of what stays.

## keep `engine-input`: A probe sweeps what could differ

No guide states it. Searched `docs/games/testing.md`, `docs/games/input.md` and `docs/method.md` for the walk-the-cursor rule, the density rule and the fail-when-nothing-is-reached rule: `testing.md` § "How a cross-game guard finds its population" rule 8 covers only the fixed seed and the reset, and `method.md` § "A sweep that finds zero owes a power argument" is the general form without the cursor or the off-grid targets. The rule's other home is the comment on `probePoints` in `src/engine/testing/input-probe.ts`, so it stays here.

## keep `engine-input`: A cursor outside the canonical field fails the build

It carries a rule on a game that no other requirement states: a game does not re-declare a helper `pointer.ts` exports ("The engine provides shared pointer button constants" forbids only a button code or a mask, and "A bounded-grid cursor is driven through moveCursor" only a clamp). The structural method is also the promise its scenario makes, that a spelling nobody has listed is caught, which is the difference from the name scan beside it in `cursor-vocabulary.test.ts`.

## cut `engine-input`: A game claiming an unactionable code is on an exact ledger

process: `docs/games/testing.md` § "How a cross-game guard finds its population", rule 3, states it for every cross-game guard: the exceptions are a ledger in the guard, one entry a member with its reason, asserted equal to what the derivation found, so an entry cannot outlive what it excuses. `CLAIMS_UNACTIONABLE` in `src/engine/input-parity.test.ts` is that ledger and is empty. That a ledger excuses a claimant stays in the scenario "A game answering a meaningless code is caught" of "A game declines a button it did not act on".

## keep `engine-input`: A key label carries its resolved text

A contract and not a detail: the literal `"Clear"` is what the key panel's icon map keys on (`src/engine/key-labels.ts`, the comment on `clearKey`), and "the engine does not re-derive a label from a button code" is a rule on the engine. Not merged into "Games may expose on-screen key labels": the two together pass 500 characters.

## note `docs/games/testing.md` rule 4 contradicts the secondary-button requirement

`docs/games/testing.md` § "How a cross-game guard finds its population", rule 4, says "`ignoresSecondaryButton` iff the game consumes `RIGHT_BUTTON` (`input-parity.test.ts`)". `engine-input`, "A secondary meaning is derived from what the player can perceive", says consumption alone does not satisfy the biconditional, and `docs/games/input.md` § "A touch hold arrives as the right button" agrees with the spec. The guide's rule 4 is stale and should read "iff the secondary button means nothing the player can perceive".

## note the doc comment on `gridCursorMove` describes a policy the engine has since taken

`src/engine/pointer.ts`, the comment on `gridCursorMove`, says that which field holds the cursor, the changed-tracking and "the first arrow-press only reveals the cursor idiom" stay in each game. `moveCursor` in the same file owns all three now, the field is the canonical `cursor`, and "One arrow press reveals the cursor and moves it" says the first press moves as well. The comment needs bringing up to date; the requirement is right as it stands.
