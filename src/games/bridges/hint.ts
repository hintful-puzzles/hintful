/**
 * Bridges' explained hint: the narration of the firings the ladder
 * [`bridges.description.yaml`](./bridges.description.yaml) states makes, one at
 * a time, which `engine/described-edge-hint.ts` walks. This file turns each
 * firing into the move and the picture, and its words are
 * [`hint-text.ts`](./hint-text.ts)'s.
 *
 * **An island is named by its clue, and a bridge is named by nothing.** Bridges
 * draws no coordinates, so an island's digit is the only handle a sentence can
 * offer, and the step recolors that island so the words point at something
 * visible (docs/hints.md § "Name a square by its value"). A bridge has no
 * handle at all: the narration calls it "the ringed line" and the hint draws the
 * bridge, or the cross, that the move would make.
 */

import {
  describedEdgeHint,
  type EdgeSpoken,
  type Fired,
} from "../../engine/described-edge-hint.ts";
import type { HintStep } from "../../engine/game.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { SAYS_KINDS } from "./bridges.compiled.ts";
import { SPAN, say } from "./hint-text.ts";
import {
  type BridgesSays,
  type BridgesSpan,
  type BridgesWalkContext,
  bridgesWalk,
  firingOps,
  linesJoined,
  spansOf,
  TIER_COUNT,
  walkTier,
} from "./solver.ts";
import {
  type BridgesMove,
  type BridgesOp,
  type BridgesState,
  G_LINEH,
  G_LINEV,
  G_NOLINEH,
  G_NOLINEV,
} from "./state.ts";

/**
 * A hard cap on how far ahead the plan is computed.
 *
 * A UX bound rather than a correctness one: a 15x15 board runs to some hundreds
 * of forced bridges from empty, and a player rarely follows more than a handful
 * before going their own way, at which point the plan is recomputed anyway
 * (`engine/hint-plan.ts`). It also keeps `hint()` cheap enough to be asked for
 * after every move, which the cross-game resume walk does.
 */
const PLAN_CAP = 12;

// --- highlights -----------------------------------------------------------

/** A span the step decides, and what it decides about it. */
export interface BridgesTarget extends BridgesSpan {
  /** How many bridges the move leaves running here. */
  bridges: number;
  /** The move draws the no-line cross instead. */
  blocked: boolean;
  /** The "at most" limit the move writes here, or `null` when it writes none. */
  limit: number | null;
}

/**
 * What one step is about, in four roles; its words name the ones it marks.
 *
 * The focus island is outlined, as the cited ones are, and the sentence names
 * it on its own ("this 5"), so the app repaints it in a color of its own.
 */
export interface BridgesHighlights {
  /** The spans the step decides; several when one premise forces them all. */
  targets: BridgesTarget[];
  /** The island whose arithmetic forces the step, if the sentence names one. */
  focus: { x: number; y: number } | null;
  /** Islands the argument counts. */
  islands: { x: number; y: number }[];
  /** Bridges the argument counts. */
  spans: BridgesSpan[];
}

// --- narration ------------------------------------------------------------

/** Each technique's sentence, from what the firing says. The words are
 * [`hint-text.ts`](./hint-text.ts)'s. */
export const sentences: {
  [K in keyof BridgesSays]: (
    spoken: EdgeSpoken<BridgesSays[K]>,
    marked: BridgesHighlights,
  ) => Sentence;
} = {
  exactSpace: (s, m) => say.exactSpace(s.terms.clue, s.terms.missing, m),
  everyNeighbor: (s, m) => say.everyNeighbor(s.terms.clue, s.terms.neighbors, m),
  needsThisWay: (s, m) => say.needsThisWay(s.terms.clue, s.terms.elsewhere, m),
  sealing: (s, m) => say.wouldSealGroup(s.outline.length, 0, m),
  loop: (_s, m) => say.wouldCloseLoop(m),
  mustReachOut: (s, m) => say.mustReachOut(s.terms.clue, m),
  tooMany: (s, m) =>
    s.arm === "sealed"
      ? say.wouldSealGroup(s.outline.length, s.terms.limit, m)
      : // "The outlined island" is a lie when the starved island *is* the one
        // the bridge starts from, because nothing else is then left to outline.
        // The sentence and the picture ask `namesFocus` the same question, so
        // they cannot disagree about which arm this is.
        say.wouldStarve(s.terms.clue, s.terms.starved === s.terms.at, s.terms.limit, m),
};

// --- highlights from a firing ---------------------------------------------

