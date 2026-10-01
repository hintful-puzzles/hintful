# read-descs-through-one-cursor

**Status: done (2026-10-01).** Task 0 held on both counts; every game reads
its desc once through `DescParse`, most through `engine/desc-reader.ts`'s
cursor. `tasks.md` has the numbers.

## Why

Migrating ~150 description errors (`own-the-player-facing-messages`), three
agents working on separate batches each wrote the same decision by hand: a
separator or number that is missing because the description *ended* is
`DESC_TOO_SHORT`, and one that is missing because something else is there is
`descBadCharacter` or `DESC_MALFORMED`. Mines grew a local helper for it
(`misplaced`); the agents' reports name the split in at least Crossing, Cube,
Flip, Flood, Map, Mines, Samegame, Sixteen, Twiddle and Undead. A ternary
pattern found it in only seven files, because most sites are written as an
`if` and a `return`, so that count is a floor, not a census.

N games writing one decision is the layer below missing it (AGENTS.md §
"Convention over configuration"). A small reader over a description, with
`expect(",")`, `int()`, `char()` and `end()` that each return the right
`DescError` when they fail, would make the decision once.

## A second reason: one read instead of two

`hold-validatedesc-to-newstate` measured the cost of each game reading its
description twice, once in `validateDesc` and once in `newState`
(`docs/games/mechanics.md` § "The two scans have to agree, and nothing makes
them"). What it found, 2026-10-01:

- **34 games scan twice**, 5 share part of the scan, 7 share only the
  `run-length.ts` tokenizer (each still looping twice over the tokens), and 11
  call one parser from both. The 11 return **eight different shapes** —
  `{ ok, value }`, flat `{ ok, ...fields }`, an undiscriminated
  `{ error } | X`, `DescError | null` mutating a passed-in state, a record
  with a nullable error that two `newState`s ignore, a verdict string, a
  decoder that cannot fail, a tokenizer — and `desc-error.ts` has no result
  type.
- **36 games' `newState` cannot throw on a bad desc**: with `validateDesc`
  replaced by one accepting everything, they built and drew every one-edit
  mutant, the empty desc included. The cross-game near-miss test is blind
  for exactly those games.
- **26 games' validators accept a character the parser then ignores** — an
  accepted mutant built a state identical to the original's. Some are a
  benign spelling (`00` for `0`, `__` for `_`, padding bits in a last hex
  digit), but many are not in the grammar at all: Ascent and Bricks accept
  `^` and `` ` `` where `_` belongs, Blackbox and Mines accept `/` and `,`
  inside hex, Boats accepts `+` for `,`, Rome and Seismic accept `1` or `+`
  for their section break, Light Up and Mathrax accept a final run that
  overshoots the grid. Here the parser happened to read the intended board.
  A test cannot see the other direction, where it reads a different one,
  without an encoder to round-trip against.

A cursor whose failures are `DescError`s makes `validateDesc` the question
"did the one parse succeed" and `newState` its value, which a strict parser
cannot disagree with. So the cursor is now judged on two counts, and Task 0
reads both.

## The prior no-go, and why it may not apply

`run-length.ts`'s header records why a token iterator was rejected for the
games with richer descriptions (Towers, Keen, Solo, Undead and others): their
grammars hand an index back to the caller and re-enter the scan, so an
iterator was longer than the loop it replaced. (The neighboring no-go,
`record-the-letter-run-no-go`, is about the letter alphabet, and stands
whatever this finds.) That rejected an *iterator over tokens*. A *cursor* the caller drives is the
loop itself, so it may fit where the iterator did not. Task 0 decides, and
the change says which.

## Task 0

Read every game's description parser (not a grep) and classify each:
already a single-token grammar (`run-length.ts`), a grammar a cursor would
replace line for line, or one it would not fit, with the reason. Take the real
count of the ran-out split while reading.

For each, also say whether `validateDesc` and `newState` could become one
parse through the cursor; the classification above (shared, partial, twice)
is a starting map, not a substitute for reading.

**Falsifier:** if fewer than about fifteen games' parsers get shorter or
lose a hand-written ran-out decision with the cursor, *and* the cursor does
not let the twice-scanning games read once, record the no-go here with its
numbers, beside `run-length.ts`'s, and archive. If it fails the first count
and passes the second, the single read is reason enough on its own.
