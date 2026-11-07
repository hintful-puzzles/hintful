# Tasks

- [x] 1. The census, from the archive's recorded timings and one profile at HEAD (`deal-profile`), not a re-timing of every game (proposal § "How the census is taken")
- [x] 1a. Check `rung`'s self time against the instrument: inlined technique work, not the wrapper (proposal § "What it found")
- [x] 2a. Read the marks in place in compiled code (`marksRead`): Boats about 9% faster, the rest within noise
- [x] 2b. Keep what the hand-written Slant solver kept: `linked` caught up from a placement log, and sums over a group kept at its root (`linkedAggregate`); same boards and verdicts, 30×30 solves halved
- [ ] 2c. Per-scan code quality, construct by construct, each timed on the same boards: one loop for several aggregates over one set, `slash` and clue reads made cheap, a set not built where only its size is read; Slant first, then the other games in the census
- [ ] 2. The fixes, in the compiler and runtime: board-kept values across boards, inline set walks, what `with` inlines; boards dealt, tests and soundness verdicts unchanged
- [ ] 3. Each game within about 10% of its hand-written deal time, or brought to the owner with its profile; download sizes recorded
- [ ] 4. How the cost stays near zero for the games still to be described, brought to the owner; the guides updated
