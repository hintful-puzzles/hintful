# Design

## What was measured (2026-11-16, at 9673834ae)

Each census file run alone with `CI=true`, the census skipped. The import
share of vitest's duration is the load-time deal: Seismic 2.5 s, Path 1.9 s,
Magnets 0.55 s, and the rest 0.1 to 0.35 s. Norinori and Starbattle already
dealt inside a memoized thunk. So the claim holds for 16 of 20 files, and
three of them are what costs.

## D1: `board` is called once, and `solve` builds what it changes

The census calls each case's `board` once, inside the case's test, and hands
the one board to every cap. A game whose solver changes its input (Subsets'
`known`, for one) returns from `board` what was dealt, `{ params, desc }`
where nothing cheaper fits, and `solve` builds its working state from it.

Declined: a separate `deal` and `fresh` per cap. Building a state from a desc
is cheap beside dealing it, so one function in `solve` does it with no second
slot in the spec, and every game writes the census the same way.

## D2: the guard counts the generators' retry tries while the file loads

Every generator's retry loop takes a guard from `retry-limit.ts`, and the
guards already tally their tries for `npm run deal-walk` (`countingTries`). A
test setup file runs before each file's imports, so it opens a count there
(`openLoadWindow` in `testing/dealt.ts`) and closes it in a `beforeAll`,
which runs after the file has loaded. The census adds one test, in every
run, that the count is empty, and names the guards that tried.

This sees a deal whatever function it went through, since it measures the
generator running and not a name. It does not see a board made with no
generator, a desc parsed or a grid filled at random, which costs nothing
worth guarding. Declined: the file's collection time, which is wall time on
a busy machine and cannot name what dealt.

A file that shares its boards between the census and checks that run in CI
(Path, Norinori) deals each through `dealOnce`, so the board is dealt by
whichever test asks first.

## Seen failing

Before the callers moved, in CI mode: Seismic failed naming its 4x4, 6x6 and
7x7 generation guards, the grid skeleton naming `skeleton: generation`, and
Palisade, already lazy, passed.
