# Ledger: quick-save

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## A single quick-save slot per puzzle

| Rule | Where it went |
| --- | --- |
| One slot per `puzzleId`, in IndexedDB as a distinct save type, apart from the library and autosave | spec: A single quick-save slot per puzzle |
| Saving overwrites the previous quick-save | spec: A single quick-save slot per puzzle |
| The slot is read back through the library's save codec, with no per-game code | spec: A single quick-save slot per puzzle |
| Scenario: quick-save then quick-load round-trips, and a second save overwrites | spec: A single quick-save slot per puzzle |
| The presence of a slot is observable reactively, for the quick-load control | spec: The presence of a quick-save is observable |
| Scenario: quick-load is disabled with no slot and enabled once one is made | spec: The presence of a quick-save is observable |

## Quick-save keyboard shortcut

| Rule | Where it went |
| --- | --- |
| Cmd/Ctrl+S runs Check & save and the browser's save-page default is prevented while a puzzle is open | spec: Quick-save keyboard shortcut |
| Scenario: Cmd/Ctrl+S triggers Check & save | spec: Quick-save keyboard shortcut |

## Check & save gates the checkpoint on a clean board

| Rule | Where it went |
| --- | --- |
| One control, labeled "Check & save" in every game | spec: Check & save gates the checkpoint on a clean board |
| A game that can check (`canCheck`) is validated through the engine's `check()` and saved only with no mistakes and no dead end | spec: Check & save gates the checkpoint on a clean board |
| Scenario: a clean board is checkpointed | spec: Check & save gates the checkpoint on a clean board |
| On mistakes or a dead end the slot is not written and the previous quick-save stays | spec: A refused Check & save leaves the slot intact and says why |
| The refusal reports the count with the cells highlighted, or the hint's sentence with its cause marked | spec: A refused Check & save leaves the slot intact and says why |
| Scenario: a board with mistakes is not checkpointed | spec: A refused Check & save leaves the slot intact and says why |
| Scenario: a dead end is not checkpointed | spec: A refused Check & save leaves the slot intact and says why |
| A position the hint's search could not settle is saved | spec: A position the hint's search cannot settle is saved |
| Scenario: a position past the search's reach is saved, and the player is told the check could not tell | spec: A position the hint's search cannot settle is saved |
| A game that cannot check gets a plain quick-save from the same control | spec: A game that cannot check gets a plain quick-save |
| Scenario: a game without mistake-checking or a hint still reads "Check & save" and saves directly | spec: A game that cannot check gets a plain quick-save |

## A clean save confirms on its own button; only a refused save interrupts

| Rule | Where it went |
| --- | --- |
| A successful save reads "Saved" with a check mark on the pressed control, then "Check & save" again | spec: A clean save confirms on its own button |
| The control keeps its resting size while it reads "Saved", so no neighbor moves | spec: A clean save confirms on its own button |
| A successful save shows no toast and no modal, the unsettled toast excepted | spec: A clean save confirms on its own button |
| Scenario: a clean save confirms on the button, with no toast or modal and the Bar's controls in place | spec: A clean save confirms on its own button |
| The confirmation is announced through a polite live region, and reports the check where one ran ("No mistakes. Saved." where `findMistakes` ran) | spec: A save's confirmation is announced with the check's result |
| Scenario clause: a screen reader is told the board had no mistakes and was saved | spec: A save's confirmation is announced with the check's result |
| A save the check could not settle says so in a non-blocking toast, announced in place of the confirmation | spec: An unsettled save says so in a toast |
| Scenario: an unsettled save says so without interrupting | spec: An unsettled save says so in a toast |
| The unsettled toast was the owner's decision of a given day | history |
| The control is drawn like the commands beside it, not bordered or outlined | spec: Check & save is drawn like the commands beside it |
| A refused save stays a modal alert that reports nothing was saved and why, because it must interrupt | spec: Only a refused save interrupts |
| Scenario: a refused save still interrupts | spec: Only a refused save interrupts |
| A successful Quick-load is confirmed with a transient, auto-dismissing, non-blocking toast | spec: A successful Quick-load confirms with a toast |
