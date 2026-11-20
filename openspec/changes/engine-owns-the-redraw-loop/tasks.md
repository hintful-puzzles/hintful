## 1. Design on a hard game

- [ ] 1.1 Re-run the census. Sort the 60-odd `redraw`s by shape: cell
      tiles, edge or vertex tiles, layered tiles, not tiles at all. Record
      each with its query.
- [ ] 1.2 Write the loop and the palette roles. Pilot on a game that
      pressures the design (several layers, text, animation, hint marks),
      not the simplest one.
- [ ] 1.3 Measure the pilot's frame time against HEAD, back to back under
      load; run it in the app (mouse, touch, keyboard, win flash, hint).

## 2. Migrate

- [ ] 2.1 Move the games in batches by shape; each runs in the app before it
      counts. Record in this file which are moved and which keep the
      explicit form, and why.
- [ ] 2.2 The skeletons' `render.ts` write the engine's form.

## 3. Finish

- [ ] 3.1 `docs/rendering.md` describes the one way. Run
      `npm run test:hint-sweeps`; commit, push, archive.
