# slice-presets-by-the-axes-a-game-varies

## Why

The cross-game guards' gate slice (`walkedPresets` in
`src/engine/hint-resume.test.ts`) keys a **tiered** game on tier alone and takes
the first preset of each. Measured 2026-09-20 on Solo, which offers eighteen:

```
all (18):   2x2 Easy | 2x3 Normal | 2x3 Tricky | 2x3 Hard | 3x3 Easy |
            3x3 Normal | 3x3 Normal X | 3x3 Tricky | 3x3 Hard | 3x3 Hard X |
            3x3 Extreme | 3x3 Unreasonable | 3x3 Killer | 9 Jigsaw Normal |
            9 Jigsaw Normal X | 9 Jigsaw Hard | 3x4 Normal | 4x4 Normal
gate slice (6): 2x2 Easy | 2x3 Normal | 2x3 Tricky | 2x3 Hard |
                3x3 Extreme | 3x3 Unreasonable
```

**Every X board, every Killer board, every jigsaw board and every board larger
than 9×9 is de-duplicated away**, because each shares a tier with a plainer
board earlier in the menu. So no cross-game hint guard walks a Solo Killer hint
on a commit — and Killer is not a skin, it adds four cage rungs and four cage
sentences that the guards exist to check (recompute stability, narration
convention, mark parity, mistake invariants).

This is the same defect the slice has already been fixed for once. Its own
comment records it: keyed on tier alone, every preset of an *untiered* game
collapsed to one key, *"reinstating, for those games, exactly the first-preset
blindness the widening existed to remove"*, and it cost a real defect
(`fix-sixteen-hint-recompute-stability`). The fix added a size axis **for
untiered games only**. A tiered game with modes has the same hole.

**Found while measuring `offer-solos-small-board-at-every-tier`**, which added
two presets and, as a side effect nobody would see in its diff, switched the
board the guards walk for Tricky and Hard from a 9×9 to a 6×6. That swap is
acceptable and is recorded there. The hole it exposed is not that change's to
fix.

## What changes

The slice keys on **the axes a game actually varies**, not on tier alone.

The shape is the change's one real decision, and the existing code names the
constraint: the slice must stay cheap enough to run per commit — it was widened
once already and the widening had to be bounded for `SEARCH_PLANNING_GAMES`,
whose two members were 43% of all test time. So "walk everything" is not the
answer; "walk one per distinct combination of the axes this game varies" might
be, and the axes have to be **derived from the params the presets carry**, not
declared.

**Derive, do not enroll.** A per-game roster of "modes worth walking" is exactly
the manifest shape this repo has reversed three times: it can be forgotten by a
new game, left behind by a changed one, and nothing notices. The presets already
carry the params; two presets differing in a boolean the game varies *are* two
points on an axis, and that is readable without anyone declaring it.

## What this does not do

- **Not a widening that ignores cost.** Measure before and after, per guard, on
  an idle box, and state free memory and swap beside the figure. If the honest
  slice is too expensive per commit, the deferral rules apply — and the four
  conditions in the `build-pipeline` spec bind anything deferred to push.
- **Not a change to any game's presets menu.** The menu is what a player sees;
  the slice is a test artifact, and the test bends to the menu, never the
  reverse.
- **Not `firstLeaf`.** Several guards take the first preset only
  (`mark-all.test.ts`, `hint-mark.test.ts`, `hint-ordinal.test.ts`,
  `hint-overlay.test.ts`, `hint-text-convention.test.ts`). Whether they should
  widen too is a separate question with its own cost, and answering it here
  would bundle two designs.

## Verified before filing

- The printout above is from the live registry, not from reading the menu.
- Solo's *own* suite does cover Killer and X per-commit (`solo.test.ts`,
  `solo-hint.test.ts` carry `KILLER` and `XADV` params), so the gap is
  specifically in the **cross-game** guards, which is where a defect shared by
  several games would show up and a per-game suite would not look.
