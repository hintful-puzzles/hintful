# make-guess-d-clear-in-notes-mode

**Status: approved by the owner (2026-10-09)**, who took the recommendation
of the session that archived
`2026-10-09-triage-what-the-spec-rewrite-found-in-the-code` (its row
`B-guess-5`). Fourth in the order that session set.

## Why

In Guess's notes mode the erase key clears the marks on the framed answer
slot. Its letter alias does not: seen in the running app (2026-10-09), with
the frame on the second answer slot and notes mode on, `d` removed the second
peg of the working row and left notes mode on. Only `isEraseKey` is diverted
to the marks in `interpretMove`, so `d` and `D` still take the working-row
arm. A player on a physical keyboard who uses the alias loses a peg they
meant to keep.

## What Changes

- In notes mode `d` and `D` do what the erase key does there: clear the marks
  on the framed slot, and touch no peg.
- Outside notes mode they are unchanged.

## Capabilities

### Modified Capabilities

- `guess`: "Guess rubs out a color without ever lengthening the row", which
  today states the alias's behavior in notes mode.

## Impact

- One condition in `interpretMove` in `src/games/guess/index.ts`, and a test.
- The help page, if it names the alias.
- No save or game-ID change.
