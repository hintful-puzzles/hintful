/**
 * Which hint references name one thing and paint an area wider than a square?
 *
 * A sentence that names a clue by its value ("this 4") tells the player to
 * find a square. Where the only mark drawn for the reference is the clue's
 * area, the player finds the square by working out the area's middle, and the
 * same digit elsewhere inside the area is as good a reading
 * (docs/games/hints.md § "A clue named with its area is marked on its own
 * square").
 *
 * No list of games says which references have that shape, since what a
 * reference paints is its game's renderer's business. So this reads the frame,
 * the way the binding check does (`engine/testing/hint-binding.ts`): each
 * outline or stripes reference that names one unit is narrowed out of the
 * step's words, and the paint that goes with it is measured. A reference whose
 * paint spans more than a tile and a half is a row.
 *
 * **It is a report, not a gate.** Most rows name the area itself ("this row",
 * "this cage", "the striped region"), and those are right as they stand: the
 * area is the thing the words point at. The rows to read are the ones whose
 * words name a clue, a number or a square, and the question to ask of each is
 * whether the frame also marks that square. The measure cannot ask it: a
 * reference that paints both the area and the square is as wide as one that
 * paints the area alone, which is why Mosaic's numbers stay rows.
 *
 *     npx vitest run -c scripts/checks/diff.vitest.config.mts hint-area-names
 */
import { writeFileSync } from "node:fs";
import { expect, it } from "vitest";
import type { HintStep } from "../../src/engine/game.ts";
import type { MarkRef, Sentence } from "../../src/engine/hint-words.ts";
import { dealt } from "../../src/engine/testing/dealt.ts";
import { gatePresets, HINT_GAMES } from "../../src/engine/testing/hint-games.ts";
import {
  type DrawOp,
  RecordingDrawing,
} from "../../src/engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../src/engine/testing/render-scenario.ts";
import { NO_FLASH } from "../../src/engine/win-wave.ts";

const OUT = "metrics/hint-area-names.md";

/** Steps walked on one board. A board's later steps are spoken by the rungs
 * its earlier ones were. */
const STEPS = 80;
const SEEDS = [1, 2];
/** Tiles a reference's paint may span and still be one square's: a mark in
 * the gutter round a square is a little over one. */
const WIDE = 1.6;

type Box = readonly [x0: number, y0: number, x1: number, y1: number];

/** The box an op paints in, or `null` for one that paints nothing here. */
function boxOf(op: DrawOp): Box | null {
  switch (op.op) {
    case "rect":
      return [op.x, op.y, op.x + op.w, op.y + op.h];
    case "line":
      return [
        Math.min(op.x1, op.x2),
        Math.min(op.y1, op.y2),
        Math.max(op.x1, op.x2),
        Math.max(op.y1, op.y2),
      ];
    case "polygon": {
      const xs = op.points.map((p) => p[0]);
      const ys = op.points.map((p) => p[1]);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    }
    case "circle":
      return [op.cx - op.r, op.cy - op.r, op.cx + op.r, op.cy + op.r];
    case "text":
      return [op.x, op.y, op.x, op.y];
    default: {
      const o = op as { x?: number; y?: number; w?: number; h?: number };
      if (o.x === undefined || o.y === undefined) return null;
      return [o.x, o.y, o.x + (o.w ?? 0), o.y + (o.h ?? 0)];
    }
  }
}

/** The longer side, in pixels, of the box round every op of `full` that
 * `without` lacks. */
function spanOfDifference(full: readonly string[], without: readonly string[]): number {
  const left = new Map<string, number>();
  for (const o of without) left.set(o, (left.get(o) ?? 0) + 1);
  let box: Box | null = null;
  for (const o of full) {
    const n = left.get(o) ?? 0;
    if (n > 0) {
      left.set(o, n - 1);
      continue;
    }
    const b = boxOf(JSON.parse(o) as DrawOp);
    if (!b) continue;
    box = box
      ? [
          Math.min(box[0], b[0]),
          Math.min(box[1], b[1]),
          Math.max(box[2], b[2]),
          Math.max(box[3], b[3]),
        ]
      : b;
  }
  return box ? Math.max(box[2] - box[0], box[3] - box[1]) : 0;
}

interface Row {
  oneUnit: number;
  wide: number;
  said: Map<string, number>;
}

