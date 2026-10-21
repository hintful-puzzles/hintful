## MODIFIED Requirements

### Requirement: Params: A size is refused at a tier none of its boards need

When parameters are about to deal a board, `validateParams` SHALL refuse a
tier no board of the size needs: Unreasonable below 5×5; Hard below 6×6;
Tricky below 4×4, and below 6×6 with the identity shown; Normal below 4×4, and
at 4×4 with the identity shown. A 6×6 at Hard with the identity shown is rare
and SHALL be dealt (`engine-difficulty`, "A rare tier is dealt under the
deadline").

#### Scenario: A 5×5 has no Hard board

- **WHEN** parameters about to deal a board request a 5×5 at Hard
- **THEN** `validateParams` refuses them, saying no such puzzle is Hard

#### Scenario: The refusal says when hiding the identity brings the tier back

- **WHEN** parameters about to deal a board request a 5×5 at Tricky with the
  identity shown
- **THEN** the refusal names 5×5 puzzles that show their identity
