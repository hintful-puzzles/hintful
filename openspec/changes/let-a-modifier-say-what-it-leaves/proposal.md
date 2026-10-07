# let-a-modifier-say-what-it-leaves

**Status: scaffolded, not started (2026-10-06).** Found while measuring
`let-a-ruleset-say-what-it-offers`, which built the mechanism for rulesets.

## Why

Two rule modifiers leave out a tier, and the Custom dialog offers the tier
anyway and refuses after OK. Read in each game's `validateParams` on
2026-10-06:

- **Group**: with "Show identity" off, Easy is refused ("Easy puzzles must
  have an identity."). Not gated on `full`.
- **Bridges**: with one bridge a line, Tricky is refused ("Tricky needs lines
  that can carry at least two bridges."). Gated on `full`.

A ruleset now declares this with `Ruleset.only`, and the dialog disables what
it does not offer. A modifier cannot.

The other refusals that test a modifier bind a typed number (ABCD's letters,
Guess's colors, Net's and Solo's sizes, Unruly's, Group's 3x3) and are not
this: `let-a-ruleset-say-what-it-offers` declined those, with the reason.

## What is known and what is not

- **The dialog's side is built.** `ConfigDescription.narrowing` is a list of
  deciding fields, `offeredOf` leaves of a field what all of them offer, and
  the form disables on it. A deciding field there is a `choices` field read by
  index; a checkbox would index as 0 and 1, which nothing does yet.
- **Which field gives way: the tier, unless building it shows otherwise.**
  Hidden identity and Easy exclude each other, and either could be the one
  disabled. A modifier is a rule, as a ruleset is, and a ruleset is plainly
  the one that decides: unticking the box with Easy chosen moves the tier to
  Normal in front of the player, grayed as a ruleset's is. Start there, and
  look at it in the app before keeping it.
- **The two differ on `full`.** `onlyError` holds a deal and not a written
  board. Bridges' refusal is the same; Group's holds a written board too, and
  whether it needs to has not been read.
- **The generated sentence is plainer than the two written ones**, which give
  a reason. It would be seen only by someone typing a game ID.

## What Changes

To be designed. The direction: `modifierItem` takes the same `only`, keyed by
the value at which it applies, and `rulesetNarrowing` becomes one of two
sources of a description's `narrowing`.

## Hints to pull in

None.
