## REMOVED Requirements

### Requirement: Flip has a dev-time differential spot-check

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. It required an advisory check generating descriptions from the C build and the TS port side by side, and `crosses` output to match C exactly; there is no C build to run it against.

**Migration**: Correctness is "Flip generates solvable, non-trivial boards". `flip-differential.test.ts` and its frozen `flip-c-reference.json` stay as a refactoring net; a deliberate divergence retires them.
