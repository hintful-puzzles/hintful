#!/usr/bin/env sh
# The gate, in one place so the two hooks (`.husky/pre-commit`,
# `.husky/pre-push`) and `npm run gate` cannot drift (the build-pipeline spec
# requires they mirror each other). Section 0a says which role does what.
#
# THIS COMMENT DESCRIBES THE SHAPE, NOT THE STEPS. Naming a step up here is how
# a header comes to name a compiler the gate no longer runs, eight lines above
# the line that runs the real one. The reason for each step is the comment
# above it, below, and that is the only prose copy there is.
#
# Order and semantics:
#   1. Fast fail-fast prefix — the typechecks, then biome, then the cheap node
#      guards, ordered roughly cheapest-first. A type, lint, formatting, spelling
#      or guard failure fails here in seconds without spending the heavy
#      branches. The biome scope is per-commit (staged files, when the hook sets
#      GATE_BIOME_STAGED=1) or whole-tree (CI / manual `npm run gate`) — see the
#      branch below. Guards that read `docs/` or `AGENTS.md` MUST live in this
#      prefix rather than in vitest; see the documentation-only shortcut below
#      for why, and `src/gate-scope.test.ts` for what enforces it. The prefix
#      ends with the vitest files that only read source (step 1f), run as a
#      pass of their own so that a failure there arrives in seconds. Every
#      step of it goes through `step` (section 0b), which is what lets
#      `npm run fast-checks` run the same list without stopping.
#   2. Heavy checks — `vitest run` and `vite build`. They share no inputs or
#      outputs, so on a machine with spare cores they run concurrently and the
#      gate wall-clock is ~max(vitest, build) instead of their sum (~40s off the
#      critical path). The gate fails if EITHER fails; blocking semantics are
#      unchanged.
#
# `vite build` stays in the gate because nothing in the prefix exercises the
# production build, so a broken build (vite-plugin closeBundle crashes,
# unresolved `?raw`/asset imports, plugin/dep regressions) is otherwise
# invisible until deploy — exactly how two such bugs sat undetected on main.
# The prefix already covers the typecheck half of `npm run build`, so run
# `vite build` directly (leaner, no double typecheck). The one thing it reads
# that is generated is the descriptions' compiled modules, which the prefix
# writes first.
#
# Do NOT gate the concurrency on the load average: a probe that serialized the
# two branches on a busy box read "busy" nearly always here and put the build on
# the critical path. Nor does contention only make a test *slower* — at load ~81
# on 8 cores two Sixteen hint tests (~50s each solo, 112s for the whole file)
# blew through the 600s ceiling in vitest.config.ts and failed this gate. The fix
# is not another timeout: vitest caps its worker pool (`maxWorkers` in
# vitest.config.ts, leaving two cores free) and both heavy branches below run
# under `nice`, so a gate run yields to the developer's own work instead of
# competing with it.
set -e

# --- 0-. Which part of CI's run this is. ---
#
# CI runs the gate in parts, each a job of `.github/workflows/gate.yml`, so
# that its wall time follows the suite's CPU time over the shards rather than
# one runner's workers. `GATE_CI_PART` names the part, and unset this is the
# whole gate, as everywhere but CI:
#
#   checks    every step but the tests: the fast checks and the build
#   <i>/<n>   the tests of shard i of n (`src/engine/testing/gate-shard.ts`)
#   suite     the shards' costs summed and judged, once every shard passed
#
# The parts are this script's steps and nothing else, so CI and `npm run gate`
# cannot run different gates.
ci_part=${GATE_CI_PART:-}
shard=""
case "$ci_part" in
  "" | checks) ;;
  suite) exec node scripts/checks/test-cost.ts suite ;;
  [1-9]*/[1-9]*) shard=$ci_part ;;
  *)
    echo "✗ GATE_CI_PART is checks, suite or <shard>/<shards>, not \"$ci_part\"."
    exit 1
    ;;
esac

# --- 0a. Which paths is this run about, and is there anything to run? ---
#
# Four roles run this script, and three of them are about a set of paths. A
# commit's are the staged ones (`.husky/pre-commit` sets GATE_PRECOMMIT). A
# push's are everything between the commit the remote has and `HEAD`
# (`.husky/pre-push` passes that commit as GATE_SINCE, beside GATE_PRECOMMIT).
# `npm run fast-checks` (GATE_KEEP_GOING, section 0b) is about every path the
# working tree changed, staged or not, untracked included, since that is what
# the next commit is made of. CI and a manual `npm run gate` set none of these
# and are about the whole tree.
#
# The set is every path changed in any way: a deleted file by its path, and a
# moved one by both (`--no-renames` lists the path it left beside the one it
# arrived at). A deletion under `src/` can break a test as surely as an edit,
# and a file moved from `src/` into `docs/` has left `src/`.
changed=""
if [ -n "${GATE_SINCE:-}" ]; then
  changed=$(git diff --name-only --no-renames "$GATE_SINCE" HEAD)
