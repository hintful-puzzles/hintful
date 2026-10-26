# Design

## Context

A chain hint marks a set of forced consequences and numbers them in a corner
of each cell or beside each edge, through `drawHintOrdinal`. The guide is
`docs/hints-marks.md` § "Number a chain's cells in order". Population, as of
2026-10-26: `git grep -l drawHintOrdinal src/games` lists eight games; Path
draws its edge ordinals through `engine/edge-hint.ts`, Map through its
region label point, and the Latin-square games share `forcingChainArea`
(`engine/latin-hint.ts`) with `forcingChainPremise` (`engine/hint-text.ts`).
Re-take the population from those references before relying on it.

These measurements were the reason for an ordinal and not an arrow. They come
from the work that introduced the ordinal, over 140 Clusters firings: a link's
predecessor is load-bearing in 65.6% of links, only 48.5% of links are
adjacent, and the break sits on or beside the last forced cell in 140 of 140.

## Goals / Non-Goals

**Goals**

- No hint draws a number on a chain, in any game.
- Each sentence that cited a number still ties every mark it names.
- Every chain a hint shows is either ordinary marked steps or not shown below
  Unreasonable (D4).

**Non-Goals**

- A mark for suppositions (D4).

## Decisions

### D1. The ordinal leaves the engine, not only the games

There is one obvious way to show a chain, so the mechanism goes: the drawing,
the declared `order`, the pinned positions and the guards that read them. A
game that keeps an ordinal by itself would be a second convention.

### D2. A link the words single out is a reference of its own

The shared Latin sentence reads "Cell 1 is 3 or the numbered chain forces
cell 5 to 3, both in line with this cell". Its ends become references of
their own, for example "One end of the outlined chain is 3, or the chain
forces its other end to 3, both in line with this cell". Each reference has
its own pill, color and leader, so the player finds each end by pressing it.
The final wording is fitted to the 120-character limit
(`engine/hint-quality.test.ts`).

### D3. Map shows its own region numbers throughout

Map hides the map's region numbers while a chain shows, to make room for
the ordinals. With no ordinals, nothing is hidden. Its chain journey ("dots
each numbered region") is re-worded, and its spec delta is written once the
wording is settled.

### D4. Forcing is taught only through marks the player can make (owner)

The owner asked this change to look for a better way to communicate
forcing, especially in Path. Their example, on a phone at 7×9 Normal, reads
"A cross on this edge would force the numbered edges and leave the outlined
square a dead end, so it must be a line." The edge is ringed, the forced
edges are thin green lines numbered 1 to 5, and the dead-end square is
outlined. The owner found it "an already extremely difficult hint".

The owner's ruling (2026-10-26): **in practice, long forcing is
indistinguishable from backtracking.** A chain is fair only if every link
can be recorded with the game's ordinary deductive marks, the kind a player
makes anyway, like pencil-mark eliminations in the Latin games. Such a chain
is taught as ordinary steps, each writing its mark, and needs no chain
picture. A chain whose links cannot be written down as facts is a
supposition: it is Search, so it belongs to Unreasonable. The generator
stops dealing it at lower difficulties, and the hint refuses it there as it
refuses other Search.

**No supposition marks.** A layer for marking hypotheses was considered and
refused. A player who wants to try a supposition already can, by saving,
playing it out and loading back.

The owner's Path example looks like a supposition: a cross "would force"
edges that are not facts, and no Path mark records them. That is a reading,
not a finding. Classify it per D5.

### D5. Classify every chain kind before reworking any

For each game and rung that shows a chain, decide whether every link writes
a mark the player can make. Record the table in this design, and keep the
code behind it as a guard derived from what each rung is, not a list
(`docs/method.md`). Then:

- **Markable** chains are split into ordinary steps.
- **Supposition** chains move to Unreasonable: the rung is gated off the
  lower tiers, and the generator's difficulty certifier is re-checked so
  each tier still deals boards.

Measure what moving them costs. For each tier, count how many boards the
generator deals and how long dealing takes, before and after, and bring the
owner any tier that becomes hard to fill. Re-read
`docs/hints-marks.md` § "Show the what-if walk statically" and
`docs/hints.md` § "The forcing boundary" against D4, and retire whatever D4
makes dead.

## Risks / Trade-offs

- **A sentence that leaned on "the numbered chain" may lose its tie.** The
  deixis guard (`scripts/checks/hint-deixis.test.ts`) and each game's tie
  test must still pass, and each is seen to fail with a tie removed.
- **Snapshots rebaseline in eleven games.** Verify them by the shape of the
  diff: ordinal text ops gone and nothing else moved.
