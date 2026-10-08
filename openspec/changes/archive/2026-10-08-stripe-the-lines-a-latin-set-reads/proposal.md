# stripe-the-lines-a-latin-set-reads

Found in `name-the-lines-solos-digit-pattern-reads` and taken on in the same
session, on the owner's word (2026-10-08): the session that fixed Solo's step
holds the context for the same defect in the shared solver.

## Why

The shared Latin solver (`engine/latin.ts`) has the rung Solo's change just
fixed: one value confined across several lines. Its step said "The outlined
cells already account for 4 between them" and outlined the cells the value was
left with. The rest of those lines, where the value is absent, rode along as
`reads`: premise to the walk, drawn nowhere. A player could not check the step
from the frame.

Measured on 2026-10-08 by walking hint-guided play on every preset's board,
three deals each: the step showed 61 times in Unequal (69 boards), 13 in Salad
(45), 7 in Keen (27), 6 in Towers (36), 3 in Group (27) and 3 in Mathrax (51).
Every one hatched nothing.

The solver also always recorded one of the firing's two readings, the one its
search happened on. On a Keen 6x6 that was eleven cells across four columns
where the other reading is four cells across two rows.

## What Changes

- `latin.ts`'s set reason carries `lines` when the firing is over one value's
  places: the whole rows or columns that confine it. `set` records whichever
  of its two readings is fewer lines; `setGeneral` (a repeated symbol, Salad's)
  records the subset it found.
- One sentence in `engine/hint-text.ts`, `confinedPremise`, stripes those lines
  and outlines the cells: "These 2 rows fit 4 only in the outlined cells,
  which take the 4 of 2 columns". It is short because the walk may end it with
  every value a cell keeps: the first wording ran to 121 characters. Keen, Unequal, Group, Mathrax and Salad
  reach it through `latinPremise`; Towers and Solo call it from their own
  sentence files, and Solo's copy of the words is gone.
- Salad's empty-square mark confined across lines speaks the same sentence
  ("fit X only in …"), replacing "account for both empty squares of each of
  their columns", which named lines it did not mark.

### What it costs

- The step's frame is busier: two or three whole lines hatched.
- Under the implicit reading the walk no longer writes a note into every cell
  of those lines before the step. The hatch is premise, so the step is still
  offered only when the board shows it; a cell with no notes reads as its row
  and column leave it, as everywhere else under that reading.

## Impact

- `src/engine/latin.ts`, `src/engine/hint-text.ts`, `src/engine/latin-hint.ts`.
- `src/games/solo`, `src/games/towers`, `src/games/salad`: their sentence files
  and narration arms.
- `openspec/specs/engine-candidate-hints/spec.md`.
- Each game's help legend, where it says what stripes and outlines mean.
