/**
 * The cross-game guard on every render cache: **a frame drawn on a warm draw
 * state looks like the same frame drawn on a fresh one.**
 *
 * `testing/repaint-differential.ts` says what is compared and why the
 * comparison is sound. What it catches is any way a tile can fail to repaint —
 * flags sharing a bit, a value overflowing its field, a painter input missing
 * from the key — which is why this replaced the per-module flag lists: a
 * module listing its own flags cannot see the flag it forgot, and none of the
 * collisions that census found was two named flags sharing a bit.
 *
 * Population: every registered game, from the registry.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import type { AnyGame } from "./testing/input-probe.ts";
import { repaintDifferential } from "./testing/repaint-differential.ts";

const IDS = registeredGameIds().sort();
const EVENTS = 60;

describe("a warm frame matches a fresh one", () => {
  it("is not vacuous — the registry offered every game", () => {
    expect(IDS.length).toBeGreaterThan(50);
  });

  it.each(IDS)("%s: repaints every tile it must", (id) => {
    const run = repaintDifferential(getTsGame(id) as AnyGame, id, EVENTS);
    expect(run.mismatch, JSON.stringify(run.mismatch)).toBeNull();
    expect(run.frames).toBeGreaterThan(EVENTS);
  });
});
