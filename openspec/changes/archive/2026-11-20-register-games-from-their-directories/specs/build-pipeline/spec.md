## MODIFIED Requirements

### Requirement: The selector's walk reads the globs of every module it visits

The walk SHALL follow imports and SHALL read the `import.meta.glob` calls of
every module it visits, not only of the test file. A guard that reads source
through a helper reads what the helper's glob matches, and a scan of the test
file alone cannot see it. A glob that imports modules SHALL be followed into
every file its base can match, as an import of each, where each is a script
or JSON; otherwise it SHALL reach everything.

#### Scenario: A guard reads source through a helper

- **WHEN** an engine module is staged, and a guard reads engine source only
  through a helper module's glob
- **THEN** the guard is selected
- **BECAUSE** the helper's glob is read by every file that imports the helper,
  and a selector that read only the test file's own globs would skip it

#### Scenario: A test loads the games through the registry's glob

- **WHEN** a game's module is staged, and a test imports `src/games/index.ts`,
  which loads the games through a glob
- **THEN** the test is selected
- **AND** a test that imports only the app's catalog, whose glob matches the
  games' `catalog.ts` alone, is not selected for it

### Requirement: Only the compiled descriptions are generated into the source tree

Nothing the build reads SHALL be generated except the modules compiled from
descriptions: the game catalog is committed TypeScript source (each game's
`src/games/<id>/catalog.ts`), the per-puzzle icons are a committed snapshot,
and the help pages are committed markdown and descriptions. A module compiled
from a description SHALL be generated into `src/generated/`, which git
ignores, and SHALL NOT be committed.

#### Scenario: No other artifact is generated into the source tree

- **WHEN** the repository is inspected after a build
- **THEN** `src/assets/` holds only committed files
- **AND** `src/generated/` is the only directory under `src/` that `.gitignore`
  names
