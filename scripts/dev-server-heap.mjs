// The dev server's heap across a long session of edits, measured: it starts
// the server through Vite's API, then a number of rounds of one edit each,
// and after each round prints the heap left after a full GC.
//
//   node --expose-gc scripts/dev-server-heap.mjs [--rounds N] [--page /slant]
//                    [--touch <file>]
//
// Without `--touch`, a round calls `server.restart()`, which is what Vite does
// on a change to anything the config imports. `--touch <file>` rewrites a
// source file with its own bytes and waits for the server to settle, which is
// what an edit to it costs: a restart if the config imports it, a hot reload
// if not. Either way each round then fetches `--page` and every module it
// imports, as a browser would, so that whatever the server caches is filled.
//
// The heap after GC is the instrument, not RSS, which swings by hundreds of
// megabytes with no trend. A leak shows as a straight-line rise.

import fs from "node:fs";
import { parseArgs } from "node:util";
import { createServer } from "vite";

const { values } = parseArgs({
  options: {
    rounds: { type: "string", default: "12" },
    page: { type: "string", default: "/slant" },
    touch: { type: "string" },
    // A config file other than the project's, or "false" for Vite bare: what
    // a leak is left with once a plugin is taken out.
    config: { type: "string" },
  },
});
if (typeof globalThis.gc !== "function") {
  throw new Error("run under node --expose-gc, or the heap figures mean nothing");
}
const rounds = Number(values.rounds);
const touch = values.touch ?? null;

let restarts = 0;
const server = await createServer({
  configFile: values.config === "false" ? false : values.config,
  // HMR stays on: with `hmr: false` Vite ignores a change outright, restart
  // included, and an edit would measure nothing.
  server: { port: 0 },
  logLevel: "warn",
  plugins: [
    {
      name: "count-restarts",
      configureServer: () => {
        restarts++;
      },
    },
  ],
});
await server.listen();

function origin() {
  const address = server.httpServer?.address();
  if (address === null || typeof address !== "object" || address === undefined) {
    throw new Error("the dev server is not listening");
  }
  return `http://localhost:${address.port}`;
}

// A module's static and dynamic imports, as the served (transformed) code
// writes them: absolute, since Vite rewrites every bare and relative one.
const IMPORT = /(?:\bfrom\s*|\bimport\s*\(?\s*)["'](\/[^"']+)["']/g;
const SCRIPT = /<script[^>]*\bsrc="(\/[^"]+)"/g;

/** Fetches `page` and its whole module graph; the number of modules fetched. */
async function crawl(page) {
  const base = origin();
  // A module is its own entry: Vite bare has no pages to start from.
  const queue = page.endsWith(".ts")
    ? [page]
    : [...(await (await fetch(base + page)).text()).matchAll(SCRIPT)].map((m) => m[1]);
  const seen = new Set(queue);
  while (queue.length > 0) {
    const url = queue.pop();
    const response = await fetch(base + url);
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    for (const m of (await response.text()).matchAll(IMPORT)) {
      if (!seen.has(m[1])) {
        seen.add(m[1]);
        queue.push(m[1]);
      }
    }
  }
  return seen.size;
}

/** Resolves once the watcher has seen `file` change and the server is quiet. */
async function edit(file) {
  const changed = new Promise((resolve) => {
    server.watcher.once("change", resolve);
  });
  fs.writeFileSync(file, fs.readFileSync(file));
  await changed;
  // A restart, if one follows, replaces the http server; give it time to.
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

function heapMb() {
  globalThis.gc();
  globalThis.gc();
  return (process.memoryUsage().heapUsed / 2 ** 20).toFixed(1);
}

const first = await crawl(values.page);
console.log(`round 0: ${first} modules, heap ${heapMb()} MB`);
for (let round = 1; round <= rounds; round++) {
  if (touch === null) await server.restart();
  else await edit(touch);
  const modules = await crawl(values.page);
  console.log(
    `round ${round}: ${modules} modules, heap ${heapMb()} MB, restarts ${restarts - 1}`,
  );
}
await server.close();
