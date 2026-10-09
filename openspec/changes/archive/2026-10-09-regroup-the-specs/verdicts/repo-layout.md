# Verdicts: repo-layout

## keep `repo-layout`: A check that counts violations also counts what it looked at

`docs/method.md` § "Count what the check looked at" says to count the inputs
and assert the count, and nothing under `docs/` says the count is a floor.
`docs/games/testing.md` § "Metrics and instruments" says the opposite of a
neighboring thing ("Thresholds are ratchets, never aspirations"), so a session
setting a vacuity count would tighten it without this. The floor is a decision,
and this is its only statement.

## keep `testing`: The mock check says what it scanned

More than an instance of the general rule: it also says the scan reaches
`vite-plugins/` and that the pattern is proved against a known mock and a spy.
`src/no-module-mocks.test.ts` does all three, and the requirement is the reason
it does.

## keep `repo-layout`: The layering check guards its own reach

It says what this check must count, which the general rule cannot: that every
relative specifier resolves, and that the failure names the ones that did not.
`src/module-layering.test.ts` holds it, with the floor set far below the true
count. A rule a guard exists to hold.

## keep `testing`: The probe walks the engine recursively and fails below a floor of test files

Its reason is the probe's own and not the general rule's: too few tests found
reads as a lower rate, which looks like the tests getting worse, and the anchor
check cannot see a file move. `scripts/feedback-probe.mjs` (`TEST_FILE_FLOOR`,
`checkTestFileFloor`) holds it and tells its reader not to lower the floor.

## keep `repo-layout`: The spelling guard scans every tracked file and counts them

The count is the smaller half. The requirement is the only statement that a
stem is matched as a substring and case-insensitively, over every tracked file
outside the exemptions, which is what the guard is. `scripts/checks/spelling.mjs`
does it, with `FLOOR`.

## keep `repo-layout`: Two old names that fold to one are resolved per file

