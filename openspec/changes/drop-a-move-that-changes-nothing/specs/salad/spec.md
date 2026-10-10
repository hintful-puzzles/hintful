## ADDED Requirements

### Requirement: Salad refuses an entry on a given, and a marker its square contradicts

A square the puzzle filled with a symbol or a cross SHALL take no entry. An
empty marker on a square whose clue is a ball SHALL be refused in either mode,
since that square is not empty. A penciled not-empty marker on a square marked
empty SHALL leave the square as it is. A penciled symbol or empty marker SHALL
toggle its mark.

#### Scenario: An empty marker on a given cross

- **WHEN** the keyboard cursor is on a given cross and the empty marker's key is
  pressed
- **THEN** no move is made

#### Scenario: An empty marker on a ball

- **WHEN** the keyboard cursor is on a square whose clue is a ball and the
  empty marker's key is pressed, with notes mode on or off
- **THEN** no move is made

#### Scenario: A penciled not-empty marker on a square marked empty

- **WHEN** notes mode is on, the cursor is on a square marked empty, and the
  not-empty marker's key is pressed
- **THEN** the square stays marked empty and Undo gains nothing

## REMOVED Requirements

### Requirement: A Salad move that would not change the board is a no-op

**Reason**: Restated as "Salad refuses an entry on a given, and a marker its square contradicts", which keeps what is Salad's own: the given that takes no entry, with the scenario "An empty marker on a given cross" word for word, the ball that refuses the empty marker, the penciled not-empty marker on a square marked empty, and the penciled symbol or empty marker being a toggle. That re-entering what a square holds, or clearing a square with nothing to clear, costs no step of Undo is `ts-engine`, "A move that leaves the board as it was is no step of the history". The title and the scenario "Re-entering what a square holds leaves no history" said only that, so the title changes and that scenario is replaced by two about what remains.
