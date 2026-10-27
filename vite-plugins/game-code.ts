/**
 * The game collection, for a plugin that reads it: `src/build-facts.ts`,
 * loaded when a page or module is rendered, never when the config is.
 *
 * Nothing in the config imports a game or the engine, even lazily: Vite
 * bundles the config with everything it imports, restarts the dev server when
 * any of those files changes, and Node never unloads the bundle it imported.
 * With the collection in it, every game edit would be a restart that keeps
 * megabytes for good. `config-imports.test.ts` asks Vite what the config
 * imports.
 *
 * In dev the module is evaluated by a module runner on the dev server's SSR
 * environment, which shares its transform cache, and the runner is dropped
 * when any file it evaluated changes: each game module registers itself, so
 * re-evaluating one into the old registry would throw, and a fresh runner
 * evaluates all of them, registry included, against the code as it is now.
 * A build evaluates it once, in a runner it then discards.
 */

import { createServerModuleRunner, type Plugin, runnerImport } from "vite";
import type { ModuleRunner } from "vite/module-runner";

export type GameCode = typeof import("../src/build-facts.ts");

const ENTRY = "/src/build-facts.ts";

type Loaded = { code: GameCode; files: readonly string[] };

let load: (() => Promise<Loaded>) | null = null;

/**
 * The game collection, as its code stands. `watch` is given every file it was
 * evaluated from, so a page or module built from it is rebuilt on an edit.
 */
export async function gameCode(watch?: (file: string) => void): Promise<GameCode> {
  if (load === null)
    throw new Error("gameCode() needs gameCodeLoader() among the config's plugins");
  const { code, files } = await load();
  if (watch) for (const file of files) watch(file);
  return code;
}

/** The plugin that gives `gameCode` its loader, in dev and in a build. */
export function gameCodeLoader(): Plugin {
  let runner: ModuleRunner | null = null;
  let loaded: Promise<Loaded> | null = null;
  return {
    name: "game-code",
    configResolved(config) {
      if (config.command !== "build") return;
      load = () => {
        loaded ??= runnerImport<GameCode>(ENTRY, {
          root: config.root,
          logLevel: "warn",
        }).then(({ module, dependencies }) => ({ code: module, files: dependencies }));
        return loaded;
      };
    },
    configureServer(server) {
      const environment = server.environments.ssr;
      load = () => {
        runner ??= createServerModuleRunner(environment, { hmr: false });
        const current = runner;
        loaded ??= current.import<GameCode>(ENTRY).then((code) => ({
          code,
          files: [...current.evaluatedModules.fileToModulesMap.keys()],
        }));
        return loaded;
      };
      server.watcher.on("all", (_event, file) => {
        if (runner?.evaluatedModules.getModulesByFile(file) === undefined) return;
        void runner.close();
        runner = null;
        loaded = null;
      });
    },
    async closeBundle() {
      await runner?.close();
      runner = null;
      loaded = null;
    },
  };
}
