# make-the-help-pages-say-what-the-code-does

**Status: filed 2026-10-11 by the session that archived
`state-what-a-games-spec-never-did`, whose census found these. What it says
of the code was true that day; re-check before relying on it.**

## Why

Each game's requirements were written from the code and then read against
its help page. In twelve places the page says something the game does not
do, and each was confirmed by a second agent, most by running it. They are
in
`openspec/changes/archive/2026-10-11-state-what-a-games-spec-never-did/found.md`,
§ "A help page that disagrees with the code", with the line of the page and
of the code: Black Box (a second press on a fired laser "shows its path
again"; it recolors the result at its two ends), Bridges, Cube (two of the
four number-pad diagonals cross the flat side, and the page omits 8, 2, 4
and 6), Dominosa (the hint is said to reason from the player's lines; it
reads only dominoes), Inertia, Loopy (pressing again on a pair does not
cycle it), Seismic (sticky pencil mode starts on; `M` fills only cells with
no marks), Solo and Unequal (`M`).

The same file, under "Smaller things", lists where a page
is shorter than the code: keys the game takes that the page does not name.

Where the page was right and the code wrong, the finding is a bug and is in
`mend-the-keys-the-spec-census-found-wrong` or
`hold-a-hint-step-to-the-board-the-player-sees`, not here.

## What the engine could do so that no page has this

A help page's Controls section is rendered from `targetVerbs` in a game that
declares it, and such a page cannot disagree with the code there. Every
defect above is in hand-written prose: of a game with no `targetVerbs`, or
of a key outside it (the keypad, `M`, a preference). The first task is to
count, of the twelve, how many a declaration would have prevented, and to
say what the engine would have to render for the rest: the keypad's keys
from `requestKeys`, Mark-all's sentence from `canMarkAll`, a preference's
default from `prefs`.

## What Changes

- Whatever of the above the engine can render, rendered, so the sentence
  cannot drift.
- The remaining sentences corrected by hand to what the code does.

The words of about ten help pages change. Each change makes a page true.
