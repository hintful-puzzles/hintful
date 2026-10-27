/**
 * Empties a dev server's module graphs when it closes, as it does on every
 * restart, so the copy that Vite cannot free holds no transformed code.
 *
 * Vite (8.2 to 8.3.5) hands rolldown's native resolver plugin callbacks that
 * close over the environment that owns the plugin, and a cycle through native
 * handles is never collected, so each restart keeps the old server's
 * environments for good. With their graphs emptied a restart keeps about
 * 2.6 MB rather than 15 (`scripts/dev-server-heap.mjs`).
 */

import type { Plugin, ViteDevServer } from "vite";

export function releaseClosedServer(): Plugin {
  let server: ViteDevServer | null = null;
  return {
    name: "release-closed-server",
    configureServer(devServer) {
      server = devServer;
    },
    closeBundle() {
      for (const environment of Object.values(server?.environments ?? {})) {
        environment.moduleGraph.invalidateAll();
      }
    },
  };
}
