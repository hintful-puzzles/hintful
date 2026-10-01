# hold-validatedesc-to-newstate

**Status: done (2026-10-01).** Task 0 found no disagreement that throws, and
found that throwing is all a test of this shape can see for 21 games of 57;
`tasks.md` has the numbers, and `read-descs-through-one-cursor` carries the
structural answer.

## Why

`validateDesc` and `newState` read the same description twice, and
`docs/games/mechanics.md` § "The two scans have to agree, and nothing makes
them" says so. A description `validateDesc` accepts but `newState` cannot
build is a crash on a pasted game ID: the Enter Game ID dialog loads it, and
the throw lands in the worker rather than in a sentence.

`own-the-player-facing-messages` added `desc-error-games.test.ts`, which feeds
every game a few descriptions no generator writes and asserts each is refused
without a throw. It reads only `validateDesc`, and its inputs are junk, so it
cannot see the disagreement: junk is refused before `newState` is reached.

## What changes

A cross-game test, beside that one, that builds near-miss descriptions from
real ones and holds the two scans to each other:

- for every game, generate a board per preset and derive mutants of its desc:
  truncations at every length, one character dropped, one doubled, one
  replaced by a neighbor in its alphabet, a run letter changed;
- for every mutant `validateDesc` accepts, `newState` must not throw, and the
  state it builds must survive one `redraw` against the recording double.

Mutants are deterministic (no RNG beyond the seeded generator), and their
number is capped per game so the test earns its runtime (AGENTS.md § "Test
discipline"). Say the cap, and what it reaches, in the test.

## Task 0

Run it with no cap once and record what it finds. **Each failure is a defect
to fix in the game, not an entry to except.** If none fails, say how many
accepted mutants that was, per game, before calling it a clean bill (AGENTS.md
§ "Method", "a census that finds zero owes a power argument").