/**
 * Does this firing's sentence name the island the move runs from?
 *
 * Four of the seven do ("This 5 still needs…"), and those recolor it so the
 * words point at it. **The other three do not, and they
 * must not recolor it either**: a mark on the board that no sentence mentions
 * is one the player has to account for on their own, and here it would be worse
 * than that. Two of the three count a *group* the source island belongs to, so
 * marking it apart would say two islands play different parts in an argument
 * that treats them the same, and "these 2 islands" would point at one mark of
 * each color (docs/hints-marks.md § "The engine colors the marks").
 */
function namesFocus(id: string, terms: { at: number }): boolean {
  switch (id) {
    case "exactSpace":
    case "everyNeighbor":
    case "needsThisWay":
    case "mustReachOut":
      return true;
    case "tooMany":
      // Only the arm that says "this 5 itself", which is exactly the one where
      // nothing else is left to outline.
      return "starved" in terms && terms.starved === terms.at;
    default:
      return false;
  }
}

/** The move a firing makes and what it marks, read off the marks it found and
 * the ones it left. */
function stepOf(
  fired: Fired<BridgesSays[keyof BridgesSays], BridgesWalkContext>,
  state: BridgesState,
): { move: BridgesMove; highlights: BridgesHighlights; marked: BridgesHighlights } {
  const { taken, says, ctx, before, marks } = fired;
  const { terms } = says;
  const { geo } = ctx;
  const at = (c: number): { x: number; y: number } => ({
    x: c % state.w,
    y: (c / state.w) | 0,
  });
  const ops = firingOps(state, geo, marks, before, taken, terms.at);
  const focused = namesFocus(taken.entry.id, terms);
  const highlights: BridgesHighlights = {
    targets: ops.flatMap((op) =>
      op.op === "L" || op.op === "N" || op.op === "C"
        ? [
            {
              x1: op.x1,
              y1: op.y1,
              x2: op.x2,
              y2: op.y2,
              bridges: op.op === "L" ? op.n : 0,
              blocked: op.op === "N",
              limit: op.op === "C" ? op.n : null,
            },
          ]
        : [],
    ),
    focus: focused ? at(terms.at) : null,
    // Only the island the words are *about* is filtered out of its own
    // evidence: a demotion that removes context makes the remaining mark
    // louder, not quieter (docs/hints.md, the Galaxies partner). Where
    // the sentence does not name it, it stays in the group it belongs to.
    islands: ("outline" in says.marks ? says.marks.outline : [])
      .filter((c) => !focused || c !== terms.at)
      .map(at),
    spans: "links" in terms ? spansOf(geo, terms.links) : [],
  };
  return { move: { ops }, highlights, marked: highlights };
}

// --- the plan -------------------------------------------------------------

/** The hint's rungs: the kinds of the ladder's techniques. */
export const BRIDGES_RUNGS = SAYS_KINDS;
export type BridgesRung = (typeof BRIDGES_RUNGS)[number];

/**
 * The hint: the plan from the player's own bridges.
 *
 * The tier is the board's own difficulty rather than the top rung: that is the
 * tier the generator certified it soluble at, and it is what stops an Easy
 * board being handed a connectivity argument it never needed. The plan stops
 * where the ladder does: a line the player can see is closed may be left
 * unmarked.
 *
 * **Every fact a step leans on is one the player can see**, because the
 * per-direction limit is a mark the player writes too, and a step writes
 * what its firing concluded as bridges, crosses and limits. `firingOps` throws
 * on a firing that leaves a line its marks cannot show, and
 * `bridges-hint.test.ts` holds each step to moving the board.
 */
export const bridgesHint = describedEdgeHint<
  BridgesState,
  BridgesMove,
  BridgesHighlights,
  BridgesHighlights,
  BridgesWalkContext,
  BridgesSays,
  BridgesRung
>({
  name: "bridges hint",
  walk: (state, _cap) => bridgesWalk(state),
  tiers: { lowest: walkTier, count: TIER_COUNT },
  plan: PLAN_CAP,
  // A player follows the islands: a firing reads the island it is about and
  // those it counts, and writes the islands its lines join.
  writes: (taken, ctx) => linesJoined(ctx.geo, taken),
  step: stepOf,
  say: sentences,
});

// --- following the plan ---------------------------------------------------

/**
 * The same two islands, in either order. A recorded op always runs *from* the
 * island whose arithmetic forced it, and the player's drag runs from whichever
 * end they started at, so an oriented compare would call half the right moves
 * off-plan.
 */
