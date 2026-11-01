# generate-the-done-clue-sentence

**Status: filed on the owner's word (2026-10-31)**, a follow-up of
`split-adjacent-from-unequal`.

## Why

Five help pages write their own sentence for marking a clue done: Unequal
and Adjacent word for word, Towers and Undead nearly so, Magnets in its own
words (`grep -l "gray it out" src/games/*/*.description.yaml`, 2026-10-31).
`docs/help-pages.md` § "A game's page" says a sentence several pages would
each write is the engine's, rendered from a declaration, as `{{mark-all}}`
and `{{sticky-pencil}}` are. The mark is already declared: each of these
games builds it with `dragMarkVerbs`, which names its noun and the buttons
that make it.

## What Changes

- A placeholder the help build expands from the game's `dragMarkVerbs`
  declaration: what is marked, with which button, and that a drag repeats it.
  A page that owes it and omits it, or writes it for a game without the mark,
  fails the build, as the other generated sentences do.
- The five pages write the placeholder, keeping after it only what is their
  own (Magnets' clues off the grid, the keyboard's way to the clue).

## Acceptance

The five help pages read in the app, each naming its own clue and buttons.
