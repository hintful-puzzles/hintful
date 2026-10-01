# word-params-refusals-as-sentences

**Status: implemented and archived (2026-10-01).**

## Why

The Enter Game ID dialog shows a refusal as a sentence, and since
`own-the-player-facing-messages` a description error is one ("This game ID is
too short for its board."). A params refusal is not: `paramsError`'s generated
bounds messages ("Width must be at least 3") and the games' own
`validateParams` messages have no full stop, and some are not sentences at all
("Grid is too big", "Puzzle is too small"). So the dialog's `asSentence` adds
a full stop when one is missing (`src/dialogs/enter-gameid-dialog.ts`). That
patches the symptom at the one place that shows both; the custom-params dialog
shows params refusals too, and patches nothing.

`own-the-player-facing-messages` measured 88 distinct `validateParams` messages
over 46 games (2026-09-30) and kept them per game, because about four fifths are
cross-field rules about one puzzle. That still holds. What does not need a
decision per game is the *form*: a sentence, with a full stop, in one voice.

## What changes

- `paramsError`'s generated messages end with a full stop.
- Every game's `validateParams` messages are full sentences; the ones that are
  fragments are rewritten (by hand: the census is small enough to read).
- A guard reads every string a `validateParams` returns, by shape (a `return`
  in a function of that name or one it calls with `string | null`), and fails
  one that is not a sentence. Keep `AREA_TOO_LARGE` as the exemplar.
- `asSentence` in the dialog is deleted, and the dialog shows the refusal as
  it comes.

## Task 0

Re-take the census of `validateParams` and `paramsError` messages, and of every
place the app shows a params refusal (the Enter Game ID dialog, the Custom
dialog, anything else `paramsError` reaches). **Falsifier:** none needed for
the form; but if a surface shows a params refusal as a fragment by design (a
field-level hint beside a box, say), that surface keeps its own form, and the
change says so rather than forcing a full stop onto it.