elif [ "${GATE_PRECOMMIT:-}" = "1" ]; then
  changed=$(git diff --cached --name-only --no-renames)
elif [ "${GATE_KEEP_GOING:-}" = "1" ]; then
  changed=$(git diff --name-only --no-renames HEAD; git ls-files --others --exclude-standard)
fi
# **A commit is tested as it will be committed.** Every step below reads the
# working tree, so a staged path whose working-tree copy differs from the
# staged one would be judged on a file the commit does not carry: a moved test
# whose imports were fixed after staging passed the hook and broke `main`.
# Testing the index itself would mean stashing the rest around the run, which
# rewrites the author's tree and loses work when the hook is interrupted; a
# refusal costs nothing. A staged deletion of a file still on disk differs too.
# A partial stage (`git add -p`) is refused with the rest.
if [ "${GATE_PRECOMMIT:-}" = "1" ] && [ -z "${GATE_SINCE:-}" ] && [ -n "$changed" ]; then
  unstaged=$(git diff --name-only --no-renames)
  # `|| true` and `if`: under `set -e` a grep that finds nothing would end
  # the gate without a word.
  differs=$(
    printf '%s\n' "$unstaged" | grep -Fx -e "$changed" || true
    git diff --cached --name-only --no-renames --diff-filter=D |
      while read -r f; do if [ -e "$f" ]; then echo "$f"; fi; done
  )
  if [ -n "$differs" ]; then
    echo "✗ these staged files differ in the working tree, and the gate tests the"
    echo "  working tree, so it would test what the commit does not carry:"
    printf '%s\n' "$differs" | sed 's/^/    /'
    echo "  Stage them as they stand (\`git add\`), or restore them to what is staged."
    exit 1
  fi
  # A tracked file the commit does not stage is read as it stands too. It may
  # be another session's work, so it is named, not refused.
  others=$(printf '%s\n' "$unstaged" | grep -vFx -e "$changed" | grep . || true)
  if [ -n "$others" ]; then
    echo "! the gate also reads these unstaged changes, which the commit does not carry:"
    printf '%s\n' "$others" | head -10 | sed 's/^/    /'
  fi
fi
# Whether every changed path is one no test and no build reads: section 1d
# says why these, and what holds the list to that.
doc_only() {
  [ -n "$changed" ] && ! printf '%s\n' "$changed" |
    grep -qvE '^(docs/|openspec/|research/|AGENTS\.md$|CLAUDE\.md$|CREDITS\.md$)'
}
# What the push runs and a commit does not shows first as a red CI run, and
# nobody watches one, so both hooks end by saying so when the last finished run
# on `main` failed (`scripts/checks/ci-status.mjs`). It is a notice and cannot
# fail the hook, since the commit that meets it is usually the fix; it is
# silent when it cannot reach GitHub.
ci_notice() {
  if [ "${GATE_PRECOMMIT:-}" = "1" ]; then
    node scripts/checks/ci-status.mjs || true
  fi
}

# **The push runs what its commits left out, once, and nothing when they left
# nothing.** A commit runs the per-game work of the games it stages and no
# other (section 1e), so a commit to the engine leaves every game's boards to
# the push that carries it. `select-tests.ts --since` prints that remainder, or
# `NOTHING` for a push whose commits were each a game's own or documentation.
# Decided here, ahead of the prefix, because each commit has passed the prefix
# already and a push with nothing owed should cost a second.
#
# The run reads the working tree, so the tree has to be the commits: a push
# over uncommitted changes would be judged on code it does not carry.
plan="ALL"
if [ -n "${GATE_SINCE:-}" ]; then
  if [ -z "$changed" ] || doc_only; then
    echo "✓ this push carries no change a test or the build reads."
    ci_notice
    exit 0
  fi
  # A commit that left files to the push past its cost ceiling (section 1e)
  # wrote them down, and the push then owes its whole plan.
  owed=""
  [ -s node_modules/.cache/test-cost/deferred ] && owed="--owed"
  # The plan follows imports through the compiled modules, so they are
  # written before it is made (section 1 says what they are).
  node scripts/describe.ts --quiet
  # shellcheck disable=SC2086 # empty, or one flag.
  plan=$(node scripts/checks/select-tests.ts --since "$GATE_SINCE" $owed 2>/dev/null) || plan="ALL"
  [ -n "$plan" ] || plan="ALL"
  if [ "$plan" = "NOTHING" ]; then
    echo "✓ this push's commits ran every test it can have broken."
    ci_notice
    exit 0
  fi
  if [ "${GATE_PUSH_TESTS:-}" = "1" ] && ! git diff --quiet HEAD; then
    echo "✗ the push runs the tests its commits left out, and it runs them on the"
    echo "  working tree, which has uncommitted changes. Commit or stash them."
    exit 1
  fi
  if [ "${GATE_PUSH_TESTS:-}" = "1" ]; then
    echo "The push runs what its commits left to it: every game's cases of the"
    echo "cross-game sweeps a commit to shared code reaches. Once a push, not a commit."
  fi
