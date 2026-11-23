## Context

The motivation is in proposal.md § "Why". `compare-cost` ran its worker as a
vitest file, so each count was of the engine behind vitest's module runner:
every import read through a getter, and `import.meta.env.DEV` on.

## Decisions

### The bundle is built by Vite, in each tree, from a config copied there

`scripts/checks/cost.vite.config.mts` builds one ES module for Node of the
worker and the named games: the describe plugin first, as the app's config
has it, the app's `es2022` target, minified, DEV off (a build's mode). A
virtual entry imports each game's registering module (its own `index.ts`,
or the module its description is compiled to) and then the worker, which
reads the registry. The command copies the config into the baseline as it
did the vitest one, and runs that tree's own Vite on it, so each tree is
bundled with its own describe plugin and compiler. One bundle a tree a
command; each run is `node --predictable <bundle>` under `/usr/bin/time -l`.

A tree the config cannot bundle stops the command with Vite's message: a
baseline from before the describe plugin, or one whose game is not where
the entry looks.

Not the app's whole config: its plugins write pages, licenses and the
service worker, none of which a count reads, and it bundles for the
browser, which Node cannot run. What a count needs of it is how an import
is bound, how a described game compiles and whether DEV is on, and the
copied config takes all three.

### `deal-compare` and `deal-profile` stay under vitest, and say so

`deal-compare` imports two trees into one process to time them side by
side, and `deal-profile` samples a profile through the inspector; neither
is a count, and bundling either is a rewrite for figures already marked "a
hint, never a claim". Each header now says the described side reads dearer
there than in the app. `deal-profile`'s share errs on the safe side: the
getters on a compiled technique's calls are described samples, so a game
it clears is clear.

## The instrument (1.1), 2026-11-23

Light Up and Boats, the hand-written games at `75691d811` against the born
ones at `f7304ce26`, the same boards (24 and 48), five rounds; median G
instructions net of start-up, ± half the larger spread:

