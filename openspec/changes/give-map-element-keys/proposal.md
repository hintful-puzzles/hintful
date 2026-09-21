# give-map-element-keys

**Status: an open question, scaffolded so it survives the session. Not started,
and it needs an owner decision before it should be.**

## Why this is here

`give-rome-its-element-keypad` established the rule that a game's markable
elements belong on the on-screen panel wherever its notes are an **enumerable
per-cell set** — select a cell, tap a value, and in notes mode the same key
toggles it as a mark. Every note game in the collection now follows it except
three, and two of those are outside it permanently: Loopy marks *which corner*
of a face or *which pair of edges*, Slant marks *which two adjacent squares*
slant alike, and both are indicated by pointing, so there is no element for a
button to name.

**Map is the one that could go either way**, and the owner asked (2026-09-21) to
leave it and perhaps re-examine later.

## What makes it a decision rather than a task

Map's marks *are* enumerable — "possibly this color", four of them — so the rule
appears to apply. But a Map mark is laid by **dragging from a colored region
onto a blank one**, and which pencil bit it sets comes from *the color the drag
started on*. The mode arms the kind of drop, not its content.

So element keys for Map cannot be built the way Rome's were. Rome already
answered typed directions and only needed a reachable cursor; Map has **no
key-based entry at all** — not for notes and not for colors. Giving it four
color keys means giving it "select a region, press a color", which is a change
to **how the game is played**, not to how its notes are reached. It would
arguably be an improvement on touch, where Map is drag-only for everything —
which is exactly why it deserves its own decision rather than arriving as a
side effect of a notes-consistency change.

## What a proposal here would have to settle

- Whether colors get keys too, or only the pencil marks (only the marks would
  leave the game's primary action drag-only, which is the inconsistency this
  rule exists to remove).
- What a tap on a region means once it can select. Map's taps currently begin a
  drag; unlike Rome's, they are not no-ops, so selection is not free here.
- Whether erasing a color gets a key, given it is currently "drag in from
  outside the grid".

## What is already true, and needs no work

Map has the Marks key and the pencil-mode indicator, and its notes mode makes an
ordinary drag lay dots (`derive-the-marks-key-from-having-notes`). A player can
reach every Map mark today; what they cannot do is reach one without a drag.
