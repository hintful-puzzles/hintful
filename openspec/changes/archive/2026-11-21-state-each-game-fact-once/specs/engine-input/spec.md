## MODIFIED Requirements

### Requirement: A declaring game hands its buttons to the engine

A game declaring `targetVerbs` SHALL hand the buttons it does not handle
itself to the engine's `interpretTargetVerbs`, and its help page SHALL carry
the Controls paragraph generated from the declaration. A game whose verbs are
all its input SHALL write no `interpretMove`: the engine's
`playedByTargetVerbs` declares the verbs and the `interpretMove` together.

#### Scenario: The help cannot describe a key the game does not bind

- **WHEN** a declaring game's help page is built
- **THEN** its Controls section carries the paragraph generated from its
  verbs, and a page carrying the placeholder for a game that declares none
  fails the build

#### Scenario: A game with no arms of its own

- **WHEN** a game's input is its verbs and nothing else
- **THEN** its `Game` literal spreads `playedByTargetVerbs(targetVerbs)` and
  declares no `interpretMove` of its own
