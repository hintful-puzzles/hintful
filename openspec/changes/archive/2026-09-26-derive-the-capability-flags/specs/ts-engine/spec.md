## ADDED Requirements

### Requirement: Solve, the status bar and text export follow from the game's methods

The `Midend` SHALL derive `canSolve` from the presence of `Game.solve` and
`wantsStatusbar` from the presence of `Game.statusbarText`, and SHALL offer a
text rendering exactly when `Game.textFormat` is present and returns one. The
`Game` contract SHALL carry no flag restating any of the three, so a game
cannot advertise a capability it has no method behind.

#### Scenario: A game without the methods offers neither Solve nor a status bar

- **WHEN** a game provides neither `solve` nor `statusbarText`
- **THEN** its static properties report `canSolve` and `wantsStatusbar` false
- **AND** `Midend.solve()` refuses with "This game does not support solving"

#### Scenario: A game with the methods offers both

- **WHEN** a game provides `solve` and `statusbarText`
- **THEN** its static properties report `canSolve` and `wantsStatusbar` true

## MODIFIED Requirements

### Requirement: Hint explanation surfaces independent of the status bar

The active hint step's explanation SHALL be surfaced to the UI (the hint
banner) whenever a hint is displayed, **regardless of whether the game
has a status bar** (provides `statusbarText`). The explanation rides on the
`status-bar-change` notification together with the status-bar text; the
`Midend` SHALL emit that notification for a game that has either a status bar
or a `hint` capability, so a hint-carrying game with no status bar (e.g.
Range) still shows and clears the banner. The status-bar DOM remains gated on the app's `wantsStatusbar` attribute independently, so the empty status-bar text emitted for a
no-status-bar game is inert.

#### Scenario: A no-status-bar game shows and clears the hint banner

- **WHEN** a game with a `hint` method and no `statusbarText` is sent a
  hint request, and then the player makes a move
- **THEN** the midend emits the hint explanation while the hint is displayed
- **AND** the explanation is cleared (emitted empty) once a move hides the hint

### Requirement: The static-attributes relay carries no field the app does not read

Every field of `PuzzleStaticAttributes` SHALL be read by the app shell, and a
check SHALL assert it. A field with no app reader SHALL be removed, or recorded
with the change that owns the decision to give it one.

This is the sibling of the rule that the `Game` contract carries no capability
without a consumer, and it needs stating separately because the two contracts
fail independently: every field here is produced by `Midend.getStaticProperties`
and relayed under the same name into a `Puzzle` field, so the chain is easy to
extend and its far end is easy to forget. Two of the original nine fields turned
out to have no reader — `canConfigure`, which the midend answered with a literal
`true` while it gated the type menu's "Custom type…" entry, and `displayName`,
which `Puzzle` overrode from the catalog on every reachable path.

The check SHALL count only reads from outside the engine, because the two
contracts share field names: `canMarkAll` is also a `Game` member, so an engine read of `game.canMarkAll` would otherwise vouch for an app field nothing touches.

#### Scenario: A relayed field the app never reads is reported

- **WHEN** a `PuzzleStaticAttributes` field has no app-shell reader
- **THEN** the check reports it by name, so the midend stops computing and
  shipping a value for nobody

#### Scenario: The check states how much it inspected

- **WHEN** the check runs
- **THEN** it asserts the number of fields it examined and the number of
  app-shell modules it scanned, so a sweep that silently matched nothing cannot
  report success
