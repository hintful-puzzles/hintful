# quiet-map-hint-evidence

## Why

Owner playtest of `add-map-hint`, 2026-09-25: a small target region surrounded
by outlined neighbors was very hard to pick out. Every mark sat on a region
border, so where the target met a neighbor its blue band and the neighbor's teal
one ran together into one thick line. And on the commonest step, "This region
touches yellow, teal and purple, so it must be red", the outlines said nothing
the neighbors' own fills did not.

## What changes

- A single-region step (one color left) outlines nothing but its target. Its
  premise is the neighbors' colors, and the fills show it; the plan still reads
  those neighbors for continuity. That is about nine steps in ten.
- Where a premise does need its regions marked (a pair, a chain), they take a
  thin dashed line set in from their border by a band's width, so the target's
  solid band is the only mark on a boundary. The marks now differ in form
  (solid on the border against dashed and inset), not only in hue and weight.
- "Its other dots match the outlined neighbors" becomes "…match its neighbors'
  colors", since nothing is outlined.

Owner-chosen from options offered, 2026-09-25. Nothing a player has saved is
affected.
