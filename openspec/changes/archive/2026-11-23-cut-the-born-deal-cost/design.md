## Context

`measure-cost-by-instructions` found the born games' deals slower than the
hand-written ones they replaced: 3.7 times in Light Up and 2.6 in Boats,
counted, and past 100 ms on menu boards (proposal). The deal is the
engine's (`src/engine/fill/deal.ts`, `search.ts`), so the cut is too.

## Where the work went (1.1)

The census (`npm run deal-walk` with cells named), which the fill deal did
not keep by stage before this change and keeps now (`drawRejected` at each
stage that throws a draw away), and solves counted a stage at a time, on
the proposal's boards at `3dc80e261`, six deals each:

| Board | Draws a deal | Thrown away, by stage | Solves a deal |
|---|---|---|---|
| Light Up 12x16 Normal | 45 | the lowest tier stops short with every clue: 226; the tier below finishes the board: 4 | 196 |
| Light Up 12x16 Unreasonable | 45 | the lowest tier stops short with every clue: 348 | 198, and the strip's searches |
| Boats 10x10 Hard | 4.5 | the tier below finishes the board: 23 | 535, 22 of them at Hard (31 ms of 97) |

The hand-written generators at `75691d811`, counted the same way:

- **Light Up** asked the asked tier to finish the every-number board, not
  the lowest, and needed 28.5 tries a 12x16 Normal deal; the born deal
  asked Easy, and threw away five draws in six for it. Each born draw also
  built its answer with the whole ladder after every bulb, where the
  hand-written one laid bulbs with no solver (upstream's `place_lights`):
  128 ms of a 213 ms deal. Its Unreasonable deal stripped every board from
  every number, and its search forked its marks at each branch and chose
  the square that lights the most dark squares.
- **Boats** added given segments to an empty board until Easy finished it
  (some 15 solves), then took each away that the asked tier did without:
  one pass at one tier. The born deal started from every square's shape
  shown and took each away a solve at a time (some 100 at Easy), then
  passed over the rest at every tier up to Hard, and judged most boards
  too easy at the end.

A solve costs about the same in both: the hand-written Light Up already
ran the described ladder, and `deal-compare`'s solve columns read 1.0 to
1.2 on the same boards. The born deals made more solves.

## Decisions

1. **The hide starts at the lowest tier that finishes the board with every
   clue, not at the lowest tier.** A draw no tier up to the asked one
   finishes is thrown away; one the asked tier finishes is a board of it.
   The climb from the lowest was for Mosaic, whose boards hide twice as
   fast at a lower tier (`born-unruly-norinori-and-mosaic`), and a board
   still hides from at the lowest tier that finishes it.
2. **The asked tier is asked first.** Most draws it does not finish, and
   one solve at it says so; the lower tiers' solves are asked only of the
   draws kept. Light Up's 12x16 Normal: 186 solves a deal to 153, the same
   boards.
3. **Then the asked tier, and none between.** A pass at a tier between the
   first and the asked hides nothing the asked one would not, and costs a
   solve a clue. Boats' 10x10 Hard: 507 solves a deal to 404, and fewer
   boards judged too easy (6x6 Hard, 10.3 draws a deal to 7.3). Nothing
   else changed which board it deals.
4. **The shortest run first.** Before the pass a clue at a time, a thorough
   hide halves its way to the shortest run of the shuffled clues that still
   finishes, as Boats' hand-written generator added clues until one did:
   some 7 solves and the run's length, against one a clue.
5. **A build ladders at the lowest tier until it meets a dead end or builds
   an answer that breaks a rule, and a tier higher after each.** The whole
   ladder was a third of Light Up's build and decided nothing in it: the
   lowest tier built the same boards. Unruly and Singles need it, and climb
   to it on their first draws (Unruly's 12x16 at the lowest alone took
   1,169 draws a deal against 3; with the climb, 4).
6. **The deal's search knows the answer it dealt.** It assumes each cell's
   dealt value last, depth first, so the first answer it meets is the
   verdict: one that is not the dealt one means several, and stops there
   (`searchAgainst`). A board with one answer is searched whole either way,
   so no verdict changes.
7. **A search branch forks its parent's marks**, as Net's search and the
   hand-written Light Up search did, and goes on from the parent's
   fixpoint, what it struck included, instead of solving the branch afresh.
   It skips a value the marks have struck.
8. **Light Up's description states `stripFrom: everyClue`**, as Sticks'
   does: its hand-written generator stripped every Unreasonable board from
   every number, and the born deal had taken Mosaic's start instead,
   hiding each board at the lowest tier that finishes it first. That start
   cost a solve on every draw to find the tier and the hide after it, and
   Light Up's draws mostly have no such tier (some 38 thrown away a 12x16
   deal). Thirty deals each of the 12x16 and the 10x10, bundled, took 7.8 s
   of CPU time with it, 4.8 s from every number, and 5.1 s hand-written.
   The proposal forbids a description change that makes a deal cheaper;
   this one is not of that kind. It makes no technique cheaper, and it
   states Light Up's own deal, which the born description had left to a
   default that was Mosaic's. Stripping such a draw from every clue in the
   engine, for every game, was tried first: it brought the 10x10 level
   but left the 12x16 at 113 ms, and changed Mosaic's mix for nothing.

