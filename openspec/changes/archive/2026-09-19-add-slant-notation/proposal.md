# add-slant-notation

## Why

`apply-markable-facts-rule`'s audit found Slant's equivalence step breaking
`AGENTS.md` § "Hint quality bar" rule 6. *"This square is locked to the same slant
as the ringed one by the clues around them"* cites a class in the solver's
equivalence union-find, merged by a pairing or v-shape argument several fixpoint
passes earlier, and Slant gives players no way to record that two squares slant
alike. It is not rare. Measured on opening plans, it fired on 5 of 5 boards at
12x10 Normal (20 of 600 steps) and on 4 of 5 at both 8x8 Normal and 12x10 Easy.
It is Slant's only nonconforming arm.

## What changes

- Give players a mark for "these two squares slant alike" (and, if the solver's
  pairs need it, "slant opposite"), in the shape `add-loopy-notation` gave Loopy's
  pairs: a note mode, a mark drawn on the board, seeded into the solver as a fact
  whose premise is "on the board", and vouched for by `findMistakes`.
- Record why each merge in the equivalence union-find holds (the pairing or v-shape
  argument, with its clues) and place each link the equivalence step cites as a note
  step of its own, beside the firing that cites it (`docs/games/hints.md` § "Give the
  facts a notation (Loopy)").
- Retire the honest-chain-tier wording and its section in the guide.

## What this does not do

It does not change which boards generate. The tier fallback (`Unreasonable`) is the
alternative only if the notation proves unmanageable, and then the change says what
made it so.

## Acceptance

Owner acceptance: a new input and a new mark on the board.
