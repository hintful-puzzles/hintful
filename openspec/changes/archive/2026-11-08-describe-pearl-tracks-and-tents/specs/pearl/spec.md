## MODIFIED Requirements

### Requirement: Rules: Pearl reports completion and mistakes

The game SHALL report the board solved exactly while its lines are an answer
of `pearl.description.yaml`: one closed loop through every pearl, with every
clue's meaning holding. It SHALL show always-on error marks, flagging
squares of degree greater than two and clue contradictions. A move that leaves
a line with no reciprocal line in the neighboring square SHALL be refused.

#### Scenario: A loop that misses a pearl is not solved

- **WHEN** the lines form one closed loop that leaves a pearl's square empty
- **THEN** the board is not reported solved, and that pearl carries an error
  mark

### Requirement: Solver: Pearl's solver is a certified deduction ladder

Pearl's solver SHALL deduce only, as the ladder `pearl.description.yaml`
states, over the edges alone: at Easy, a square read off its own edges, a
black pearl's turn one axis at a time, its run-on and the run-on it cannot
take, a white pearl that cannot turn or turns opposite, and a closed loop;
at Normal, an edge or a way through a square that would close a loop early.
Each technique SHALL be checked sound on square boards, and a planted defect
of each found unsound.

#### Scenario: A mis-tiered shortcut rung fails

- **WHEN** the early-loop technique is declared at Easy
- **THEN** boards that need it pass as Easy, and the frozen differential fails

#### Scenario: A silenced rung fails

- **WHEN** any technique is removed from the description
- **THEN** the firing census or the frozen differential fails

### Requirement: Hint: One Pearl hint step is one premise of the solver's ladder

A hint step SHALL be one firing of the solver's ladder: a square read off its
own edges, one axis of a black pearl at a time, each of the four pearl rules,
an edge that would close a loop early, and a way through a square that would.

#### Scenario: A black pearl settled on both axes

- **WHEN** a black pearl's own edges settle an edge to its left or right and
  an edge above or below it
- **THEN** the step decides the edges to its left and right alone, and the
  others are a step of their own

### Requirement: Hint: A Pearl hint step rests only on edges and pearls

Every fact a hint step rests on SHALL be an edge the player has drawn or
crossed, or a pearl: the ladder the hint walks SHALL hold nothing but the
edges, so a square's ways through are read afresh from its pearl and its four
edges at every firing.

#### Scenario: A step rests on nothing the player cannot mark

- **WHEN** any step of a hint's plan is taken
- **THEN** every edge it reads is one the player's lines and crosses, or an
  earlier step of the same plan, has decided

### Requirement: Hint: Pearl's hint tries a square, then a pearl, then an early loop

At each step the hint SHALL take, of every firing the ladder could make, the
one that continues from the latest steps, the ladder's order breaking ties: a
square, then a pearl, then a closed loop, all at Easy, and an early loop only
where no Easy technique fires anywhere. It SHALL apply no difficulty cap, so a
board dealt at Easy and one dealt at Normal are hinted in the same order.

#### Scenario: A loop rule waits for the plainer steps

- **WHEN** some square can be read off its own edges and some edge would also
  close a loop early
- **THEN** the step is not the early loop's
