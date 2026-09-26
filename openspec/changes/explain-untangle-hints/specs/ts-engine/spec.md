## MODIFIED Requirements

### Requirement: The midend retains generator aux info for Solve

The `Midend` SHALL retain the solver-shortcut `aux` info a game's
`newDesc` returns (upstream `aux_info`) and pass it to the game's
`solve(orig, curr, aux)`. The `aux` SHALL be retained for a freshly
*generated* game (both `newGame` and a random `<params>#<seed>` id). The
retained `aux` SHALL be cleared for
a descriptive `<params>:<desc>` id and for a loaded save (where no aux is
available), so a game whose solver requires aux correctly reports the
solution as unknown for those — faithful to upstream, where Solve is
available only for a game generated in the current session.

#### Scenario: Solve uses the generator's aux on a freshly generated game

- **WHEN** a game is started from `newGame` or a `#seed` id and the user
  invokes Solve
- **THEN** the midend passes the retained `aux` to the game's `solve`,
  and a game that uses it solves the board

#### Scenario: Solve is unavailable on a loaded game

- **WHEN** a game requiring aux for Solve is loaded from a save (no aux)
  and the user invokes Solve
- **THEN** the midend passes `undefined` aux and the game reports the
  solution is not known, leaving the board unchanged
