import { describe, expect, it } from "vitest";
import { InstallProgress, percentOf, planInstall } from "./precache-plan.ts";

const urls = ["https://x/a.js", "https://x/b.png", "https://x/c.html"];
const sizes = new Map([
  ["https://x/a.js", 800],
  ["https://x/b.png", 150],
  ["https://x/c.html", 50],
]);

describe("planInstall", () => {
  it("plans every file on a first install", () => {
    const plan = planInstall({ urls, sizes, isCached: () => false });
    expect([...plan.pending]).toEqual(urls);
    expect(plan.totalBytes).toBe(1000);
  });

  it("plans only what the cache lacks on an update", () => {
    const plan = planInstall({ urls, sizes, isCached: (u) => u !== "https://x/b.png" });
    expect([...plan.pending]).toEqual(["https://x/b.png"]);
    expect(plan.totalBytes).toBe(150);
  });

  it("plans nothing when everything is cached", () => {
    const plan = planInstall({ urls, sizes, isCached: () => true });
    expect(plan.pending.size).toBe(0);
    expect(plan.totalBytes).toBe(0);
  });

  it("falls back to file counts when the sizes could not be read", () => {
    const plan = planInstall({ urls, sizes: null, isCached: () => false });
    expect(plan.pending.size).toBe(3);
    expect(plan.totalBytes).toBe(0);
  });

  it("weighs a file the sizes do not list at nothing, and still counts it", () => {
    // The real manifest has a file the build's size pass never sees.
    const partial = new Map([["https://x/a.js", 800]]);
    const plan = planInstall({ urls, sizes: partial, isCached: () => false });
    expect(plan.pending.size).toBe(3);
    expect(plan.totalBytes).toBe(800);
    const progress = new InstallProgress(plan);
    expect(progress.finish("https://x/b.png")).toMatchObject({ count: 1, bytes: 0 });
    expect(progress.finish("https://x/a.js")).toMatchObject({ count: 2, bytes: 800 });
  });
});

describe("InstallProgress", () => {
  it("accumulates bytes and reaches completion exactly when the last file ends", () => {
    const progress = new InstallProgress(
      planInstall({ urls, sizes, isCached: () => false }),
    );
    expect(progress.finish("https://x/a.js")).toEqual({
      count: 1,
      total: 3,
      bytes: 800,
      totalBytes: 1000,
    });
    expect(progress.complete).toBe(false);
    progress.finish("https://x/b.png");
    expect(progress.complete).toBe(false);
    expect(progress.finish("https://x/c.html")).toMatchObject({
      count: 3,
      bytes: 1000,
    });
    expect(progress.complete).toBe(true);
  });

  it("ignores a file already cached, so an update's figure is its own", () => {
    const plan = planInstall({
      urls,
      sizes,
      isCached: (u) => u !== "https://x/c.html",
    });
    const progress = new InstallProgress(plan);
    expect(progress.finish("https://x/a.js")).toBeNull();
    expect(progress.finish("https://x/c.html")).toEqual({
      count: 1,
      total: 1,
      bytes: 50,
      totalBytes: 50,
    });
    expect(progress.complete).toBe(true);
  });

  it("counts a file once however often it reports", () => {
    const progress = new InstallProgress(
      planInstall({ urls, sizes, isCached: () => false }),
    );
    progress.finish("https://x/a.js");
    expect(progress.finish("https://x/a.js")).toMatchObject({ count: 1, bytes: 800 });
  });

  it("is complete at once when there is nothing to fetch", () => {
    const progress = new InstallProgress(
      planInstall({ urls, sizes, isCached: () => true }),
    );
    expect(progress.complete).toBe(true);
  });
});

describe("percentOf", () => {
  it("is by bytes when sizes are known", () => {
    expect(percentOf({ count: 1, total: 3, bytes: 800, totalBytes: 1000 })).toBe(80);
  });
  it("is by files when they are not", () => {
    expect(percentOf({ count: 1, total: 4, bytes: 0, totalBytes: 0 })).toBe(25);
  });
  it("never passes 100 or divides by zero", () => {
    expect(percentOf({ count: 5, total: 3, bytes: 0, totalBytes: 0 })).toBe(100);
    expect(percentOf({ count: 0, total: 0, bytes: 0, totalBytes: 0 })).toBe(0);
  });
});
