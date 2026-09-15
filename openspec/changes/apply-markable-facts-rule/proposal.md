# apply-markable-facts-rule

## Why

`AGENTS.md` § "Hint quality bar" rule 6 (owner, 2026-09-15): **a hint relies only
on marks the player can make.** It was stated while fixing Loopy
(`add-loopy-notation`), and it binds every hinting game, so the games already
shipping a hint need checking against it.

**One instance is verified.** Slant's equivalence step says *"This square is
locked to the same slant as the ringed one by the clues around them, so it must be
a backslash too."* (`src/games/slant/hint-text.ts`, read 2026-09-15). Slant's
solver tracks squares whose slants are locked together, and Slant gives players
no way to mark that two squares share a slant, so the step rests on a fact the
player cannot record. `docs/games/hints.md` § "The honest chain tier" describes it
as citing an anchor without reconstructing the derivation.

**The rest are unchecked**, and that is the audit. Candidates worth reading first,
because their hints are known to reason over state the board does not draw:
Subsets (candidate set-values; it has a reference aid, which may or may not carry
the fact), Clusters and the Latin family (hypotheticals and forcing chains, whose
facts are candidate notes the player can make, so likely conforming), Galaxies
(association arrows, which players can draw).

## What changes

- Read every hinting game's steps against rule 6 and record, per game, conforming
  or not, with the fact at issue.
- For each nonconforming game, scaffold its own change giving players the notation,
  as `add-loopy-notation` does, since each is a player-visible input design.
- Slant is the first of those changes.

## What this does not do

It does not design any notation itself; each game's notation is its own change and
its own acceptance.
