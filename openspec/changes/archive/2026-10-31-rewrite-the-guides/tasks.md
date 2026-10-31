# Tasks

- [x] 0. CI's Gate run went red on 3a48e89e (run 41241268134): `twiddle-hint.test.ts` at 153 reference s against 120. Its cost was the turn library's build on each shape's first hint (a 4×4 orientable board's first hint took 12.7 s, the walk after it 23 ms). Fixed in the planner, plans unchanged on 36 boards: the build is 1.5 to 4 times faster (4×4: 2.3 s to 0.7 s). The test drops a duplicate of a preset and checks the whole plan on the walk's own board instead of rebuilding every library again (50 s to 17 s locally)

- [x] 1. Brief the writer and the reviewer (the rules by citation, the per-guide report)
- [x] 2. The guides read whole, smallest first: `method.md`, `help-pages.md`, `doctrine.md`, `work-management.md` (work-management's "Which hintless game comes next" retired: every game declares a hint)
- [x] 2a. Owner (2026-10-31): a significant simplification that improves maintainability is a benefit in its own right; the rule is judgment, not dogma. `doctrine.md` § "Nothing is sacred" says so
- [x] 2b. A pointer pass on the four short guides above, under the owner's "a guide points; the code details" (design.md), set after they were committed
- [x] 3. The mid-sized guides: `descriptions.md`, `new-game.md`, `hints-search.md`, `test-strength.md` (written, trimmed to no growth, then a pointer pass; committed 2026-10-31)
- [x] 3a. Review the mid-sized guides' pointer pass with a reviewer that did not write them (old text = the commit before `docs: rewrite the mid-sized guides`): lost rules as opposed to detail; every "X's header says/lists" pointer opened and confirmed; descriptions.md's five "What a statement costs" shapes against `compile.ts`; anything outside test-strength.md quoting a figure it no longer holds; the change ids no longer cited (72 ids, 64 resolving vs 75/67 before)
- [x] 4. The large guides: `rendering.md`, `testing.md`, `input.md`, `hints-candidates.md`, `mechanics.md`, `hints-marks.md`, `hints.md`, `solver-and-generator.md`
- [x] 5. `engine-catalog.md`, its index under budget with a quarter free (shorter rows: 11,988 → 7,286 bytes, 39% free; a catalog per area measured smaller but needs a `guide-sections` change, so not taken)
- [x] 6. `README.md` § "Documentation" follows the guides, and states the owner's rule for any guide: a guide points and the code details; a detail found stale is deleted, not corrected
- [x] 7. The owner reads a sample and accepts (accepted, 2026-10-31)
