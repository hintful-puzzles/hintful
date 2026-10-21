## ADDED Requirements

### Requirement: The page ends a deal at the deadline

The page SHALL end a deal's worker a little after the engine's deal deadline
and answer as for a deal that found no board, so that no game's deal outlasts
the deadline, even where one search inside the generator runs past it.

#### Scenario: A search that never answers

- **WHEN** a New game waits on a deal whose generator does not return
- **THEN** a little after the deadline the deal's worker is ended, and the
  player is told no board of the type was found, in the engine's sentence

### Requirement: The wait for a board says how long it has run

While the app says it is looking for a board it SHALL show how long the wait
has run, and what is known of how long it will be: how long the last board of
the type took where one was found this visit, and the deadline where none
was. The running time SHALL NOT be read out each time it changes.

#### Scenario: A first deal of a type

- **WHEN** the app has been looking for a board of a type for a second and has
  found none of it this visit
- **THEN** it shows the time waited so far and the deadline as the most it
  will be

#### Scenario: A type found before

- **WHEN** the app is looking for a board of a type it found one of earlier
  this visit
- **THEN** it shows the time waited so far and how long the last one took
