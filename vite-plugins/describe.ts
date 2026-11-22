/**
 * Every description compiled before a dev server, a build or a test run reads
 * a module, and again in a dev server whenever a description changes. A
 * schema edit restarts the server, since the config imports the loader. The
 * modules are generated and never committed (`scripts/describe.ts`).
 *
 * It runs the script in a process of its own, so the config imports no line
 * of the compiler (`game-code.ts` says why a config keeps its imports small).
 */

import { execFile, execFileSync } from "node:child_process";
import path from "node:path";
import type { Plugin } from "vite";

const ROOT = path.resolve(import.meta.dirname, "..");
const SCRIPT = path.join(ROOT, "scripts", "describe.ts");

/** Once a process: a test run's projects each apply the config's plugins. */
let generated = false;

/** Compile every description now. A description that does not compile throws,
 * with the compiler's message printed. */
export function describeNow(): void {
  execFileSync(process.execPath, [SCRIPT, "--quiet"], { stdio: "inherit" });
}

/** Whether this process already serves: a restart imports the config afresh,
 * so the mark is the process's, not this module's. */
const SERVING = Symbol.for("hintful.describe-first.serving");
const marks = globalThis as unknown as Record<symbol, true | undefined>;

export function describeFirst(): Plugin {
  return {
    name: "describe-first",
    config() {
      if (generated) return;
      try {
        // A description that does not compile fails the command here, with
        // the compiler's message, before anything imports a missing module.
        describeNow();
      } catch (error) {
        // A restart (on a schema edit: the config imports the loader) that
        // failed would leave the server reading the old schema until the
        // config next changed. The modules of the last good run are there,
        // and the failure was printed above.
        if (marks[SERVING] !== true) throw error;
      }
      generated = true;
    },
    configureServer(server) {
      marks[SERVING] = true;
      const regenerate = (file: string): void => {
        if (!file.endsWith(".description.yaml")) return;
        // A module it writes is an edit the server already reloads on. A
        // description mid-edit may not compile: say so, and keep serving.
        execFile(process.execPath, [SCRIPT, "--quiet"], (error, stdout, stderr) => {
          if (stdout) server.config.logger.info(stdout.trimEnd());
          if (error) server.config.logger.error(stderr.trimEnd() || error.message);
        });
      };
      server.watcher.on("change", regenerate);
      server.watcher.on("add", regenerate);
      server.watcher.on("unlink", regenerate);
    },
  };
}
