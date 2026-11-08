## ADDED Requirements

### Requirement: A board may be any tiling

A description SHALL be able to state its board as a tiling, with the answer on its edges: its cells SHALL be the tiling's dots, and its faces and angles (two edges side by side round a dot) SHALL be sorts a technique reads, with a clue sitting on a face. The compiler SHALL refuse the rectangle's geometry on it, the game SHALL build the space from its grid, and the soundness checker SHALL check each technique on small tilings.

#### Scenario: A Loopy clue on a hexagon

- **WHEN** Loopy's compiled ladder counts a clue on a honeycomb board
- **THEN** it reads the clue at the face and the face's six edges and angles from the tiling's space

### Requirement: An edge mark may sit on the angles

A mark on edges SHALL be able to sit on the angles instead, its candidates the values its meaning may take there, read and struck as an edge mark is. An angle's index SHALL name the same two edges as the player's note of that index, so a note seeds the mark and a narrowed mark is placed as that note.

#### Scenario: A player's corner note

- **WHEN** a player has noted a Loopy corner as needing a line and asks for a hint
- **THEN** the ladder starts with 0 struck from that angle's mark

### Requirement: Two edges may be known alike or opposite

A description SHALL be able to declare a relation over the edges, each pair unrelated, alike or opposite, that a technique reads and concludes. The marks SHALL keep the relation closed, so two edges related through a chain read as related, and the hint SHALL be able to name the chain's links.

#### Scenario: A chain of pairs

- **WHEN** edge a is noted alike b, and b opposite c
- **THEN** a technique reading a and c reads them as opposite, and a hint citing that pair places its links one at a time

### Requirement: Loopy runs its compiled ladder

Loopy's solver, generator, hint and Solve SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung. The hint SHALL walk the same ladder, keeping a firing that only notes a corner or relates two edges as a fact it places as a note where a line cites it.

#### Scenario: A Hard board's pair

- **WHEN** a Hard Loopy board's hint settles an edge from a pair of edges
- **THEN** the step is a firing of a compiled technique, the pair a fact a compiled technique related, and the board was graded at Hard by the compiled ladder
