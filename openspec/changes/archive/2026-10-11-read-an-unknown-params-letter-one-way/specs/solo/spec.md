## RENAMED Requirements

- FROM: `### Requirement: Solo decodes its parameters leniently`
- TO: `### Requirement: Solo reads the legacy jigsaw form and a single leading number`

## MODIFIED Requirements

### Requirement: Solo reads the legacy jigsaw form and a single leading number

`decodeParams` SHALL accept the legacy `"{c}x{r}j"` form, in which a `j` after
a seen `r` collapses the rectangle to a jigsaw of edge `c·r`, and SHALL
round-trip the preset list. A leading number with no `x` after it SHALL be
read as both `c` and `r`, and `r2` SHALL be read as the default symmetry. A
`d` followed by no tier letter, and a character the encoding does not use,
SHALL be refused.

#### Scenario: The legacy jigsaw form is read

- **WHEN** `3x3j` is decoded
- **THEN** the params are a jigsaw of edge 9: `c === 9` and `r === 1`

#### Scenario: A jigsaw's one number

- **WHEN** the preset `9jdb` is decoded
- **THEN** the `9` is read as both `c` and `r`, and the `j`, coming after no
  `x`, sets `r` to 1 and leaves `c` at 9