fi

# --- 0. Reap orphaned vitest workers from a previously-interrupted run. ---
# A sync-blocked worker survives its parent's death and spins a core forever
# (see scripts/reap-orphaned-workers.sh). Reaping up front rather than relying
# on the `pretest:run` hook below is deliberate: an orphan left by an earlier
# Ctrl-C would otherwise compete with this run for cores start to finish.
# Fail-safe and near-free (one `ps` scan), so it costs a clean box nothing.
sh "$(dirname -- "$0")/reap-orphaned-workers.sh" || true

# --- 0b. How a step of the fast prefix runs. ---
#
# The gate stops at the first refusal, so a commit that owes four fixes
# learned of them one gated attempt at a time: a word game's last commit took
# eight attempts over forty minutes, every refusal a check of seconds.
# `npm run fast-checks` sets GATE_KEEP_GOING and runs the same steps, through
# the same function, past every refusal, and ends by naming each one with the
# command that reproduces it; it then stops before the tests and the build.
# One list, two ways of running it: a second copy would drift from this one.
#
# Where a refusal has one right answer and a fixer, the keep-going run applies
# it first (`fix`), to files the working tree has changed, and names each file
# it wrote. The gate itself never writes.
#
# A step that needs an earlier one keeps its place after it; the steps that
# every other reads (the descriptions' modules) are not steps, and a failure
# there ends the keep-going run as it ends the gate.
#
# A shard of CI's suite runs no step: the checks part runs each of them once.
refused=""
step_as() {
  reproducer=$1
  shift
  [ -z "$shard" ] || return 0
  if [ "${GATE_KEEP_GOING:-}" != "1" ]; then
    # The refusal is where a session learns the command exists.
    "$@" || {
      step_rc=$?
      echo ""
      echo "✗ the gate stops at its first refusal. \`npm run fast-checks\` names every one at once"
      echo "  and writes the fixes that have one right answer."
      exit $step_rc
    }
    return 0
  fi
  step_log=$(mktemp)
  step_start=$(date +%s)
  if "$@" >"$step_log" 2>&1; then
    echo "✓ $(($(date +%s) - step_start))s  $reproducer"
  else
    echo "✗ $(($(date +%s) - step_start))s  $reproducer"
    # Its passes and notes would bury the refusal: the validator prints a
    # line for each of a hundred specs.
    grep -vE '^[[:space:]]*(✓|ℹ)' "$step_log" | sed 's/^/    /' || true
    refused="$refused  $reproducer
"
  fi
  rm -f "$step_log"
}
step() { step_as "$*" "$@"; }
# `fix <files> <command>...`: run a fixer and name each of the files it changed.
sums() { for f in "$@"; do [ -f "$f" ] && cksum "$f"; done; }
fix() {
  [ "${GATE_KEEP_GOING:-}" = "1" ] || return 0
  fix_files=$1
  shift
  # shellcheck disable=SC2086 # newline-separated paths, no globs.
  fix_before=$(sums $fix_files)
  "$@" >/dev/null 2>&1 || true
  # shellcheck disable=SC2086
  sums $fix_files | grep -vxF -e "$fix_before" | sed "s|^[0-9]* [0-9]* |✎ fixed by $2: |" || true
}

# --- 1. Fast fail-fast prefix. ---
#
# Every description's compiled module, which the typechecks, the guards, the
# tests and the build all import: generated, never committed, and written
# here so that the two heavy branches below find nothing to write. ~1s, and
# nothing written when nothing changed.
node scripts/describe.ts --quiet
# `npm run tsc` is TypeScript 7's compiler, installed under the alias
# `typescript-7` and run by path: it checks this tree in ~2.5s against ~13s for
# tsc 5.9. By path and never `npx tsc`, because `typescript` (5.x) is installed
# beside it and declares the same bin, and which of the two npm links there is
# an accident of install order. 5.x stays for its programmatic API — see the
# madge section of metrics.sh for the ten packages that need it.
step npm run -s tsc -- -b --noEmit
# The build-side TypeScript — `vite.config.ts`, `vitest.config.ts`,
# `vite-plugins/` and the advisory checks under `scripts/checks/` — is a second
# project because it runs in Node, and `tsconfig.json` is deliberately
# browser-shaped (`"types": []`, DOM lib). It is NOT optional: the file that
# renders every help page and static entry went unchecked while it sat outside
# `include`, and the first pass over it found a dead `output.validate` (a rollup
# option rolldown neither declares nor reads) and a `defineConfig` overload
# failure. Same strictness, different runtime.
step npm run -s tsc -- --noEmit -p tsconfig.node.json
# A file in neither project above is checked by nothing, and neither compiler
# run can say so, since each reports on the files it was given. ~3s.
step node scripts/checks/typescript-projects.mjs

