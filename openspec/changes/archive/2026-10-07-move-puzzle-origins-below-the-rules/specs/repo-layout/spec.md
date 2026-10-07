## MODIFIED Requirements

### Requirement: Every game's help page has one skeleton, read off the game

Every page under `help/games/` SHALL have the same skeleton: the rules first and
unheaded; then `## Controls`; then any sections of the game's own; then, when
the page credits its puzzle, `## Where the puzzle comes from`; then `## Hints`
when, and only when, the game declares `hint()`; and last,
`## <Name> parameters`, where `<Name>` is the game's catalog name.

Which sections a page owes SHALL be derived from the game, never from a list: the
`hint()` declaration decides the Hints section, and `paramConfig` decides what the
parameters section names.

A puzzle's inventor, its other names and a link to more of it SHALL be under the
origins heading and nowhere else on the page. The heading SHALL read
`## Where the puzzles come from` for a game that declares rulesets, which is
several puzzles, and `## Where the puzzle comes from` for any other.

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

#### Scenario: A page's origins section is misplaced or misnamed

- **WHEN** a page has an origins heading that is not immediately before
  `## Hints` (or before the parameters section, on a hintless game's page), or
  that is the singular on a page whose game declares rulesets, or the plural on
  one whose game does not
- **THEN** `src/help-coverage.test.ts` fails, naming the game

#### Scenario: A credit is left in the rules

- **WHEN** a page says who invented its puzzle, who designed it, what it is
  known as or what it is an implementation of, anywhere outside its origins
  section
- **THEN** `src/help-coverage.test.ts` fails, naming the game and the words it
  found
- **AND** a credit phrased in none of those words passes, since the words are
  the only thing a test can tell a credit by

#### Scenario: A help-only commit runs the guard

- **WHEN** a commit stages only a page under `help/games/`
- **THEN** the pre-commit hook selects `src/help-coverage.test.ts`, because
  `help/` is outside the documentation-only shortcut and the test selector
  reaches a help page through the file's glob
