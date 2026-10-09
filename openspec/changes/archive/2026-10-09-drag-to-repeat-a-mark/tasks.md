## 1. Survey and decide

- [x] 1.1 Every game's click and drag, and where a mark cannot be dragged.
- [x] 1.2 The design, put to the owner: paint and not toggle, one Undo step,
      the press-position split for Tracks and Galaxies, the smaller marks
      included. Owner, 2026-10-08: yes to all.

## 2. The engine, Tracks and Galaxies

- [x] 2.1 The sweep in `target-verb.ts`, and its sentence in the generated
      Controls paragraph.
- [x] 2.2 The midend joins a drag's moves into one step of Undo and Redo.
- [x] 2.3 Tracks: a drag from an edge.
- [x] 2.4 Galaxies: a drag from a line.
- [x] 2.5 The model's tests, and the cross-game guard, seen to fail on a
      planted defect.
- [x] 2.6 In the app: Tracks' drag round a corner, and one Undo.
- [x] 2.7 In the app: Galaxies' line drag, straight and round a corner, and
      one Undo. The arrow drags are held by the game's own tests.
- [x] 2.8 The gate, and pushed for the owner to try.

## 3. The rest of the catalog

- [x] 3.1 Cell marks through the model: Light Up (crosses), Range, Singles,
      Unruly, Slant, Magnets, Subsets, Black Box, and Mines' flags.
- [x] 3.2 Edge marks through the model: Palisade, Separate, Dominosa, Loopy.
- [x] 3.3 Mosaic moved onto the model's drag, which lays and clears; its own
      row-and-column paint drag is gone, and its `paint` move is kept for a
      saved game to replay.
- [x] 3.4 `dragMarkVerbs` for a mark outside `targetVerbs`: Pearl's crosses,
      and the clue-done marks of Towers, Undead and Unequal (Magnets' is in
      its sweep).
- [x] 3.5 Notes-mode marks: Net's side notes and lock, Slant's mark between
      squares. Loopy's is left: its notes drag is the pair note.
- [x] 3.6 `testing/sweep-probe.ts`, one check for both kinds of declaration.
- [x] 3.7 Help pages for what the generated paragraph does not say.
- [x] 3.8 In the app: Range, Mines, Unruly and Palisade. Palisade's drag
      through the middles of a row took the edges beside it, two pixels off
      center: a reach is measured from an edge's true middle now
      (`sweep.middle`), for it, Tracks and Pearl.
- [x] 3.9 Mosaic's cursor left a pixel at the grid's bottom right corner,
      which the new drag reached and `warm-repaint.test.ts` caught.
- [x] 3.10 The gate.

## 4. Tracks' right button, from the owner's play of part 2

- [x] 4.1 A right-drag crosses squares only, wherever it starts.
- [x] 4.2 A right-click crosses an edge only on the strip along it.

## 5. Tracks' left drag and win flash, from the owner's play

- [x] 5.1 The left drag is decided by what the pressed square holds.
- [x] 5.2 The win flash is a short highlight that runs the track from A to B,
      seen in the app on an auto-solved board.
- [x] 5.3 The gate.
- [x] 5.4 The owner's eye. Owner, 2026-10-09: "Consider it all accepted".
