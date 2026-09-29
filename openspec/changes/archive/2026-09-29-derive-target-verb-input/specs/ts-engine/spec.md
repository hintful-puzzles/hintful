## ADDED Requirements

### Requirement: Click-game input is declared as targets and verbs

A game whose input is **aim at a target, and each button applies a verb there** MAY declare it as `Game.targetVerbs`: a geometry (which target a press addresses, which one the cursor rests on, how the arrows move the cursor) and a verb per button, each a function from the state and a target to the game's own `Move`, with the words the help uses for it. Such a game SHALL hand the buttons it does not handle itself to the engine's `interpretTargetVerbs`, and its help page SHALL carry the Controls paragraph generated from the declaration.

The engine SHALL own, for every declaring game:

- a pointer press parks the cursor, hidden, on the target it pressed;
- the first select key on a hidden cursor only shows it;
- a press that applies nothing is a repaint only when it hid a shown cursor;
- Enter applies the left-click verb, Space the right-click verb, or the left-click verb when the game has no second one, and a verb's own keys apply that verb.

A verb's semantics SHALL be the game's function, never a flag on the model. Input beyond the verbs SHALL be an arm of the game's own `interpretMove`, tried before the hand-off.

A cross-game guard SHALL hold the declaration to the behavior: for every declaring game, the boards a select key reaches at every cursor position the arrows reach SHALL equal the boards its button reaches at every point on the board, since that is what the generated paragraph tells the player.

#### Scenario: Enter does what the click does

- **WHEN** a declaring game is probed from its opening position
- **THEN** Enter at every reachable cursor position reaches exactly the boards a left-click at every board point reaches, and Space those of the right-click, or of the left-click when there is no right verb

#### Scenario: An arm that disagrees with its verb fails

- **WHEN** a declaring game handles Space in an arm of its own that applies a different verb from its right-click
- **THEN** the guard fails for that game

#### Scenario: The help cannot describe a key the game does not bind

- **WHEN** a declaring game's help page is built
- **THEN** its Controls section carries the paragraph generated from its verbs, and a page carrying the placeholder for a game that declares none fails the build
