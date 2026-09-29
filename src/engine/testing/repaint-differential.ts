/**
 * **Does an incrementally drawn frame look like the same frame drawn from
 * nothing?** The one question every render cache must answer yes to, asked
 * directly rather than through the cache's bits.
 *
 * A game keeps a draw state recording what the canvas shows and repaints a tile
 * only when its key changes. Anything the painter reads that the key does not
 * name leaves a tile showing the past: two flags sharing a bit, a value
 * overflowing its field, or an input the key never mentions. Each has shipped
 * here, and each was invisible to every snapshot, because a snapshot starts
 * from a cold draw state and a cold draw state repaints everything. So this
 * drives a real `Midend` through a seeded run of input, and after every frame
 * paints the same frame again on a fresh draw state and compares the two
 * pictures.
 *
 * ON THE INSTRUMENT. The picture is a **raster of inks**: each op writes its
 * color over the pixels it paints, and text writes its string too (a stale "3"
 * under a fresh "4" in the same ink must differ). Both directions of error
 * convict a cache wrongly, so the raster aims to be exact, not merely cautious.
 * An op that claims more than it paints spills into a neighboring tile, where a
 * fresh paint covers the spill and a warm one rightly does not: the first cut
 * claimed bounding boxes and reported 27 games for that. An op that claims less
 * leaves an older claim standing under a pixel it really repaints: polygons
 * claiming only their centroid convicted Mines. Production draws at `+ 0.5`
 * (`puzzle/drawing.ts`), so a pixel is inside a filled shape exactly when its
 * integer corner is, and a one-pixel stroke covers the pixels its path passes
 * through; rects, polygons, circles and one-pixel lines are rasterized that
 * way. A thick line claims only its path and text a small box at its middle,
 * the two places the raster is still an estimate. Blitter saves and loads are
 * replayed, because a sprite game restores what was under its sprite with them.
 *
 * Dev/test-only; never imported by production code.
 */

import { Midend } from "../midend.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../pointer.ts";
import { randomNew, randomUpto } from "../random/index.ts";
import type { AnyGame } from "./input-probe.ts";
import { type DrawOp, RecordingDrawing } from "./recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./render-scenario.ts";

