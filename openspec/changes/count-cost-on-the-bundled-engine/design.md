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
