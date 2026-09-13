# reach-the-custom-dialog-from-the-rail

**Readiness: scaffolded 2026-09-13, not started.** Found in the browser while
verifying `spell-absence-one-way` (task 4.4). Both defects below were reproduced
in Chromium on that date and their causes read in the code; re-check before
building on either.

## Why

### "Custom type…" throws from the wide layout's rail

On a wide window, choosing **Custom type…** from the Type chips in the rail opens
nothing and raises an unhandled rejection, shown in the error dialog:
"launchCustomDialog() can't find puzzle-context container". Reproduced on Abcd.

`PuzzleTypeMenu.launchCustomDialog` (`src/puzzle/components/type-menu.ts`) finds
the container it appends the dialog to with `this.closest("puzzle-context")`.
`closest` does not cross a shadow root, and the rail renders its
`<puzzle-type-menu>` inside its own shadow DOM (`src/puzzle/components/rail.ts`,
`renderHeading`), so the lookup returns `null`. The Type menu that
`src/screens/puzzle-screen.ts` renders directly inside `<puzzle-context>` works:
at phone width the same choice opens the dialog, and an invalid width is refused
with the game's message. The rail's placement arrived with `9b5093cf`.

### The Custom dialog's title is the game's id

The dialog opened at phone width is titled **"abcd"**, because
`Midend.getCustomParamsConfig` sets `title: this.game.id`. Every game shows its
lowercase id there rather than its name.

## What changes

- The type menu finds its `<puzzle-context>` through the composed tree (or is
  handed the container), so the dialog opens from the rail and from the
  phone-width header alike; a component test covers the menu rendered inside a
  shadow root.
- The dialog is titled with the game's display name. The wording a player reads
  is the owner's to accept, so it is run in the app and shown.

## What this does not do

- It does not change what the Custom dialog edits or validates.