# Biome checks lint rules AND formatting AND import order in one read-only pass
# (the `check`/`ci` form — not `lint`, which misses formatting; not
# `format --check`, which misses import sorting). `npm run check` stays the fixer.
#
# Scope depends on role. A commit can only make a file unformatted by touching
# it, so a local hook (which sets GATE_BIOME_STAGED=1) checks
# only the staged files — no redundant re-scan of an already-clean tree.
# CI and a manual `npm run gate` leave the toggle unset and check the WHOLE tree:
# that is the backstop for a --no-verify bypass and the thing that forces a
# tree-wide reformat when biome itself is upgraded. Do not scope those down.
# The keep-going run takes the files the working tree changed, which the next
# commit stages, and writes biome's safe fixes into them first.
if [ "${GATE_BIOME_STAGED:-}" = "1" ]; then
  step npx biome check --staged --no-errors-on-unmatched
elif [ "${GATE_KEEP_GOING:-}" = "1" ]; then
  biome_files=$(printf '%s\n' "$changed" | while read -r f; do [ -f "$f" ] && echo "$f"; done || true)
  if [ -n "$biome_files" ]; then
    # shellcheck disable=SC2086 # newline-separated paths, no globs.
    fix "$biome_files" npx biome check --write --no-errors-on-unmatched \
      --files-ignore-unknown=true $biome_files
    # shellcheck disable=SC2086
    step_as "npx biome check <the $(printf '%s\n' "$biome_files" | wc -l | tr -d ' ') changed files>" \
      npx biome check --no-errors-on-unmatched --files-ignore-unknown=true $biome_files
  fi
else
  step npx biome ci .
fi

# The local-feedback corpus still APPLIES — not its result. ~0.2s, no tests run.
#
# `scripts/feedback-probe-cases.mjs` anchors each case on a verbatim excerpt of
# engine source, which is what lets a case name a real defect instead of a
# mutation operator. It is also the corpus's one fragility: refactor a probed
# line and the anchor stops matching. The harness then measures a SMALLER corpus
# and reports success — a silent cap that reads as health — and since the full
# run is ~20 minutes and deliberately opt-in, nothing else would ever notice.
#
# What is gated is only "every anchor applies". The probe's rate is NEVER gated
# or ratcheted: a gated feedback number invites tests written against the number
# rather than against behavior, which is exactly what the testing
# requirement it serves forbids. A survivor is a finding to read.
#
# If this fails, re-anchor the case on surrounding text — and take the prompt to
# decide whether it still states the defect it claims to.
step node scripts/feedback-probe.mjs --verify

# --- 1b. Every word this project writes is spelled the American way. ~1s. ---
#
# `scripts/checks/spelling-table.mjs` is the convention (the `repo-layout`
# spelling requirement); this scans every tracked file outside the record and
# other people's words for any stem in it. It sits HERE, in the fast prefix and
# ahead of the documentation-only shortcut below, because the shortcut skips
# vitest — and `src/gate-scope.test.ts` forbids a test from reading `docs/` or
# `openspec/` at all, which is exactly where a British spelling would otherwise
# creep back in unchecked.
step node scripts/checks/spelling.mjs

# --- 1b-ii. The engine catalog names every shared helper there is. ~0s. ---
#
# `docs/engine-catalog.md` is the menu that stops a game author
# re-rolling something the engine already has, and its value is entirely in
# being complete: the entry most likely to be missing is the newest one, which
# is the one an author is least likely to know about. Five modules had gone
# uncataloged before this ran.
#
# Here for the same reason as the spelling guard directly above — this reads
# `docs/`, and deleting a catalog entry is a documentation-only commit, so it
# has to be ahead of the shortcut and cannot be a vitest file.
step node scripts/checks/engine-catalog.mjs

# --- 1b-iii. A change id cited in prose still resolves. ~0s. ---
#
# A prose citation cannot survive a change being renamed or withdrawn, and
# nothing else in the tree notices. This was declined on 2026-09-04 on the
# measurement that no dead citation existed; one was created 46 minutes later by
# a rename, in the same commit that wrote the replacing sentence, and stood five
# days. The decline named its own revisit condition and it fired.
#
# Here, with the two guards above, for the same three reasons: it reads `docs/`,
# a rename is a documentation-only commit, and `src/gate-scope.test.ts` forbids
# a vitest file from reading that root at all.
step node scripts/checks/change-citations.mjs

