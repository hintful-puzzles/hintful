# pin-a-leg-of-the-opening-plan

**Status: scaffolded, not started (2026-10-04); most of it since done
elsewhere (2026-10-05). Re-read before starting.** A follow-up from
`move-the-hint-scans-onto-the-harness`.

## What `name-the-rung-a-hint-step-speaks` already did

A **rung's** pin is now a position whose plan holds a step of that rung at any
leg, the scan tests every step of each plan against it, and the loader returns
the step with its `index`. So the three sentences below are pinned as rungs
(Rome's and Salad's `dup`, Slant's `equiv`), and the guide's workaround
paragraph is gone. What is left of this change:

- A **predicate** kind still reads only the step a plan opens with. Netslide's
  `journey` kind still asks the hint again inside its predicate to look at
  `steps[1]`. Check who else does (2026-10-05: not measured) before deciding
  this is worth a harness change and not one game's predicate.
- The loader returns the plan and the step's index, not the board as it stands
  when that leg is shown. No test asked for it during the rung work; the
  question below about `continuesPrevious` is still open if one does.

If neither is wanted, close this change as done.

## As scaffolded

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
