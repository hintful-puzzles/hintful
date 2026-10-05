# name-a-games-modes-from-one-place

**Status: implemented 2026-10-05.** § "What was measured" and § "What was
built" are the record; the sections between are the scaffold as it was
written, kept for what it guessed. Asked for by the owner on
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

## What was measured

Two readings of the registry, both over every game's `paramConfig`.

**Names per choice.** For every `"choices"` and `"boolean"` item other than
difficulty: the dialog's names, the label's words for each value, and the
menu's section titles. Salad was the only game whose label renamed a choice.
Seismic and Unequal say the choice's own name. Where another choices field
has label `words` (Ascent's grid type, the symmetry fields of Light Up, Solo
and Sticks, Bridges' three), they drop a default or phrase a tail ("no
symmetry"), which is the name in a sentence and not a second name. A
checkbox has no name to say, so its `words` are its only one.

**Names typed into a page.** Every choice name containing a letter, sought in
its game's page as a whole, case-matched word: 24 places in five pages.
Ascent says "Edges" nine times, Flip "Crosses" twice and "Random" once, Salad
its two puzzles five times, Seismic "Tectonic" twice, Unequal "Adjacent"
twice. The other hits were the game's own name (Cube, Seismic, Unequal).
Every hit was a page naming the choice, none an ordinary use of the word,
which is what makes a scan of the prose a usable guard here. Loopy, Solo and
Keen, which the scaffold named as next to read, type no choice's name.

Ascent also kept a second array of three of its grid types' names for its
labels, beside the one the dialog reads.

## What was built

- **Salad's modes are Letters and Numbers** (owner). The help says once each
  that they are the puzzles called ABC End View and Number Ball.
- **No short-and-full declaration.** With Salad on one name no game has two,
  so the type refuses label `words` on a `lead` choices item instead.
- **`{{choice:<kw>:<index>}}`**, keyed by index and not by name: a
  placeholder that spelled the name would have to be edited on a rename,
  which is the copy this change removes. The index is the value the field's
  `get` already returns, and reordering `choices` would break the params
  codec before it broke a page.
- **The guard is the scan above**, in `help-coverage.test.ts`, leaving out
  the game's own name and the tier names. Seen red three ways: Salad's page
  before it moved, a typed name planted in Flip's, and an index past the end
  planted in Unequal's, which the build refused too.
- **The ruleset is an entity the engine reads** (owner, mid-change: presets
  of different rulesets are not to be intermixed, and is that defined
  anywhere?). It was not: the `lead` slot only placed a word. `rulesetItem`
  names it and `presetMenu` gives each ruleset a section, so Seismic and
  Unequal, which interleaved two puzzles in one list, are sectioned, and
  Salad's hand-written sections are gone. The params-stability snapshot moved
  for those two games in label and order only: the multiset of title and
  encodings is unchanged.
- **Sentences in the games' code** that named a mode read the array now
  (Ascent's refusals and hint legend, the size docs of Seismic and Unequal).

Left to `review-preset-counts-across-the-catalog`: a leaf inside a section
still repeats the section's word ("Letters: 5x5 A~C Easy" under Letters).
Ascent's Edges is a `kind` with a hand-written section; whether it is a
ruleset is a question for that review, since making it one would put its
word in front of every Edges title.

## Hints to pull in

None.

## What would show it worked

Renaming a mode in one game's `paramConfig` changes the dialog, the picker
and the help together, and a help page that spells a mode's name by hand
where a placeholder could say it fails a check.
