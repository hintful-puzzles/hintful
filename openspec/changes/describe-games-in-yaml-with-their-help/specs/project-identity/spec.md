## MODIFIED Requirements

### Requirement: Player-facing text is this project's own, and the lineage is credited in one place

Every sentence a player reads outside the per-game help pages SHALL be this
project's own writing, in its own voice: the front page, the page titles and
descriptions, the help site's own pages, the unsupported-browser and not-found
pages, and the privacy notes. Text inherited from `puzzles-web` SHALL NOT
survive verbatim on those surfaces. The per-game pages, built from each game's
description, are excluded on purpose and keep upstream's wording.

#### Scenario: A page outside the per-game help is written or revised

- **WHEN** the front page, one of the help site's own pages, the
  unsupported-browser page, the not-found page or the privacy notes is written
  or revised
- **THEN** its text is written for this project, and no paragraph of
  `puzzles-web`'s is carried into it verbatim