/** A canvas of op identities, one per pixel. */
export class BoxRaster {
  readonly px: Int32Array;
  /** The frame that last wrote each pixel, for the report. */
  readonly when: Int32Array;
  private frame = 0;
  private clipRect: { x0: number; y0: number; x1: number; y1: number };

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    // The midend lays color 0 under a fresh draw state's first frame.
    this.px = new Int32Array(w * h).fill(ink(0));
    this.when = new Int32Array(w * h);
    this.clipRect = { x0: 0, y0: 0, x1: w, y1: h };
  }

  /** What each blitter holds, keyed by the blitter the game made. */
  private readonly saved = new Map<unknown, { w: number; h: number; px: Int32Array }>();

  /** Paint a recording, or a bare op list that used no blitter. */
  apply(rec: BlitterRecording | readonly DrawOp[], frame = 0): void {
    this.frame = frame;
    const ops = "ops" in rec ? rec.ops : rec;
    const blits = "blits" in rec ? rec.blits : [];
    let b = 0;
    for (let i = 0; i <= ops.length; i++) {
      for (; b < blits.length && blits[b].at === i; b++) this.blit(blits[b]);
      if (i < ops.length) this.one(ops[i]);
    }
    this.clipRect = { x0: 0, y0: 0, x1: this.w, y1: this.h };
  }

  /** A blitter save copies pixels out and a load copies them back, as the
   * canvas does: a sprite game restores what was under its sprite this way,
   * and a raster that ignored it would keep the sprite. */
  private blit(e: BlitEvent): void {
    const { w, h } = e.blitter.size;
    if (e.kind === "save") {
      const px = new Int32Array(w * h).fill(identity("unsaved"));
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const cx = e.x + x;
          const cy = e.y + y;
          if (cx >= 0 && cy >= 0 && cx < this.w && cy < this.h)
            px[y * w + x] = this.px[cy * this.w + cx];
        }
      this.saved.set(e.blitter, { w, h, px });
      return;
    }
    const got = this.saved.get(e.blitter);
    if (!got) return;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const v = got.px[y * w + x];
        this.fill(e.x + x, e.y + y, e.x + x + 1, e.y + y + 1, v);
      }
  }

  private dot(x: number, y: number, v: number): void {
    this.fill(x, y, x + 1, y + 1, v);
  }

  /** One pixel wide along a segment: never wider than what is painted. */
  private segment(x1: number, y1: number, x2: number, y2: number, v: number): void {
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
    for (let k = 0; k <= n; k++) {
      const x = Math.round(x1 + ((x2 - x1) * k) / n);
      const y = Math.round(y1 + ((y2 - y1) * k) / n);
      this.fill(x, y, x + 1, y + 1, v);
    }
  }

  private one(o: DrawOp): void {
    switch (o.op) {
      case "clip":
        this.clipRect = {
          x0: Math.max(0, o.x),
          y0: Math.max(0, o.y),
          x1: Math.min(this.w, o.x + o.w),
          y1: Math.min(this.h, o.y + o.h),
        };
        return;
      case "unclip":
        this.clipRect = { x0: 0, y0: 0, x1: this.w, y1: this.h };
        return;
      case "rect":
        this.fill(o.x, o.y, o.x + o.w, o.y + o.h, ink(o.color));
        return;
      case "hatch":
        // A hatch is stripes over the rect's own paint, not a fill of it.
        this.fill(o.x, o.y, o.x + o.w, o.y + o.h, identity("hatch", o.color));
        return;
      case "line":
        this.segment(o.x1, o.y1, o.x2, o.y2, ink(o.color));
        return;
      case "circle": {
        const r2 = o.r * o.r;
        const x0 = Math.floor(o.cx - o.r) - 1;
        const y0 = Math.floor(o.cy - o.r) - 1;
        const x1 = Math.ceil(o.cx + o.r) + 1;
        const y1 = Math.ceil(o.cy + o.r) + 1;
        for (let y = y0; y <= y1; y++)
          for (let x = x0; x <= x1; x++) {
            const d2 = (x - o.cx) ** 2 + (y - o.cy) ** 2;
            const d = Math.sqrt(d2);
            if (o.outline >= 0 && Math.abs(d - o.r) <= 0.5)
              this.dot(x, y, ink(o.outline));
            else if (o.fill >= 0 && d2 <= r2) this.dot(x, y, ink(o.fill));
          }
        return;
      }
      case "polygon": {
        const pts = o.points;
        if (o.fill >= 0) {
          const xs = pts.map((p) => p[0]);
          const ys = pts.map((p) => p[1]);
          for (let y = Math.min(...ys); y <= Math.max(...ys); y++)
            for (let x = Math.min(...xs); x <= Math.max(...xs); x++)
              if (inside(pts, x, y)) this.dot(x, y, ink(o.fill));
        }
        if (o.outline >= 0)
          for (let k = 0; k < pts.length; k++) {
            const [x1, y1] = pts[k];
            const [x2, y2] = pts[(k + 1) % pts.length];
            this.segment(x1, y1, x2, y2, ink(o.outline));
          }
        return;
      }
      case "text": {
        // A small box at the glyphs' middle: an estimate that stays inside them.
        const span = (o.text.length * o.size * 0.6) / 2;
        const cx =
          o.align === "left" ? o.x + span : o.align === "right" ? o.x - span : o.x;
        const cy =
          o.baseline === "top" || o.baseline === "hanging"
            ? o.y + o.size * 0.35
            : o.baseline === "middle" || o.baseline === "mathematical"
              ? o.y
              : o.y - o.size * 0.35;
        const s = Math.max(1, Math.floor(o.size * 0.15));
        const x = Math.round(cx);
        const y = Math.round(cy);
        this.fill(
          x - s,
          y - s,
          x + s + 1,
          y + s + 1,
          identity(`text:${o.text}`, o.color),
        );
        return;
      }
    }
  }

  private fill(x0: number, y0: number, x1: number, y1: number, v: number): void {
    const c = this.clipRect;
    const ax = Math.max(c.x0, Math.floor(x0));
    const ay = Math.max(c.y0, Math.floor(y0));
    const bx = Math.min(c.x1, Math.ceil(x1));
    const by = Math.min(c.y1, Math.ceil(y1));
    for (let y = ay; y < by; y++) {
      const from = y * this.w + ax;
      const to = y * this.w + Math.max(ax, bx);
      this.px.fill(v, from, to);
      this.when.fill(this.frame, from, to);
    }
  }
}

interface Blitter {
  readonly size: { w: number; h: number };
}

interface BlitEvent {
  /** The op index it comes before. */
  at: number;
  kind: "save" | "load";
  blitter: Blitter;
  x: number;
  y: number;
}

/** A recording that also keeps the blitter calls `RecordingDrawing` drops, in
 * their place among the ops. */
export class BlitterRecording extends RecordingDrawing {
  readonly blits: BlitEvent[] = [];