it("reports every reference that names one thing and paints an area", () => {
  const rows = new Map<string, Row>();
  let references = 0;
  let measured = 0;

  for (const [name, game] of HINT_GAMES) {
    const palette = game.colors(DEFAULT_BACKGROUND);
    const tile = game.preferredTileSize ?? 32;
    for (const { params } of gatePresets(name, game))
      for (const seed of SEEDS) {
        const { desc, aux } = dealt(game, params, seed);
        let state = game.newState(params, desc);
        const ui = game.newUi(state);
        const frame = (step: HintStep<unknown>, words: Sentence): string[] => {
          const rec = new RecordingDrawing(palette);
          const ds = game.newDrawState(state, tile);
          game.redraw(rec, ds, null, state, 1, ui, 0, NO_FLASH, { ...step, words });
          return rec.ops.map((o) => JSON.stringify(o));
        };
        let walked = 0;
        for (let round = 0; round < 40 && walked < STEPS; round++) {
          if (game.status(state) !== "ongoing") break;
          const res = game.hint?.(state, aux, ui);
          if (!res?.ok) break;
          for (const step of res.steps) {
            if (walked++ >= STEPS) break;
            const words = step.words;
            let full: string[] | null = null;
            for (const r of (words?.refs ?? []) as MarkRef[]) {
              if (r.role === "ring" || !words) continue;
              references++;
              const unit = r.kind.unit?.bind(r.kind) ?? r.kind.key.bind(r.kind);
              if (new Set(r.elements.map(unit)).size !== 1) continue;
              measured++;
              const id = `${name} | ${r.role} | ${r.kind.name}`;
              const row = rows.get(id) ?? { oneUnit: 0, wide: 0, said: new Map() };
              rows.set(id, row);
              row.oneUnit++;
              full ??= frame(step, words);
              const keys = new Set(r.elements.map((e) => r.kind.key(e)));
              const without = frame(
                step,
                words.narrow(
                  (role, kind, key) =>
                    !(role === r.role && kind === r.kind.name && keys.has(key)),
                ),
              );
              if (spanOfDifference(full, without) <= WIDE * tile) continue;
              row.wide++;
              // A reference carries its words, which `MarkRef` does not show.
              const said = (r as MarkRef & { words(e: readonly unknown[]): string })
                .words(r.elements)
                .toLowerCase()
                .replace(/\d+/g, "#");
              row.said.set(said, (row.said.get(said) ?? 0) + 1);
            }
            const live = game.refreshHintStep
              ? game.refreshHintStep(step, state)
              : step;
            if (live === null) continue;
            state = game.executeMove(state, live.move);
          }
        }
      }
  }

  // The "how many did I look at?" guard, and the instrument's known positive:
  // a striped row is one unit and as wide as the board.
  expect(measured, "no one-unit reference was measured").toBeGreaterThan(2000);
  const wide = [...rows].filter(([, r]) => r.wide > 0);
  expect(
    wide.some(([, r]) => [...r.said.keys()].some((s) => /\brow\b/.test(s))),
    "no striped row measured wide: the measure sees no area",
  ).toBe(true);

  const lines = [
    "# References that name one thing and paint an area",
    "",
    "Generated by `npx vitest run -c scripts/checks/diff.vitest.config.mts hint-area-names`.",
    "**Advisory.** A row whose words name the area itself is right as it stands.",
    "Read the rows whose words name a clue, a number or a square, and ask of each",
    "whether the frame also marks that square.",
    "",
    `${references} outline and stripes references walked, ${measured} naming one unit;`,
    `${wide.length} kinds of reference paint wider than ${WIDE} tiles, in ${new Set(wide.map(([id]) => id.split(" | ")[0])).size} games.`,
    "",
    "| game | role | kind | wide, of one-unit | said |",
    "| --- | --- | --- | --- | --- |",
    ...wide
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, r]) => {
        const said = [...r.said]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([s]) => `"${s}"`)
          .join(", ");
        return `| ${id} | ${r.wide} of ${r.oneUnit} | ${said} |`;
      }),
  ];
  writeFileSync(OUT, `${lines.join("\n")}\n`);
  console.log(`wrote ${OUT}: ${wide.length} kinds of reference paint an area`);
});
