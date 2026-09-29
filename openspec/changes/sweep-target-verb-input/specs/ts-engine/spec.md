## MODIFIED Requirements

### Requirement: Click-game input is declared as targets and verbs

A game whose input is **aim at a target, and each button applies a verb there** MAY declare it as `Game.targetVerbs`: a geometry (which target a press addresses, which one the cursor rests on, how the arrows move the cursor) and a verb per button, each a function from the state, a target and the player's `Ui` to the game's own `Move`, a UI-only update, or nothing, with the words the help uses for it. Such a game SHALL hand the buttons it does not handle itself to the engine's `interpretTargetVerbs`, and its help page SHALL carry the Controls paragraph generated from the declaration.

A target is whatever the game aims at — a square, an edge between two cells, a clue beside the grid — and where the cursor is, and how the arrows move it, belongs to the geometry; the engine reads only whether the cursor shows. A verb MAY also be reached only by keys, with no button.

The engine SHALL own, for every declaring game:

- a pointer press parks the cursor, hidden, on the target it pressed;
- the first select key on a hidden cursor only shows it;
- a press that applies nothing is a repaint only when it hid a shown cursor;
- Enter applies the left-click verb, Space the right-click verb, or the left-click verb when the game has no second one, and a verb's own keys apply that verb. Space is never bound to another verb: a game wanting a key for a verb gives the verb its own key.

A verb's semantics SHALL be the game's function, never a flag on the model. Input beyond the verbs SHALL be an arm of the game's own `interpretMove`, tried before the hand-off; an arm that resolves a press on its release SHALL call the same verb functions the model calls, so the model owns no release hook.

A cross-game guard SHALL hold the declaration to the behavior: for every declaring game, the boards a select key reaches at every cursor position the arrows reach that rests on a target SHALL equal the boards its button reaches at every point on the board, since that is what the generated paragraph tells the player. A position resting on no target belongs to an arm and is walked through without being pressed at.

#### Scenario: Enter does what the click does

- **WHEN** a declaring game is probed from its opening position
- **THEN** Enter at every reachable cursor position resting on a target reaches exactly the boards a left-click at every board point reaches, and Space those of the right-click, or of the left-click when there is no right verb

#### Scenario: An arm that disagrees with its verb fails

- **WHEN** a declaring game handles Space in an arm of its own that applies a different verb from its right-click
- **THEN** the guard fails for that game

#### Scenario: The help cannot describe a key the game does not bind

- **WHEN** a declaring game's help page is built
- **THEN** its Controls section carries the paragraph generated from its verbs, and a page carrying the placeholder for a game that declares none fails the build

#### Scenario: A key-only verb reaches the board

- **WHEN** a declaring game has a verb reached only by keys
- **THEN** each of its keys reaches some board from a primed position, or the guard fails

### Requirement: Keyboard reachability is a recorded decision for every game

Every registered game SHALL either handle keyboard cursor input, or appear on an
explicit exemption list whose entry states **why** — and the exemption's reason
SHALL be in that game's spec, not only in a comment or a test fixture.

The point is not that every game must have a cursor. It is that "this game has no
keyboard" must be a decision somebody made and wrote down, rather than a
condition nobody noticed.

Handling a cursor key is necessary and not sufficient: the guard SHALL also
assert that some **keyboard-only sequence commits a move**, because a cursor that
goes everywhere and does nothing is not a keyboard. That probe SHALL allow
multi-step sequences, since several games pick a piece up with one select and put
it down with a second (Pegs, Map, Rectangles, Samegame, Signpost, Slide,
Untangle), and a single-keypress probe scores every one of them deaf.

The check SHALL derive a game's coverage through the registry and the shared
input helpers, not by reading its `index.ts` alone: a game declaring
`targetVerbs` hands its arrows and select keys to `interpretTargetVerbs`, and
Palisade and Separate reach it through `border-grid.ts`'s `borderGridVerbs`,
with no direct `CURSOR_*` reference of their own. A check that reads one file
convicts games that are fine, which is the failure mode where a guard is
turned off rather than fixed.

#### Scenario: A game with no keyboard handling must be on the list

- **WHEN** a registered game handles no cursor input
- **THEN** the guard fails unless that game is on the exemption list
- **AND** the exemption names the reason, which is also stated in the game's spec

#### Scenario: Cursor handling through a shared helper counts

- **WHEN** a game's cursor input is supplied by `interpretTargetVerbs` or
  another shared helper rather than by its own `CURSOR_*` branches
- **THEN** the guard recognizes it as covered

#### Scenario: A cursor that cannot act is not a keyboard

- **WHEN** a game moves a cursor in response to the arrow keys but no
  keyboard-only sequence changes the board
- **THEN** the guard fails
