/**
 * The CPU time a test file costs, for the gate's cost budget
 * (`test-cost.ts`, beside this file), appended to the log the gate names in
 * `TEST_COST_RUN`. A run outside the gate names no log and records nothing.
 *
 * A vitest setup file runs before each test file's imports, and a forks-pool
 * worker runs one file at a time, so the process's CPU time between here and
 * the file's last `afterAll` is that file's work whatever else the machine is
 * doing. Wall time is no measure of it: contention inflates wall several-fold
 * and unevenly (`docs/testing.md` § "Timing anything under vitest").
 *
 * With `isolate: false` a worker's files share what one of them computed, so
 * a file's own CPU time depends on what its worker ran before it. The boards
 * the sweeps share are most of that, and a file is charged for each board it
 * used that an earlier file dealt (`dealt.ts`), so a cheap file stays cheap
 * whatever order it runs in. What remains is the module graph: a worker's
 * first file pays for importing the registry, about 20 seconds.
 */
import { appendFileSync } from "node:fs";
import { afterAll } from "vitest";
import { inheritedDealCost, openCostWindow } from "../../src/engine/testing/dealt.ts";

const start = process.cpuUsage();
openCostWindow();

// biome-ignore lint/correctness/noEmptyPattern: vitest refuses a hook whose context is not destructured, and the file is the second argument.
afterAll(({}, file) => {
  const log = process.env["TEST_COST_RUN"];
  if (log === undefined || log === "") return;
  const { user, system } = process.cpuUsage(start);
  const cpu = (user + system + inheritedDealCost()) / 1e6;
  // One short line per write, so the workers' appends do not interleave.
  appendFileSync(
    log,
    `${JSON.stringify({ file: file.name, project: file.file.projectName ?? "", cpu })}\n`,
  );
});