  override blitterNew(size?: { w: number; h: number }): unknown {
    return { size: size ?? { w: 0, h: 0 } };
  }
  override blitterSave(blitter?: unknown, origin?: { x: number; y: number }): void {
    this.push("save", blitter, origin);
  }
  override blitterLoad(blitter?: unknown, origin?: { x: number; y: number }): void {
    this.push("load", blitter, origin);
  }
  private push(
    kind: "save" | "load",
    blitter: unknown,
    origin?: { x: number; y: number },
  ): void {
    if (!origin) return;
    this.blits.push({
      at: this.ops.length,
      kind,
      blitter: blitter as Blitter,
      x: Math.round(origin.x),
      y: Math.round(origin.y),
    });
  }
}

/** A palette color as it lands on the canvas, whatever op put it there. */
function ink(color: number): number {
  return identity("ink", color);
}

/** Whether pixel `(x, y)` is inside a polygon, half-open like a rect fill —
 * `[left, right)` and `[top, bottom)` — so two shapes sharing an edge do not
 * both claim the pixels on it. */
function inside(
  pts: ReadonlyArray<readonly [number, number]>,
  x: number,
  y: number,
): boolean {
  let odd = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) odd = !odd;
  }
  return odd;
}

/** Each identity's readable form, for the report. */
const LABELS = new Map<number, string>();

function identity(kind: string, ...colors: number[]): number {
  const label = `${kind} ${colors.join("/")}`;
  let h = 0;
  for (const ch of label) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0;
  LABELS.set(h, label);
  return h;
}

/** Where a warm frame first disagreed with its cold twin. */
export interface RepaintMismatch {
  /** Which frame of the run, and the event that led to it. */
  frame: number;
  after: string;
  /** How many pixels differ, and the first one's position. */
  pixels: number;
  at: { x: number; y: number };
  /** What the warm canvas shows there and the frame that painted it, and
   * what a fresh one shows. */
  warm: string;
  paintedAt: number;
  fresh: string;
}

/** What the run actually put in front of the game — the power behind a pass.
 * A frame that never showed a hint says nothing about the hint's repaint. */
export interface RepaintReach {
  /** Frames painted mid-animation or mid-flash. */
  animated: number;
  /** Events after which the midend had an animation armed, read from
   * `currentAnimationMs`, which does not depend on how the run ticks. A run
   * that armed one and painted no animated frame has stopped looking. */
  armed: number;
  /** Frames painted with a hint step displayed. */
  hinted: number;
  /** Frames painted with a non-empty mistake overlay. */
  mistaken: number;
}

export interface RepaintRun {
  /** Frames compared — the vacuity count. */
  frames: number;
  mismatch: RepaintMismatch | null;
  reached: RepaintReach;
}

/** One tick of the run's clock, in the seconds `Midend.timer` takes: short
 * enough that every animation and flash in the collection is painted
 * part-way through at least once. */
const TICK_S = 0.05;
/** Ticks before the run stops waiting for a frame to settle (6 s). */
const MAX_TICKS = 120;

/**
 * Drive `game` through `events` seeded input events on a board of `params`
 * (its default params unless given), comparing every frame against a fresh
 * draw state's, the frames of every animation included. Stops at the first
 * mismatch.
 */
