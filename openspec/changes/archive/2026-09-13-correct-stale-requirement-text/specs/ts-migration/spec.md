## MODIFIED Requirements

### Requirement: Migration proceeds top-down, product-value first

The TypeScript migration SHALL proceed top-down: the TS midend and a
clean `Game` interface SHALL be built before any game is ported, and
games SHALL then be ported by user-facing priority (simplest first to
establish the pattern, then the games the owner wants to enhance, then
outward to the rest). Leaf libraries (dsf, tree234, sort, findloop,
etc.) SHALL be ported lazily and idiomatically as ordinary TS
dependencies *when a game being ported needs them* — NOT as
standalone bridged seams with characterization corpora.

The migration SHALL NOT be ordered bottom-up by library-dependency
depth. Delivering user-visible capability early takes precedence over
maximizing how much downstream code each port unblocks.

#### Scenario: A game port pulls in only the leaf libs it needs

- **WHEN** a game is ported to TS and depends on a union-find / dsf
  helper
- **THEN** an idiomatic TS equivalent is written as a normal module
  dependency
- **AND** no characterization corpus is recorded for that helper

#### Scenario: Midend precedes game ports

- **WHEN** the migration begins after this doctrine lands
- **THEN** the first implementation change is the TS midend + `Game`
  interface (`ts-midend-and-game-interface`)
- **AND** no per-game port is attempted before that interface exists
