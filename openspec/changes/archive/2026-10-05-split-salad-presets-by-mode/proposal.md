# split-salad-presets-by-mode

**Status: implemented (2026-10-05).** Asked for by the owner on seeing the
fifteen-entry menu `offer-salad-normal-presets` left: *"For now, please just
split the Letters and Numbers presets into two separate sections in the
picker, as are essentially distinct games."*

## Why

Salad's two modes share a board and little else, and its menu listed them
interleaved in one run of fifteen.

## What Changes

- The menu's top level is two sections, "Letters" and "Numbers", each
  holding that mode's presets, Easy before Normal. The presets themselves
  are unchanged.
- The help page's list of modes says the section names beside the puzzles'
  own ("Letters, the puzzle called ABC End View"), since the page named
  neither word the picker shows.

Both are interim. How long a menu should be and when a mode earns a section
is `review-preset-counts-across-the-catalog`, and a mode's name coming from
one place is `name-a-games-modes-from-one-place`. A title inside a section
still leads with the section's word ("Letters: 5x5 A~C Easy"), which the
first of those decides.

## Compatibility

None to break: a menu's layout is in no saved game or shared ID.