Rejected: making a description cheaper to deal (the proposal forbids it);
caching a definition kept "for the board" across a deal's clue sets (Light
Up's `lights` is 9% of its Unreasonable deal, rebuilt each solve because
each solve's clues are a new object, but a hidden number changes both
lists it reads, so no key short of the cells' contents holds).

## The instrument: what vitest adds to a born game

Profiled under vitest, 24% of Light Up's deal was in two functions at the
top of `describe-runtime.ts` and `clues.ts`, at lines that are comments in
the source. They are the getters Vite's SSR transform puts on every export:
a compiled technique calls the runtime through the `describe-runtime.ts`
barrel, two getters a call. The app is bundled, and a bundle binds an
import directly. The hand-written code calls little through a barrel, so
the getters weigh on the born side of every comparison run in vitest:
`compare-cost`, `deal-compare` and `deal-profile` alike. Light Up's
12x16 Normal deal read 3.2 times its hand-written one in `deal-compare`
(123 ms against 38) and 1.5 times bundled (40.0 against 25.9), both on the
same tree, midway through the cuts here.

Vitest cannot run the engine without its module runner (Node's own type
stripping fails on the engine's parameter properties, and on
`import.meta.glob`), so the counts below are taken twice: by
`compare-cost` as the method says, and on a rolldown bundle of the deals,
as the app runs them. Filed as `count-cost-on-the-bundled-engine`.

## Figures

### 2.1: counted against the commit before

`npm run compare-cost -- --baseline <worktree of 3dc80e261> lightup boats
clusters sticks unruly`, all the cuts together (five rounds; baseline /
this tree, ± half the larger spread):

| Game | Boards | Deal instructions | Walk instructions |
|---|---|---|---|
| Light Up | 24 | 25.59 / 14.42 G (±0.07), −43.7% | none |
| Boats | 48 | 30.37 / 18.25 G (±0.12), −39.9% | none |
| Clusters | 40 | 16.67 / 17.99 G (±0.13), +7.9% | none |
| Sticks | 24 | 103.76 / 100.48 G (±0.11), −3.2% | none |
| Unruly | 36 | 6.01 / 5.67 G (±0.04), −5.7% | none |

Steps and technique tries are the same on every line: the walks did not
change. Clusters' rise is vitest's (§ "The instrument"): bundled, 30 deals
of each, the least of three alternating rounds, its 9x9 Unreasonable dealt
in 58.4 ms a deal against HEAD's 63.5, and its 9x9 Tough in 24.0 against
23.1, inside the rounds' spread.

### 2.2: the deals' milliseconds against the hand-written ones

A rolldown bundle of the born games (this tree) and one of the hand-written
ones (`75691d811`), DEV off, each dealing a preset 30 times after five
untimed deals; CPU time a deal, mean over the 30, the least of five
alternating rounds (beside it in brackets, the spread of the five in ms). The commit before
this change (`3dc80e261`) is bundled and timed the same way, apart:

| Board | Hand-written | Born, before | Born, after |
|---|---|---|---|
| Light Up 12x16 Normal (`12x16b20s2d1`) | 26.6 ms (2.5) | 71.4 ms | 43.1 ms (2.5) |
| Light Up 12x16 Unreasonable (`12x16b20s2d2`) | 64.3 ms (3.4) | 137.5 ms | 64.0 ms (2.0) |
| Light Up 10x10 Unreasonable (`10x10b20s2d2`) | 21.5 ms (1.0) | 48.2 ms | 17.3 ms (0.8) |
| Boats 10x10 Hard (`10x10dh`) | 26.6 ms (4.4) | 74.6 ms | 25.7 ms (1.1) |
| Clusters 9x9 Unreasonable (`9x9du`) | 32.2 ms (1.5) | 42.7 ms | 41.8 ms (2.0) |

No born deal of these is over 100 ms, and three are level with the
hand-written deal or below it. Two are slower and under 100 ms, which the
requirement allows with where the cost lies recorded (below).

The tier walk (2.3), over the twelve fill games: no cell dealt a board
below or above its tier. Light Up's 80 cells and Clusters' 23 left out as
slow before deal now. Clusters' Unreasonable gives up at its smallest and
one-wide sizes (`3x3du`, `1x7du`), as `3dc80e261` does: the tier is absent
there, and the report had not been run at those cells before.

## What remains

- **Light Up's 12x16 Normal, 1.6 times the hand-written deal.** Profiled
  bundled, the build is 19 ms of the 43 against the hand-written
  `placeLights`' 7: the born build ladders after each bulb, the
  hand-written one laid bulbs with no solver. The hide is 25 ms against
  `removeNumbers`' 17: it passes at the lowest tier that finishes the
  board and then at Normal, where the hand-written one passed once at
  Normal. Either is a description's choice the proposal does not let this
  change make (a build with no ladder; a hide at the asked tier alone).
- **Clusters' 9x9 Unreasonable, 1.3 times.** Profiled bundled, the two
  deals spend their time alike (the search 37% born, 42% hand-written;
  drawing 34% and 28%), so no one stage holds the difference: the born
  deal costs about a third more throughout, in the ladder's rungs that
  every stage runs.

## Risks / Trade-offs

- **Which boards are dealt changed** for every born game whose deal hides
  or builds. The app hands out boards and not seeds, so no saved game or
  link changes. The tier walk (2.3) checks each still deals its tier.
- **A build that met a dead end climbs for the rest of the deal**, even
  where the whole ladder would have met it as well. It costs one draw a
  tier at most.
