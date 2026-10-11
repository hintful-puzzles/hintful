## 1. The engine

- [x] 1.1 `src/engine/win-wave.ts`: `Flash`, `NO_FLASH`, the wave (extent learned per frame, band, reduced-motion form), `sweepStep`, `loopSteps`, `walkLoop`, with unit tests
- [x] 1.2 `Game`: remove `solvedFlash`, `redraw` takes `Flash`
- [x] 1.3 Midend: arm the wave on `becameSolved`, start its clock after the move's animation, commit the extent after each frame, end a wave nothing asked about
- [x] 1.4 Reduced motion: the frontend's signal reaches the midend
- [x] 1.5 Test harnesses (`render-scenario`, `repaint-differential`, `fake-game`) and every direct `redraw` call in a test take a `Flash`

## 2. The games

- [x] 2.1 Paths: Tracks, Ascent, Signpost (its `flash-type` preference removed)
- [x] 2.2 Loops: Loopy, Pearl
- [x] 2.3 Spreads: Net, Netslide, Flood
- [x] 2.4 Sweeps: every other game, Cube and Guess included; Map's `flash-type` preference removed
- [x] 2.5 Games with a flash of their own (Flood, Inertia, Mines, Same Game) read `flash.time` for it, and the win no longer needs a kind in the `Ui`; Black Box's reveal blink was its win, and is the sweep

## 3. Guards

- [x] 3.1 Cross-game: every game, won through the midend, paints flash frames that differ from the settled board and lights its elements over time; see it fail on a game that asks nothing
- [x] 3.2 The repaint differential covers win frames in every game
- [x] 3.3 Per route: Tracks first lit square is the entrance; a loop starts at the bottom left and goes clockwise; Net lights the source first

## 4. Specs, docs, help

- [x] 4.1 Deltas for `engine-colors` and each game spec the proposal names
- [x] 4.2 `docs/games/rendering.md` § "Animation and flash", and the catalog entry for the helpers
- [x] 4.3 Help pages of Map and Signpost, where they describe the removed preference (neither does)

## 5. In the app

- [x] 5.1 Tune `WIN_BAND` by eye on Tracks, a sweep game and a loop
- [x] 5.2 Win a board of every game in Chrome, light and dark; reduced motion on one. Seen in at least one scheme: every game but Cube, Mines and Same Game, which Solve-then-redo does not reach and whose flash is pinned by their own tests. Reduced motion seen on Solo.
- [x] 5.3 Gate, commit, push

## 6. The owner's eye

- [ ] 6.1 The owner looks at the deploy. Two things to judge there: whether 2 seconds and the width of the highlight feel right, and whether each game lighting in its own color (Tracks yellow, Solo's entry wash, Loopy's white line, a lifted cell elsewhere) should become one highlight color for every game.