# --- 1b-iii-a. The brief every session loads stays short. ~0s. ---
#
# `AGENTS.md` is read into every session, and a long one is followed less well
# than a short one. It grew by a rule that said every new rule goes there; the
# rule now says the guide it binds, and this is what holds when that is not
# followed. Here for the reason the guards above are: editing the file is a
# documentation-only commit.
step node scripts/checks/brief-size.mjs

# --- 1b-iii-b. A guide's opening names its sections, and a citation lands. ~0s. ---
#
# A session reads a guide's opening and then the one section it needs, so a
# section the opening does not name is one nobody is sent to. And a section is
# cited by its heading's text, which nothing else resolves when the heading is
# reworded. Here for the reason the guards above are: a guide edit is a
# documentation-only commit.
step node scripts/checks/guide-sections.mjs

# --- 1b-iv. No test's every assertion sits behind a condition. ~1s. ---
#
# A test that cannot fail passes forever while asserting nothing, and the suite
# cannot tell it from a working one — a green test and a vacuous one are the same
# observation. `tidy-the-code-after-the-port` found one in thirteen games, each
# by planting a defect by hand, which is not a thing the gate can do.
#
# Unlike the three guards above this reads only `*.test.ts`, so it is not here
# for the documentation-shortcut reason. It is here because it is cheap, it is
# fail-fast, and a vacuity report should arrive before ten minutes of vitest
# rather than after. It proves itself on every run (seven fixtures, ~1 ms): a
# guard about tests that cannot fail may not be one.
step node scripts/checks/vacuous-assertions.mjs

# --- 1b-v. Nothing exports something no other file imports. ~2s. ---
#
# An unused export is invisible to the typechecker, to biome and to every test,
# because nothing that runs reads it. This ran as `npm run dead-exports` while
# its backlog stood at 376; `retire-the-dead-exports` cleared it, and the ledger
# it could have used is empty, so the check is a gate rather than a diagnostic.
#
# Here rather than in vitest for the reason `src/gate-scope.test.ts` gives: it
# shells out to `git ls-files` and parses the tree with the TypeScript compiler
# API, which is build-side work, and it is two seconds against ten minutes of
# vitest.
step node scripts/checks/unused-exports.mjs

# --- 1b-vi. Absence has one spelling. ~7s. ---
#
# `undefined` written into a union, and a strict comparison testing for an
# absent word its value cannot hold. The second half is why this is a gate
# rather than a lint: moving a helper from `undefined` to `null` leaves
# `=== undefined` behind it, always false, and the typechecker accepts it. The dearest step
# in the prefix, because that half reads types and so builds a program over the
# whole tree; build-side work for the same reason as the step above.
step node scripts/checks/absence-spelling.mjs

# --- 1c. The specs and every open change parse and validate. ~1s. ---
#
# This is the tool's own check, deliberately, and it replaces a hand-written one.
# A `MODIFIED` delta replaces the whole requirement at archive time, so a delta
# holding a stale copy deletes whatever it omits — that cost this project 134
# lines of the `ts-engine` hint requirement on 2026-08-15. The repo answered by
# retiring the verb and writing its own scenario-survival check; the actual cause
# was an openspec CLI nine months and fifteen releases stale, which had fixed it
# in 1.6.0 (archive refuses the loss) and 1.8.0 (validate reports it at authoring
# time).
#
# So the floor is load-bearing, not hygiene: below 1.6.0 the archiver will apply
# the loss silently, and this line would still print a cheerful pass. `npx`
# resolves the pinned devDependency, which is why the version is a fact the repo
# states rather than a property of the machine.
#
# The keep-going run first puts each game's spec in subject order (section
# 1c-000): `--fix` moves whole requirements and changes no word, and doing it
# here means the lines the checks below report are where the reader finds them.
fix "$(ls openspec/specs/*/spec.md openspec/changes/*/specs/*/spec.md 2>/dev/null)" \
  node scripts/checks/spec-subjects.mjs --fix
step node scripts/checks/openspec-version.mjs
step npx --no-install openspec validate --all --strict

# --- 1c-0. A spec holds rules, not the story of a change. ~0s. ---
#
# Archiving merges a delta's words into the main spec as written, so a delta
# that says when a rule was decided and by which change leaves that in the
# spec for good. The validator above bounds a requirement's length; this
# refuses a date and a change id, the two marks of a history that can be
# resolved rather than guessed at. Here because archiving is a
# documentation-only commit.
step node scripts/checks/spec-form.mjs

# --- 1c-00. A requirement cited by its title is still there. ~0s. ---
#
# A comment or a guide that sends a reader to a requirement names it by its
# title, and a title changes whenever a change restates the requirement. Here
# for the reason the change-citation guard is: it reads `docs/`, and a rename
# is a documentation-only commit.
step node scripts/checks/spec-citations.mjs

