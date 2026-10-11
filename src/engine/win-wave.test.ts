import { describe, expect, it } from "vitest";
import { winFlashAt } from "./testing/win-flash.ts";
import {
  loopSteps,
  NO_FLASH,
  ownFlash,
  sweepRanks,
  sweepStep,
  WIN_FLASH_S,
  WIN_STILL_S,
  WinWave,
  walkLoop,
} from "./win-wave.ts";

/** Which of the positions `0..n-1` are lit at each of `frames` instants spread
 * over the flash, its two ends excluded. */
function run(n: number, frames: number, still = false): boolean[][] {
  const positions = Array.from({ length: n }, (_, i) => i);
  const ask = (flash: { win(p: number): boolean }) =>
    positions.map((p) => flash.win(p));
  return Array.from({ length: frames }, (_, f) =>
    ask(winFlashAt((WIN_FLASH_S * (f + 1)) / (frames + 1), ask, still)),
  );
}

describe("the win wave travels its route once", () => {
  it.each([1, 2, 3, 5, 17, 400])("on a route of %i steps", (n) => {
    const frames = run(n, 600);
    for (let p = 0; p < n; p++) {
      const on = frames.map((frame) => frame[p]);
      const first = on.indexOf(true);
      // Lit, and for one stretch: the highlight passes and does not return.
      expect(first).toBeGreaterThanOrEqual(0);
      expect(on.lastIndexOf(true) - first + 1).toBe(on.filter(Boolean).length);
      // In order: a later position never lights before an earlier one.
      if (p > 0)
        expect(first).toBeGreaterThanOrEqual(frames.findIndex((f) => f[p - 1]));
    }
    // Something is lit at every instant between the ends: no dark gap between
    // one step and the next, however short the route.
    for (const frame of frames) expect(frame.some(Boolean)).toBe(true);
  });

  it("lights the same share of a long route as of a short one", () => {
    const share = (n: number) =>
      Math.max(...run(n, 200).map((frame) => frame.filter(Boolean).length)) / n;
    expect(share(400)).toBeCloseTo(share(100), 1);
    expect(share(400)).toBeLessThan(0.3);
  });

  it("starts at the lowest position and ends dark", () => {
    const ask = (flash: { win(p: number): boolean }) => [flash.win(7), flash.win(-3)];
    expect(winFlashAt(0.01, ask).win(-3)).toBe(true);
    expect(winFlashAt(0.01, ask).win(7)).toBe(false);
    const end = winFlashAt(WIN_FLASH_S, ask);
    expect([end.win(-3), end.win(7)]).toEqual([false, false]);
  });
});

describe("a frame of the win wave", () => {
  it("lights nothing until a frame has measured the route", () => {
    const wave = new WinWave(false);
    wave.seek(1);
    expect(wave.win(0)).toBe(false);
    expect(wave.done).toBe(false);
  });

  it("gives one answer however often it is asked", () => {
    const wave = new WinWave(false);
    for (let p = 0; p < 10; p++) wave.win(p);
    wave.endFrame();
    wave.seek(0.5);
    const once = Array.from({ length: 10 }, (_, p) => wave.win(p));
    // A position outside the route, asked mid-frame, moves nothing this frame.
    wave.win(500);
    expect(Array.from({ length: 10 }, (_, p) => wave.win(p))).toEqual(once);
  });

  it("ends when a frame asked about nothing", () => {
    const wave = new WinWave(false);
    wave.endFrame();
    expect(wave.done).toBe(true);
  });

  it("is over at the flash's length", () => {
    const wave = new WinWave(false);
    wave.seek(WIN_FLASH_S - 0.001);
    expect(wave.done).toBe(false);
    wave.seek(WIN_FLASH_S);
    expect(wave.done).toBe(true);
  });
});

describe("the still flash, for reduced motion", () => {
  it("lights everything at once and does not travel", () => {
    for (const frame of run(9, 20, true)) expect(new Set(frame).size).toBe(1);
  });

  it("is shorter than the traveling one", () => {
    const wave = new WinWave(true);
    wave.seek(WIN_STILL_S);
    expect(wave.done).toBe(true);
    expect(WIN_STILL_S).toBeLessThan(WIN_FLASH_S);
  });
});

