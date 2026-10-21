## MODIFIED Requirements

### Requirement: Params: Sokoban deals no level past the area its search can open

Sokoban SHALL refuse to deal a level on a board of more than 1200 squares, with a sentence
that names the limit and says the hint seldom finishes a larger one, since past it a deal
mostly runs its tries out on levels the search gives up on and ends on a level the hint
cannot open. The refusal SHALL bind dealing only.

#### Scenario: A board past the limit is refused when dealing

- **WHEN** the Custom dialog or a type link asks for a board whose width times height is
  more than 1200
- **THEN** no level is dealt and the refusal says the limit
