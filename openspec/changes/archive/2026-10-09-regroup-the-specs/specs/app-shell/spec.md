## ADDED Requirements

### Requirement: The catalog labels a draft

The home screen SHALL label each draft game's row "Draft", beside its name, and
the label SHALL say which features are still to come, by the names a player
knows them by. A draft SHALL stay listed and playable: the label says the game
is not yet complete and hides nothing. Which games are drafts SHALL be
computed from the registered games when the app is built, and SHALL NOT be a
field of the committed catalog.

#### Scenario: A hintless game is labeled

- **WHEN** the home screen lists a game that has no hint
- **THEN** its row carries a "Draft" label saying that Hints are still to come

#### Scenario: A complete game is not labeled

- **WHEN** the home screen lists Palisade
- **THEN** its row carries no draft label

#### Scenario: A draft gains its missing section

- **WHEN** a draft game implements the last section it lacked and the app is
  built
- **THEN** its row carries no draft label, and the committed catalog is
  unchanged

### Requirement: The app shell shows a non-blocking, responsive reference panel

The app shell SHALL render a reference control only when `hasReference` is
true, where "Everything that depends on the game is in the Game controls"
puts it. Activating it SHALL toggle a `<reference-panel>` open and closed like
a disclosure, not a one-shot modal. The panel SHALL be non-blocking and SHALL
keep the board visible and interactive while open, in both of its layouts.

#### Scenario: The control appears only for a reference-bearing game

- **WHEN** the active game reports `hasReference` true
- **THEN** a reference toggle is shown in the Game controls panel; for a game
  reporting false, no such control is shown

#### Scenario: The panel keeps the board interactive and updates live

- **WHEN** the panel is open and the player places or removes a piece on the
  board
- **THEN** the board input is unaffected by the panel, and the panel's
  checklist status reflects the new board without being reopened

### Requirement: The reference panel renders each item and selects on a click

The panel SHALL render each `ReferenceItem` with status-distinct styling,
drawing `pips` as piece faces when present and `label` otherwise, and SHALL
reflect found status live as the board changes. A click on an item SHALL toggle
its selection and call `selectReference` with the item's `key`, or `null` when
deselecting. Selection feedback in the list SHALL be immediate and SHALL NOT
wait on the asynchronous model refresh.

#### Scenario: Clicking an item spotlights it on the still-visible board

- **WHEN** the player clicks an outstanding item in the open panel
- **THEN** the item shows as selected immediately, and the board, still visible
  beside or above the panel, highlights that item's occurrences
- **AND** clicking it again clears the highlight

### Requirement: The board spotlight persists when the reference panel is closed

Closing the panel SHALL NOT clear the board spotlight. Acting on the board
SHALL clear it: a game clears it in `interpretMove` on any board tap. The
Escape key SHALL clear it whether the panel is open, which stays open, or
closed, and clicking the selected item again SHALL clear it.

#### Scenario: The spotlight persists after close

- **WHEN** a reference item is spotlighted and the player closes the panel
- **THEN** the board spotlight remains, so the player can act on it with the
  panel out of the way

#### Scenario: Escape clears the spotlight

- **WHEN** a reference item is spotlighted and the player presses Escape, with
  the panel open or closed
- **THEN** the spotlight is cleared, and an open panel deselects its item and
  stays open

### Requirement: A refused Solve is shown in the help banner

A Solve the engine refuses SHALL show the refusal's own text in the same
transient banner a refused Hint uses, whichever control asked for it, in every
game that offers Solve, including a game with no hint: the banner SHALL NOT
depend on the hint controls being rendered. A Solve that lands SHALL add no
message of its own. The app SHALL NOT rewrite the refusal's wording, which is
the collection's (`ts-engine`, "Solve failures are worded once for the whole collection").

#### Scenario: Solve on an unstarted Mines board

- **WHEN** the player presses Solve on a fresh Mines board, before the first
  click
- **THEN** the banner says there is nothing to solve until the first move lays
  the board out, and the board is unchanged

#### Scenario: A Solve that lands shows no banner

- **WHEN** the player presses Solve and the game's solver solves the board
- **THEN** the board shows the solution and no banner message is added

### Requirement: Solve is ordered with the other queued input

Solve applies a move, so it SHALL be ordered with the other queued input: a
Solve pressed while an Auto-Hint step is being applied SHALL land after that
step, never inside it.

#### Scenario: Solve waits behind a step in flight

- **WHEN** Solve is pressed while a hint step is still being applied
- **THEN** the worker receives the solve only after that step has finished

### Requirement: The chrome does not overflow at a phone width

The puzzle screen's chrome SHALL lay out without horizontal overflow at 390 CSS
pixels.

#### Scenario: A narrow viewport

- **WHEN** the puzzle screen renders at 390 CSS pixels wide
- **THEN** no chrome element overlaps another, and no control's label is
  truncated to fewer characters than it needs

## REMOVED Requirements

### Requirement: A design direction is chosen on sight, before any code

**Reason**: process: it says who decides and in what order the work is done,
and nothing about what the chrome is. No guide stated it (searched `docs/` and
`AGENTS.md` for "design direction", "drawn alternatives" and "on sight";
`docs/doctrine.md` and `docs/work-management.md` have neither), so the `guide`
entry below puts it in `docs/work-management.md` § "What the owner accepts",
where a session reads what waits for the owner.

### Requirement: The catalog labels a draft, and the help gives a section's reason

**Reason**: Reworded in `app-shell` as "The catalog labels a draft". The
title's second half named the rule of the requirement after it, which is now
`help-pages`, "A help page lists what is not in the game, with the game's
reason". The words are unchanged.

### Requirement: A help page lists what is not in the game, with the game's reason

**Reason**: Moved to `help-pages`, with its words.
