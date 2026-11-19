## ADDED Requirements

### Requirement: The All-the-puzzles table is generated from the catalog

The table on `help/puzzles.md` SHALL be built from the catalog at build time:
one row per cataloged game, sorted by name, with its link, its help link, and
the puzzles it is similar to from the catalog's `similar` field.

#### Scenario: A new game is on the page by being cataloged

- **WHEN** a game is added to the catalog
- **THEN** the All-the-puzzles page lists it, with no edit to `help/puzzles.md`

### Requirement: A site-level help page keeps no list of games by hand

A site-level help page SHALL NOT keep a list of games by hand. A list SHALL be
written by the build from what the games declare, or the page SHALL name games
only as examples of a fact each game's own page states.

#### Scenario: The puzzles with no use for a right-click are the flag's

- **WHEN** `help/features.md` is built
- **THEN** it names exactly the games that declare `ignoresSecondaryButton`
