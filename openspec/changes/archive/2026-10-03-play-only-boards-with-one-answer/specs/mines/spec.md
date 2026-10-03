## REMOVED Requirements

### Requirement: Mines does not offer mistake-checking

**Reason**: Check & Save is an answer check in every game, and the owner chose
that meaning for Mines too (2026-10-02): a flag on a square with no mine is a
mistake like a wrong digit, and a player who wants to probe with it can do so in
any game.

**Migration**: Replaced by "Mines checks flags against its mines" below.

### Requirement: Mines ships an explained deductive hint

**Reason**: Its step taking a flag off a square the numbers prove safe, and the
scenario holding it, describe a board the midend no longer asks the hint about:
a flag on a safe square is now a mistake, and the midend refuses a hint until it
comes off.

**Migration**: Replaced by "Mines ships an explained deductive hint from proved
facts" below, which keeps every other clause and scenario.

## ADDED Requirements

### Requirement: Mines checks flags against its mines

Mines SHALL implement `findMistakes`, reporting every flag on a square with no
mine under it, and nothing before the first click lays the mines out. An opened
mine SHALL NOT be reported: the hint's dead-board refusal answers it. The mistake
SHALL be drawn as a frame in the error color around the flagged square, held in
the tile's cache key so it repaints when it comes and goes.

#### Scenario: Check & Save on Mines

- **WHEN** the player invokes Check & Save with a flag on a square that has no
  mine
- **THEN** the flag is framed as a mistake and the board is not saved

#### Scenario: A right flag passes

- **WHEN** every flag on the board sits on a mine
- **THEN** `findMistakes` reports nothing, whether or not the numbers prove those
  mines yet

### Requirement: Mines ships an explained deductive hint from proved facts

Mines SHALL offer a hint that reasons only from what the board proves, the opened
numbers and squares, and never from the player's flags: the midend asks it only
about a board whose flags all sit on mines, but a flag the numbers have not
proved may be a guess, and the hint SHALL NOT teach from it. Each step SHALL name
the number or numbers it reasons from and why the ringed squares must be safe or
must be mines: one number on its own, two numbers sharing squares, a number whose
squares sit inside another's, or the count of mines left. Before the first click
the hint SHALL open a square, saying that no mine is laid in the first square
opened or beside it. On a board whose last move opened a mine, the hint SHALL
refuse and tell the player to undo it; on a board deduction cannot advance, it
SHALL refuse with the collection's deduction-exhausted words.

#### Scenario: A satisfied number frees its other squares

- **WHEN** an opened number already touches all its mines
- **THEN** the hint marks that number and rings its other unopened squares as safe,
  saying so

#### Scenario: A lucky flag is not a premise

- **WHEN** the player has flagged a mine no opened number touches
- **THEN** the hint's first step reads as it would without the flag

#### Scenario: A dead board

- **WHEN** a hint is asked for after the player opened a mine
- **THEN** the hint refuses, telling the player to undo that move
