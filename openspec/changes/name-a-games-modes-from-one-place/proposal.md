# name-a-games-modes-from-one-place

**Status: scaffolded, not started (2026-10-05).** Asked for by the owner on
reading Salad's help beside its picker: *"the help text is not consistent
with the category names … I wonder if we should also scaffold a change to see
about the help text using a placeholder to get the type category rather than
write it manually."*

## Why

Salad named its two modes three ways, each typed out by hand:

- the Custom dialog's choices: "ABC End View" and "Number Ball"
  (`salad/state.ts`, `paramConfig`'s `game-mode`);
- the params label, and so every preset title and the type chip: "Letters"
  and "Numbers" (the same item's `label.words`);
- the help page's rules: "ABC End View mode" and "Number Ball mode"
  (`help/games/salad.md`), which is upstream's wording.

A player who picks "Letters" from the menu and opens the help finds no
"Letters" on the page. The interim fix, 2026-10-05, wrote both names into the
help by hand ("Letters, the puzzle called ABC End View"), which is a third
copy made consistent, not a copy removed.

The parameters half of a help page is already generated: `{{parameters}}`
expands from `paramConfig` (`vite-plugins/parameters.ts`), so the Custom
dialog and the help's field list cannot disagree. The prose above it is
free text, and a mode's name in it is a typed-out value: the grep that finds
the constant does not find it (AGENTS.md § "Method", "a grep for a
constant's *name* is blind to a copy that spells out its *value*").

## What is known and what is not

- **Salad is the one game measured.** Whether another game's help names a
  mode differently from its picker has not been checked. The population to
  read is the games with a `"choices"` or `"boolean"` item that carries a
  `label`, since those are the words a menu shows: Seismic (Seismic,
  Tectonic) and Unequal (Unequal, Adjacent) have a `lead` label and say the
  choice's own name, so their picker and dialog agree by construction; their
  help prose is typed. Loopy's tilings, Ascent's grids, Solo's variants and
  Keen's modes are the next to read.
- **Salad's two names for one mode may be the defect, more than the help.**
  A label that says the choice's own name (`label: { slot: "lead" }` with no
  `words`, as Seismic's) cannot disagree with the dialog. Which pair Salad
  keeps, the puzzles' names or the plain words, is the owner's.

## What Changes

To be designed; two parts, the second depending on the first.

- **One name a mode.** A game's mode is called one thing in the dialog, the
  label and the section title, from one declaration the engine reads. Where
  a game wants a short word in a title and a full name in the dialog, that is
  two fields of the one item, not two unrelated strings.
- **The help reads it.** A placeholder a page writes where it names a choice
  (something like `{{choice:game-mode:Number Ball}}`, the form to be
  designed), expanded by the help build from `paramConfig` and failing the
  build when it names a choice the game does not have. Or, where a page lists
  its modes as bullets, the list itself is generated and the page supplies
  each mode's sentence keyed by the choice.

`help-coverage.test.ts` already holds a page to the dialog's labels in its
parameters section. Its reach into the prose is the thing to extend: a page
that names a mode in words the game does not use should fail.

## Hints to pull in

None.

## What would show it worked

Renaming a mode in one game's `paramConfig` changes the dialog, the picker
and the help together, and a help page that spells a mode's name by hand
where a placeholder could say it fails a check.
