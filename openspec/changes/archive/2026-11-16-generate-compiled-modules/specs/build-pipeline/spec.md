## REMOVED Requirements

### Requirement: Nothing is generated into the source tree

**Reason**: The compiled modules are generated, never committed, and the gate
no longer holds a committed copy to its description: there is no copy.
**Migration**: Replaced by the three requirements this change adds, which keep
the rest of it as it was.

## ADDED Requirements

### Requirement: Only the compiled descriptions are generated into the source tree

Nothing the build reads SHALL be generated except the modules compiled from
descriptions: the game catalog is committed TypeScript source
(`src/puzzle/catalog-data.ts`), the per-puzzle icons are a committed snapshot,
and the help pages are committed markdown and descriptions. A module compiled
from a description SHALL be generated into `src/generated/`, which git
ignores, and SHALL NOT be committed.

#### Scenario: No other artifact is generated into the source tree

- **WHEN** the repository is inspected after a build
- **THEN** `src/assets/` holds only committed files
- **AND** `src/generated/` is the only directory under `src/` that `.gitignore`
  names

### Requirement: Every command generates the compiled descriptions it reads

Every command that reads a compiled module SHALL generate the modules first,
so that none reports a missing or stale module, and a dev server SHALL
generate them again when a description changes.

#### Scenario: A fresh clone needs no step before a command

- **WHEN** a fresh clone runs `npm ci` and then `npm run typecheck`
- **THEN** the typecheck passes, with no command run between the two

#### Scenario: A description edited in a running dev server

- **WHEN** a description's technique is edited while the dev server runs
- **THEN** its module is compiled again and the game runs the edited
  technique, with no restart

### Requirement: A compiler change shows in a diff

The modules of a few descriptions SHALL be committed as samples that a test
compiles again, so that a change to the compiler shows its effect in the diff
of the commit that carries it.

#### Scenario: A compiler change fails the samples until they are written again

- **WHEN** the compiler is changed so that it emits different code
- **THEN** the samples' test fails until the samples are written again, and
  the commit that carries the change shows their diff
