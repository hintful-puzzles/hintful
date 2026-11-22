## MODIFIED Requirements

### Requirement: A game is registered by its directory

A game SHALL be registered and cataloged by its own directory alone: its
`index.ts` registers it and its `catalog.ts` exports its entry, or, for a
game born from its description, the `<id>.game.ts` and `<id>.catalog.ts`
the compiler writes from it. No shared file SHALL list the games. Loading
the games SHALL fail when a game registers under another name or has no
catalog entry, or when a catalog entry has no game.

#### Scenario: A game directory has no catalog entry

- **WHEN** a directory under `src/games/` has an `index.ts` and no
  `catalog.ts`
- **THEN** importing `src/games/index.ts` throws, naming the directory
- **AND** the Vite config fails to load

#### Scenario: A game registers under another name

- **WHEN** a directory's `index.ts` registers no game whose id is the
  directory's name
- **THEN** importing `src/games/index.ts` throws, naming the directory

#### Scenario: A born game needs no TypeScript of its own

- **WHEN** a game's directory holds its description and no `index.ts`
- **THEN** the game is registered and cataloged from what the compiler wrote

## ADDED Requirements

### Requirement: The TypeScript under src/games/ only shrinks

The gate SHALL count the lines of TypeScript under `src/games/`, tests
excluded, and refuse a count other than the committed ceiling, so a change
that adds a game's hand-written code fails and the change that removes some
lowers the ceiling.

#### Scenario: A planted line

- **WHEN** a line is added to a TypeScript file under `src/games/` that is not
  a test
- **THEN** the gate's `game-lines` check fails, naming the count and the
  ceiling