const sameSpan = (a: BridgesSpan, b: BridgesSpan): boolean =>
  (a.x1 === b.x1 && a.y1 === b.y1 && a.x2 === b.x2 && a.y2 === b.y2) ||
  (a.x1 === b.x2 && a.y1 === b.y2 && a.x2 === b.x1 && a.y2 === b.y1);

/** How many bridges run along this span right now. */
export function spanBridges(state: BridgesState, span: BridgesSpan): number {
  const dx = Math.sign(span.x2 - span.x1);
  const dy = Math.sign(span.y2 - span.y1);
  return state.gridCount(span.x1 + dx, span.y1 + dy, dx ? G_LINEH : G_LINEV);
}

/**
 * The most bridges this span may carry once `m` is played: none under a cross,
 * otherwise its limit. A limit is lowered one drag at a time and a drag can be
 * two ops (lift the limit, then cross), so a move is judged by the limit it
 * leaves rather than by the ops that leave it.
 */
export function limitAfter(
  state: BridgesState,
  span: BridgesSpan,
  m: BridgesMove,
): number {
  const dx = Math.sign(span.x2 - span.x1);
  const dy = Math.sign(span.y2 - span.y1);
  const x = span.x1 + dx;
  const y = span.y1 + dy;
  let crossed = (state.gridAt(x, y) & (dx ? G_NOLINEH : G_NOLINEV)) !== 0;
  let limit = state.maximum(dx, x, y);
  for (const op of m.ops) {
    if (op.op === "N" && sameSpan(op, span)) crossed = !crossed;
    if (op.op === "C" && sameSpan(op, span)) limit = op.n;
  }
  return crossed ? 0 : limit;
}

/** The limit a step asks for: none for a cross. */
export const wantedLimit = (want: BridgesOp): number => (want.op === "C" ? want.n : 0);

/**
 * Classify a player move against the displayed step.
 *
 * One premise can force bridges in several directions at once, and the player
 * draws them one drag at a time — **and a drag adds one bridge, not the whole
 * count**, so a step asking for two on a span is reached by two drags. So an op
 * is on-plan when it moves the span *toward* what the step asks for, and the
 * step is shrunk in place to the spans still short of it, so a later
 * `executeHint` does not re-apply what is already done.
 */
export function bridgesKeepTrack(
  m: BridgesMove,
  step: HintStep<BridgesMove, BridgesHighlights>,
  state: BridgesState,
): "completed" | "onTrack" | "off" {
  const wanted = step.move.ops;
  if (m.ops.length === 0) return "off";
  // An island's done-mark is the player's own note and changes no span the
  // step decides; taking one off is how a drag from that island starts.
  if (m.ops.every((op) => op.op === "M")) return "onTrack";

  for (const op of m.ops) {
    if (op.op === "L") {
      const want = wanted.find((w) => w.op === "L" && sameSpan(w, op));
      if (!want || want.op !== "L") return "off";
      // A drag that wraps a full span back to zero, or one past what the step
      // asks for, is the player going their own way.
      const now = spanBridges(state, op);
      if (op.n <= now || op.n > want.n) return "off";
    } else if (op.op === "N" || op.op === "C") {
      const want = wanted.find(
        (w) => (w.op === "N" || w.op === "C") && sameSpan(w, op),
      );
      if (!want) return "off";
      // Lowering toward the step's limit is on the way to it; lowering past
      // it, or lifting a limit back up, is not.
      const before = limitAfter(state, op, { ops: [] });
      const after = limitAfter(state, op, m);
      if (after >= before || after < wantedLimit(want)) return "off";
    } else {
      return "off";
    }
  }

  const done = (want: BridgesOp): boolean => {
    if (want.op === "L") {
      return (
        m.ops.some((op) => op.op === "L" && sameSpan(op, want) && op.n === want.n) ||
        spanBridges(state, want) === want.n
      );
    }
    if (want.op === "N" || want.op === "C") {
      return limitAfter(state, want, m) === wantedLimit(want);
    }
    return true;
  };

  const left = wanted.filter((want) => !done(want));
  if (left.length === 0) return "completed";

  step.move = { ops: left };
  if (step.highlights) {
    const targets = step.highlights.targets.filter((t) =>
      left.some((w) => w.op !== "S" && w.op !== "M" && sameSpan(w, t)),
    );
    step.highlights = { ...step.highlights, targets };
    if (step.words) {
      const kept = new Set(targets.map((t) => SPAN.key(t)));
      step.words = step.words.narrow(
        (role, _kind, key) => role !== "ring" || kept.has(key),
      );
      step.explanation = step.words.text;
    }
  }
  return "onTrack";
}
