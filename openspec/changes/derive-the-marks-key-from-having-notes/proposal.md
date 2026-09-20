# derive-the-marks-key-from-having-notes

## Why

**Rome and Map take notes and had no way to reach them from the screen**, and
had not for their whole lives (owner-reported 2026-09-21, on Rome, right after
its hint shipped). A note-taking game's Marks key is a touch player's only way
into the mode: the alternatives are a right-click, which a touch player does not
have, and the app's long-press fallback, which in a drag-driven game is already
the start of a drag.

**The guard that existed to prevent this could not see them.**
`pencil-mode-key.test.ts` derived its population as
`typeof ui.pencilMode === "boolean"` — a **name**, so it found only the games
that had spelled the mode that way — and read the keypad from
`game.requestKeys` rather than from the `Midend` the app actually renders. Both
games were outside the population and the file was green over them. That is
`AGENTS.md` § "A scan that keys on a name finds only the games that were named
that way", in the guard whose whole job was this rule.

Censused 2026-09-21 over the live registry: **15 games take notes, 13 had the
key, Rome and Map did not.**

## What changes

**The engine appends the key, so the discrepancy becomes unreachable rather
than merely detectable** (owner: *"change the engine notes functionality to make
it impossible for this discrepancy to occur in the future"*).

- `Midend.requestKeys()` appends `pencilModeKey` to any game that takes notes.
  The keypad the app renders is this one, so a game **cannot** ship notes
  without the key — however it spells its own mode, and whether or not it has a
  `requestKeys` at all.
- `takesNotes(state, ui)` is the one definition of the population, read off what
  a game *is*: a `pencil` array on its board, or the collection's `pencilMode`
  flag on its `Ui`. The union is exact rather than a convenient over-reach —
  Loopy and Slant take notes with no `pencil` array (their marks are edge and
  line states) and are known by the flag. The engine and the guard read the same
  function, so they cannot disagree about who is in.
- **The thirteen games stop listing the key themselves**, so there is one
  source. Loopy and Slant listed *only* that key, so their `requestKeys` is gone
  entirely.
- **Rome and Map gain `pencilMode`**, and with it the collection's obligations:
  the key toggles it, the mode makes an ordinary drag lay a mark, and the
  canvas grows for the pencil-mode indicator so a sticky mode is never invisible.
  Neither was contorted to fit — Rome's mode picks which `MOUSEMODE_*` a press
  starts, and Map's supplies the `altButton` its `drop` already took.

The guard is rewritten to ask the two questions that can still be answered
wrongly: does the derivation see every game that takes notes, and does the key
*do* anything when pressed. Its exemption ledger is **empty**.

## What this does not do

- **Not a new declaration.** A game does not say it takes notes; it is seen to.
  A `Game.hasNotes` boolean would be the same defect one level up — forgettable
  by a new game, left behind by a changed one, with nothing noticing.
- **Not a change to how any of the thirteen games behave.** Their rendered
  keypads are byte-identical; only who appends the last key moved.
