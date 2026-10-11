# mend-the-keys-the-spec-census-found-wrong

**Status: filed 2026-10-11 by the session that archived
`state-what-a-games-spec-never-did`, whose census found these. What it says
of the code was true that day; re-check before relying on it.**

## Why

Writing each game's controls as requirements found five places where a key
or a press does the wrong thing. Each was run; the boards and key sequences
are in
`openspec/changes/archive/2026-10-11-state-what-a-games-spec-never-did/found.md`,
§ "A control that does the wrong thing":

- **Sixteen**: Ctrl or Shift with Right from the last column, or with Down
  from the last row, slides the line the other way and carries the cursor
  off its tile. `src/games/sixteen/index.ts` takes the direction from
  whether the stopped cursor moved; upstream takes it from the key.
- **Galaxies**: Enter or Space on a dot that sits on an edge starts no drag,
  where the help and "The association drag runs from either button, the
  keyboard, and either end" promise one.
- **Ascent**: with the number pad set to move the cursor, 7, 9, 1 and 3 move
  it and also type their digit.
- **Filling**: a pointer press does not end a keyboard drag, so the next
  arrow extends a selection nothing shows.
- **Bricks**: Ctrl or Shift with a move answers a move that changes nothing
  where it should decline.

No test presses any of these: Sixteen's tests have no Ctrl press and no
shifted press from the last column or row; none presses a number-pad
diagonal in Ascent.

## What the engine could do so that no game has this

- **A modifier arrow from every edge.** Sixteen, Bricks, Boats, Clusters,
  Sticks and Tents each take Shift or Ctrl with an arrow. The cross-game
  input probes (`src/engine/testing/input-probe.ts`) can press each modifier
  with each arrow from each corner of a board and hold the result to the
  direction of the key, which is what Sixteen fails.
- **The number pad as a direction pad, resolved once.** Ascent and Bricks
  both offer it, and only Bricks resolves all eight digits before asking
  which key is a digit. One engine helper that turns a number-pad key into a
  direction under the preference leaves no game to forget the diagonals.
- **A move that changes nothing.** The midend already drops one; whether the
  probe should also convict a game that answers one is 2.3 below.

Galaxies' and Filling's are each a branch of the game's own.

## What Changes

- The probes above, each seen failing on the game that has the bug.
- The least that mends each of the five games.

A player's keys behave differently in five games, each as its help page
already says.

Found while doing it, 2026-10-11: with Num Lock off the number pad's arrows
arrived marked as number-pad keys, and Ascent under "Move cursor", Bricks and
Cube compare an arrow without looking past the mark, so none of them heard
those arrows. The frontend now marks a digit alone. Cube takes its
directions from the same helper as the other two.
