## ADDED Requirements

### Requirement: Ascent's Edges hint names a number's own line by its shape

In Edges mode, every hint sentence that rests on a number's own arrow line SHALL
name that line by its shape, as "on its row", "on its column" or "on its
diagonal", in every technique alike, and SHALL name another number's line the
same way ("16's row").

#### Scenario: A neighbor step names the row

- **WHEN** a step places 22 next to 21 because only one square beside 21 is on
  22's row
- **THEN** its sentence says 22 "must sit next to 21, on its row"
