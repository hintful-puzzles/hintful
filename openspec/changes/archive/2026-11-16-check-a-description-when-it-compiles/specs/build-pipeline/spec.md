## ADDED Requirements

### Requirement: npm run describe holds a description's wordings to the render's rules

`npm run describe` SHALL check every form of every wording a description
states against the rules the render applies, read from the same lists: place
words and role words outside a reference, retired phrases, and references that
name no mark. It SHALL report every finding in one run, naming the file and
the wording, and SHALL fail on any.

#### Scenario: A place word in one form of an if

- **WHEN** a wording says "there" outside a reference in one form of an `if`
- **THEN** `npm run describe` fails, naming the wording and the word, though
  no board has spoken that form

### Requirement: npm run describe names what an edit leaves to be done

`npm run describe` SHALL name each technique and dead-end claim with no
soundness verdict for what it reads now, with the command that checks them,
and SHALL warn of a binder over the whole board that keeps only elements near
another, naming the local binder.

#### Scenario: A definition is added

- **WHEN** a `define` is added to a description, changing every technique's
  fingerprint
- **THEN** `npm run describe` lists those techniques and the
  `CHECK_GAMES=<game>` command that checks them
