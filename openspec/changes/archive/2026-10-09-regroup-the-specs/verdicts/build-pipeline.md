# Verdicts: build-pipeline

## keep `build-pipeline`: Pool tuning keeps the suite deterministic, or is reverted

It is a standing rule and not the record of one decision. The comment above
`isolate: false` in `vitest.config.ts` is one application of it, and no guide
states the rule: `docs/games/testing.md` mentions `isolate: false` only as a
fact about the suite. A session changing the pool or the isolation setting
checks its change against this.

## keep `build-pipeline`: A guard the type system misrepresents is kept

No guide carries the two mechanisms (searched `docs/` and `AGENTS.md` for
`noUncheckedIndexedAccess` and for narrowing across a call: `tsconfig.json`
has the flag's measured cost and nothing on either mechanism). They are what a
dead-code audit needs in order to recognize the finding, and the triage
requirement names the third arm without them.

## keep `build-pipeline`: A live build option the tool's type does not declare is kept

The rule refuses two fixes that both typecheck: deleting the option, and
casting the whole containing object. `vite.config.ts` applies it once
(`esbuild.supported`, widened by a module declaration) and records that case
only. No guide carries it, and it is read whenever a tool upgrade narrows a
type, however rarely that has happened.

## reword `build-pipeline`: A test selector is accepted only against two experiments

It still binds: it is the acceptance test for a scheme that replaces the
selector, and it is the reason `select-tests.ts --verify` plans a Pearl source
change and a `help/games/pearl.md` change on every gate. The first sentence was
left dangling when the requirement was split from the one before it, and is
folded into the rule as the permission it was. No rule is dropped; the
fail-closed sentence stays although "The selector fails closed" also says it,
because here it binds a scheme that is not yet the selector.

### Requirement: A test selector is accepted only against two experiments

Any scheme that selects the tests a commit runs, one that selects on what a
test actually read at runtime included, SHALL be accepted only against two
experiments, a change to one game's source and a change to a `help/` page, and
only if it selects the glob-based guards for both. It SHALL treat an
unclassifiable change as "run everything" and never as "run nothing".

#### Scenario: A test-impact selector is proposed

- **WHEN** a change proposes to run only the tests downstream of a commit
- **THEN** it is run against a game source change and a `help/` change, and
  adopted only if it selects the glob-based guards for both
- **BECAUSE** the guards this project most relies on are exactly the ones a
  static graph cannot see, and switching them off is silent

## keep `build-pipeline`: Cognitive complexity comes from Biome

A refusal that still binds, which the prune brief keeps. Where it is written
is an internal decision and not the owner's: `biome.json` and
`scripts/metrics.sh` use the rule and do not say that a second linter was
turned down, so the spec is the only place the refusal is stated.

## keep `build-pipeline`: The unused-export check is the repository's own, not knip

A refusal that still binds, and one a session would propose again: knip is the
obvious tool, and `package.json` does not have it. The header of
`scripts/checks/unused-exports.mjs` tells the story, and a session deciding
which tool to install reads the spec before it reads a script's header.

## keep `build-pipeline`: The publish is verified on the deployed origin

`docs/work-management.md` § "Pushing and deploying" says to verify against the
deployed origin and names headers and clean URLs as host behavior. It does not
say that the headers are checked on the response and not inferred from
`dist/_headers`. The guide is a summary of this rule and not a second home.

## keep `build-pipeline`: The service worker and the crawler files are verified on the deployed origin

The guide's section covers the service worker and the offline check, and says
nothing of `sitemap.xml`, `robots.txt` or `VITE_CANONICAL_BASE_URL`, which
`.github/workflows/ci.yml` passes from a repository variable that can be
unset with no report. The spec is the only statement of that check.

## keep `build-pipeline`: A test is retired or deferred by measurement, never by category

`docs/games/testing.md` § "Right-sizing the gate" states it in a line and
sends the reader here for the conditions ("the conditions are in the
`build-pipeline` spec"). It is the condition on "No correctness check is
removed or weakened to buy speed" that a retirement is checked against, so it
is a rule of the gate and not only a way of working.

## keep `build-pipeline`: A test is not deferred when it is the only cover of a configuration

The same: the guide's treatment 3 says it in a sentence, and this is the rule
a deferral is checked against, beside "The hook keeps a board of every kind
and every check one board can fail". The three treatments themselves are how
the work is done, and the guide is their home.

## note the ten right-sizing and cost requirements cut as `process` stay cut

Read against `docs/games/testing.md` § "Right-sizing the gate", § "One board
of each kind per commit" and § "Where the cost actually is": the three
treatments in order, the stale pin's fallback, the systematic-property
condition on a seed count, the slow tier run once a refactoring round, and CPU
over wall time are each there. Nothing to restore.

## note the three cuts recorded as a cross-capability `duplicate` stand

Each rule is in the regrouped specs. "The probe's rate is never gated":
`build-pipeline` "The gate verifies that every probe case still applies"
(asserts nothing about the corpus's result) and "The local-feedback probe
plants a defect and runs only the module's own tests" (a diagnostic and not a
ratchet), which is now in `testing` and not in `repo-layout` as the cuts table
says. "The spelling guard runs ahead of the documentation-only shortcut":
`repo-layout` "The spelling guard runs in the gate's fast prefix, not as a
test", in those words. "The top-level metrics directory holds only live
instruments": `repo-layout` "`metrics/` holds only live instruments". The
brief's word for a rule another capability states is `collection`; the cuts
are right under either word.
