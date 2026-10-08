#!/usr/bin/env node
/**
 * Says so when the last finished CI run on `main` failed. Never fails.
 *
 * The per-commit hook leaves part of every cross-game sweep to the push
 * (`perCommit` in `src/engine/testing/slow.ts`), so a defect the hook cannot
 * see shows first as a red CI run, and nobody is watching one: a session
 * pushes and moves on. This puts the result where the next commit prints it.
 *
 * **A notice and not a check.** The commit that meets a red run is usually the
 * fix for it, so refusing the commit would refuse the repair. It is also
 * silent whenever it cannot tell: no `gh`, no network, no answer within five
 * seconds. A hook that waits on a network is a hook people learn to skip.
 *
 * A canceled run is passed over. CI cancels a run when a newer push arrives,
 * so the newest finished run is often one that was cut short and says nothing.
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
        "CI",
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
  console.log("  The push runs what this hook leaves out. Read the failure with");
  console.log("  `gh run view --log-failed`, and fix it before other work.");
}