describe("a flash that is not a win", () => {
  it("lights nothing", () => {
    expect(NO_FLASH.win(0)).toBe(false);
    expect(ownFlash(0.2).win(0)).toBe(false);
    expect(ownFlash(0.2).time).toBe(0.2);
    expect(ownFlash(0.2).winning).toBe(false);
  });
});

describe("sweepStep", () => {
  it("runs from the bottom left to the top right", () => {
    const w = 4;
    const h = 3;
    const cells = Array.from({ length: w * h }, (_, i) => ({
      x: i % w,
      y: (i / w) | 0,
    }));
    const by = [...cells].sort((a, b) => sweepStep(a.x, a.y) - sweepStep(b.x, b.y));
    expect(by[0]).toEqual({ x: 0, y: h - 1 });
    expect(by[by.length - 1]).toEqual({ x: w - 1, y: 0 });
    // Neighbors along the sweep are one step apart.
    expect(sweepStep(1, 0) - sweepStep(0, 0)).toBe(1);
    expect(sweepStep(0, 0) - sweepStep(0, 1)).toBe(1);
  });
});

describe("sweepRanks", () => {
  it("ranks scattered centers along the sweep, one step apart", () => {
    // Bottom left, two on one diagonal far from it, and the top right.
    const ranks = sweepRanks([
      { x: 300, y: 10 },
      { x: 5, y: 290 },
      { x: 120, y: 100 },
      { x: 140, y: 120 },
    ]);
    expect(ranks).toEqual([2, 0, 1, 1]);
  });
});

describe("loopSteps", () => {
  // A square's corners, clockwise as drawn (y downward): top-left, top-right,
  // bottom-right, bottom-left.
  const clockwise = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 2 },
    { x: 0, y: 2 },
  ];

  it("starts at the bottom left and goes clockwise", () => {
    // Bottom-left first, then up to the top-left, across, and down.
    expect(loopSteps(clockwise)).toEqual([1, 2, 3, 0]);
  });

  it("goes clockwise whichever way round the loop was given", () => {
    const given = [...clockwise].reverse();
    const steps = loopSteps(given);
    const byStep = given.map((_, n) => given[steps.indexOf(n)]);
    expect(byStep).toEqual([
      { x: 0, y: 2 },
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
    ]);
  });

  it("starts nearest the corner when the bottom row is reached only on the right", () => {
    // An L: its lowest row is at the right, its leftmost column is higher up.
    const l = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ];
    const steps = loopSteps(l);
    expect(l[steps.indexOf(0)]).toEqual({ x: 0, y: 2 });
    expect(l[steps.indexOf(1)]).toEqual({ x: 0, y: 0 });
  });

  it("takes the lower of two elements equally near the corner", () => {
    const steps = loopSteps([
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 1 },
      { x: 0, y: 1 },
    ]);
    expect(steps.indexOf(0)).toBe(3);
  });
});

describe("walkLoop", () => {
  it("orders a loop's links however they were listed", () => {
    // A hexagon 0-1-2-3-4-5, its links shuffled and written either way round.
    const links = [
      [3, 2],
      [0, 1],
      [5, 0],
      [1, 2],
      [4, 3],
      [4, 5],
    ] as const;
    const walk = walkLoop(links);
    expect(walk.links).toHaveLength(6);
    expect(new Set(walk.links).size).toBe(6);
    expect(new Set(walk.nodes).size).toBe(6);
    // Each link is left by its node and arrives at the next one's.
    walk.links.forEach((k, i) => {
      const next = walk.nodes[(i + 1) % 6];
      expect([...links[k]].sort()).toEqual([walk.nodes[i], next].sort());
    });
  });

  it("stops at the end of a route that does not close", () => {
    expect(
      walkLoop([
        [0, 1],
        [1, 2],
      ]).links,
    ).toEqual([0, 1]);
    expect(walkLoop([]).links).toEqual([]);
  });
});
