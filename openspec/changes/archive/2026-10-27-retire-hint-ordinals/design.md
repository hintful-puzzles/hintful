# Design

## Context

A chain hint marks a set of forced consequences and numbers them in a corner
of each cell or beside each edge, through `drawHintOrdinal`. The guide was
the section of `docs/hints-marks.md` that this change removes. Population, as of
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

### D6. The classification (2026-10-27)

Every rung below Unreasonable that tries a hypothesis, found from the
solvers' ladders and not from the ordinal declarations alone (a chain need
not have been numbered to be a supposition). Rungs already at Unreasonable
(Undead's `forcingPass`, Dominosa's `deduceForcingChain`, Bricks' and
Galaxies' `solverRecurse`, Spokes' unbounded contradiction) and the Checks
(one placement and one validator call: Bricks' and Clusters' `solverTry`,
Sticks' `sticksTry`, Seismic's `attempt`, Star Battle's `crowded` and
`starved`, Bridges' `stage3`) are out of it.

Tiers are named as the player sees them (`tierNames`), not by the code's
constants: Keen's `DIFF_EXTREME` is shown as Hard.

| Game | Rung | Tier | Links writable as marks? | Verdict | Moved to Unreasonable |
| --- | --- | --- | --- | --- | --- |
| Keen, Unequal, Group | `forcing` (`latin.ts`) | Hard | each cell's two candidates are notes; "if this is a, the next is b" is a conditional no mark records | supposition | Hard keeps set elimination (`diffSet1`) |
| Towers, Mathrax | `forcing` | Tricky | as above | supposition | Tricky keeps set elimination |
| Solo | `forcing-chain` | Extreme | as above | supposition | Extreme keeps `digit-set` |
| Salad | `forcing` | Normal | as above | supposition | Normal keeps set elimination; Salad has no Unreasonable |
| Map | `forcingChain` | Tricky | the dots are markable, and the premise legs write them; the alternation along the chain is a conditional | supposition | Tricky has no other rung: it would deal nothing |
| Path | `lookahead`, `long-lookahead` | Normal, Tricky | the edges a supposed line or cross forces are not facts | supposition | Normal and Tricky have no other rung; Path has no Unreasonable |
| Clusters | `lookahead-chain` | Normal (second of two) | the colors a supposed color forces are not facts; the rung is a sub-solve | supposition | Normal has no other rung; Clusters has no Unreasonable |
| Spokes | `contradiction-bounded` | Normal | up to four propagated spokes, not shown | supposition | Normal has no other rung |
| Boats | `attempt…` (`refuted`) | Hard | one trial square, its row filled, one validator call | borderline: a Check with one forced fill | Hard has no other rung; Boats has no Unreasonable |
| Rome | `loop` | Normal | the walk follows arrows already on the board | markable | nothing moves; the ordinal is gone |
| Blackbox | `layout` | untiered | a search, narrated as "a layout that fits" | supposition | untiered |

**What moving the Latin forcing chains costs**, measured by dealing six boards
per preset at its forcing tier at HEAD, and again with `LatinSolver.forcing`
stubbed to fire nothing and Solo's rung raised a tier (median, then max):
Towers 4×4 Tricky 9 ms → 494 ms (max 1.5 s); Solo 3×3 Extreme 15 → 808 ms
(max 1.2 s); Salad 5n4B Normal 15 → 259 ms (max 0.9 s); Keen 6×6 Hard 38 →
77 ms; Unequal 5×5 Hard 6 → 34 ms; the other presets unchanged within noise;
no deal failed. Group has no preset at Hard. So every Latin tier still fills.

**What it costs elsewhere is a tier.** Path's Normal and Tricky, Clusters'
Normal, Map's Tricky, Spokes' Normal and Boats' Hard are defined by the rung
alone, so moving it leaves the tier with no board to deal. Removing or renaming
a tier changes the params a game ID and a saved preference carry. That is a
compatibility break, and the owner's to make.

### D7. The Latin chains move now; the tier-defining rungs wait (owner, 2026-10-27)

Under D4 every row above but Rome is a supposition. For the Latin games the
move is cheap; for Path, Clusters, Map, Spokes and Boats it empties a tier,
and Path's Normal is its default. Offered (a) move them all, with the emptied
tiers renamed or removed and old game IDs read as the nearest tier left, or
(b) move the Latin forcing chains now and leave the tier-defining rungs until
each game has a markable technique to fill its tier, the owner chose **(b)**.

- **The forcing chain leaves the Latin config.** `LatinSolverConfig` loses
  `diffForcing`: `latin.ts` runs `forcing` at `diffRecursive`, beside the
  recursion, so no game can grade a chain below its search. Salad, whose
  `diffRecursive` is `DIFF_IMPOSSIBLE`, never runs one. Solo's `forcing-chain`
  rung moves to `DIFF_RECURSIVE` the same way.
- **No hint narrates a forcing chain.** Every Latin hint records below the
  recursive level, so the chain's reason, `ForcingLink`, `forcingChainArea`,
  `forcingChainPremise`, the `forcing` rung and their pins are dead and go.
  `forcing()` throws if it ever runs with a recorder, so a hint that records
  at the searching level fails loudly instead of striking a note it cannot
  explain.
- **A board a player already has keeps its ID.** A Hard (Solo: Extreme;
  Mathrax, Towers: Tricky; Salad: Normal) board that needed a chain is still
  valid and still opens. The midend grades a board its stated tier does not
  solve, so it opens labeled Unreasonable, and its hint stops where the chain
  was with the trial-and-error refusal (seen on Towers `5dx:2/2/3/2//////4/////1////2/,l1h3c`,
  2026-10-27). No format changes.
- **Two Custom cells lose their boards, and are refused** (owner,
  2026-10-27). `tier-walk` over the seven games, at HEAD and after, differs
  in five cells. Searched in boards built: Unequal 3×3 Hard (`3dx`) and Salad
  4×4 Letters of three at Normal (`4n3Ldx`) find none in 250,000, so both are
  refused by name and pinned as absent. Unequal 3×3 Unreasonable, refused
  before, now deals at once: the old Hard boards are its boards. Solo 3×2
  Killer Extreme (`3x2kade`, 6 in 30 deals of 10,000), Solo 2×3 Killer
  Extreme, Solo 3×2 Extreme and Keen 6×6 multiplication-only Hard (`6dxm`) are
  rarer than at HEAD and still deal. A params-only link to a refused cell is
  refused instead of dealing; one carrying its board still opens.
- **The rest is filed as the engine's**, one change per shape:
  `teach-what-if-walks-with-marks` (Path's lookaheads, Clusters'
  `lookahead-chain`, Spokes' `contradiction-bounded`, Boats' trial) and
  `teach-map-chains-with-marks` (Map's `forcingChain`). Each finds a markable
  technique to fill its tier before its rung moves to Unreasonable.

## Risks / Trade-offs

- **A sentence that leaned on "the numbered chain" may lose its tie.** The
  deixis guard (`scripts/checks/hint-deixis.test.ts`) and each game's tie
  test must still pass, and each is seen to fail with a tie removed.
- **Snapshots rebaseline in eleven games.** Verify them by the shape of the
  diff: ordinal text ops gone and nothing else moved.
