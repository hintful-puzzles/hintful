# magnets — delta

## MODIFIED Requirements

### Requirement: Magnets flags mistakes against the unique solution

Because a generated Magnets board is uniquely solvable, the game SHALL
implement `findMistakes`: re-solve from the dominoes and row/column counts to
the unique solution and return every player-set cell whose content contradicts
it, and every cell of a domino marked not-neutral (`?`) that is neutral in the
solution. The `?` is checked because the hint reads it as a fact, and a mark the
hint reasons from has to be one the mistake check vouches for. Empty cells, and
a `?` on a domino that is a magnet in the solution, SHALL never be flagged; a
board that is not uniquely solvable SHALL yield no mistakes. The renderer SHALL
overlay the flagged cells distinctly from the always-on live error highlighting
(two touching identical terminals, and over/under-committed clue counts, shown
in red per upstream `check_completion`).

#### Scenario: A wrong placement is flagged

- **WHEN** the player sets a domino to a polarity the unique solution
  contradicts, without yet violating adjacency or a count
- **THEN** `findMistakes` includes that cell and Check & Save refuses to save

#### Scenario: A `?` on a neutral domino is flagged

- **WHEN** the player marks `?` on a domino that is neutral in the unique
  solution
- **THEN** `findMistakes` includes its cells, and the hint refuses until the
  mark is fixed

## ADDED Requirements

### Requirement: Magnets offers an explained hint

Magnets SHALL implement `hint` as the recording projection of its graded
solver: the same ladder, run one firing at a time from the player's board, each
firing narrated with the premise that forced it. The hint SHALL start from the
player's placed dominoes and `?` marks, and SHALL refuse on a solved board or
one with mistakes.

A firing that places dominoes SHALL be one journey of placement legs, and one
that concludes dominoes cannot be neutral SHALL be one journey of legs that mark
them `?`, so every "cannot be neutral" fact a later step rests on is on the
board. A firing that concludes only that a square cannot hold + or − SHALL
advance the plan without being shown, because the board already says it: every
such fact follows from a placed pole beside the square, a line whose count is
met (counting each marked magnet lying along it as one + and one −), or the
same fact about the domino's other end, and a later step citing one SHALL name
it in those terms.

Following a leg through the game's own press cycle SHALL keep the plan: the
press on the way to the leg's value (a + before a −, neutral before a `?`) holds
the leg, and the press that lands it completes the leg.

#### Scenario: The hint finishes the board

- **WHEN** the player asks for hints on a fresh board of any preset and follows
  every step
- **THEN** the board is solved without a refusal

#### Scenario: A hidden fact is one the board shows

- **WHEN** the solver, run one firing at a time, rules + or − out of an
  undecided square
- **THEN** that square touches the same pole, lies in a line whose count for it
  is met counting marked magnets, or has a partner of which the same holds for
  the opposite pole

#### Scenario: Placing a − through its cycle keeps the plan

- **WHEN** a leg asks for a − and the player presses the square once, making it
  a +
- **THEN** the leg is held, and the second press completes it
