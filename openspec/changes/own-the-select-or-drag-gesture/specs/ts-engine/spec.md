# ts-engine spec delta — own-the-select-or-drag-gesture

## MODIFIED Requirements

### Requirement: A game whose press starts a drag joins the note-taking cell through its tap

A game whose pointer press is the start of a drag — Rome's arrow and pencil
drags, Map's color and mark drags — SHALL join the note-taking cell through its
**tap**: a release that commits nothing SHALL resolve through the engine's press
arm, with the button the gesture used, while the drags themselves keep the
buttons they already had. So the right button needs no exemption where a game
already spends it on a drag: the drag and the tap are different gestures, and
only the tap is the mechanic's. No roster of games whose right button is
"spoken for" SHALL exist.

Such a game carries the mechanic's `Ui` fields and both pencil preferences, and
is held by every guard over the mechanic like any other member — including the
repeat tap and the sticky toggle, which it SHALL answer exactly as a game whose
press is its selection does. **Its press SHALL NOT move, hide or otherwise
change the selection**: a press that may become a drag commits to nothing, and
the selection changes when the gesture resolves. A press that changed the
selection would destroy both facts the release needs — whether the tap landed on
what was already selected, and where a highlight the sticky mode switch must not
move was showing.

The rules SHALL run at the release rather than at the press, because the press
cannot tell a tap from a drag: with sticky pencil mode on the right button's
press arm switches the mode, so running it at the press would flip the mode on
the way into every right-drag.

#### Scenario: The right tap and the right drag in one game

- **WHEN** in Rome or Map the right button is pressed and released on one
  square or region, and separately pressed and dragged to another
- **THEN** the tap selects for notes (or, sticky, latches notes mode), and the
  drag still lays the mark it laid before

#### Scenario: A repeat tap puts the highlight away

- **WHEN** a tap selects a square or region in a game whose press starts a drag,
  and the same tap is repeated
- **THEN** the highlight is put away, as it is in every game whose press is its
  selection

#### Scenario: A sticky right tap leaves the highlight where it was

- **WHEN** with sticky pencil mode on, a right tap in such a game lands on
  something that can take no mark, while the highlight is showing elsewhere
- **THEN** pencil mode switches and the highlight stays exactly where it was

## ADDED Requirements

### Requirement: The engine owns the select-or-drag gesture, and the game supplies only what is about its puzzle

The note-taking cell SHALL provide the two arms a gesture ends in, so that a
game whose press may become a drag writes no selection logic of its own:

- **A release that committed nothing** SHALL resolve through a tap arm that maps
  the release button back to the press it belongs to and then applies the same
  rules a click-select game's press applies. The rules SHALL be the same code,
  not the same intent.
- **A release that committed a move** SHALL resolve through a drag-entry arm
  that moves the highlight to the cell the pointer acted on and puts it away,
  which is what the mechanic already states for an entry the pointer made.

**The identity of what is selected SHALL come from the game, as a convention
with a first-class override.** The tap arm SHALL answer "is the highlight
already on the thing being tapped?" for itself when the game's selection is a
cell, and SHALL accept the game's own answer when it is not. A game whose
selection is a region SHALL NOT be a special case in the engine.

Whether a gesture committed stays the game's: it is a question about the puzzle,
and the collection's two drag games answer it differently for reasons about
their puzzles — Rome by direction (a drag back to the grabbed square is a
cancel), Map by effect (a drop that changes nothing is a tap on the region it
was released over).

#### Scenario: A region selection is compared as a region

- **WHEN** two taps land on different cells of one region in a game whose
  selection is a region
- **THEN** they read as a repeat tap on one selection

#### Scenario: Every member answers one gesture one way

- **WHEN** the collection is swept for the games carrying the mechanic's `Ui`
  fields, and each is driven through its own `interpretMove` with a pointer
  press and release
- **THEN** a repeat tap puts the highlight away in every one of them, unless the
  game answers the re-press some other way and records it, and a sticky right
  tap hides a showing highlight in none of them
- **AND** the sweep reports how many of its taps reached the sticky mode-switch
  branch, so a rule asserted over a sweep that never exercised it fails
