## ADDED Requirements

### Requirement: Every game's help page has one skeleton, read off the game

Every page under `help/games/` SHALL have the same skeleton: the rules first and
unheaded; then `## Controls`; then any sections of the game's own; then
`## Hints` when, and only when, the game declares `hint()`; and last,
`## <Name> parameters`, where `<Name>` is the game's catalog name.

Which sections a page owes SHALL be derived from the game, never from a list: the
`hint()` declaration decides the Hints section, and `paramConfig` decides what the
parameters section names.

The pages were adopted from two sources in two shapes, and only one of them had a
parameters section at all; the other's parameters lived in a manual that was
deleted for documenting a different program. That is how a mode the Type menu
offers came to be missing from its page.

#### Scenario: A page is missing a section, or has them out of order

- **WHEN** a page's first `##` heading is not `Controls`, or its last is not
  `<Name> parameters`, or `## Hints` is not immediately before the parameters
  section
- **THEN** `src/help-coverage.test.ts` fails, naming the game

#### Scenario: A hinted game has no Hints section, or a hintless one has one

- **WHEN** a game declares `hint()` and its page has no `## Hints`, or declares
  none and its page has one
- **THEN** `src/help-coverage.test.ts` fails, naming the game

#### Scenario: A help-only commit runs the guard

- **WHEN** a commit stages only a page under `help/games/`
- **THEN** the pre-commit hook selects `src/help-coverage.test.ts`, because
  `help/` is outside the documentation-only shortcut and the test selector
  reaches a help page through the file's glob

### Requirement: A game's Hints section teaches its hint marks

A game's `## Hints` section SHALL say what the hint's marks mean in that game,
which of them are the player's own notation and how the player makes them, and the
words the hint's sentences use for its marks. A hint's sentence names its marks
("the hatched and outlined regions", "the ringed dot"), and a player who was never
told what they mean has to decode them on the spot.

The guard checks **presence, not content**: a heading proves a section exists and
nothing about whether it teaches the marks. What a section says SHALL agree with
the game's hint as it narrates and draws, and is held to that by whoever writes or
changes either.

#### Scenario: A hint's marks change

- **WHEN** a change alters what a game's hint draws or the words it uses for a mark
- **THEN** the same change updates that game's `## Hints` section

### Requirement: A game's parameters section names every field its Custom dialog offers

A page's `## <Name> parameters` section SHALL name every field of the game's
`paramConfig` by the label the Custom dialog shows, and every choice of a choices
field that is a word rather than a value. The difficulty field's choices are
exempt, derived from the difficulty item the game already declares: tier names
mean the same in every game, and `help/features.md` says what, once.

This is a content check, and a sound one, because it keys on the labels the dialog
itself renders: a field the dialog offers that the page never names is the gap.

#### Scenario: A game gains a mode the page does not mention

- **WHEN** a game adds a `paramConfig` field, or a word choice to one, and its page
  does not name it
- **THEN** `src/help-coverage.test.ts` fails, listing the names the section owes
