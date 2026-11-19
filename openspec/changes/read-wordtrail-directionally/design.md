# Design

Decisions made while filing (2026-11-19); the implementing session may
revise any of them for a reason it records here. What is still the owner's
is marked **(owner)**.

## What an edge holds

The engine's `EdgeMark` stays `OPEN | LINE | CROSS`. A directed game keeps
beside it the direction of each line: which of the edge's two squares comes
first (a per-edge byte in the state, carried by `EdgeChange` as an optional
`from` square). An undirected game never sets or reads it, so Path's and
Pearl's saves and moves do not change. Read the engine first: if a single
mark with two line values (`LINE_FORWARD`, `LINE_BACK`) is cleaner across
the drag, the preview, `edgeMistakes` and the hint's ring, take that
instead and record why.

## The drag

The engine's `LineDrag.cells` is already in stroke order, so a release knows
each line's direction. With `directed: true` in `LineRules`:

- A square takes at most one line in and one line out (`takes` stays 2).
- A drag from the **last** letter of a word carries it on, as today.
- A drag that **ends on the first** letter of a word joins onto its front:
  the drawn lines run into it, and the word reads on through it.
- A drag **from the first letter outward**, or one that would meet a word's
  line head to head, stops before the square, as a drag stops today where a
  square would take too many lines: the start mark says where a word begins.
- A drag back along a word's own lines, in either direction, takes them up,
  as a drag that passes only lines does today.
- The keyboard's Enter-path is a drag and follows the same rules;
  Ctrl+arrow lays a line in the direction the cursor moves.
- **A click near an edge** (owner): today it toggles a line. Recommended: a
  click on an edge beside the end of a word extends that word across it;
  anywhere else it lays a line pointing right or down, and a click on a line
  reverses it before a third click takes it up. Ask the owner if this is not
  obviously good once played.

## The description

The answer's value on an edge needs the direction: `range(1, 3)`, with 1 a
line read from the edge's lower-numbered square to its higher, 3 the other
way, and 2 none (keep 2 = none so the crossing reads stay). `follows(k, x,
y)` becomes directed (`pos(k, y) = pos(k, x) + 1`), and the techniques
place the value of the direction the trails agree on. Find how the language
compares two squares' order (or add the smallest thing that lets it), check
every technique sound again (`CHECK_GAMES=wordtrail`), and re-pin. A trail
that spells a word both ways is two trail clues, so `onlyWord` where only
SIP and PIS fit through a letter decides nothing on that edge: the ladder
never asks a player to draw a line whose direction it does not know.

## The generator

A board is kept only where its division is unique against the guess list
read directionally, and no answer word reversed is a guess, so the answer's
directions are forced. Re-run the deal walk's census: how many boards a
preset costs at both tiers, against today's (`add-wordtrail` § 1.2).

## The look

Our own marks, not Wend's: a small ring or dot on a word's first letter,
and a chevron on each line pointing the way it reads, both in the line's ink
and drawn for unfinished fragments too. The list writes each word as read.
Check light and dark, touch, keyboard, and a phone.

## Not doing

Wend's colored word bands are its look, and the board's region fill for a
finished word already says the word is done.
