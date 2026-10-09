# Verdicts: ascent

## reword `ascent`: Ascent grades its difficulty tiers honestly

The first sentence stays: it is what the generator promises of a board, and
the difference from upstream, which never asked the tier below. The second
sentence and its scenario go as `how`. The trap is held at the site, in the
words the spec used: the comment over the probe in
`src/games/ascent/generator.ts` ("The probe gets its own scratch:
`foundEndpoints` persists across solves ... reusing `sc` would ask an
already-weakened solver, under-rejecting, and would leave the probe's state
behind"). A generator that fell into it would deal boards the tier below
solves, which the first sentence forbids and `engine-difficulty` "A cross-game
guard asserts that tiers bind" fails on, Ascent having a difficulty contract.

### Requirement: Ascent grades its difficulty tiers honestly

A board generated above Easy SHALL NOT be soluble at the tier below it, in any
grid mode.

#### Scenario: A board above Easy genuinely needs its own tier

- **WHEN** a board generated above Easy is solved at the tier below it
- **THEN** the solver does not reach a solution
- **AND** solving the same board at its own tier does

## keep `ascent`: Ascent's solver treats the last number like any other

A session changing the solver would check against it. It says which rungs
carry "the last number sits next to the one before it", and so what each tier
means for the end of the path; without it that fact belongs to no rung and a
board is graded harder than it plays, which is the requirement's own last
sentence. That is what a tier means, and it stays.

## edit `ascent`: What Ascent draws

Both halves are things a player sees, so the requirement stays, and the vague
half is made exact. The drawing is the pair of small numbers in a cell's
corners that `updatePathHints` in `src/games/ascent/state.ts` computes and
`render.ts` draws, and `help/games/ascent.md` describes it to the player: "If
a path has only a single number, the endpoints will display one or two smaller
numbers, which represent the numbers which are valid for this cell." No other
requirement states it. That moves are drawn at once is the game's own choice
of look and is left as it is.

from: Rendering SHALL show endpoint candidate hints for a single-number path.
to: Where a drawn path holds only a single number, rendering SHALL show at its endpoints the one or two smaller numbers valid there.

## keep `ascent`: The Type menu has a section for each ruleset

One board for each ruleset and tier, the Hexagon offered only from Normal up
beside the Honeycomb, other sizes left to Custom and the default being the
menu's first line are decisions about what a player is offered, not a copy of
the preset table: the table could hold three sizes a tier and this says it
does not. The first clause does restate `engine-params` "The preset menu gives
each ruleset a section", and it is the subject the rest of the sentence hangs
on, so the requirement stays whole.

## keep `ascent`: The UI_UPDATE tail of interpretMove is kept

The guide is not enough on its own. `docs/games/input.md` § "A button you did
not act on must not be claimed" ("The trap, concretely") tells the story of
the fix as an example of a general rule; this requirement is the refusal that
binds Ascent's code (do not narrow the tail by comparing UI state), and its
scenario is a control rule the guide does not hold: a partly typed number is
committed by a cursor move, Enter or a click.
