## ADDED Requirements

### Requirement: A local run sees the tree as it is

A test run SHALL NOT reuse a cached module whose output depends on files other
than its own text. Vitest's module cache keys a module on its own text, so a
module that calls `import.meta.glob` SHALL be kept out of it
(`vite-plugins/glob-cache.ts`), and a file added since the last run SHALL be
seen by every glob that matches it, with no manual step.

#### Scenario: A planted file fails a guard on a warm cache

- **WHEN** a guard that globs `src/games/` has run once, and a file it rejects
  is then added under `src/games/`
- **THEN** the guard's next local run fails on that file
