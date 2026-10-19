## ADDED Requirements

### Requirement: A game's own colors stay clear of the hint's reference colors

No color a game draws its content in SHALL sit near a color a hint's
reference can take, in either scheme, so a repainted mark never reads as
content nor content as a mark. Where one would, the content color or the
pool's shade SHALL move, and no game SHALL choose a pool of its own.

#### Scenario: A Map hint names a region

- **WHEN** a Map hint is shown over regions of all four colors
- **THEN** every reference's color is clear of every region fill, in light
  and in dark
