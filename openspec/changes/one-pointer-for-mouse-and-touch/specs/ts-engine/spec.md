## ADDED Requirements

### Requirement: A game reads one pointer with two buttons
The frontend SHALL deliver a pointer to a game as a left button and a right button only, the same from a mouse, a finger and a pen: a click or a tap is `LEFT_BUTTON`, a right-click or a long press is `RIGHT_BUTTON`, and a drag from either is that button's drag and release. Nothing a game receives SHALL say which device pressed. A player moves between a mouse and a finger without learning a game twice, and a player who has only one of them reaches everything the other does.

So three things upstream offered SHALL NOT exist in the engine's vocabulary:

- **The middle button.** The engine SHALL NOT export middle-button codes, and the frontend SHALL drop a middle-button press. Many touchpads cannot send one and a finger has nothing like it.
- **A key held with a press.** The frontend SHALL send a pointer press, drag and release with no modifier bits, and SHALL NOT turn a press into another button because a key is held (upstream's Shift-click as middle and Ctrl-click as the other button). Modifiers on keys — Shift+arrow, Ctrl+arrow — are keyboard gestures and are unaffected.
- **A stylus bit.** No bit SHALL mark a press as a finger's or a pen's, and `Game` SHALL carry no flag asking for one. A game therefore cannot give touch a control scheme of its own, and cannot compare a raw button that a finger's press would fail to match — the defect that once left nine ports deaf to touch.

Every action a game offers SHALL be reachable with the two buttons alone, by clicks and drags, as well as from the keyboard. Where a game has more actions than buttons, the extra one goes into a mode the player turns on or onto the on-screen keypad; a clear or a reset that a button cycle already passes through needs no control of its own, and MAY keep a key as a keyboard convenience.

`view-interactive.test.ts` SHALL assert this at the frontend, on the codes a game receives.

#### Scenario: A tap sends what a click sends
- **WHEN** the board is pressed and released by a mouse, a finger or a pen
- **THEN** the game receives `LEFT_BUTTON` and `LEFT_RELEASE` in each case, with no other bits

#### Scenario: A held key changes nothing
- **WHEN** a left or right press is made with Shift, Ctrl or Command held
- **THEN** the game receives exactly what it receives for the same press with no key held

#### Scenario: The middle button does nothing
- **WHEN** the middle mouse button is pressed on the board
- **THEN** the game receives nothing

### Requirement: A boolean capability flag is held to the behavior it claims
The `Game` interface MAY carry a boolean capability flag **only** where a production consumer needs the answer synchronously and cannot observe it. Every such flag SHALL be asserted equal to a derivation of the fact it declares, so a flag that is forgotten, left behind by a changed game, or simply wrong fails a test rather than going unnoticed.

The flags the contract carries SHALL be held as follows:

- `ignoresSecondaryButton` SHALL be set if and only if the game consumes no `RIGHT_BUTTON` press anywhere on its board.
- `canMarkAll` SHALL be set if and only if the game's `interpretMove` returns a move for an `M` press.

A flag whose effect is to **disable** a guard or a frontend behavior SHALL carry such a check, because nothing else observes it when it lies.

A source scan standing in for a derivation SHALL read the game's code with comments removed: a mention in prose is not a use.

#### Scenario: A flag declared against the behavior fails
- **WHEN** a game sets `ignoresSecondaryButton` but a right-button press changes its board somewhere
- **THEN** `input-parity.test.ts` fails, naming the game

#### Scenario: A flag the behavior calls for but the game omits fails
- **WHEN** a game's `interpretMove` answers an `M` press with a move but the game does not set `canMarkAll`
- **THEN** `mark-all.test.ts` fails, naming the game

## REMOVED Requirements

### Requirement: The midend hides the stylus modifier from games that do not want it
**Reason**: There is no stylus bit left to hide. A tap reaches a game as a left click and a long press as a right click, so the two games that asked for the bit (Loopy and Pattern) gave touch a second control scheme for no gain.
**Migration**: "A game reads one pointer with two buttons". Loopy's and Pattern's touch input now matches their mouse input.

### Requirement: Touch equivalence is guarded at gesture level, not only at press level
**Reason**: With nothing distinguishing a finger from a mouse at the engine, a touch gesture and a mouse gesture are the same input by construction, and an engine-level sweep comparing them compares a sequence with itself. The equivalence now lives in the frontend's mapping, which is where it is checked.
**Migration**: `view-interactive.test.ts` asserts that a finger, a pen and a mouse send the same codes ("A game reads one pointer with two buttons"). The long-press trap this requirement also named stays guarded by the `ignoresSecondaryButton` biconditional.

### Requirement: A boolean capability declaration is held to the behavior it claims
**Reason**: Both of its scenarios were about `wantsStylusModifier`, which no longer exists, and the requirement listed it as one of three flags.
**Migration**: "A boolean capability flag is held to the behavior it claims", covering the two remaining flags.
