# Design

Every figure here was taken on 2026-10-12.

## What was read

Seven divisions into unequal regions, and no eighth. The search was for a
generator that builds a `Dsf` or a region label for each cell
(`git grep -ln "Dsf\|region" -- 'src/games/*/generator.ts'`, sixteen files,
each read). The nine not in the proposal's table use a `Dsf` for something
else: Crossing, Slant and Slide ask whether cells are connected, Sticks reads
the solver's, Palisade and Separate take equal regions from `divvy.ts`, and
Inertia, Lightup and Net only use the word.

For each of the seven, what is the game's rule and what is only the walk:

| Game | The walk | The rule |
| --- | --- | --- |
| Rome | Every pair of neighboring squares once, shuffled; join the pair's regions unless the rule refuses | No region holds two of one arrow; a goal stays alone |
| Map | Scatter seeds; a free cell and a region beside it are drawn together by weight until the grid is full | How many regions |
| Seismic | Seed at the most hemmed-in free cell; grow into a free neighbor at random to a size | The size drawn for a region |
| Keen | Dominoes in a shuffled order at three chances in four; each single square left is folded into a neighbor under a largest size | Six cells at most; mostly pairs |
| Solo, Killer | Dominoes in reading order, rightward or downward; each single square left is folded into a neighbor | Mostly pairs; a tier that keeps singles |
| Filling | Join a region to a neighbor only where two neighboring regions have the same size, then absorb single squares | No two neighboring regions of one size |
| Galaxies | Grow a region two cells at a time, a cell and its mirror image about the region's dot | Every region symmetric about its dot |

## Decisions

### Three walks, not two

The proposal counted two shapes, merge and seed-and-grow. Seed-and-grow is two
walks: Map grows every region at once from seeds placed first and is told a
count, and Seismic grows one region at a time and is told a size. Neither can
be said as the other. Star Battle needs the first with seeds it places itself
(its stars), so the seeds are an argument and scattering them is a function of
its own.

`src/engine/divide.ts`:

- `mergeNeighbors(p, rng, rule)`: Rome's walk.
- `mergeToCount(p, rng, rule, count)`: the same rule, joined toward a count.
  New, and below.
- `growFromSeeds(p, seeds, rng)` with `scatterSeeds(p, n, rng)`: Map's walk.
- `growToSize(p, rng, size)`: Seismic's walk.
- `regionNumbers(division, cells)`: a division as a number for each cell, in
  reading order of first cells, which Map's description needs.

Each returns a `Dsf`, as `divvy.ts` does.

### The rule is what a region holds and how two holdings join

A merge rule is `of(cell)`, what a region holds to begin with, and
`join(a, b)`, what two would hold as one or `null` where the game forbids it.
Rome holds a mask of arrows; a size rule holds a count. The walk never learns
what the rule is about, and a rule needs no access to the division. The rule
may name a division to start `from`, so a merge can follow a growth.

### A merge toward a count is a different walk

Star Battle wants exactly as many regions as the grid is wide, each holding
exactly the board's number of stars. Said as "no region holds more than `k`
stars", `mergeNeighbors` ends with regions of fewer where a one-star region
is left among full ones. Measured on a star placement, 20,000 tries each,
joining one-star regions grown from the stars:

| Board | Random order of joins | Fewest choices first |
| --- | --- | --- |
| 8x8, two stars | 8.9% | 86% |
| 10x10, two stars | 3.8% | 78% |
| 14x14, three stars | 0.08% | 61% |

So `mergeToCount` joins the region with the fewest neighbors it may join
first, a tie broken at random, and returns `null` when the rule refuses every
join before the count is reached. A try costs 0.07 ms at 8x8 and 0.47 ms at
14x14. It recomputes who may join whom after each join, which is a pass over
the grid, so it is for a division of some tens of regions.

### How Star Battle says its rule

With `stars` the cells the game placed, `k` to a row, and `n` the width:

```ts
const one = growFromSeeds(p, stars, rng); // a region round each star
const regions =
  k === 1
    ? one
    : mergeToCount(
        p,
        rng,
        { from: one, of: () => 1, join: (a, b) => (a + b <= k ? a + b : null) },
        n,
      );
```

`null` is drawn again on the same stars. At one star a division never fails.
What the measurement did not look at, and `add-starbattle` owns: the spread of
region sizes (at 10x10 with one star, from 1 cell to 36), which a rule that
holds a size as well as a star count can narrow, and whether a board dealt
this way has one answer.

### Which games move

**A game moves where the engine's walk makes its draws in its order, so the
boards do not change.** `docs/solver-and-generator.md` § "Divergence and what
it costs" asks a divergence for a benefit a player sees, and one walk in place
of two is not one. This is narrower than the proposal, which allowed a move
that deals other boards.

| Game | Verdict | Why |
| --- | --- | --- |
| Rome | Moves to `mergeNeighbors` | The same pairs, shuffled the same |
| Map | Moves to `growFromSeeds` | `genmap`, moved whole |
| Seismic | Moves to `growToSize` | `growRegions`, moved whole |
| Keen | Stays | It wants mostly pairs: a merge under a largest size deals regions at that size, and Keen's subtraction and division clues need two cells. Its walk lays dominoes first |
| Solo, Killer | Stays | The same, and a tier that keeps single cells |
| Filling | Stays | Its rule obliges a join (two neighbors of one size must become one) where the engine's rule only permits one |
| Galaxies | Stays | A region grows by a cell and its mirror image, which no walk here does |

Keen and Killer are one more shape, dominoes and then folding, held twice.
The two walks differ in every draw, each is pinned byte for byte by a frozen
fixture, and putting them on one walk would deal other boards in one of them
for no gain to a player. What would reopen it: a third game that wants
dominoes first.

### Measured, for the three that moved

Every preset of the three games at twelve seeds each, 432 boards, dealt
before and after: 0 descriptions differ, in 28.2 s before and 28.1 s after.
With a defect planted in each walk (a weight, the tie-break of a seed, the
order of the pairs) all 432 differ, so the comparison sees each walk. No
fixture is retired: Rome's and Map's frozen differentials still pass and now
pin the engine's walks.

Because no board changed, task 2.3's look at a dozen boards in the browser
has nothing to find and was not done: the regions a player sees are, cell for
cell, the ones dealt before.

## The module's own tests

`src/engine/divide.test.ts`, on rules made by hand: every cell in one region,
every region connected, the rule never broken, and a rule that cannot be met
answered with `null`. Each was seen to fail on a planted defect. Two say what
sample they need: growth that ignores the one-run rule encloses a region in
about one draw in a hundred, so that test takes 600 draws; and the order of
`mergeToCount` is held by a success rate, over half of 40 tries, where the
planted random order met the rule once.
