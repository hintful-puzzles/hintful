/**
 * Keeps a module that calls `import.meta.glob` out of vitest's module cache
 * (`fsModuleCache`, on by default), which keys a module on its own text. A
 * glob is expanded in the transform, so a cached guard keeps the file list it
 * matched when it was cached, and a file added since is not among them.
 *
 * Vitest already skips such a module, but by matching `import.meta.glob(`,
 * which the typed call `import.meta.glob<string>(` does not contain. The
 * pattern here also matches a mention in a comment: that costs one module a
 * transform, where too narrow a pattern lets a guard pass on a stale list.
 */

import type { Plugin } from "vite";

const GLOB = /import\.meta\.glob\b/;

/** Whether vitest may cache a module with this source: `false` bails it out. */
export function globCacheKey(sourceCode: string): false | null {
  return GLOB.test(sourceCode) ? false : null;
}

export function uncacheGlobs(): Plugin {
  return {
    name: "uncache-globs",
    configureVitest({ defineCacheKeyGenerator }) {
      defineCacheKeyGenerator(({ sourceCode }) => globCacheKey(sourceCode));
    },
  };
}
