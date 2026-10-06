#!/bin/sh
# Do a coding agent's edits still come back with type errors?
#
# After an agent edits a TypeScript file, the harness shows it what the
# language server pushed. Nothing else in this repository notices when that
# stops, and it once stopped for three weeks: the session keeps working, and
# simply never hears about the error it just wrote. This plants one type error
# in a fresh headless session, has the session say what it was shown, and
# fails unless all four expected errors are in the answer.
#
# Not a gate step. It starts a real agent session, so it costs tokens and
# needs the `claude` CLI and a login. Run it by hand (`npm run
# agent-diagnostics`) after anything that could move the language server: a
# `typescript` upgrade, a Claude Code upgrade, a change to the LSP plugins.
#
# The expected answer, for `let result: string = 1;` on PLANT_LINE below:
#   63:7   TS2322  Type 'number' is not assignable to type 'string'.
#   65:5   TS2322  Type 'number' is not assignable to type 'string'.
#   65:15  TS2362  The left-hand side of an arithmetic operation must be …
#   67:3   TS2322  Type 'string' is not assignable to type 'number'.
# `npm run typecheck` reports the same four for the same plant, which is what
# makes this an answer and not just a count.
#
# The wait is the instrument. Diagnostics are pushed, so they never ride on the
# Edit's own result: measured 2026-10-06 they arrived about fifteen seconds
# later, attached to the result of whichever tool call came next. A session
# that edits, reads and reverts straight away is shown nothing and reports a
# false loss. The harness also refuses a long standalone `sleep`, so the wait
# is two short ones.
#
# It also prints the language-server processes that appeared during the run.
# The path of the `tsserver.js` among them says whose TypeScript the agent's
# diagnostics come from: this repository's `node_modules/typescript` (5.x), or
# a global install that can drift from it. Either way it is not the gate's
# compiler; `npm run typecheck` is the gate's verdict.
set -u

FILE=src/engine/combi/index.ts
PLANT_LINE='  let result = 1;'
EXPECTED='63:7 65:5 65:15 67:3'

cd "$(dirname -- "$0")/.." || exit 2

# The plant is reverted by the session and the revert is checked below against
# HEAD, so a file that already differs from HEAD would make that check lie.
if ! git diff --quiet HEAD -- "$FILE"; then
  echo "agent-diagnostics: $FILE has uncommitted changes; commit or stash them first." >&2
  exit 2
fi
if ! grep -qxF "$PLANT_LINE" "$FILE"; then
  echo "agent-diagnostics: the line to plant on is gone from $FILE." >&2
  echo "  Pick another assignment, and re-derive EXPECTED from 'npm run typecheck'." >&2
  exit 2
fi

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

servers() {
  ps -axo pid=,ppid=,command= | grep -E 'tsserver|typescript-language-server|--lsp' | grep -v grep
}

PROMPT='You are running a check of whether language-server diagnostics reach an agent after an edit. Do exactly this and nothing more.
1. With the Edit tool, in '"$FILE"', change the line `  let result = 1;` to `  let result: string = 1;`.
2. With the Bash tool run exactly `sleep 15`. Then read lines 60 to 68 of that file. Then run exactly `sleep 15` again and read those lines once more.
3. With the Edit tool, change `  let result: string = 1;` back to `  let result = 1;`, restoring the line exactly.
4. Report, verbatim and in full, every diagnostic you were shown at any point after step 1: in a tool result, in a system reminder, or in any attachment. Give each as line:character, severity, code and message, and say after which step it appeared. If you were shown none at all, say exactly "No diagnostics were shown." Do not run a typechecker, do not use the LSP tool, and do not infer what the errors would be: report only what was put in front of you.'

servers | sort -u >"$WORK/before"
: >"$WORK/during"

# The model is pinned to a small one because what is under test is the
# harness's delivery, which does not depend on it. `Bash(sleep:*)` is the only
# shell the session gets.
claude -p "$PROMPT" --model sonnet --permission-mode acceptEdits \
  --allowedTools "Bash(sleep:*)" \
  --disallowedTools Write NotebookEdit Agent Skill LSP \
  >"$WORK/report" 2>&1 &
SESSION=$!

while kill -0 "$SESSION" 2>/dev/null; do
  servers >>"$WORK/during"
  sleep 2
done
wait "$SESSION"
STATUS=$?

echo "=== what the session was shown ==="
cat "$WORK/report"
echo
echo "=== language-server processes that appeared during the run ==="
sort -u "$WORK/during" | comm -23 - "$WORK/before" | cut -c1-200
echo

FAILED=0
if [ "$STATUS" -ne 0 ]; then
  echo "agent-diagnostics: the session exited $STATUS." >&2
  FAILED=1
fi
for at in $EXPECTED; do
  if ! grep -qwF "$at" "$WORK/report"; then
    echo "agent-diagnostics: no diagnostic reported at $at." >&2
    FAILED=1
  fi
done
if ! git diff --quiet HEAD -- "$FILE"; then
  echo "agent-diagnostics: the session left $FILE changed. Restore it: git checkout -- $FILE" >&2
  FAILED=1
fi

if [ "$FAILED" -eq 0 ]; then
  echo "agent-diagnostics: all four expected errors reached the session, and $FILE is restored."
fi
exit "$FAILED"
