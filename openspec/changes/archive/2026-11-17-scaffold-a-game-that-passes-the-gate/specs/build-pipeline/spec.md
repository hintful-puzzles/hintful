## MODIFIED Requirements

### Requirement: npm run describe names what an edit leaves to be done

`npm run describe` SHALL name each technique and dead-end claim with no
soundness verdict for what it reads now, with the command that checks them,
and each verdict in `soundness.json` that no technique or claim reads any
more, and SHALL warn of a binder over the whole board that keeps only
elements near another, naming the local binder. `compile.test.ts` SHALL fail
on a verdict no technique or claim reads.

#### Scenario: A definition is added

- **WHEN** a `define` is added to a description, changing every technique's
  fingerprint
- **THEN** `npm run describe` lists those techniques and the
  `CHECK_GAMES=<game>` command that checks them

#### Scenario: A game replaces the skeleton's techniques

- **WHEN** a game scaffolded from a skeleton renames or drops a technique
  whose verdict the scaffold copied
- **THEN** `npm run describe` names the verdict left behind
- **AND** `compile.test.ts` fails until it is deleted
