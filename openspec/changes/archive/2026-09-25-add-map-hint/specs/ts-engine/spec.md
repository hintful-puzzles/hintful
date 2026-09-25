# ts-engine

## ADDED Requirements

### Requirement: The hint frontier keys on whatever a game's steps act on

`HintFrontier` SHALL take a key naming what a step reads and writes, rather than
assuming a cell of a grid: a grid game SHALL pass `gridKey(w, h)`, under which a
cell off the board keys to nothing, and a game whose elements are not cells SHALL
pass its own. Map's are regions of a graph and key as their index. The continue
rule is unchanged by the key.

A game that takes the frontier directly rather than through the candidate walk
SHALL be derived from its own source and held to an exact ledger naming the guard
that checks its continuity, because the cross-game measurement reads a square
grid and would otherwise leave it out without saying so.

#### Scenario: A graph game continues from the region it just colored

- **WHEN** a Map hint step colors a region and leaves a neighbor with one color,
  and the next step is chosen
- **THEN** the step taken reads a region the last firing wrote

#### Scenario: A new direct user of the frontier is not missed

- **WHEN** a hinting game constructs a `HintFrontier` without walking a candidate
  plan and has no ledger entry
- **THEN** the frontier's cross-game test fails and names it
