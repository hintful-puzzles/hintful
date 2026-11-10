# Tasks

- [x] 1. The compiler emits, behind a runtime switch, a fresh read of every binder at each binding, throwing where it differs
- [x] 2. A test deals and solves every described game with the switch on, counting what it checked
- [x] 3. Both plants named in the acceptance fail it; the test's cost is measured

## What was found (2026-11-10)

- **The guard found a real gap at once**: Blackbox's `ray` fired on a stale
  `u = ahead(s)`. `beam` and `ahead` hand the marks to the runtime but were
  not in `MARK_READS`, so no read was made again. They are listed now; only
  Blackbox's module changed.
- **The guard ships nothing.** It is half again the compiled modules' source
  (2.27 MB to 3.38 MB), so it sits behind `import.meta.env.DEV` and keeps no
  buffer outside its block: the built JS is within 534 bytes of the commit
  before, and no `freshBinding` survives in it.
- **Plant 1** (`groupRereads`' read made `true || …`) fails Palisade and
  Separate. It cannot fail Filling, Pearl or Tracks: with the read made to
  throw where it fails, 15 deals of every menu preset of each, millions of
  bindings, never failed it, so the plant changes nothing those games do.
  The acceptance's "Filling among them" was false at birth; no guard that
  observes behavior could meet it.
- **Plant 2** (`rechecked` emitting nothing) fails 25 games, each on a stale
  read. Of the 14 it reaches that pass, the same probe found the recheck
  failing only in Bridges (its 6th Normal deal) and Crossing (its 9th
  Unreasonable deal); the rest never fail it. The slow tier deals twelve
  more boards of every preset under the switch, and fails plant 2 in
  Bridges, Crossing and Light Up too.
- **What the test runs**: each `gatePresets` board solved at every cap, and
  a five-step hint walk, which alone reaches Guess's and Mines' techniques. A
  fresh deal under the switch caught nothing the solves miss. The file costs
  about 75 s of CPU here, nearly all of it Group's and Loopy's shared deals,
  which the suite pays once whoever deals them; under the 120 s a file.
