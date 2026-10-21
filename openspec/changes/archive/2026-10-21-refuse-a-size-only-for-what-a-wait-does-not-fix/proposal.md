# refuse-a-size-only-for-what-a-wait-does-not-fix

**Status: the owner answered (a) on 2026-10-20, and widened it on
2026-10-21 (§ "The second answer"). Filed 2026-10-15** from
item 2 of `mend-what-the-guide-rewrite-found`, which measured it and
archived without it. Every figure here carries that date; re-check it
before relying on it.

## Why

`docs/solver-and-generator.md` § "A Custom size is not refused for its wait"
says a large Custom size that deals slowly is not refused, and names "a
larger one takes too long to deal" as a wait. Net, Signpost and Sticks each
refuse an Unreasonable size in exactly those words
(`src/games/net/state.ts`, `src/games/signpost/index.ts`,
`src/games/sticks/state.ts`), and Net's refusal is in its spec. Beside it,
`engine-difficulty`, "An unbindable tier is refused, not silently
downgraded", reads as an unconditional SHALL, while the guide's default, that
a new game writes no refusal for a rare tier and leaves it to the deal's
deadline (`DEAL_DEADLINE_MS`, 120 s, `src/engine/deal.ts`), is in no spec.

## What was measured

`npm run deal-walk` with `DEAL_WALK_CELLS` naming each size, which now deals
a refused size too. One machine under outside load (load average 5–11, swap
nearly full), so the seconds are an upper bound; the shape is what to read.
Every deal that came back was an Unreasonable board.

| Game | Refused past | Just past the bound (3 deals) | Further out (2 deals) |
| --- | --- | --- | --- |
| Net | 900 squares | `31x30`: 3 s, slowest 4 | `45x45`: 16 s; `60x60`: 38 s |
| Net | 40 long, unwrapped, under 7 wide | `6x41`: 0.8 s, slowest 2 | `6x80`: 0.9 s |
| Net | 30 long, wrapping, 4 wide | `4x31w`: 0.6 s, slowest 1 | `4x60w`: 66 s, slowest 81 |
| Net | 80 long, wrapping | `7x81w`: 1 s | `7x160w`: 4 s |
| Sticks | 100 squares or 30 long | `11x10`: 3 s, slowest 6; `2x31`: 1 s | `15x15`: 79 s, slowest 85; `20x20`: **no board in 120 s**, 2 of 2; `2x60`: 28 s |
| Signpost | 225 squares or 30 long | `16x15`: 1 s; `2x31`: 0.1 s | `20x20`: 5 s; `30x30`: **gave up**, 2 of 2, in 11 s; `2x60`: 0.4 s |

Every bound sits well inside the deadline: the sizes just past each deal in
seconds. Two games do reach a real limit further out, and both are of the
kind the guide does refuse: Sticks at `20x20` never answers inside the
deadline, and Signpost at `30x30` runs its retry bound out, which is a
generator that fails more often than it finds.

## A question for the owner

Player-visible either way. Recommendation: **(a)**.

- **(a)** Remove the three "takes too long to deal" refusals. A size that
  deals inside the deadline is dealt, however long the player chooses to
  wait. Where a generator gives up or never answers (Signpost near `30x30`,
  Sticks near `20x20`), refuse it for that reason, with the line drawn from
  a dozen deals each side as the guide asks, and say so in the words for a
  size no board is found at. Net's spec loses its refusal.
- **(b)** Keep the refusals, and narrow the guide's rule to say when a wait
  is a reason to refuse; `engine-difficulty` gains the bar a refusal must
  clear. This keeps sizes the measurement deals in seconds refused.

## The answer, and how far it reaches

The owner chose (a), 2026-10-20. A census of every game's `validateParams`
that day found the same refusal under other words in more games than the
three: `tooRareToDeal` is by its own contract a size "found too seldom to
wait for", and several bounds that tell the player no board exists were
drawn where a deal takes a few seconds. The owner chose to bring them all
into this change.

**The line.** A size is refused only where the app's deal, under its
deadline, gives up more often than it finds a board, or never answers; or
for what no wait fixes at all (memory, a board that does not exist, a deal
whose time goes on boards it throws away). With a board found once in `m`
seconds a deal runs the deadline out with chance `e^(-120/m)`, which passes
one half at `m` ≈ 173 s: that is the mean wait past which a rare size is
refused. A line is placed from a dozen deals each side, dealt as the app
deals them.

**The instrument.** `npm run deal-walk` with cells named called the
generator directly, where a retry loop gives up after 10,000 tries rather
than at the deadline, so its "gave up" was not the player's. A named cell is
now dealt by `generate`, under the deadline. The figures in "What was
measured" above predate that.

## The second answer

Two days into measuring, a line placed that way was seen to be a timing: it
moves whenever a generator or solver gets faster or slower, and on a slower
device, so every table would be measured again after every solver change.
And a player is never trapped by a slow deal: every deal runs in a worker of
its own, Stop ends it, and after the deadline it says no board was found
(`dealGaveUp`). A refusal saves at most that wait.

The owner chose, 2026-10-21, to **drop every refusal drawn on time**, so that
the catalog never needs measuring for it again, and to give the player an
estimate of the wait if that is straightforward.

**The rule.** A size is refused only for what no speedup changes: a board
that does not exist, shown by a count or a proof (`noSuchTier`), or a
structural limit (memory, an encoding, a level the hint cannot open). A size
that is merely rare or slow is dealt, and the deadline answers it the same
way in every game. Nothing in the catalog is drawn from a deal's time. A
`noSuchTier` that rests on a count of tries stays: it is no timing, since a
faster machine finds no board a count missed, and `describeAbsentTiers`
goes red if a solver change makes such a board findable, which is when it is
measured again.

**What that needs of the engine.** The deadline is checked between a
generator's tries, so a single long search outlives it: Mosaic at 100×100,
Blackbox with many balls and Signpost on a 2×450 were seen never to answer.
The page ends a deal's worker at the deadline and reports it as found none,
so no game can hang a wait whatever its solver does. A type whose last deal
found nothing is already not dealt ahead until asked (`DealAhead`'s
`unasked`), so a hopeless Custom type spends no background time.

**The estimate.** No figure is known before a type's first deal on a device,
which is the wait that matters, so the words say what is known: how long the
wait has run, that a deal gives up by the deadline, and how long the last
deal of the type took where one did this visit.

## What Changes

- Every `tooRareToDeal` refusal, every "takes too long to deal" refusal, and
  every bound drawn from measured deal times or acceptance rates is removed
  from `validateParams` across the catalog. A refusal backed by a count or a
  proof (`noSuchTier`) or a structural limit stays. `tooRareToDeal` goes.
- `DealAhead` ends a deal at the deadline from the page.
- The pending-deal words give the elapsed wait, the deadline, and the last
  deal's time of the type.
- `engine-difficulty`: "A tier too rare to deal says so" is removed; the
  rule above is stated, with the page's deadline.
- Game specs and help pages lose the bounds they name; Sokoban's refusal
  keeps its line and says its real reason.
- `docs/solver-and-generator.md` § "A Custom size is not refused for its
  wait" states the rule.

## Impact

`src/engine/{deal,difficulty,retry-limit}.ts`, `src/puzzle/{deal-ahead,
puzzle}.ts` and the chrome's pending-deal words; the validators, tests,
help pages and specs of every game with a timing refusal;
`openspec/specs/engine-difficulty/`; `docs/solver-and-generator.md`;
`scripts/deal-walk.ts`.
