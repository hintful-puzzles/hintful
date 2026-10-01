# read-descs-through-one-cursor

**Status: scaffolded, not started (2026-10-01). Measurement first.**

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

**Falsifier:** if fewer than about fifteen games' parsers get shorter or
lose a hand-written ran-out decision with the cursor, record the no-go here
with its numbers, beside `run-length.ts`'s, and archive.