# --- 1c-000. A game's spec holds its subjects, in one order. ~0s. ---
#
# A game's spec is read a subject at a time, so each requirement's title leads
# with its subject and the subjects stand in one order in every game. Archiving
# appends the requirements a delta adds, which puts a spec out of order, and
# archiving is a documentation-only commit, so the check is here and reads the
# recorded surface of each `Game` where a test would have read the object.
# The keep-going run has applied its `--fix` ahead of section 1c.
step node scripts/checks/spec-subjects.mjs

# --- 1c-i. The deploy's build-only run. ---
#
# CI's deploy job runs the checks above and the production build, and nothing
# else: every commit has already passed the hook's gate, and the suite runs in
# CI's own job beside the deploy, so waiting on it again before publishing buys
# minutes of delay per push and no check (owner, 2026-09-27). The build here
# is the artifact that ships, with the deploy-time environment.
if [ "${GATE_BUILD_ONLY:-}" = "1" ]; then
  npx vite build
  exit 0
fi

# --- 1c-ii. A note on what else GATE_PRECOMMIT reaches. ---
#
# The toggle is set by the two local hooks and by nothing else, and vitest
# inherits it: beside GATE_GAME_SCOPE it narrows a sweep's cases to the games
# the run is about (`src/engine/testing/game-scope.ts`). A sweep walks the same
# boards here as in CI; more of the same is the slow tier's, in no default
# suite. The backstop is asserted by `src/gate-scope.test.ts`, which fails if
# CI ever sets this or a hook stops.
#
# `nice` (weak on macOS but free insurance) is applied to BOTH heavy branches,
# so the gate yields to whatever else the developer is running rather than
# competing with it. The build is niced hardest, since vitest is the branch that
# actually blocks the commit.
if command -v nice >/dev/null 2>&1; then
  NICE="nice -n 19"
  NICE_TESTS="nice -n 10"
else
  NICE=""
  NICE_TESTS=""
fi

# --- 1d. Documentation-only commits skip the heavy branches. ---
#
# The fast prefix above costs ~28s (typecheck 5s, biome 2s, openspec 1s, probe 0s,
# and the build 20s); `vitest run` is the other eight to ten minutes, and it ran
# in full for a commit touching one markdown file.
#
# **Scoped by role, exactly as the biome step is.** Only the local hooks take
# this path (they set GATE_PRECOMMIT=1; the push takes it in section 0a); CI
# and a manual `npm run gate` always run everything, so nothing reaches `main`
# without the full gate having seen it. That is the same backstop argument as
# `biome ci`, and it is why this narrows a *commit's* cost without narrowing
# what protects the branch.
#
# **The allowlist is provable, and it is proved.** These paths are read by no
# test and are not build inputs — `openspec/` is already covered by the
# `validate --all --strict` above, and `docs/` and `AGENTS.md` are read by
# nothing at all. `research/` holds development tools in TypeScript, run by
# hand: the prefix's typecheck compiles them (`tsconfig.node.json`), which a
# documentation-only commit still runs, and their quick guards run in CI's
# workflow beside the gate, since they import `src/`, which a change can break
# them through. No test or build of the gate's loads them.
# `src/gate-scope.test.ts` asserts that, by scanning for any glob, file read or
# import naming them, so the day a test starts reading
# `docs/` this path stops being safe *and says so*. It takes the list from the
# pattern in `doc_only` above, so there is no second copy to fall behind. `help/` is
# deliberately absent: it is both a `vite build` input and
# `help-coverage.test.ts`'s subject. So are `README.md`, which
# `src/project-identity.test.ts` reads, and `LICENSE.md`, which the About
# dialog imports.
#
# Anything outside the list — one `src/` file, one `help/` page, one license —
# and the whole gate runs. The default is "run everything"; this is the
# exception, and it fails closed.
if [ "${GATE_PRECOMMIT:-}" = "1" ] && doc_only; then
  echo "✓ documentation-only commit — skipping vitest and vite build."
  echo "  (CI runs the full gate on push; \`npm run gate\` runs it here.)"
  ci_notice
  exit 0
fi

# --- 1d-ii. The push runs the fast checks, and the tests only when asked. ---
#
# Measured 2026-11-15 over the last 100 runs of CI's gate: 19 failed, 16 of them
# on a cross-game hint sweep (`npm run test:hint-sweeps` runs those whole) and 3 on
# a cost budget that only the CI runners can judge. A push's narrowed run
# found neither before CI did, and a session waiting on it waited minutes for
# a verdict CI gives anyway. So the push is the prefix above, which is what a
# commit has passed already plus whatever the later commits changed, and the
# plan below (the tests the commits left out) runs only on request:
# `GATE_PUSH_TESTS=1 git push`. CI is the whole run, and the next commit and
# push print its red verdict (`ci_notice`).
if [ -n "${GATE_SINCE:-}" ] && [ "${GATE_PUSH_TESTS:-}" != "1" ]; then
  echo "✓ the push ran the fast checks. The tests are CI's: \`GATE_PUSH_TESTS=1 git push\`"
  echo "  runs the ones the commits left out here, \`npm run test:hint-sweeps\` the hint sweeps."
  ci_notice
  exit 0
