# show-where-to-look-first

**Status: filed on the owner's word (2026-11-07). Low priority**: nothing
blocks it, and it waits behind the description work. Player-visible work the
owner named, so its result is brought to them before it is archived.

## Why

Every game's hint now marks the board: a ring on what the step decides, an
outline on what it reasons from, stripes on the line or region it names
(`docs/hints-marks.md`). The Hint button has two beats: show the step, its
words and all its marks, then apply it (`engine-hints`, "The toolbar Hint
button alternates show and apply").

A player who wants a nudge, not the answer, has nothing smaller than the
whole explanation. The owner asks for a beat before it: show only where to
look.

## What Changes

The Hint button gets three beats:

1. **Show hint**: one mark only, on the part of the board where the next
   deduction is to be found. No words that give the deduction away.
2. **Explain hint**: the step as today, its words and all its marks.
3. **Apply hint**: the step played, as today.

The engine chooses the one mark from the step's own marks: their roles
(`MarkRole` in `src/engine/hint-words.ts`) and the order its words name
them. No game writes anything new, and no game's hint changes. Any other
action disarms the next beat, as any action disarms the apply today.

## Questions the session brings to the owner, with its answers

- **Which mark is the "one"?**
  - The recommendation is the evidence the step reasons from: its first
    outline, or its stripes where it names a line or region.
  - The ring is where the answer is, so showing it gives the move away.
  - A step with no outline or stripes would show its ring.
  - Measure how many steps of each game's hint walks fall in each case
    before deciding.
- **What the status line says at the first beat**: nothing, or one fixed
  sentence ("Look here.").
- **Whether a step that is a leg of a journey** (`continuesPrevious`) skips
  the first beat, since the player is already looking there.
- **Whether keyboard `H` and every other hint entry point walk all three
  beats.**

## What it touches

- `src/puzzle/puzzle.ts`: the beat state (`_hintArmedToApply` becomes a beat
  of three).
- `src/puzzle/command-list.ts`: the label.
- The engine: one helper that narrows a step's marks to the chosen one, read
  where every renderer reads `stepMarks`.
- Specs `engine-hints` (the three requirements on show and apply) and
  `app-shell` (the Bar's widest caption at a phone width).
- The help pages that describe the Hint button.

## Acceptance

- Every game's first beat shows exactly one mark, chosen by the engine. A
  cross-game test enrolls a game by its having a hint.
- The second and third beats are as today.
- Checked in the running app on touch, keyboard and mouse, at a phone width
  and a desktop width, in light and dark.
- Brought to the owner before archiving.
