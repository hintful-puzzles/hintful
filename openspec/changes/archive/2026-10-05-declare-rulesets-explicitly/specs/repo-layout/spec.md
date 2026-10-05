## ADDED Requirements

### Requirement: A game page's list of rulesets is generated

The help page of a game that declares rulesets SHALL write `{{rulesets}}` once, in the unheaded rules at its top, and the help build SHALL replace it with a list generated from the declaration: one line for each ruleset, its name and its `rule`. A declaring game's page without the placeholder, and any other game's page with one, SHALL fail the build, and `src/help-coverage.test.ts` SHALL say so first.

The list was hand-written on each page beside a dialog field that named the same puzzles, and Salad's said neither word its menu showed.

#### Scenario: A ruleset's rule is reworded

- **WHEN** a game changes a ruleset's `rule` or `name`
- **THEN** its help page's list says the new words with no edit to the page

#### Scenario: A page and its game disagree about having rulesets

- **WHEN** a game declares rulesets and its page lacks `{{rulesets}}`, or a
  page carries it and its game declares none
- **THEN** `src/help-coverage.test.ts` fails, naming the page, and the help
  build refuses it
