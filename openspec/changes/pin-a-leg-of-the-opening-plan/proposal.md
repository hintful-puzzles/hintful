# pin-a-leg-of-the-opening-plan

**Status: scaffolded, not started (2026-10-04).** A follow-up from
`move-the-hint-scans-onto-the-harness`.

## Why

`describeHintPins` pins what a plan **opens** with. Some sentences are only
ever a later leg: after the first step is played, the recompute explains the
same square by another rung, so the sentence never opens a plan. Measured
2026-10-04 by the scans that looked for them:

- Rome's "This area now has": 0 of 1,823 opening steps.
- Salad's "The N just placed": 0 of 966.
- Slant's equivalence sentence: 0 of 2,456.

Each stays outside the harness, as a `hintUntil` on a literal board with the
count beside it, so nothing finds it again if the board stops saying it. Two
more games met the same thing and worked around it with a predicate that
asks the hint again inside the kind and looks along the plan: Tents (the
four line cases) and Netslide (`journey`), and Palisade and Slant read
`steps[1]` the same way. The harness then loads the pin and the test walks
to the leg by hand.

## What Changes

A kind may name a leg of the opening plan and not only its first step. The
scan tests every leg of each plan it walks against such a kind, the pin is
still the position the plan is asked from, and the loader returns the leg
(and the board as it stands when that leg is shown) with the plan.

Check first whether "the board when that leg is shown" is well defined for
a multi-leg journey under `continuesPrevious`, which is what the midend
plays; `Midend.executeHint` is the reference.

## Hints to pull in

None: every game here has its hint. Rome, Salad and Slant are the check.

## What would show it worked

The three `hintUntil` frames read pins with counts, Tents' and Netslide's
kinds stop calling `hint` inside their predicates, and
`docs/games/testing.md` § "Pinning a hint's positions" loses its paragraph
on the workaround.
