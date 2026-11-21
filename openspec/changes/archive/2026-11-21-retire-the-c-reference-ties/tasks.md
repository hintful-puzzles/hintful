## 1. Census

- [x] 1.1 Re-take the review's census at HEAD, and list each spec
      requirement, guide passage and comment that asks for a byte-match, a
      C-graded verdict or C's draw order.
- [x] 1.2 For each differential, name what else it is the only net under,
      and what replaces it.

Census at `4dcb0fcbc` (2026-11-21): 56 `*differential*` files, of which 46
are game differentials, the two grid differentials, the shared helper and
its test; `repaint-differential` compares a game with itself and is not a
tie. 49 C fixtures, plus the RNG corpus. The sweep queries:
`git grep -il -E 'byte-match|byte.for.byte|byte-faithful|bit-identical|differential|c-reference|draw order' -- src docs openspec/specs scripts`.

What each differential was the only net under, and what holds it now:

- **Inertia's route length** (no longer than C's tour): the one assertion
  about our own code nothing else held. Kept as a ratchet on our own lengths
  over the same ten boards, in `inertia.test.ts`; seen to fail with the
  farthest-first tour removed.
- **Boats' params on upstream's fleets**: `upstream-descs` now asks
  `paramsError` of each params string, as loading a game ID does; seen to
  fail on a planted refusal.
- **Magnets' desc encoder** had no other round-trip: added to the
  generator test in `magnets.test.ts`.
- Every other assertion is held elsewhere: an upstream desc loading with one
  answer by `upstream-descs`; a board dealt at its tier and not below by
  `difficulty-contract` (Solo's X, Killer and Jigsaw are presets);
  aux and Solve by `solve-finishes`; params by `params-stability`; codecs by
  each game's own round-trips; and "which boards exist" moving under a
  refactor by `hint-walk-fingerprint`, which re-records with `-u`.

Two ties turned out to have another benefit, and stay re-founded on it:

- **Grid numbering.** A Loopy game ID is a grid desc, then a clue per face in
  face order, so a renumbered grid reads every shared link as another board.
  The grid differentials become `grid-numbering.test.ts` and
  `grid-aperiodic-numbering.test.ts`, asserting incidence only; coordinates
  and sizes (display) and the aperiodic seed-to-desc half are dropped. Seen
  to fail on a transposed square emission loop.
- **None for the RNG.** A Mines desc dealt before the first click is an RNG
  state, which looked like a reason to keep `random.c`'s stream; but the
  layout it deals also turns on the hint's ladder (`mines/generator.ts`), and
  the first click's move carries the layout, so holding the stream buys
  nothing. The corpus goes; `random.test.ts` holds what a generator asks
  (determinism, range, copy, encode and decode), seen to fail on a
  sign-extended draw.

## 2. Retire

- [x] 2.1 Build the slim upstream-ID corpus from the fixtures, and re-found
      `upstream-descs` on it; see it fail on a tightened parser.
      (711 descs over 48 games; Tents refusing `_` failed it, refusing `z`
      did not, since no Tents board in it has 25 blanks in a run.)
- [x] 2.2 Delete the differentials, their fixtures and
      `engine/testing/differential.ts`; drop the RNG corpus test and the
      constraint, keeping the code. Rewrite the tests that read a fixture
      as sample boards onto inline boards.
- [x] 2.3 Rewrite the guides' byte-match passages as what replaces them;
      drop the generators' "byte-match critical" headers, keeping
      provenance; and every comment that hands a guarantee to a differential.
      `testing.md`'s five fixture sections became § "When the boards a seed
      deals move". The probe stops excluding `*-differential.test.ts`, which
      had come to exclude only `repaint-differential.test.ts`, a module's
      own test. Spectre's fallback test asserts an incidence digest, taken
      while the C's whole-dump digest still held.

## 3. Finish

- [x] 3.1 Spec deltas; `npm run test:hint-sweeps` (12 files, 658 passed).
- [ ] 3.2 Commit, push, archive.
