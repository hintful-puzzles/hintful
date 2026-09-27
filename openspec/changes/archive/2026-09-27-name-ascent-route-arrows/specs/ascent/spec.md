## ADDED Requirements

### Requirement: Ascent's Edges hint says when the arrows fix a run's route

When a hint step places a whole run along its only route in Edges mode, and
counting the run's routes with the arrows ignored finds more than one, the step
SHALL outline the arrows of the run's numbers, and its sentence SHALL say that
the arrows leave only that route whenever that fits in 120 characters. It SHALL
NOT make that claim when the count without arrows finds the same one route, or
gives up.

#### Scenario: The arrows keep a run on one side

- **WHEN** a run's numbers could go around either side of a placed number, but
  their arrows' lines allow only one side
- **THEN** the step says that with each number on its arrow's line the run has
  only one route, and outlines those arrows