| | Under vitest (HEAD's command) | Bundled (this change) | What vitest adds |
|---|---|---|---|
| Light Up walk, hand-written | 1.123 | 1.008 | +11% |
| Light Up walk, born | 1.513 | 1.238 | +22% |
| Light Up deal, hand-written | 6.952 | 4.338 | +60% |
| Light Up deal, born | 14.392 | 7.214 | +99% |
| Boats walk, hand-written | 6.063 | 5.583 | +9% |
| Boats walk, born | 5.859 | 5.370 | +9% |
| Boats deal, hand-written | 11.736 | 8.593 | +37% |
| Boats deal, born | 18.211 | 13.642 | +33% |
| Spread (±) | 0.023 to 0.043 | 0.002 to 0.009 | |

So born against hand-written: Light Up's walk +34.8% under vitest and
+22.8% bundled, its deal +107% and +66%; Boats' walk −3.4% and −3.8%, its
deal +55% and +59%. Vitest's overhead is not the getters alone, and not
the born side's alone: it adds to a hand-written deal too (DEV checks, and
the getters on the engine's own imports). It overstated Light Up's born
side by a quarter and left Boats' ratio where it was, so how far an old
figure is off depends on how much of a game's work crosses a module
boundary per step; it cannot be corrected by a factor. Bundled, one tree's
spread is a tenth of what it was under vitest.

## The new figure, seen to move (2.2)

`f7304ce26` against the working tree, whose engine is the same: every line
"none", Light Up 1.245 / 1.246 G walk (±0.002) and 7.217 / 7.218 G deal
(±0.005), Boats 4.268 / 4.269 and 13.639 / 13.638, while the next run
loaded the machine beside it. With a 40-pass loop planted in `clueAt`, the
runtime call a compiled clue technique makes: Light Up walk +41.7%, deal
+118.4%; Boats walk +6.8%, deal +22.1%; steps and technique tries
unchanged, so the count saw the price move and not the work. The plant
removed, `git diff src/` was empty.

Light Up's walk leaves 8 of 24 boards unsolved in both trees: each is an
Unreasonable board, where the hint says the position needs trial and
error, as `measure-cost-by-instructions` recorded.

## The born families re-counted (3.1), 2026-11-23

`npm run compare-cost`, bundled, five rounds, the working tree
(`f7304ce26` and this change) against each archive's baseline, on the
boards `measure-cost-by-instructions` dealt (the same counts, dealt at the
baseline). Median G instructions net of start-up, hand-written / born;
beside each change, the one that archive recorded under vitest at
`6aef4c447`, before `cut-the-born-deal-cost`. No line's spread was above
±0.07 G.

Against `75691d811` (`born-plain-cell-family`):

| Game | Walk | Change | Vitest | Deal | Change | Vitest |
|---|---|---|---|---|---|---|
| Range | 1.302 / 1.519 | +16.7% | +17.6% | 3.810 / 3.457 | −9.3% | −5.3% |
| Star Battle | 10.52 / 13.05 | +24.1% | +26.8% | 304.2 / 275.3 | −9.5% | −9.3% |
| Clusters | 2.029 / 2.270 | +11.9% | +12.2% | 7.965 / 14.05 | +76.3% | +60.1% |
| Light Up | 0.996 / 1.240 | +24.4% | +33.7% | 4.415 / 7.281 | +64.9% | +270% |
| Sticks | 2.883 / 3.510 | +21.7% | +25.2% | 28.98 / 45.36 | +56.5% | +57.7% |
| Bricks | 1.248 / 1.087 | −12.9% | −19.5% | 4.899 / 4.590 | −6.3% | none |
| Pattern | 0.797 / 2.090 | +162% | +157% | 2.731 / 3.041 | +11.3% | +17.8% |
| Singles | 1.685 / 1.801 | +6.9% | none | 4.356 / 3.285 | −24.6% | −47.6% |
| Boats | 5.538 / 5.384 | −2.8% | −3.7% | 8.590 / 13.65 | +58.9% | +159% |

Against `1057f5dc4` (`born-unruly-norinori-and-mosaic`):

| Game | Walk | Change | Vitest | Deal | Change | Vitest |
|---|---|---|---|---|---|---|
| Unruly | 1.551 / 1.768 | +14.0% | +14.7% | 3.361 / 4.211 | +25.3% | +39.6% |
| Mosaic | 0.852 / 0.913 | +7.1% | +11.8% | 2.544 / 8.669 | +241% | +23.3% |
| Norinori | 2.733 / 2.812 | +2.9% | +5.1% | 81.70 / 63.25 | −22.6% | −23.9% |

Steps are as the archive recorded, every game. Tents and Kakurasu, the
third family, were born before `measure-cost-by-instructions`; no archive
holds a count of them, and their baseline's `package-lock.json` differs
from this tree's, which the command refuses.

**What moved.** The walks: every sign holds, and vitest had overstated the
born walk by up to nine points (Light Up's +34% is +24%, Singles' "none"
is +7%). The deals moved twice over, by the instrument and by
`cut-the-born-deal-cost` between the two counts: Light Up's and Boats'
fell, as that change meant. Mosaic's rose from +23% to +241%, and
Clusters' from +60% to +76%, both after that change, whose comparison
counted Light Up and Boats alone.

**`cut-the-born-deal-cost` against the commit before it** (`cebb0c3fc`),
three rounds, every born game: deals Mosaic +214.7%, Singles +33.4%,
Clusters +10.4%, Bricks −6.8%, Unruly −4.7%, the rest within 2%; walks
and steps unchanged. Mosaic's deal in CPU time, bundled, the least of
three runs of ten deals: 8x10 Easy 9 ms in both, Normal 16 to 27 ms,
Unreasonable 53 to 84; 12x15 Normal 40 to 88, Unreasonable 139 to 242;
20x25 Normal 302 to 883. That is a menu board past 100 ms where it was
not, which `docs/descriptions.md` § "Judging a family moved onto its
description" has fixed in the engine; it is taken up below.

## The hide mended (3.2), 2026-11-23

Three parts of `cut-the-born-deal-cost`'s hide (`engine/fill/deal.ts`,
`hideUpTo`) cost Mosaic, each found by switching it off alone and
counting the bundle's deals (ten or twenty of a cell):

