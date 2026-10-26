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
- Forcing is shown in a way the owner prefers to today's, Path first.

**Non-Goals**

- Shortening chains or changing which deductions a ladder fires, unless the
  owner's choice of presentation calls for it.

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

## Open question: how should forcing be shown?

The owner asked this change to look for a better way to communicate forcing,
especially in Path (2026-10-26). Their example, on a phone at 7×9 Normal,
reads "A cross on this edge would force the numbered edges and leave the
outlined square a dead end, so it must be a line." The edge is ringed, the
forced edges are thin green lines numbered 1 to 5, and the dead-end square is
outlined. The owner found it "an already extremely difficult hint".

This is player-visible, and the owner asked for it by name. So the session
prototypes the candidates on real boards, builds a comparison the owner can
see side by side (screenshots in the app, light and dark, phone width), and
asks before building one. Candidates to weigh, not a shortlist:

- **Outline only.** The forced edges are drawn thin, with no numbers, and the
  sentence names them as a set. This is the minimum: the player re-derives
  the order from the hypothetical edge outward.
- **Reveal in order on demand.** Pressing the chain's pill draws its links one
  at a time, in the order they follow from the supposition. The order is
  shown without a number on the board. The order must be one that forces:
  re-derive it rather than reuse the search's discovery order. The 65.6%
  figure says those differ.
- **The supposition as a journey.** Today a hypothesis is never a journey's
  legs (`docs/hints-marks.md` § "Show the what-if walk statically"). Ask who
  that rule serves before keeping it. A walk the player can play forward and
  take back may teach better than a static picture.
- **A shorter story.** The break is beside the last forced link in every
  measured Clusters firing. Showing only the links the contradiction needs,
  or splitting a long chain into steps that each force one thing, may matter
  more than how the chain is marked.

Measure before choosing. For each candidate, count how many forced links a
real Path lookahead step shows (`npm run hint-scan`), and read the sentence
against the board.

## Risks / Trade-offs

- **A sentence that leaned on "the numbered chain" may lose its tie.** The
  deixis guard (`scripts/checks/hint-deixis.test.ts`) and each game's tie
  test must still pass, and each is seen to fail with a tie removed.
- **Snapshots rebaseline in eleven games.** Verify them by the shape of the
  diff: ordinal text ops gone and nothing else moved.
