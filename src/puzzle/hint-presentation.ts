import { signal } from "@lit-labs/signals";
import type { Remote } from "comlink";
import { darkValue } from "../engine/color/color-token.ts";
import type { Scheme } from "../engine/color/color-word.ts";
import { HINT_REFERENCE_COLORS } from "../engine/color/colors.ts";
import type { MarkRole } from "../engine/contract/hint-words.ts";
import type {
  Color,
  HintSpan,
  NotifyStatusBarChange,
} from "../engine/contract/types.ts";
import { MARK_EDGE_PX } from "../engine/render/ring.ts";
import { sleep } from "../utils/timing.ts";
import type { BoardSurface, HintReferenceMarks } from "./engine-surface.ts";
import { repainted } from "./mark-flash.ts";

/** How long a pressed reference's marks stay lit, from turning white to
 * fading back (`HintPresentation.flash`). One flash, so nothing strobes. */
export const HINT_FLASH_MS = 1000;

/** A color's value in `scheme`, as the canvas overlay and CSS take it. */
function hexIn(c: Color, scheme: Scheme): string {
  const v = scheme === "dark" ? (darkValue(c) ?? c) : c;
  return `#${v
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Whether two references draw the same marks ("here" … "this"). */
function sameMarks(a: Uint8ClampedArray, b: Uint8ClampedArray): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** A status bar message with no hint's words, as `HintPresentation.said`
 * compares it. */
const NOTHING_SAID = JSON.stringify([null, null]);

/**
 * The displayed hint as the page shows it: its words in each scheme, each
 * reference's marks measured off the canvas and the color they are repainted
 * in, and the flash of one reference's marks.
 */
export class HintPresentation {
  /** `board` waits for there to be a board, as `Puzzle`'s does. */
  constructor(private readonly board: () => Promise<Remote<BoardSurface>>) {}

  private readonly _explanation = signal<string>("");
  private readonly _spans = signal<{ light: HintSpan[]; dark: HintSpan[] } | null>(
    null,
  );
  private readonly _flashing = signal<number | null>(null);
  private flashTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly _marks = signal<HintReferenceMarks | null>(null);
  private marksToken = 0;
  /** The hint's words and marks the status bar last said, as compared. */
  private said = NOTHING_SAID;
  /** The device pixel ratio the canvas is drawn at, which a mark's edge
   * scales with. */
  public dpr = 1;

  /** Take what the status bar now says of the hint. */
  public heard(
    message: Pick<
      NotifyStatusBarChange,
      "activeHintExplanation" | "activeHintSpans" | "activeHintMarks"
    >,
  ): void {
    const explanation = message.activeHintExplanation ?? "";
    if (this._explanation.get() !== explanation) this._explanation.set(explanation);
    // Compared by value: the engine sends fresh runs each time. Other
    // words, or the same words marking other squares (a step a move
    // narrowed), are marks a flash begun on these is not, and that the
    // measure taken of these does not draw.
    const said = JSON.stringify([
      message.activeHintSpans ?? null,
      message.activeHintMarks ?? null,
    ]);
    if (said !== this.said) {
      this.said = said;
      this._spans.set(message.activeHintSpans ?? null);
      this.stopFlash();
      this.remeasure();
    }
  }

  /** The hint's sentence in `scheme`, whose words for a color may differ, as
   * runs that each are one reference to a mark or literal words. Empty when
   * no hint is shown; one literal run for a step with no references. */
  public spansIn(scheme: Scheme): readonly HintSpan[] {
    const spans = this._spans.get();
    if (spans) return spans[scheme];
    const text = this._explanation.get();
    return text ? [{ text, ref: null }] : [];
  }

  /** The displayed hint step's sentence, or "" with none. */
  public get explanation(): string {
    return this._explanation.get();
  }

  /** The reference whose marks are flashing, or `null` between flashes. */
  public get flashing(): number | null {
    return this._flashing.get();
  }

  /** Each reference's marks on the canvas, measured once a step is drawn at
   * rest; `null` with no hint, or until they are. */
  public get marks(): HintReferenceMarks | null {
    return this._marks.get();
  }

  /** The color of each reference of the hint's words in `scheme`, from its
   * role's (`HINT_REFERENCE_COLORS`; the owner, 2026-10-19: "I can't imagine
   * any situation when we'd not want the colors to be distinct"), that its
   * marks are repainted in and its pill is tinted with. `null` for a
   * reference that draws nothing. References that draw the same marks share
   * one. */
  public referenceColorsIn(scheme: Scheme): readonly (string | null)[] {
    const marks = this._marks.get();
    if (!marks) return [];
    const colors: (string | null)[] = [];
    const taken: Partial<Record<MarkRole, number>> = {};
    marks.refs.forEach((r, i) => {
      const same = marks.refs.findIndex((o) => sameMarks(o.alpha, r.alpha));
      const role = marks.roles[i] ?? "outline";
      const pool = HINT_REFERENCE_COLORS[role];
      const next = taken[role] ?? 0;
      if (r.box === null) colors.push(null);
      else if (same < i) colors.push(colors[same]);
      else {
        colors.push(hexIn(pool[next % pool.length], scheme));
        taken[role] = next + 1;
      }
    });
    return colors;
  }

  /** Flash the marks of a reference, the rest of the step's marks staying as
   * they are, for {@link HINT_FLASH_MS}. A flash already running is replaced. */
  public flash(index: number): void {
    this.stopFlash();
    this._flashing.set(index);
    this.flashTimer = setTimeout(() => this.stopFlash(), HINT_FLASH_MS);
    if (!this._marks.get()) this.remeasure();
  }

  private stopFlash(): void {
    if (this.flashTimer !== null) clearTimeout(this.flashTimer);
    this.flashTimer = null;
    this._flashing.set(null);
  }

  /** Measure each reference's marks once the board is at rest: a step's
   * move may still be sliding when its words arrive. A later measure, or other
   * words, supersede one under way. */
  public remeasure(): void {
    const spans = this._spans.get();
    const token = ++this.marksToken;
    this._marks.set(null);
    if (!spans) return;
    const count = Math.max(-1, ...spans.light.map((s) => s.ref ?? -1)) + 1;
    if (count === 0) return;
    void (async () => {
      const board = await this.board();
      const moving = await board.currentAnimationMs();
      if (moving > 0) await sleep(moving + 50);
      if (token !== this.marksToken) return;
      const marks = await board.hintReferenceMarks(count);
      if (token === this.marksToken) this._marks.set(marks);
    })();
  }

  public clear(): void {
    this._explanation.set("");
    this._spans.set(null);
    this.said = NOTHING_SAID;
    this.stopFlash();
    // With the words gone, the engine's wordless message that follows reads as
    // no change, so the marks are dropped here or they outlive the board.
    this.remeasure();
  }

  /** The marks repainted in each reference's color over the canvas
   * (`repainted`), as RGBA at the canvas's size; `null` until they are
   * measured. */
  public repaintIn(scheme: Scheme): Uint8ClampedArray<ArrayBuffer> | null {
    const marks = this._marks.get();
    if (!marks) return null;
    const reach = Math.max(1, Math.round(MARK_EDGE_PX * this.dpr));
    return repainted(marks, this.referenceColorsIn(scheme), reach);
  }
}