fi

# --- 1e. Which tests does this commit run? (the local hooks only) ---
#
# `scripts/checks/select-tests.ts` prints a plan: either `ALL`, or the test
# files to run, each marked `whole` or `narrow`, and a `scope` of games. It
# selects a file when the static import graph (`vitest list --changed`) or
# `reach.ts`'s walk reaches a changed path. The walk exists because this repo's
# cross-game guards read game source as *text* — `AGENTS.md` requires a guard to
# derive its population from what a game IS — and text reads form no import
# edge. Measured: on a `help/` page the graph alone selects **nothing**, against
# three guards that check exactly those files.
#
# **Hooks only.** CI runs the whole suite on every push to `main`, which is what
# makes a narrower local run safe — the identical argument that already scopes
# biome to staged files here and to the whole tree there. A selector bug costs a
# slower feedback loop, never a broken `main`.
#
# The selector fails closed: any error at all yields `ALL`, and so does a push
# with a path it does not model or an empty result. `src/test-selection.test.ts`
# fails the build if a test acquires a read channel the selector cannot see, and
# step 1f holds the walk and both plans to known positives.
#
# **Within those files, a `narrow` file skips the cases of games outside the
# scope.** A cross-game guard titles each case `<id>: …`, and per-game work is
# nearly all of the suite: 880 s of 1,005 s of test time, measured 2026-10-12
# over the hook's whole selection. A `whole` file runs in a vitest invocation of
# its own with GATE_GAME_SCOPE unset, because the name filter is one per run.
#
# **A commit's scope is the games it stages; a push's is the games that reach
# what it carries.** So a commit costs about the same whatever it touches, and
# a commit to shared code leaves every other game's cases to the one push at
# the session's end (section 0a). What reads the variable, and what each role's
# skipped case means, is in `src/engine/testing/game-scope.ts`. Skipped cases
# are reported as skipped, and CI runs them all.
if [ "${GATE_PRECOMMIT:-}" = "1" ] && [ -z "${GATE_SINCE:-}" ]; then
  plan=$(node scripts/checks/select-tests.ts 2>/dev/null) || plan="ALL"
  [ -n "$plan" ] || plan="ALL"
fi
# **A hook's run is held to a ceiling of CPU time** (`build-pipeline`, "A
# hook's run is held to a ceiling"), so a commit costs about a minute and a
# push a few, whatever they select. `test-cost.ts fit` prices the plan from
# what the last runs recorded and keeps the cheapest files that fit, beside
# the staged test files, which run whatever they cost; both hooks leave the
# rest to CI, which runs everything. The
# suite's own budget applies where the whole suite runs: CI and `npm run gate`.
whole_suite=""
if [ "${GATE_PRECOMMIT:-}" = "1" ]; then
  role=commit
  [ -n "${GATE_SINCE:-}" ] && role=push
  fitted=$(printf '%s\n' "$plan" | node scripts/checks/test-cost.ts fit "$role") && plan=$fitted
elif [ "$plan" = "ALL" ]; then
  whole_suite="--suite"
fi
plan_lines() { printf '%s\n' "$plan" | sed -n "s/^$1 //p"; }
scope=$(plan_lines scope)
whole=$(plan_lines whole)
narrow=$(plan_lines narrow)
if [ "$plan" != "ALL" ]; then
  count() { [ -n "$1" ] && printf '%s\n' "$1" | wc -l | tr -d ' ' || echo 0; }
  echo "✓ running $(($(count "$whole") + $(count "$narrow"))) of $(find src vite-plugins -name '*.test.ts' | wc -l | tr -d ' ') test files."
  if [ "$scope" = "-" ]; then
    echo "✓ $(count "$narrow") of them run no game's cross-game cases: this commit stages no game."
  elif [ -n "$narrow" ]; then
    echo "✓ $(count "$narrow") of them run only the cross-game cases of: $scope."
  fi
fi
if [ "${GATE_PRECOMMIT:-}" = "1" ] && [ -z "${GATE_SINCE:-}" ]; then
  echo "  CI runs the cases of the games this commit does not stage, and everything"
  echo "  else; \`npm run gate\` runs everything here."
fi

