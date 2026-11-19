## Context

The gate's fast prefix (`scripts/gate.sh` § "1. Fast fail-fast prefix") is a
straight list of shell lines under `set -e`. Its own header says the order is
cheapest first, so a failure costs seconds. It does cost seconds; but each
refusal is followed by a commit attempt that re-runs everything before it,
and an agent who meets the refusals one at a time pays a gate run for each.

## Decisions

**One list of checks, read by both runners.** The prefix's cheap checks move
into one place (a list in a small script, or a shell function the gate
sources) that the gate runs fail-fast and the new command runs keep-going.
Two copies of the list would drift; `src/gate-scope.test.ts` and the
build-pipeline spec already require the hooks and `npm run gate` to mirror
each other, and the same rule covers this.

**What counts as cheap.** The checks of the prefix that read source and run
no test: the typechecks, biome, the `scripts/checks/*.mjs` guards, openspec
strict validation and spec-subjects, and the source-reading vitest pass
(step 1f) if it stays within seconds. The heavy branch (`vitest run`, `vite
build`) is out. Read the prefix at implementation time rather than this
list: it is the source.

**Fix what is mechanical, report the rest.** Biome's formatting and import
order, and spec-subjects' order, have one right answer and a fixer; the
command applies them to the files in the change and says so. A British
spelling, a long requirement or an unused export needs a person's choice and
is reported with its file and line.

**Scope.** The command defaults to what `git status` shows changed (staged
or not), because the gate tests the working tree. `npm run game <id>` calls it
with that scope instead of running biome over the game's directory alone.

**The archive.** The openspec archive skill is the tool's own and is not
edited here; `docs/work-management.md` § "Before archiving" already says to
run `spec-subjects --fix`. The command makes the step unnecessary to
remember: run after an archive, it reorders and reports long requirements in
the main specs the archive touched. Whether to also wrap `openspec archive`
in an npm script is the implementer's call, weighed on whether agents would
reach for the wrapper over the skill.

## Risks

- A keep-going run that applies fixes could touch files the agent did not
  mean to stage. Mitigation: it only formats files already in `git status`,
  and it prints what it changed.
- Any check that relies on an earlier one having passed (the typecheck
  before a guard that imports compiled modules) must still be ordered; the
  list keeps the gate's order and a failure upstream is reported as such.