- **A draw the lowest tier does not finish was kept** and hidden from at
  the tier that does. Mosaic 12x15 Normal 84 to 43 ms a deal without it,
  Unreasonable 240 to 131; Light Up 12x16 Normal 68 to 80. Light Up gains
  a sixth from keeping them and Mosaic loses half, so a draw the lowest
  tier does not finish is drawn again, as before that change, until 64 in
  a row. The tier walk found why that change had kept them: Mosaic's
  narrow Custom boards at Normal (37x5 to 41x5, 3x50, 4x50), which Easy
  seldom finishes, gave up after 10,000 draws without them. After 64 such
  draws one is kept, and those cells deal in 64 to 445 draws (`npm run
  deal-walk`, three seeds a cell). At 64 every menu board measured (Mosaic
  8x10 and 12x15, Light Up 12x16 and 10x10, Boats 10x10 Hard) deals with
  the same count of instructions as with no run at all; at 32, Mosaic's
  8x10 Normal cost 37% more, and at 16, its 12x15 Normal 63% more.
- **The asked tier was solved first.** Once a draw must finish at the
  lowest tier, that solve does nothing the lowest's does not, and the
  lowest's is the cheaper: without it Mosaic 8x10 Normal −32%, Light Up
  12x16 and 10x10 Normal −9% and −10%, Boats 8x8 Normal −6%, Boats 10x10
  Hard +2%.
- **The halving before a search's strip.** Without it Mosaic 12x15
  Unreasonable 43.7 to 26.3 G, 8x10 −37%; Range neutral on its big
  boards; Bricks 8x10 +10%, 6x7 +12% (about 5 ms a deal, against 170
  saved on Mosaic's). Kept where no search follows: off everywhere,
  Boats' 8x8 Normal cost 77% more.

Against `f7304ce26`, `compare-cost`, three rounds, the run of 64 in:
deals Mosaic −64.3%, Bricks +8.5%, Range +10.0%, Boats −1.3%, Light Up
−0.7%, Unruly −0.2%, Sticks none; walks and steps unchanged (Singles and
Clusters, which hide nothing, none before the run went in). Bundled CPU time a deal,
the least of three runs of ten deals (start-up, 3 ms a deal, included):

| Board | Before the cuts | Now | Hand-written |
|---|---|---|---|
| Mosaic 8x10 Unreasonable | 56 ms | 66–71 ms | 61 ms |
| Mosaic 12x15 Normal | 43 ms | 41 ms | |
| Mosaic 12x15 Unreasonable | 149 ms | 123–128 ms | 123 ms |
| Mosaic 20x25 Normal | 309 ms | 305–313 ms | 281 ms |
| Light Up 12x16 Normal | 109 ms | 83 ms | |
| Light Up 12x16 Unreasonable | 188 ms | 85 ms | |
| Boats 10x10 Hard | 133 ms | 101 ms | |

"Before the cuts" is `cebb0c3fc`, "hand-written" Mosaic's at `1057f5dc4`.
Taken beside a tier walk, so above the archive's quieter figures; read
across a row. Mosaic's two boards past 100 ms are past it in the
hand-written game too.

The tier walk (`metrics/tier-walk.md`) over Mosaic, Light Up, Boats,
Bricks, Range, Unruly and Sticks: no board below or above its tier, and no
cell that `f7304ce26`'s walk dealt gives up. Mosaic reaches 1,022 cells
where that walk reached 784 before leaving the rest out as slow. Its
narrow Custom boards at Easy (40x5 and up, 5x38 and up, 3x50 to 50x6)
give up, as those that walk reached did: Easy is the lowest tier, so no
run hands over to another, and a draw that narrow Easy seldom finishes.
That is a Custom size past any menu board, and is not filed.

**Left as they are.** Singles' deal is +33% against the commit before the
cuts, from the build that ladders from the lowest tier (12x12 Easy 63 to
57 ms, 9x11 Normal 15 to 21), and still 24% below the hand-written one's
count; Clusters' is +10%, from `climbFill`. Both are under 100 ms on every
menu board.