# --- 1f. The source scans, ahead of everything that builds a board. ~6s. ---
#
# The cross-game guards that read source as text cost milliseconds, but as
# ordinary vitest files they reported only after the whole run: on 2026-09-22 a
# commit failed twice, each time about eight minutes in, on two such scans. So
# `vitest.config.ts` splits the suite into two passes by `GATE_TEST_PASS`, and
# the scans run here, before `vite build` is even started.
#
# Membership is derived, never listed: `scripts/checks/source-scans.ts` takes a
# file that reads source through a `?raw` glob and whose imports reach no game,
# so it cannot build a board. One list is the scan pass's include and the main
# pass's exclude, and `--verify` asks vitest itself to confirm that every test
# file is in exactly one pass. A file that fell out of both would otherwise pass
# by never running, which is the failure this gate exists to refuse.
#
# The hook's plan applies to both passes unchanged, since a filter that names a
# file outside a pass's include matches nothing there.
#
# `select-tests.ts --verify` sits here for the neighboring reason: the plan is
# only as good as the walk under it, and a walk that went blind to a coupling
# would report a narrow plan that looks like health. ~1s.
step node scripts/checks/source-scans.ts --verify
step node scripts/checks/select-tests.ts --verify
# CI's checks part ends with the build, which the shards do not run.
if [ "$ci_part" = checks ]; then
  npx vite build
  exit 0
fi
# Every vitest pass below appends what each test file cost in CPU time to one
# log (`scripts/checks/test-cost.ts`), read once the suite has run.
TEST_COST_RUN=$(mktemp)
export TEST_COST_RUN
trap 'rm -f "$TEST_COST_RUN"' EXIT
# `--update=none` is what vitest picks by itself under CI: a snapshot entry no
# test checked fails its file, and a missing one fails rather than being written
# into the tree after the commit's files were staged. Vitest's default, `new`,
# only lists an orphaned entry in a summary nobody reads after a green run.
run_tests() {
  if [ "$plan" = "ALL" ]; then
    GATE_TEST_PASS=$1 $NICE_TESTS npx vitest run --passWithNoTests --update=none
    return
  fi
  tests_rc=0
  # shellcheck disable=SC2046,SC2086 # the lists are newline-separated paths, no globs.
  if [ -n "$whole" ]; then
    GATE_TEST_PASS=$1 $NICE_TESTS npx vitest run --passWithNoTests \
      --update=none $(printf '%s ' $whole) || tests_rc=$?
  fi
  # shellcheck disable=SC2046,SC2086
  if [ -n "$narrow" ]; then
    GATE_TEST_PASS=$1 GATE_GAME_SCOPE=$scope $NICE_TESTS npx vitest run \
      --passWithNoTests --update=none $(printf '%s ' $narrow) || tests_rc=$?
  fi
  return $tests_rc
}
# The keep-going run's plan is `ALL`, since it sets none of the hooks' toggles,
# and it ends here: the tests and the build are what the commit is for.
if [ "${GATE_KEEP_GOING:-}" = "1" ]; then
  step_as "GATE_TEST_PASS=scan npx vitest run --update=none" run_tests scan
  echo ""
  if [ -z "$refused" ]; then
    echo "✓ every fast check of the gate passes. The commit runs the tests and the build."
    exit 0
  fi
  echo "✗ refused by $(printf '%s' "$refused" | grep -c .) of the gate's fast checks; each refusal is above, and each reruns with:"
  printf '%s' "$refused"
  exit 1
fi
if ! run_tests scan; then
  echo ""
  echo "pre-commit gate failed in the source scans (the main vitest pass and vite build did not start)"
  exit 1
fi

# --- 2. Heavy checks, concurrently. ---
vitest_rc=0
build_rc=0

# vitest streams live (the useful signal); vite build runs quietly and its
# captured log is printed only on failure, avoiding two interleaved streams.
build_log=$(mktemp)
trap 'rm -f "$build_log" "$TEST_COST_RUN"' EXIT
if [ -z "$shard" ]; then
  $NICE npx vite build >"$build_log" 2>&1 &
  build_pid=$!
fi

run_tests main || vitest_rc=$?
[ -n "$shard" ] || wait "$build_pid" || build_rc=$?
if [ "$build_rc" -ne 0 ]; then
  echo ""
  echo "✗ vite build failed (exit $build_rc):"
  cat "$build_log"
fi

if [ "$vitest_rc" -ne 0 ] || [ "$build_rc" -ne 0 ]; then
  echo ""
  echo "pre-commit gate failed (vitest=$vitest_rc build=$build_rc)"
  exit 1
fi
# Every file's CPU time against its budget, and the suite's where it all ran.
# Recorded too, for the next hook's plan; a push that ran clears what the
# commits left it. A shard of CI's suite writes its costs for the suite part.
if [ -n "$shard" ]; then
  cost_report="shard $TEST_COST_RUN $shard"
else
  cost_report="report $TEST_COST_RUN $whole_suite"
fi
# shellcheck disable=SC2086 # the words of one command line, no globs.
if ! node scripts/checks/test-cost.ts $cost_report; then
  echo ""
  echo "gate failed on the cost budget"
  exit 1
fi
[ -n "${GATE_SINCE:-}" ] && rm -f node_modules/.cache/test-cost/deferred
ci_notice