`scripts/check-rename-shape.mjs` does this (it reports a file that "uses both …
not invertible"), it has no test, and it is run by hand on a vocabulary merge.
The requirement is what says the report-and-do-not-guess behavior was meant; a
session simplifying the fold would otherwise fold both names and corrupt the
comparison without a failure anywhere.

## keep `repo-layout`: A rewrap residue is reported apart from a content difference

The same script, the same absence of a test. Folding a rewrap into "differs"
or into "clean" are both the easy simplifications, and each hides an unintended
edit where one most easily hides. Only this says they are kept apart.

## keep `repo-layout`: Design-fiction docs are labeled and quarantined

No such directory exists (`docs/framework-rdd/` was deleted; `git grep -i
"design.fiction"` finds nothing outside the specs and the archive), but the
absence is not the rule going stale: the commit that retired the vision
(8f2f318e, "repo-layout generalizes the design-fiction rules and adds the
retirement rule this change follows") rewrote these rules on purpose to bind
the next vision. That decision was made with the directory already going.

## keep `repo-layout`: Design fiction is not cited as shipped behavior

As above: generalized deliberately when the one vision was retired, to bind
the next one. It also reads with "A withdrawn or completed vision item is
struck through and kept", which no entry names and which stays.

## keep `repo-layout`: Shipped fiction moves into the real guides and specs

As above. This is the rule the retirement itself followed (the live rules
moved to `AGENTS.md` and four guides before the directory went), and it is the
one a later vision would most need.

## keep `repo-layout`: A style pass changes no behavior and adds no abstraction

The two requirements it serves stand ("A comment says what the code cannot, and
a name answers its own question", "An identifier is renamed only when a domain
reader has to ask"), so any later edit made to meet them is a style pass and is
checked against this. Whether one large pass is planned does not matter; the
rule binds the small ones.

## keep `help-pages`: Adopting or relocating a help page changes no words, attribution or URL

`help/upstream/` is gone and the adoption is done, but relocation is not: the
promise that moving a help source changes no served URL is stated nowhere else.
"A help source directory does not shadow a served URL directory" names the URL
shape only in passing, and `docs/help-pages.md` § "One directory, owned by this
project" says where pages render, not that a move may not change it. A help URL
is something a player has bookmarked.

## cut `repo-layout`: The build output directory is `dist/`

declared: `.gitignore` carries `/dist/`, the build writes there by Vite's default (no `outDir` is set for the app build), and `build-pipeline` reads `dist/` throughout. The refusal of `build/` is held by "Repo root holds product-level config only", whose list of entry-point directories is closed and has no `build/`; the directory was dead C-toolchain output (commit 04bbd76e) and nothing is left that would produce one.

## keep `testing`: A shared helper carries the byte-for-byte differential shape

No new fixture can be recorded, but the fixtures that exist are live and their
tests are edited: `docs/games/testing.md` § "The frozen differentials" calls
them the net under refactoring and tells a reader to call
`describeDescDifferential`. The requirement is the helper's promise (what it
asserts, the `extra` callback, that solver agreement is not its shape), which
is a contract between the engine's testing utilities and a game's test.

## keep `repo-layout`: A comment-only sweep is verified by count, not by green

`docs/method.md` § "Verify a bulk edit by the shape of its diff" says a green
suite is not the check, and does not say that a comment edit can swallow a
`describe` or that the counts are what to compare. A change is checked against
this one (were the counts compared?), as it is against its neighbor "A bulk
mechanical edit is checked for shape and for scope", so it stays beside it.

## cut `testing`: A suspected cross-file leak is localized in one worker, in both orders

process: a debugging procedure no change is checked against, read by a session with a test that fails only in a full run, which reads `docs/games/testing.md` § "Seed-deterministic, never clock-gated". That section says only "re-run the file alone, then the suite under `--sequence.shuffle.files=true`", so the guide entry below carries the rest.

## guide `docs/games/testing.md` § "Seed-deterministic, never clock-gated"

**Localize a suspected cross-file leak in one worker, in both orders.** A test
that fails only in a full run and passes alone is localized by forcing the
suspected files into one worker (`VITEST_MAX_WORKERS=1 vitest run <a> <b>`) and
running them in both orders, with `--sequence.shuffle.files` under recorded
seeds. One worker still runs its files in the order the sequencer picks, so a
pair run once can pass by scheduling the victim first.

## note the guide paragraph above replaces a clause of `docs/games/testing.md`

The section's closing paragraph ends "re-run the file alone, then the suite
under `--sequence.shuffle.files=true` to localize a cross-file leak", which
names the flag and not the two things that make it conclusive. Whoever applies
the guide entry ends that sentence at "re-run the file alone" and adds the
paragraph after it.

## keep `testing`: The test suite's strength is audited, not assumed

`docs/test-strength.md` cites it by title in its opening ("Normative rules live
in the specs"), in prose that `spec-citations.mjs --list` does not pick up. A
cited requirement is never cut. Its first scenario is also checked against a
change: an unmoved fixture justifies a refactor only as far as its measured
coverage.

## note `docs/method.md` § "Count what the check looked at" does not say the count is a floor

The requirement "A check that counts violations also counts what it looked at"
stays as the statement of it. A sentence in the guide would help a session that
reads only the guide: the count is set well below the true value, because its
job is to tell working from resolving nothing, and it is not one of the
ratcheted thresholds of `docs/games/testing.md` § "Metrics and instruments".

## note `docs/test-strength.md` opens with a pointer to a file that does not exist

Its second paragraph calls itself the companion to
`porting/game-port-playbook.md` §5. There is no `docs/porting/`; the tiers and
the render harness it means are `docs/games/testing.md` § "The test tiers" and
§ "Render scenarios". The same paragraph's citation of "The test suite's
strength is audited, not assumed" is in a form the citation check does not
read, so a rename of that requirement would not fail the gate.

## note the design-fiction requirements have no instance to be checked against

Four requirements of `repo-layout` govern a kind of document of which the tree
holds none. They were kept because the retiring change generalized them on
purpose. If the owner has since decided no further vision document will be
written, all four go together as `obsolete`, including "A withdrawn or
completed vision item is struck through and kept", which no entry named.
