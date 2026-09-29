## ADDED Requirements

### Requirement: The catalog labels a draft, and the help gives a section's reason

The home screen SHALL label each draft game's row "Draft", beside its name, and
the label SHALL say which features are still to come, by the names a player
knows them by. A draft SHALL stay listed and playable: the label says the game
is not yet complete and hides nothing.

The home screen never loads game code, so the drafts SHALL be computed from the
registered games at build time (`virtual:draft-puzzles`) and SHALL NOT be a
field of the committed catalog.

A game's help page SHALL list, in a generated "Not in this game" section above
its parameters, every contract section the game declares not applicable, with
the game's reason. A page author writes nothing for it.

#### Scenario: A hintless game is labeled

- **WHEN** the home screen lists Net, which has no hint and no mistake check
- **THEN** its row carries a "Draft" label saying that Hints and Checking for
  mistakes are still to come

#### Scenario: A complete game is not labeled

- **WHEN** the home screen lists Palisade
- **THEN** its row carries no draft label

#### Scenario: A reason reaches the help page

- **WHEN** Fifteen's help page is built
- **THEN** it has a "Not in this game" section, above "Fifteen parameters",
  naming Checking for mistakes with Fifteen's reason
