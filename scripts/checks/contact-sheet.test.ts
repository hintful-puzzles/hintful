/**
 * Every game in both schemes on one page, and the close pairs beside it: the
 * thing to look at before and after a change to the palette or to how a family
 * of games is drawn.
 *
 * Each game's frame is recorded once and painted twice, through the palette the
 * app would use in each scheme (`scheme-palettes.ts`), so the two halves of a
 * tile differ in color and in nothing else. Painting the same record through a
 * palette of your own is how to mock up a restyle without touching a game:
 * {@link repaint} takes any palette.
 *
 * The frames are SVG (`svg-drawing.ts`), so text metrics and antialiasing are
 * the browser's and not the canvas's. It shows which colors sit where; it is
 * not evidence that a frame composited correctly in the app.
 *
 * Not part of the gate. Run it with:
 *
 *     npx vitest run -c scripts/checks/diff.vitest.config.mts contact-sheet
 *
 * then serve the output directory over http and open `index.html` (a browser
 * automation tool will refuse a `file:` URL).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { it } from "vitest";
import { type DrawOp, rgbLabel } from "../../src/engine/testing/recording-drawing.ts";
import { toSvg } from "../../src/engine/testing/svg-drawing.ts";
import type { Color } from "../../src/engine/types.ts";
import { puzzleIds } from "../../src/puzzle/catalog.ts";
import {
  sampleFrames,
  schemeNeighbors,
  tooCloseInDark,
} from "../../src/puzzle/neighbor-contrast.ts";
import { schemePalettes } from "../../src/puzzle/scheme-palettes.ts";
import "../../src/games/index.ts";

const OUT = "/tmp/contact-sheet";

/** A record with every color looked up again in `palette`. */
function repaint(ops: readonly DrawOp[], palette: readonly Color[]): DrawOp[] {
  // An index the palette lacks would reach the canvas as a color it refuses;
  // magenta makes it visible here.
  const label = (index: number): string => rgbLabel(palette[index] ?? [1, 0, 1]);
  return ops.map((op) => {
    if (op.op === "clip" || op.op === "unclip") return op;
    if (op.op === "polygon" || op.op === "circle")
      return { ...op, fillRgb: label(op.fill), outlineRgb: label(op.outline) };
    return { ...op, rgb: label(op.color) };
  });
}

it("draws the contact sheet", () => {
  mkdirSync(OUT, { recursive: true });
  const figures: string[] = [];
  const report: string[] = [];
  for (const id of puzzleIds) {
    const { frames, size } = sampleFrames(id);
    const ops = frames[frames.length - 1];
    const palettes = schemePalettes(id);
    const halves = (["light", "dark"] as const).map((scheme) => {
      writeFileSync(
        `${OUT}/${id}-${scheme}.svg`,
        toSvg(repaint(ops, palettes[scheme]), size),
      );
      return `<div style="background:${rgbLabel(palettes[scheme][0])}"><img src="${id}-${scheme}.svg"></div>`;
    });
    figures.push(
      `<figure><figcaption>${id}</figcaption><div class="pair">${halves.join("")}</div></figure>`,
    );
    const pairs = schemeNeighbors(id);
    report.push(`${id}: ${pairs.length} pairs`);
    for (const p of pairs.filter(tooCloseInDark))
      report.push(
        `  ${p.kind} ${p.a}~${p.b} n=${p.count} light ${p.light.toFixed(3)} dark ${p.dark.toFixed(3)}`,
      );
  }
  const css =
    "body{font:12px sans-serif;background:#888;margin:8px;display:grid;" +
    "grid-template-columns:repeat(3,1fr);gap:8px}figure{margin:0;background:#666;" +
    "padding:4px}figcaption{color:#fff}.pair{display:grid;" +
    "grid-template-columns:1fr 1fr;gap:4px}.pair div{padding:6px}" +
    "img{width:100%;display:block}";
  writeFileSync(
    `${OUT}/index.html`,
    `<!doctype html><meta charset="utf-8"><title>contact sheet</title><style>${css}</style>${figures.join("\n")}`,
  );
  writeFileSync(`${OUT}/close-pairs.txt`, `${report.join("\n")}\n`);
});
