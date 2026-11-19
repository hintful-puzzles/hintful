## Decisions

The four items share one reasoning: the describe pipeline is how a hint's
author learns what their description does, and each item is a place where it
did something without saying so. They are small and independent; take them
in any order, one commit each.

**Silent skip.** A description file that is neither a library, a planning
game, nor a compiled one is legitimate only as a help page or a draft. Print
each such file once with the reason, at `--quiet` too if it has `steps`
(steps with no techniques is almost certainly a mistake). For a game with no
techniques at all, prefer accepting `techniques: []` alone over requiring
`tiers` beside it, if the compiler has nothing to do with tiers then; check
the schema's reason for requiring them before changing it.

**Schema reload in dev.** Read `docs/descriptions.md` and the existing
`vite-plugins/` before choosing. A plugin that invalidates the module graph
on a schema change is the usual shape; a dev-only per-request read is
simpler if the loader is not on a hot path.

**Board clue fields.** Print each clue's named fields from the description's
declaration, not `c.v.k`.

**Supplied-word length.** The lint's sample for a supplied slot is the
shortest and the default form a game has said. For a slot that names words
from a list (Wordtrail's and Wordguess's), the game knows its longest word;
let the description declare a maximum, or let the lint read it from the
supplied hook. Pick the one that cannot drift from the list.

## Risks

- A louder `describe` in the gate's prefix: print only for files that look
  like a mistake, so the gate's output stays quiet on a clean tree.
