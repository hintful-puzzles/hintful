import { describe, expect, it } from "vitest";
import { globCacheKey } from "./glob-cache.ts";

describe("globCacheKey", () => {
  it("bails out every spelling of a glob call", () => {
    for (const source of [
      'import.meta.glob("./*.ts")',
      'import.meta.glob<string>("./*.ts", { query: "?raw" })',
      'import.meta.glob ("./*.ts")',
    ]) {
      expect(globCacheKey(source), source).toBe(false);
    }
  });

  it("leaves a module without one to the cache", () => {
    expect(globCacheKey('import { a } from "./a.ts";\nexport const b = a;')).toBeNull();
    expect(globCacheKey("const globals = import.meta.env;")).toBeNull();
  });
});
