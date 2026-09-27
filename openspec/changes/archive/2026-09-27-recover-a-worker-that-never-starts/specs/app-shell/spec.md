## ADDED Requirements

### Requirement: A page a deploy left stale recovers instead of going blank

When a file the page needs cannot be loaded, whether a lazily imported chunk or the puzzle
worker's script, the app SHALL reload once, and SHALL report the error if a reload in the last
thirty seconds did not help. A puzzle worker that fails to start SHALL NOT leave the board
waiting indefinitely: a script that could not be loaded SHALL be treated as a stale page, and
an error thrown by the worker's own code during startup SHALL be reported.

#### Scenario: The worker's script is gone after a deploy

- **WHEN** a page from the previous build opens a puzzle and its worker script answers 404
- **THEN** the page reloads once rather than showing a blank board

#### Scenario: Reloading did not help

- **WHEN** the worker's script is still missing after that reload
- **THEN** the crash dialog reports it, rather than the board staying blank

### Requirement: A remembered board type that no longer loads is replaced with a warning

When the board type remembered for a game is rejected, the app SHALL forget it, deal the
first preset unless a restored game brings its own type, and SHALL show a warning toast
saying the last board type could not be restored.

#### Scenario: A remembered type from an older version

- **WHEN** the remembered type for a game fails to validate on load
- **THEN** the board is dealt, and a warning toast says the last board type could not be restored
