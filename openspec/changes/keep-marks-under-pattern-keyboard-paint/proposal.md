# keep-marks-under-pattern-keyboard-paint

**Status: approved by the owner (2026-10-09)**, who took the recommendation
of the session that archived
`2026-10-09-triage-what-the-spec-rewrite-found-in-the-code` (its row
`A-pattern-1`). Third in the order that session set: after
`give-a-canceled-press-its-own-signal` and `deal-or-refuse-large-tracks-boards`.

## Why

A pointer paint drag in Pattern never rewrites a square the player already
marked (`onlyBlank`). The keyboard's paint stroke does. Seen in the running
app (2026-10-09): a square marked clear, then Ctrl+Right with the cursor on
it, became shaded. It happens on every Ctrl+arrow or Shift+arrow stroke that
crosses a square marked the other way. Upstream's stroke overwrites too, and
the change that gave the drag `onlyBlank` spoke of the pointer only, so the
keyboard was never decided.

## What Changes

- A Ctrl+arrow or Shift+arrow stroke sets `onlyBlank` on its `fill`, so it
  paints blank squares and leaves a marked one as it is. Ctrl+Shift+arrow,
  which clears, is unchanged.
- A stroke with no blank square among its two makes no move.
- Enter and Space stay the deliberate way to change one square.
- The help page says the keyboard stroke skips marked squares, as the drag
  does.

## Capabilities

### Modified Capabilities

- `pattern`: "Pattern's keyboard paints and cycles as the pointer does", which
  today states that the stroke overwrites.

## Impact

- `interpretMove` in `src/games/pattern/index.ts`, one test, and
  `help/games/pattern.md`.
- No save or game-ID change: the `fill` move already carries `onlyBlank`.
