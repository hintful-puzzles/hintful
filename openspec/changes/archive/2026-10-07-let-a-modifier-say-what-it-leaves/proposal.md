# let-a-modifier-say-what-it-leaves

**Status: built (2026-10-07).** Found while measuring
`let-a-ruleset-say-what-it-offers`, which built the mechanism for rulesets.

## Why

Two rule modifiers leave out a tier, and the Custom dialog offered the tier
anyway and refused after OK. Read in each game's `validateParams` on
2026-10-06:

- **Group**: with "Show identity" off, Easy was refused ("Easy puzzles must
  have an identity."). Not gated on `full`.
- **Bridges**: with one bridge a line, Tricky was refused ("Tricky needs lines
  that can carry at least two bridges."). Gated on `full`.

A ruleset declared this with `Ruleset.only`, and the dialog disabled what it
did not offer. A modifier could not.

The other refusals that test a modifier bind a typed number (ABCD's letters,
Guess's colors, Net's and Solo's sizes, Unruly's, Group's 3x3) and are not
this: `let-a-ruleset-say-what-it-offers` declined those, with the reason.

## What Changes

- `modifierItem` takes `only`: a checkbox's applies at the value its rule
  does, and a choice's is keyed by choice index. The readers of an `only`
  moved from `ruleset.ts` to `engine/only.ts`, which takes rulesets and
  modifiers as two sources of one list of deciding values.
- `ConfigDescription.narrowing` carries one entry per deciding field, and a
  checkbox is one, indexed off then on. The form re-shows the narrowed fields
  when a checkbox that decides changes, as it did for a choice.
- Group and Bridges declare theirs. Their two `validateParams` branches are
  gone, with Bridges' `doc` sentence and half of Group's `note`.

## What was decided

- **The tier gives way to the modifier, in both games.** Looked at in the app
  on 2026-10-07: unticking "Show identity" with Easy chosen grays Easy and
  shows Normal, ticking it again returns Easy, and OK deals "6x6 Normal,
  identity hidden". Choosing 1 bridge with Tricky chosen grays Tricky and
  shows Normal. It reads as a ruleset's narrowing does, so it is kept.
- **Group's refusal does not need to hold a written board.** `git log -S`
  lands on the port commit, and upstream's `group.c` has the same check with
  no `full` test: it was carried over, not chosen. Nothing reads a written
  board's tier, so an identity-hidden `:desc` ID tagged Easy now opens. That
  accepts more than before and refuses nothing it accepted.
- **The generated sentences name the modifier by its label and value**:
  "Difficulty must be Easy or Normal while Max. bridges per direction is 1."
  A ruleset's keeps "for Edges". The help entry for the narrowed field says
  "While Show identity is off, only Normal, Tricky, Hard and Unreasonable are
  offered."
- **A deciding field is narrowed by none.** A form works a field's offer out
  from the values as chosen, in one pass, so a chain would show one thing and
  submit another. The declaration throws. So does a pair of deciding fields
  that leaves nothing of a third, which a ruleset beside a modifier can now
  write.

## What replaces what was dropped

The two written sentences gave a reason; the generated ones give the fact.
The reason stays as a comment at each declaration, and a refusal is now seen
only by someone typing a `#seed` game ID, since the dialog cannot submit it
(`only.test.ts`, which was seen to fail for Group with a checkbox decider
ignored).

## Hints to pull in

None.
