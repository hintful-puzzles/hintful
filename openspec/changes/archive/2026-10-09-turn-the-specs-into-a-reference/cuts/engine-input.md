# Cuts: engine-input

Requirements: 78 before, 66 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The engine provides a shared cursor button-to-delta helper | type | `cursorDelta` and `isCursorMove` in `pointer.ts`: the signature and a four-row table. When a game uses it stays in "A bounded-grid cursor is driven through moveCursor". |
| The engine provides shared keyboard modifier-mask constants | duplicate | Merged into "The engine provides shared pointer button constants", which now names the masks and `stripModifiers` and forbids a local copy of either. |
| The mask values (`0x7000`, `0x4000`, `0x2000`, `0x1000`) in that requirement | declared | `pointer.ts` declares them and the engine reads them. |
| "no game file contains a local `MOD_MASK`, `MOD_NUM_KEYPAD`, `MOD_SHFT` or `MOD_CTRL` declaration" (scenario clause of that requirement) | duplicate | "The engine provides shared pointer button constants": a game SHALL NOT declare a modifier mask of its own. |
| "They SHALL be plain `const` values, not an enum." (button constants, modifier masks) | how | Only that a game compares against the shared export matters. |
| "The worker adapter SHALL forward that result and SHALL NOT return a fixed list" (The midend serves a game's key labels) | port | The fixed list was the port's stub; `worker-adapter.ts` is a one-line forward. The requirement now says the app shows what the midend returns. |
| The gesture layer's replayed event is tested | duplicate | Merged into "The gesture layer's own decisions are tested", which keeps `unhandledEvent`, the reason for it, and its scenario. |
| The list of cases the detector's tests cover (hold window, drag threshold and wobble, non-touch pointer, both affordances disabled, two-finger tap, second finger's timer reset) | process | `docs/games/input.md` § "A touch hold arrives as the right button", last paragraph, names what is asserted. |
| Keyboard coverage is derived through the registry | duplicate | "The collection's input guards share one behavioral probe": no probe reads a game's source, and a game joins by having the behavior. |
| The unsendable-code scan reads switch cases | particular | Only `emittable-keys.test.ts` consults it; `switchCases` there carries the reason and a planted case. |
| The unactionable probe codes are asserted, not assumed | process | `docs/games/input.md` § "A button you did not act on must not be claimed", "On writing the probe": checked not assumed, and why the private-use area is wrong. |
| The unactionable probe is sent at the keyboard origin | process | Same section ("Keyboard events arrive at `(0, 0)`"), and § "The input-parity bar" for "consumed" staying the question. |
| The digit-code guard keys on the codes | process | `docs/method.md` § "A scan that keys on a name" (key on the shape, in any position) and § "See a guard fail before trusting it". The rule the guard holds stays in "A game does not spell the digit keys itself". |
| The digit helpers take a character, and the caller checks the bounds | type | `isDigit(c: string)` and `digitValue(c: string)` in `decimal.ts`; the reason is the comment on them. |
| The keypad rule is checked per game | duplicate | Merged into "A game offers a keypad exactly when touch play needs one to type", with the biconditional, the no-floor rule and its scenario. |
| A key-only verb declares the pointer's route to it | type | `KeyOnlyVerb.pointer` is a required field in `target-verb.ts`. The rule is one sentence at the head of "A pointer route is a repeat, a cycle or a notes-mode press". |
| A mark declared outside targetVerbs is held to the same check | duplicate | Merged into "A declared sweep is held to what a drag does", with its scenario. |
| Scenario "An ordinary key is untouched" (An on-screen key may name a palette color) | duplicate | Restates the requirement's own sentence; the other scenario stays. |
