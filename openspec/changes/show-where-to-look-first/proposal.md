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

## The measurement, and the owner's answers (2026-11-09)

Over every hinting game's gate presets, up to 40 steps a board, 5,506 steps:
the first non-ring mark the words name is an outline in 59%, stripes in 18%;
23% name only rings (all of the search games, and most of Solo's singles);
under 1% name nothing. 26% name more than one piece of evidence, and 17% are
a journey's later leg.

- **Which mark is the "one"**: the evidence the step reasons from, shown in
  the outline (green), and **the smallest reference available**, so it is
  only a nudge. An outline before stripes, which are the larger pointer; a
  step with neither shows its ring.
- **A step whose only mark is its ring** shows the ring alone.
- **The status line** says "Look here."
- **A journey's later leg**, and a step whose words name no mark, skip the
  first beat.
- **Entry points**: keyboard `H` is the same command as the button, so it
  walks the three beats with no work of its own. Auto-solve shows each step
  whole, as before.

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
