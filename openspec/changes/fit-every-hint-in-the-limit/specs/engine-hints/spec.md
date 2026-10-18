## MODIFIED Requirements

### Requirement: A refresh that shrinks a hint step SHALL rewrite its words

When a stored step's marks shrink, because some of what it strikes is already
gone, the step's words SHALL be narrowed to the marks that remain and re-rendered,
so the sentence never names a note the step no longer strikes.

#### Scenario: One of two struck notes is already gone

- **WHEN** a stored step reads "…so 1 and 2 must go" and the 1 has been struck
  by the time it is shown
- **THEN** the refreshed step reads "…so the 2 must go" and rings only the 2

## ADDED Requirements

### Requirement: Every hint step fits the narration limit, with no exceptions

Every hint step's sentence SHALL be within the narration limit the length walk
holds it to, 120 characters, and the walk SHALL list no exception. A sentence
SHALL say what the marks do not show (the premise and the reason) and leave to
the marks and the pills what they show.

#### Scenario: A long sentence fails its commit

- **WHEN** a game's step speaks a sentence over 120 characters on a board the
  length walk deals
- **THEN** the walk fails, naming the game, the rung and the sentence
