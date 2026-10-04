# pin-the-lightness-a-help-page-names

**Status: implemented 2026-10-04.** Owner: *"Flip says 'Try to light up all the
squares in the grid', but in dark mode, it seems that we actually are currently
asking them to 'darken up all the squares' — if it's a unique thing, please
just fix it, but if you think that there is a deeper thing we could do there for
such doc references, I'd appreciate that."*

## Why

It was not unique. Flip's lit face was paper, which inverts with the scheme, so
in the dark scheme the lit face was the black one. The same shape, found by
reading every help page that names a lightness against its game's dark frame:

- **Sticks** calls its fixed cells black, in the help, the hint and the Custom
  dialog, and drew them in ink: white in the dark scheme.
- **Bricks** drew a cell that stays clear in the bevel's highlight, which
  inverts: in the dark scheme a clear cell sat a step from a shaded one.
- **Crossing**'s page said "black squares" and **Netslide**'s "the black box".
  Both are drawn in ink beside ink digits or wires, and inverting them with the
  rest is coherent, so there the word was wrong and the color was not.

`ts-engine` already requires that a piece's black or white is not ink or paper.
Nothing held a game to it where the word is "lit" or "shaded", or where the
word is only on the help page.

## What Changes

1. **Flip, Sticks, Bricks**: the named thing takes a pinned color. Bricks' and
   Sticks' digits on a pinned cell are pinned with it, and Bricks' border is
   `GRID_DARK` for the reason Range's is.
2. **Crossing, Netslide**: the page says "blocked squares" and "the solid box".
3. **`src/help-lightness-words.test.ts`**: a page that says black, shaded,
   white, lit or light up belongs to a game whose palette holds a color pinned
   dark, or light, in both schemes; a page whose word is not about a piece is
   recorded with what it is about. It fails on Flip with the old face.

**What the guard does not check**: that the pinned color is the one painted on
the thing the sentence names. Net's page says "lit" of a powered square, which
is teal, and passes because Net holds a pinned light color for something else.
Looking at the contact sheet is what checks that.

## Acceptance

The owner's, on the deployment: Flip, Sticks and Bricks in the dark scheme.
