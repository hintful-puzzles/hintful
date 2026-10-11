## ADDED Requirements

### Requirement: Same Game refuses an area too large to count

`validateParams` SHALL refuse a `w·h` past the largest whole number the app
counts exactly, in the collection's sentence "Width times height must not be
unreasonably large."

#### Scenario: A height of sixteen digits

- **WHEN** the preset `5x5c3s2` has its height changed to `9007199254740993`
- **THEN** the params are refused with "Width times height must not be
  unreasonably large."

### Requirement: Same Game writes its params whole in both encodings

The short encoding SHALL be the full one: the color count and the scoring
system are part of the board a game ID names, and neither SHALL be left out.
A string with no `c` SHALL decode with three colors, and one with no `s` with
the `(n-2)²` scoring, `s2`.

#### Scenario: A preset, short and full

- **WHEN** the preset `5x5c3s2` is decoded and encoded again
- **THEN** its short encoding and its full one are both `5x5c3s2`

#### Scenario: A size alone

- **WHEN** the `c3s2` is taken off the preset `5x5c3s2`, leaving `5x5`
- **THEN** it decodes as a 5×5 board in three colors scored `(n-2)²`, which
  encodes as `5x5c3s2`

### Requirement: A Same Game title names the colors and the other scoring

A board's title SHALL give its size and its color count, as "5x5, 3 colors",
and SHALL add "alt. scoring" where a group of `n` scores `(n-1)²`, the scoring
that is not the default.

#### Scenario: The other scoring system

- **WHEN** the `s2` of the preset `5x5c3s2` is changed to `s1`
- **THEN** the board is titled "5x5, 3 colors, alt. scoring"
