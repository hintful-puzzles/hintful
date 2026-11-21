## 1. Derive

- [x] 1.1 Sort the `WRONG` entries by how their game finds mistakes. Nine
      wrote entries through `revealEntry`, Undead its own, and seven
      (Bridges, Guess, Mines, Net, Signpost, Wordtrail, Adjacent) other
      shapes. A seek over input needs no shape: each of the 17 reached a
      mistake on its own deal (furthest Group at 517 events, next 145).
- [x] 1.2 Derive the wrong board for every game; drop every pin. Planted
      "the overlay never leaves the key" in Keen (`wrong` dropped from its
      `TileCache` overlays): the seeking run fails at "check after the
      sought mistake", 320 px. Guard time: 68 s at HEAD, 69 s with the seek.

## 2. Finish

- [x] 2.1 `docs/rendering.md` § "A warm frame must match a fresh one" says
      no game owes a pin; § "Prove the overlay repaints" and
      `docs/testing.md` follow. Commit, push, archive.
