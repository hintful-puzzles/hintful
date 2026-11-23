// The bundle `npm run compare-cost` counts (`scripts/compare-cost.ts`), built
// in each tree it compares: its worker and the games named in `COST_GAMES`,
// one ES module for Node at `COST_BUNDLE`. A build with the app's resolution
// (the describe plugin, `import.meta.glob`, DEV off, the app's target), so an
// import is bound as the app binds it and not read through a module runner's
// getter: under vitest, Light Up's born deal counted twice its bundle's.
import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import { describeFirst } from "../../vite-plugins/describe.ts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const ENTRY = "virtual:cost-entry";
const bundle = process.env["COST_BUNDLE"];
const games = process.env["COST_GAMES"]?.split(",") ?? [];
if (bundle === undefined || games.length === 0)
  throw new Error(
    "cost.vite.config: COST_BUNDLE and COST_GAMES are set by compare-cost",
  );

/** Each game's registering module, its own directory's or the one its
 * description is compiled to, imported before the worker runs. */
function costEntry(): Plugin {
  return {
    name: "cost-entry",
    resolveId: (id) => (id === ENTRY ? `\0${ENTRY}` : null),
    load(id) {
      if (id !== `\0${ENTRY}`) return null;
      const modules = games.map((game) => {
        const own = `${ROOT}/src/games/${game}/index.ts`;
        const born = `${ROOT}/src/generated/games/${game}/${game}.game.ts`;
        if (existsSync(own)) return own;
        if (existsSync(born)) return born;
        throw new Error(`cost.vite.config: no game "${game}" in ${ROOT}`);
      });
      return [...modules, `${ROOT}/scripts/checks/cost-walk.ts`]
        .map((file) => `import ${JSON.stringify(file)};`)
        .join("\n");
    },
  };
}

export default defineConfig({
  root: ROOT,
  logLevel: "warn",
  publicDir: false,
  plugins: [describeFirst(), costEntry()],
  ssr: { noExternal: true, target: "node" },
  build: {
    ssr: true,
    outDir: path.dirname(bundle),
    emptyOutDir: false,
    target: "es2022",
    minify: true,
    rollupOptions: {
      input: ENTRY,
      output: { entryFileNames: path.basename(bundle) },
    },
  },
});
