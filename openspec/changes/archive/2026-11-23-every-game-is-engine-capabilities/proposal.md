## Why

A hard decision from the owner, 2026-11-23: all of every game's imperative
code becomes engine capabilities that other games can adopt. A capability
with one user is a full success, provided another game could adopt it by
writing a description; code addressed to one game, which no other game
could use in principle, is what it replaces.

`docs/doctrine.md` already set that end state on 2026-11-21, but three
places still kept an escape from it:

- the doctrine's own bullet on conventions, and `AGENTS.md`'s summary of
  it: a game that does not fit "takes the override… the game writes the
  explicit form";
- `engine-params`' "A params encoding the grammar does not fit stays
  hand-written", whose grammar "SHALL NOT grow an option to absorb a single
  game", and `docs/mechanics.md`, which repeats it;
- the plain-cell family's design ("the game stays hand-written"), which is
  archived and left as the record.

The owner's reasoning, from the review that prompted it: one-off options in
the engine are qualitatively better than game-specific code, because the
next game can use them.

## What Changes

- `docs/doctrine.md` records the decision, and that an adoptable capability
  is one `docs/descriptions.md` can describe without naming its first game.
- The conventions bullet in the doctrine and in `AGENTS.md`: where a
  convention cannot stretch, the engine gains a capability, and the game
  keeps no explicit form of its own.
- `engine-params`: a params encoding the grammar does not fit gains an
  option, written for the shape and not the game. A hand-written codec is a
  game not yet moved.
- `docs/mechanics.md` follows the spec.

Not changed: what is true of the tree today. A game still hand-written is
work not yet done (`docs/doctrine.md`, "A game not yet moved is not a
second way"), and the specs that describe its present code stay true until
the change that moves it.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `engine-params`: the requirement that kept a params encoding hand-written
  becomes one that grows the grammar for it.

## Impact

`docs/doctrine.md`, `AGENTS.md`, `docs/mechanics.md`,
`openspec/specs/engine-params/spec.md`. No code.
