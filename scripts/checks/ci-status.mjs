#!/usr/bin/env node
/**
 * Says so when the last finished run of the gate on `main` failed. Never fails.
 *
 * The local hooks run only the tests and the games' cases a change reaches
 * (`select-tests.ts`), so a defect they cannot see shows first as a red run of
 * `.github/workflows/gate.yml`, and nobody is watching one: a session pushes
 * and moves on. This puts the result where the next commit and
 * the next push print it.
 *
 * **A notice and not a check.** The commit that meets a red run is usually the
 * fix for it, so refusing the commit would refuse the repair. It is also
 * silent whenever it cannot tell: no `gh`, no network, no answer within five
 * seconds. A hook that waits on a network is a hook people learn to skip.
 *
 * A canceled run is passed over: it says nothing. The workflow does not cancel
 * its own runs, so one is canceled only by hand or by the runner.
 */
import { execFileSync } from "node:child_process";

/** The newest run that ran to a verdict, or `null` when there is no telling. */
function lastVerdict() {
  let out;
  try {
    out = execFileSync(
      "gh",
      [
        "run",
        "list",
        "--branch",
        "main",
        "--workflow",
        "Gate",
        "--status",
        "completed",
        "--limit",
        "10",
        "--json",
        "conclusion,headSha,url,displayTitle",
      ],
      { encoding: "utf8", timeout: 5000, stdio: ["ignore", "pipe", "ignore"] },
    );
  } catch {
    return null;
  }
  let runs;
  try {
    runs = JSON.parse(out);
  } catch {
    return null;
  }
  if (!Array.isArray(runs)) return null;
  return (
    runs.find((r) => r.conclusion === "success" || r.conclusion === "failure") ?? null
  );
}

const run = lastVerdict();
if (run?.conclusion === "failure") {
  console.log("");
  console.log(`✗ CI is red on main: ${run.headSha.slice(0, 8)} "${run.displayTitle}"`);
  console.log(`  ${run.url}`);
  console.log("  CI runs what the local hooks leave out. Read the failure with");
  console.log("  `gh run view --log-failed`, and fix it before other work.");
}
