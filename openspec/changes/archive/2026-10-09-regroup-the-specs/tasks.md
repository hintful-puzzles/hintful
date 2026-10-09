# Tasks

Written 2026-10-09 from `design.md` § "The order of work", by the session that
took the change up. `design.md` § "How it was carried out" says where the work
departed from the order filed.

## 1. The plan of moves

- [x] 1.1 Merge the two "belongs elsewhere" lists into `moves.md`: a table of
  every requirement that moves, by destination, with why a session would look
  there, and a disposition for every entry of the two lists. Check: the
  dispositions count 104 and 84, the entries of the two sections.
- [x] 1.2 Decide the divisions, `repo-layout` first, and record them in
  `moves.md`.
- [x] 1.3 A fresh reviewer reads `moves.md` against the specs: for each row,
  is the destination where a session reads before the work the rule binds,
  and does the requirement read true there? Its findings are applied.

## 2. The moves, tried before they are made

- [x] 2.1 Build the regrouped specs outside the tree from `moves.md` and
  `rewrites.md`, with every reference by capability and title inside a spec
  repointed. Check: every requirement of the tree is in the regrouped specs
  exactly once or is named as removed, and a moved block is the same text.
- [x] 2.2 `rewrites.md`: the requirements that are reworded and not only
  moved (`border-grid`), each reviewed old against new.

## 3. The doubtful requirements

- [x] 3.1 The brief for settling a capability's doubts (`doubts-brief.md`),
  with the entries of `prune-report.md` § "Kept only for doubt" and the
  entries of the two lists that are a game restating the engine's rule.
- [x] 3.2 Each capability settled into `verdicts/<capability>.md`: cut with
  its word and what holds the rule, kept, or the owner's with a
  recommendation. Read against the regrouped specs of 2.1.
- [x] 3.3 Each verdict file that cuts, rewords or edits a requirement
  reviewed by a second agent, old against new, which restores what should not
  go. `verdicts/engine-hints.md` keeps every requirement it names and was not
  reviewed.
- [x] 3.4 The owner's pile. It is empty: no agent and no reviewer found a
  doubt whose answer the tree could not give. What the settling found beyond
  its verdicts is `found.md`.

## 4. The deltas and the tree

- [x] 4.1 The deltas are derived as the difference between the specs in the
  tree and the regrouped, settled specs: a move is a `REMOVED` and an `ADDED`,
  a cut a `REMOVED` with its reason, a reworded requirement a `MODIFIED`.
  Check: `openspec validate regroup-the-specs --strict`.
- [x] 4.2 The Purpose of every new capability and of every capability that
  lost a subject (`purposes.md`).
- [x] 4.3 Every citation of a moved requirement in `src/`, `docs/` and
  `scripts/` repointed. Check: `node scripts/checks/spec-citations.mjs`, and
  a search for each capability that lost a subject.
- [x] 4.4 The guides' pointers: `docs/help-pages.md`, `docs/games/testing.md`,
  `docs/test-strength.md`, `docs/games/solver-and-generator.md`,
  `docs/games/README.md` and whatever else names a capability for a subject
  it no longer holds.
- [x] 4.5 Archive, and check that the specs the archive wrote are the
  regrouped specs of 2.1 and 3.2, requirement for requirement.
- [x] 4.6 Run `node scripts/checks/spec-census.mjs` and record before and
  after in `design.md`.
- [x] 4.7 The gate, the commit and the push.

## 5. The owner

- [x] 5.1 No question came out of the doubtful requirements. The one defect
  of `found.md` that a player can reach is put to the owner as a separate
  matter when the change is archived.
