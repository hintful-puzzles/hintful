## MODIFIED Requirements

### Requirement: Only the compiled descriptions are generated into the source tree

Nothing the build reads SHALL be generated except what `npm run describe`
writes: the modules compiled from descriptions and the types generated from
the description's schema. The game catalog, the per-puzzle icons and the help
pages are committed. What `npm run describe` writes SHALL go into
`src/generated/`, which git ignores, and SHALL NOT be committed.

#### Scenario: No other artifact is generated into the source tree

- **WHEN** the repository is inspected after a build
- **THEN** `src/assets/` holds only committed files
- **AND** `src/generated/` is the only directory under `src/` that `.gitignore`
  names