export function repaintDifferential(
  game: AnyGame,
  seed: string,
  events: number,
  params: unknown = game.defaultParams(),
): RepaintRun {
  const tileSize = game.preferredTileSize ?? 32;
  const size = game.computeSize(params, tileSize);
  const palette = game.colors(DEFAULT_BACKGROUND);
  let warm: BoxRaster | null = null;
  let frames = 0;
  let mismatch: RepaintMismatch | null = null;
  let lastEvent = "the first frame";
  const reached: RepaintReach = { animated: 0, armed: 0, hinted: 0, mistaken: 0 };
  let moving = false;

  const spy: AnyGame = {
    ...game,
    // The midend's own drawing is a sink: the warm frame is recorded here.
    redraw: (_dr, ds, prev, s, dir, ui, anim, flash, hint, mistakes) => {
      moving = anim > 0 || flash > 0;
      if (moving) reached.animated++;
      if (hint) reached.hinted++;
      if (mistakes && mistakes.length > 0) reached.mistaken++;
      // The fresh twin runs first, on its own copy of the Ui, so neither call
      // can see what the other one wrote.
      const cold = new BlitterRecording(palette);
      game.redraw(
        cold,
        game.newDrawState(s, tileSize),
        prev,
        s,
        dir,
        structuredClone(ui),
        anim,
        flash,
        hint,
        mistakes,
      );
      const hot = new BlitterRecording(palette);
      game.redraw(hot, ds, prev, s, dir, ui, anim, flash, hint, mistakes);
      frames++;
      if (warm === null) warm = new BoxRaster(size.w, size.h);
      warm.apply(hot, frames);
      const fresh = new BoxRaster(size.w, size.h);
      fresh.apply(cold, frames);
      if (mismatch === null) {
        let first = -1;
        let pixels = 0;
        for (let i = 0; i < fresh.px.length; i++) {
          if (fresh.px[i] === warm.px[i]) continue;
          if (first < 0) first = i;
          pixels++;
        }
        if (pixels > 0)
          mismatch = {
            frame: frames,
            after: lastEvent,
            pixels,
            at: { x: first % size.w, y: Math.floor(first / size.w) },
            warm: LABELS.get(warm.px[first]) ?? "?",
            paintedAt: warm.when[first],
            fresh: LABELS.get(fresh.px[first]) ?? "?",
          };
      }
    },
  };

  const m = new Midend(spy);
  m.setCallbacks(
    () => {},
    () => {},
    () => {},
  );
  const desc = game.newDesc(params, randomNew(`repaint-${seed}`)).desc;
  m.newGameFromId(`${game.encodeParams(params, true)}:${desc}`);
  const sink = new RecordingDrawing(palette);
  const paint = () => {
    m.redraw(sink);
    sink.ops.length = 0;
  };
  // Paint the frame an event left, then tick the clock and paint every frame
  // until one comes out still, so an animation's and a flash's frames are
  // compared and not only where they end. `Midend.timer` takes seconds, so a
  // tick of a whole second or more ends every animation in the collection
  // unseen inside it. The last tick settles anything longer than the cap.
  const settle = () => {
    paint();
    if (m.currentAnimationMs() > 0) reached.armed++;
    for (let t = 0; t < MAX_TICKS; t++) {
      m.timer(TICK_S);
      paint();
      if (!moving) return;
    }
    m.timer(30);
    paint();
  };
  paint();

  // A hinted game first shows its hint and plays a few of its steps: a random
  // run on an empty board rarely asks for one, and once its moves have made
  // the board wrong the hint only refuses, so most hinted games never showed
  // a hint frame at all.
  if (typeof game.hint === "function") {
    lastEvent = "hint";
    m.hint();
    settle();
    for (let s = 0; s < 3; s++) {
      lastEvent = "next hint step";
      m.executeHint();
      settle();
    }
  }

  const rs = randomNew(`repaint-events-${seed}`);
  const pick = (n: number) => randomUpto(rs, n);
  const point = () => ({ x: pick(size.w), y: pick(size.h) });
  const KEYS = [..."0123456789abcdefghijklmnopqrstuvwxyz ", "\r", "\b", "\x1b"].map(
    (c) => c.charCodeAt(0),
  );
  const CURSORS = [CURSOR_UP, CURSOR_DOWN, CURSOR_LEFT, CURSOR_RIGHT];

  for (let e = 0; e < events && mismatch === null; e++) {
    const kind = pick(12);
    const p = point();
    switch (kind) {
      case 0:
      case 1:
        lastEvent = `left click at ${p.x},${p.y}`;
        m.processInput(p.x, p.y, LEFT_BUTTON);
        m.processInput(p.x, p.y, LEFT_RELEASE);
        break;
      case 2:
        lastEvent = `right click at ${p.x},${p.y}`;
        m.processInput(p.x, p.y, RIGHT_BUTTON);
        m.processInput(p.x, p.y, RIGHT_RELEASE);
        break;
      case 3: {
        const q = point();
        lastEvent = `left drag ${p.x},${p.y} → ${q.x},${q.y}`;
        m.processInput(p.x, p.y, LEFT_BUTTON);
        m.processInput(q.x, q.y, LEFT_DRAG);
        // The drag's own preview is a frame too, and what it leaves behind
        // after the release is repainted by whatever the release changed.
        paint();
        m.processInput(q.x, q.y, LEFT_RELEASE);
        break;
      }
      case 4:
      case 5: {
        const k = CURSORS[pick(4)];
        lastEvent = `cursor ${k.toString(16)}`;
        m.processInput(0, 0, k);
        break;
      }
      case 6: {
        const k = pick(2) ? CURSOR_SELECT : CURSOR_SELECT2;
        lastEvent = `select ${k.toString(16)}`;
        m.processInput(0, 0, k);
        break;
      }
      case 7: {
        const k = KEYS[pick(KEYS.length)];
        lastEvent = `key ${JSON.stringify(String.fromCharCode(k))}`;
        m.processInput(0, 0, k);
        break;
      }
      case 8:
        lastEvent = `hover at ${p.x},${p.y}`;
        m.processHover(p);
        break;
      case 9:
        lastEvent = pick(2) ? "hint" : "next hint step";
        if (lastEvent === "hint") m.hint();
        else m.executeHint();
        break;
      case 10:
        lastEvent = "check for mistakes";
        m.findMistakes();
        break;
      case 11:
        lastEvent = pick(2) ? "undo" : "redo";
        if (lastEvent === "undo") m.undo();
        else m.redo();
        break;
    }
    settle();
  }
  return { frames, mismatch, reached };
}
