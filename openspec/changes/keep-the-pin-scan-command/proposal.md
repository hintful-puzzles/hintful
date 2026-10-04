# keep-the-pin-scan-command

**Status: scaffolded, not started (2026-10-04).** A follow-up from
`move-the-hint-scans-onto-the-harness`.

## Why

`HINT_SCAN=1 npx vitest run <file>` fails with the pins to paste. Pasting is
by hand, and a pin can be thousands of characters on one line, so in that
change nobody pasted: the work was done with a throwaway script that ran the
scan through vitest's JSON reporter and spliced each report into the file's
`pins: {` block. It was never committed, and a second copy grew beside it
when the first met a block at another indent. The predecessor's design said
"a separate script would be a second thing to find"; the scan stayed a mode
of the test file, and the step after it is the one that went missing.

Three faults that script had, each met in use:

- It expected the block at one indent.
- A rerun wrote "not found" over a pin kept by hand for a kind the scan does
  not reach (Black Box's `hiddenBall`, Pegs' `trapSoonOwn`).
- A `pinned()` call in a `describe` body throws while tests are collected,
  before a new kind has a pin, and the scan then reports nothing with no
  error.

## What Changes

`npm run hint-scan -- <test file>` runs the file's scan and writes the pins,
each under its count, and:

- leaves a pin in place where the scan found none, and says so;
- finds the block wherever it sits, and a file's second block;
- says when the file declared no scan, so an empty result is not read as
  health.

The harness guards the collection trap itself: in scan mode a pin that is
empty loads as a failure the scan reports, not a throw at collection.

It must write only the test file it was given. A tool must never write into
a change directory (`AGENTS.md` § "Work management").

## Hints to pull in

None.

## What would show it worked

Adding a kind to a game is: name it, run one command, read the count. The
guide's paragraph on pasting and on `cut` goes.
