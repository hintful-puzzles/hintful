# app-shell — delta

## ADDED Requirements

### Requirement: The on-screen key panel never takes keyboard focus

A press on an on-screen key SHALL NOT move keyboard focus. The panel SHALL
suppress the focus a pointer press would otherwise give the key it lands on,
rather than handing focus back afterwards as a command control does.

The panel is an **input surface**, not a control: panel and keyboard are two
spellings of the same keypress, and using one must not switch the other off.
Without this, a single press left the physical keyboard dead in every game with
a keypad until the player clicked the board again — the board listens for
`keydown` on itself, and the stray-key redirect fires only when nothing at all
is focused. The requirement "Pressing a control gives the keyboard back to the
board" did not reach here: the panel carries no `data-command` and sits outside
the chrome whose clicks that rule covers.

The suppression SHALL be on the press rather than the pointer event, because
this frontend already cannot prevent a `pointerdown` from generating a click on
iOS Safari, and touch presses are answered on `touchstart`.

**No behavioral test tier can observe this.** Every one of them delivers input
to the engine directly, so the panel and the keyboard both work in a suite that
is green over a game nobody can type into; the standing guard asserts the
suppression and SHALL say plainly that it is a proxy and where the consequence
was observed.

#### Scenario: A physical key reaches the board straight after an on-screen key

- **WHEN** the player clicks a key on the on-screen panel and then presses a key
  on the keyboard
- **THEN** the keypress reaches the puzzle, with no click on the board in
  between
