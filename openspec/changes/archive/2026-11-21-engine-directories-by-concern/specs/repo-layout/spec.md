## ADDED Requirements

### Requirement: Engine modules are grouped by concern into layered directories

Every module under `src/engine/` SHALL sit in a directory declared, bottom
to top, in `src/engine/testing/engine-directories.ts`, and SHALL be imported
by its own path. A module SHALL import at run time only from its own
directory or one earlier in that list; a type-only import is erased and MAY
name any directory.

#### Scenario: A promoted helper lands in its concern

- **WHEN** a contributor promotes a helper a second game needs
- **THEN** it lands in the declared directory of what it is for, not at the
  top of `src/engine/`
- **AND** a helper made of parts is a directory inside its concern, as
  `board/grid/` is

#### Scenario: There is no engine-wide barrel

- **WHEN** a game imports the `Midend` or the `Game` contract
- **THEN** it names `midend/midend.ts` or `contract/game.ts`

#### Scenario: An upward runtime import is refused

- **WHEN** a module in `render/` imports the midend at run time
- **THEN** `src/module-layering.test.ts` fails, naming the import

#### Scenario: A new directory states its place

- **WHEN** a contributor adds a directory under `src/engine/` without
  declaring it
- **THEN** the layering guard fails

## REMOVED Requirements

### Requirement: Engine modules that are meaningless apart are grouped, and the rest stay flat

**Reason**: 120 flat modules put the engine's grouping in a guide rather than
the filesystem, and nothing layered them.

**Migration**: Replaced by "Engine modules are grouped by concern into
layered directories"; `grid/` is `board/grid/`, `color/` stays.

### Requirement: No engine subdirectory is created for a grouping that has to be argued for

**Reason**: Every module now sits in a concern directory, so a new helper
has a directory by what it is for, and none is flat.

**Migration**: Replaced by "Engine modules are grouped by concern into
layered directories".
