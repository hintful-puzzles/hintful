## 1. Census

- [ ] 1.1 Re-take the review's census at HEAD, and list each spec
      requirement, guide passage and comment that asks for a byte-match, a
      C-graded verdict or C's draw order.
- [ ] 1.2 For each differential, name what else it is the only net under,
      and what replaces it.

## 2. Retire

- [ ] 2.1 Build the slim upstream-ID corpus from the fixtures, and re-found
      `upstream-descs` on it; see it fail on a tightened parser.
- [ ] 2.2 Delete the differentials, their fixtures and
      `engine/testing/differential.ts`; drop the RNG corpus test and the
      constraint, keeping the code.
- [ ] 2.3 Rewrite the guides' byte-match passages as what replaces them;
      drop the generators' "byte-match critical" headers, keeping
      provenance.

## 3. Finish

- [ ] 3.1 Spec deltas; `npm run test:hint-sweeps`.
- [ ] 3.2 Commit, push, archive.
