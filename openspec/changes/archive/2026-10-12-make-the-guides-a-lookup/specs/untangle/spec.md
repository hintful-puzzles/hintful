## MODIFIED Requirements

### Requirement: A clearing step removes the most crossings a searched spot allows

A clearing step SHALL move a vertex not already on its place to a spot that
removes the most crossings among the spots searched: a grid over the whole
play box, the vertex's place in the solved layout, and its neighbors'
centroid. Among spots that remove equally many it SHALL prefer that place,
then the least crowded spot, the frame counting as crowding. Its explanation
SHALL state the crossings the vertex's lines make before and after the move,
counted exactly as the board counts them.

#### Scenario: A clearing step's counts are true

- **WHEN** a clearing step is applied
- **THEN** its explanation tells the moved vertex's crossings before and after,
  the vertex makes fewer crossings afterward, and the board loses exactly the
  difference

#### Scenario: Equal spots go to the solved place, then to the roomiest

- **WHEN** a vertex's place in the solved layout removes as many crossings as
  the best other spot searched
- **THEN** the clearing step moves the vertex to its place
- **AND** where no spot that ties is a vertex's place, the step takes the one
  farthest, by the crowding measure, from the other vertices and the frame
