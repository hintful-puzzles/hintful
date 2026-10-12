# order-and-shrink-the-game-specs

**Status (2026-10-12): the order is done and held by the gate. The owner has
chosen the cut, option C amended (`design.md` § "The owner's answer: C,
amended"), and it is task 3, not yet started.** Fourth
of the pieces of `fit-a-new-game-in-one-session`. Figures were measured
2026-10-12; `design.md` corrects two of this page's: the share of a spec that
is a second copy is about a quarter, and the order of a hint's rungs is not
one of the declarations a spec restates.

## Why

The 57 game specs are 1.39 MB, with a median of 24 KB, 33 requirements and
44 scenarios. They cover the same subjects, and three things about them are
not settled:

- **No order.** A spec is one flat list in the order its requirements were
  added. Clusters states its parameters in its second requirement and their
  letters in its seventeenth. The hint's requirements are split by other
  subjects in 51 of 57 specs, so a session working on a hint reads the file.
- **Nothing holds what a spec owes.** `state-what-a-games-spec-never-did`
  derived that from the registry in a throwaway test and closed 449 gaps.
  The next game's spec is held to nothing.
- **Much of a spec restates what the game declares.** The params letters,
  the preference keys, the keys a control answers and the order of the
  hint's rungs are each a declaration the engine consumes, written out
  again in prose that no check reads against it. That is the second copy
  `docs/doctrine.md` § "One source of truth" warns of, and a new game owes
  some 24 KB of it. The owner's word (2026-10-12): "if we can simplify it,
  we should."

## What Changes

- **A game spec states what the code cannot**: the rules of the puzzle and
  what counts as solved; what a save or a shared link depends on, as a
  promise (the encoding's grammar and what is refused, not a copy of a
  table); what each control is for; what each hint technique concludes and
  from what, and the wording rules; what a tier means and what the
  generator promises; a look or a divergence that is the game's own.
- **What the game declares is not restated.** Which requirements that
  removes is decided per kind of requirement, on a sample, before any is
  cut, and the cut is the owner's to accept because the specs are what a
  change is checked against.
- **One order of subjects in every game spec**, that of
  `docs/new-game.md` § "What a game's spec holds", each requirement's
  title leading with its subject. The 57 are reordered without a word of a
  requirement's body changing.
- **A gate check derives what a spec owes from the `Game` object** and
  holds the order, so the 58th game is held to what the 57 are.

## Capabilities

`repo-layout` gains the order and the check that holds it. Every game
capability was retitled and reordered in place, since a delta cannot say
order (`design.md` § "How the 1,943 were filed").

## Impact

`openspec/specs/<game>/spec.md` for every game, `scripts/checks/`,
`docs/new-game.md` § "What a game's spec holds", citations of a
requirement by title.
