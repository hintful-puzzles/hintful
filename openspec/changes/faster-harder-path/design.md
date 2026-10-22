# Design — faster-harder-path

Measured 2026-10-22 in Node on the owner's machine (M-series, under swap
during the deal walk, so the times are if anything high). A phone is slower;
the app deals the next board ahead in a worker, so the wait a player sees is
mostly the first board of a type.

## D1. Where the time went

Profiled at HEAD (5x5 to 11x11, both tiers): `layPaths` 21 of 26 s, the
ladder the rest. `layPaths` joined at random and kept a join of two long
paths as readily as one that rescued a stranded square, so the chance that
no square was stranded fell with the board's area: 1 attempt in 460 to 2,000
survived at 11x11. Joining the shortest path with the fewest joins left
first: one attempt in one or two at every size.

The ladder, then: a Pieces rebuild on every write (now incremental: a line
merges two pieces, a cross changes none), two scans of every square per
firing inside a supposition where one serves, arrays allocated per square
per scan, and a full scan of the board after every firing. The board now
keeps a mark per square that `forcedAt` last found nothing on, cleared by a
write to an edge the square reads (`PathBoard.stir`); a supposition copies
its parent's marks, so its walk looks only at squares it has touched.
Grading takes the first supposition that breaks, from where the last search
left off, rather than the shortest, which only the hint needs.

Checked three ways: the new ladder against HEAD's on 80 boards, dealt by
both generators, at three stages of play and both caps, 480 comparisons,
verdict and lines all equal; the same check with a planted defect (a
contradiction behind a firing missed) finds 5; and deals with and without
the quiet marks identical, desc and first hint, with a planted omission in
`stir` breaking the deal outright.

## D2. Tricky is a longer walk

Three candidates for the third tier, each dealt at 7x7, 9x9 and 11x11:

| rung | outcome |
| --- | --- |
| a supposition that may also end where a region is walled off (a pair cut apart, squares cut off from every number), six firings | Tricky boards seldom found: 7x7 gave up in 10,000 tries |
| the same, twelve firings | found; 7x7 0.4 s, 11x11 0.5 s median |
| a plain supposition, twelve firings | the same speed and the same pairs kept as with the region ending |

The region ending added nothing beside the longer walk, so it is not kept.
Twelve rather than nine: at nine an 11x11 Tricky board took a median 0.7 s
and at worst 2.2 s, against 0.5 s and 0.6 s.

An earlier measurement credited the region ending with more, and was wrong:
the merged scan let a firing ahead in reading order hide a contradiction
behind it, which lengthened Normal's walks and weakened it. The A/B against
HEAD in D1 caught it; `forcedOrBroken` keeps a contradiction first.

## D3. A walk is the walk the hint shows

The hint always cut a supposition's walk down to the firings its break
needs; grading counted the walk as the Easy rung made it, squares the break
never reads included. Played by hint, six Tricky boards showed one Tricky
step between them. Now `findSupposition` runs a walk up to 24 firings, cuts
it down (`pruned`, moved from the hint to the solver) and holds what is left
to the rung's limit; the hint narrates the walk as recorded. After: Tricky
steps on three boards in four, one to seven each.

The edges skeleton had the same split, and takes the same fix.

## D4. Each tier stripped from the one below

`newPathDesc` mends paths until the Easy rung finishes the board, then
strips at Easy, Normal and Tricky in turn up to the tier asked for. A board
no join can be taken from at tier t-1 accepts a join at t only where t-1
cannot finish the result, so the board needs t; a strip at t that joins
nothing means the board is too easy and the attempt starts again. A join the
ladder refused is not tried again within a strip.

## D5. The menu

20 deals a cell (`npm run deal-walk`):

| cell | median | slowest | tries, median |
| --- | --- | --- | --- |
| 5x5 Tricky | 0.9 s | 2 s | 2,460 |
| 7x7 Tricky | 0.4 s | 1 s | 173 |
| 10x10 Tricky | 0.5 s | 2 s | 23 |
| 13x13 Tricky | 0.8 s | 3 s | 19 |
| 15x15 Tricky | 2 s | 4 s | 10 |
| 13x13 Normal | 0.1 s | 0.2 s | 1 |
| 20x20 Normal | 0.5 s | 1 s | 1 |

The menu is 5x5 at Easy and Normal, and 7x7, 10x10 and 13x13 at every
tier: eleven lines. A 5x5 Tricky board keeps three pairs and is a rare find,
so it is off the menu, and left to Custom.
