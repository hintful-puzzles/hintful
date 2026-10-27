## RENAMED Requirements

- FROM: `### Requirement: Hint: A set or a chain that rules a square out as empty strikes its mark`
- TO: `### Requirement: Hint: A set that rules a square out as empty strikes its mark`

## MODIFIED Requirements

### Requirement: Generation: Salad has two difficulties, over the Latin deductions and its border clue's

Salad SHALL offer two tiers. To the shared Latin deductions its solver SHALL
add the border-clue deduction, in ABC End View mode. Easy SHALL be that
deduction and the shared positional and numeric eliminations, and Normal
SHALL add the shared set elimination. Salad SHALL follow no forcing chain at
either tier, since a chain is a search and Salad has no Unreasonable.

#### Scenario: A Normal board genuinely needs the Normal tier

- **WHEN** a board generated at Normal is solved at Easy
- **THEN** the solver does not reach a solution
- **AND** solving the same board at Normal does

### Requirement: Hint: A set that rules a square out as empty strikes its mark

Where a set elimination rules a square out as empty, no count says it, so the
hint SHALL strike that square's "might be empty" pencil mark with the set as
its reason, and SHALL then mark the square as holding a symbol because the
mark is gone from its notes.

#### Scenario: A set holds all of a column's empty squares

- **WHEN** a hint is requested on the Number Ball board
  `5n3Bdx:c2b1aOXbXb3c1OOc`, where three squares of one column can hold only
  one number and the column's two empty squares
- **THEN** the hint returns a plan, a step of it strikes the "might be empty"
  mark from another square of that column and names the set and the column's
  empty squares as the reason, a later step marks that square as holding a
  number, and following the plan solves the board

#### Scenario: The mark is gone from a square's notes

- **WHEN** a square with pencil marks has lost its "might be empty" mark and
  carries no marker
- **THEN** the hint's step marks it as holding a symbol and says the mark is
  not among the square's pencil marks

## ADDED Requirements

### Requirement: Params: Salad refuses a 4×4 of three letters at Normal

When a board is to be dealt at Normal, `validateParams` SHALL refuse an ABC
End View board of order 4 with three symbols, which has no board once Normal
follows no forcing chain, and SHALL accept the same params for a board that
arrives with its description.

#### Scenario: The cell is refused by name

- **WHEN** a board is to be dealt from the params `4n3Ldx`
- **THEN** it is refused with "No 4x4 Letters puzzle with 3 symbols is Normal."
- **AND** a board that arrives with its description under those params opens

### Requirement: Hint: Salad's hint names the "might be empty" mark as X

A sentence that names the "might be empty" mark SHALL print it as the X the
player pencils for it, never as a letter or a number past the board's symbols.

#### Scenario: The empty square is confined across lines

- **WHEN** a set confines the "might be empty" mark of several rows to the
  same columns
- **THEN** the sentence names the mark as X

## REMOVED Requirements

### Requirement: Hint: Salad's hint prints the "might be empty" mark as X

**Reason**: Its one case was a forcing chain running through the mark, and no
Salad hint follows a forcing chain.

**Migration**: "Hint: Salad's hint names the "might be empty" mark as X"
holds the rule for the sentences that still name the mark.
