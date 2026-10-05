## ADDED Requirements

### Requirement: A game page's list of rule modifiers is generated

The help page of a game that declares rule modifiers SHALL write `{{modifiers}}` once, in the unheaded rules at its top, and the help build SHALL replace it with a list generated from the declarations: one line for each modifier, headed by the words a params label says for it and stating its rule. A declaring game's page without the placeholder, and any other game's page with one, SHALL fail the build, and `src/help-coverage.test.ts` SHALL say so first.

A rule a setting adds was explained wherever each page's author had thought to, and for ABCD's diagonal rule and Twiddle's rows-only win that was only the Parameters section.

#### Scenario: A player meets a word in the Type menu

- **WHEN** a preset's title carries a modifier's words, such as "wrapping"
- **THEN** the game's help page has a line headed by those words stating the
  rule

#### Scenario: A page and its game disagree about having modifiers

- **WHEN** a game declares a modifier and its page lacks `{{modifiers}}`, or a
  page carries it and its game declares none
- **THEN** `src/help-coverage.test.ts` fails, naming the page, and the help
  build refuses it
