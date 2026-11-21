## 1. Measure

- [x] 1.1 List every game's area bound, explicit or none, and what each
      protects. Measure deal and draw time at growing areas on the slowest
      games to choose the bound.
      - 2026-11-21, every game with a width and height, at its easiest tier,
        30x30 / 60x60 / 100x100 / 200x200, a 30 s deadline, six at a time on
        a loaded machine. Most generators find no board within the deadline
        between 30x30 and 60x60 (ABCD, Bricks, Clusters, Crossing, Filling,
        Galaxies, Magnets, Pearl, Samegame, Seismic, Separate, Signpost,
        Singles, Sticks, Tents, Unruly at 30x30). At 100x100 only Blackbox,
        Fifteen, Flip, Flood, Inertia, Map, Mines, Netslide, Rectangles,
        Sixteen and Twiddle deal; at 200x200 Blackbox 21 s, Fifteen 36 s,
        Sixteen 24 s, Map 1 s, Mines at once, the rest none or past 30 s.
      - Dealing sets no bound: the deal's deadline already ends a slow one.
        Drawing does: 100x100 Mines in a 1280x720 window is 4 px a square
        (checked in the app). The bound is 10000 squares, 100x100, which is
        also where Clusters, Pegs and Mosaic stood.
      - Loopy at 100x100 builds every tiling in at most about 1 s and 118,000
        faces (Great-Great-Dodecagonal), so no tiling needs less.
      - The old bounds: overflow guards from upstream's C (`INT_MAX`,
        2^28, half `INT_MAX`, `MAX_SAFE_INTEGER`) in Bridges, Filling, Flip,
        Inertia, Light Up, Map, Mines, Palisade, Pattern, Pearl, Samegame,
        Separate, Slant, Tents, Tracks, Twiddle, Unruly, Dominosa and Loopy's
        grid layer; a million in Net, Netslide, Rectangles; 10000 in Clusters,
        Pegs, Mosaic; and ceilings of their own in Ascent (999), Undead (54),
        Norinori and Path (400), Slide (48). Undead past 54, Norinori and
        Path past 400 only run out of deal time (Undead Easy 12x12 deals in
        94 ms; Norinori 24x24, Path 40x40 find none in 60 s), so they take
        the engine's. Salad's order, Cube's two sides and Guess's pegs and
        guesses had no ceiling at all.

## 2. The bound

- [x] 2.1 One bound in the engine; the games' overflow guards go. A game
      that keeps a tighter one says why.
      - `MAX_BOARD_AREA` in `params.ts`; a numeric field declares `area:
        { times, max }` (set on the width by `dimensionParamConfig`, with
        `maxArea` for less); `paramsError` refuses past it before
        `validateParams`, in a sentence named by the two fields; the help
        states it. Ascent keeps 999 (typed numbers stop at three digits),
        Slide 48 (the solver exhausts the heap). Guess declares pegs times
        guesses; Salad's order and Dominosa's number take a `max` derived from
        the bound; Cube's triangle grid is no product, so Cube holds its own
        count to the bound. `gridValidateParams` goes.
- [x] 2.2 Spec deltas for `engine-params` and the game specs that state a
      bound; help pages that state a limit.
- [x] 2.3 Plant a game without the bound and see the guard fail. Check the
      Custom dialog in the app at the bound and past it.
      - `src/guards/board-area.test.ts`: every field that moves a game's size
        words, set to a million, is refused. With the engine's check
        disabled it failed across the collection.
      - In the app: Mines 101x100 refused with "Width times height must be
        at most 10000."; 100x100 deals, draws and hints. Undead 30x3, past
        its old 54, deals and its hints narrate. Help pages state the area.

## 3. Finish

- [x] 3.1 Commit, push, archive.
