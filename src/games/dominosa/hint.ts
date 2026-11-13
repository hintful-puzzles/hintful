/**
 * Dominosa's explained hint: the firings of the ladder
 * [`dominosa.description.yaml`](./dominosa.description.yaml) states, one at a
 * time, which `engine/described-edge-hint.ts` walks. This file turns a firing
 * into its steps (a domino placed, or a barrier on each spot it rules out that
 * the player has not already drawn) and says which sentence a step speaks; the
 * words are [`hint-text.ts`](./hint-text.ts)'s.
 */

import {
  describedEdgeHint,
  type EdgeSpoken,
  type Fired,
} from "../../engine/described-edge-hint.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { SAYS_KINDS } from "./dominosa.compiled.ts";
import { say } from "./hint-text.ts";
import {
  answerOf,
  type DominosaSays,
  type DominosaWalkContext,
  dominosaWalk,
  endsOf,
} from "./solver.ts";
import {
  DIFF_EXTREME,
  DIFFCOUNT,
  DOMINO,
  type DominosaMove,
  type DominosaState,
  EDGE_B,
  EDGE_R,
} from "./state.ts";

/** The hint's rungs: the ladder's techniques, in its order. */
export const DOMINOSA_RUNGS = SAYS_KINDS;
export type DominosaRung = (typeof SAYS_KINDS)[number];

/** What a dominosa hint step's ringed spot asks for, which the words do not
 * carry: a domino placed there (its two squares ringed as one shape), or a
 * barrier between its two squares (each ringed, with the wall between them
 * recolored). */
export interface DominosaHint {
  kind: "place" | "barrier";
}

/**
 * The most steps a plan holds: a player rarely follows more than a handful
 * before going their own way, at which point the plan is recomputed.
 */
const PLAN_CAP = 40;

/** What a step's sentence is told besides the firing's own: the spot it
 * decides (its squares, lower first), the numbers they show, and which of the
 * firing's steps it is (a later one does not repeat the reason). */
interface Spot {
  leg: number;
  spot: readonly [number, number];
  numbers: readonly [number, number];
}

type Spoken<K extends keyof DominosaSays> = EdgeSpoken<DominosaSays[K]>;

const pointsOf = (squares: readonly number[], w: number): Point[] =>
  squares.map((i) => ({ x: i % w, y: Math.floor(i / w) }));

/** A placing technique's sentence. */
const placing =
  (kind: "onlySpot" | "squareOnly") =>
  (s: { outline: readonly number[] }, { spot, numbers }: Spot, { w }: DominosaState) =>
    say.place(kind, numbers[0], numbers[1], spot, pointsOf(s.outline, w));

/** A technique that rules spots out: the first spot's sentence gives the
 * reason, and each later one points back at the evidence. */
const ruling =
  (kind: Exclude<DominosaRung, "onlySpot" | "squareOnly">) =>
  (
    s: { outline: readonly number[] },
    { leg, spot, numbers }: Spot,
    { w }: DominosaState,
  ) => {
    const evidence = pointsOf(s.outline, w);
    return leg > 0
      ? say.barrierNext(spot, evidence)
      : say.barrier(kind, numbers[0], numbers[1], spot, evidence);
  };

const sentences: {
  [K in keyof DominosaSays]: (
    spoken: Spoken<K>,
    spot: Spot,
    state: DominosaState,
  ) => Sentence;
} = {
  onlySpot: placing("onlySpot"),
  squareOnly: placing("squareOnly"),
  squareSingleDomino: ruling("squareSingleDomino"),
  mustOverlap: ruling("mustOverlap"),
  localDuplicate: ruling("localDuplicate"),
  localDuplicate2: ruling("localDuplicate2"),
  parity: ruling("parity"),
  set: ruling("set"),
  setDoubles: ruling("setDoubles"),
};

const edgeKey = (a: number, b: number): string => (a < b ? `${a}-${b}` : `${b}-${a}`);

/** A firing's steps: the domino it places, or a barrier for each spot it rules
 * out that the player has not drawn and no earlier step of the plan has. */
function stepOf(
  fired: Fired<DominosaSays[keyof DominosaSays], DominosaWalkContext>,
  state: DominosaState,
): { move: DominosaMove; highlights: DominosaHint; marked: Spot }[] {
  const { sp, seen } = fired.ctx;
  const { facts } = fired.taken;
  const steps: { move: DominosaMove; highlights: DominosaHint; marked: Spot }[] = [];
  for (let i = 0; i < facts.length; i += 3) {
    const [a, b] = endsOf(sp, facts[i + 1]);
    const numbers = [state.numbers[a], state.numbers[b]] as const;
    if (facts[i + 2] === DOMINO) {
      steps.push({
        move: { type: "domino", d1: a, d2: b },
        highlights: { kind: "place" },
        marked: { leg: 0, spot: [a, b], numbers },
      });
      continue;
    }
    const key = edgeKey(a, b);
    if (seen.has(key)) continue;
    seen.add(key);
    steps.push({
      move: { type: "edge", d1: a, d2: b },
      highlights: { kind: "barrier" },
      marked: { leg: steps.length, spot: [a, b], numbers },
    });
  }
  return steps;
}

const dominosaPlan = describedEdgeHint<
  DominosaState,
  DominosaMove,
  DominosaHint,
  Spot,
  DominosaWalkContext,
  DominosaSays,
  DominosaRung
>({
  name: "dominosa hint",
  walk: (state) => {
    const walked = dominosaWalk(state.params, state.numbers, state.grid);
    // Barriers the player already drew are not shown again.
    if (walked !== null)
      for (let i = 0; i < state.numbers.length; i++) {
        if (state.edges[i] & EDGE_R) walked.ctx.seen.add(edgeKey(i, i + 1));
        if (state.edges[i] & EDGE_B) walked.ctx.seen.add(edgeKey(i, i + state.w));
      }
    return walked;
  },
  // No tier is held back: the walk takes whatever the ladder offers.
  tiers: { lowest: () => DIFF_EXTREME, count: DIFFCOUNT },
  plan: PLAN_CAP,
  // A firing continues from the squares its own spots join as well as the
  // ones its reason names.
  reads: ({ facts }, { sp }) => {
    const squares: number[] = [];
    for (let i = 0; i < facts.length; i += 3) squares.push(...endsOf(sp, facts[i + 1]));
    return squares;
  },
  step: stepOf,
  say: sentences,
});

/** The deduction from the player's dominoes to the end. A board with several
 * answers has no forced deduction to teach. */
export function dominosaHint(
  state: DominosaState,
): HintResult<DominosaMove, DominosaHint, DominosaRung> {
  if (answerOf(state).kind !== "one")
    return { ok: false, error: PUZZLE_NOT_REASONABLE };
  return dominosaPlan(state);
}

/** The player's move completes the step iff it is the step's exact
 * domino/edge move; anything else drops the plan to recompute. */
export function dominosaHintKeepTrack(
  m: DominosaMove,
  step: HintStep<DominosaMove, DominosaHint>,
  _state: DominosaState,
): HintTrackVerdict {
  const sm = step.move;
  if (m.type !== sm.type) return "off";
  if (m.type === "domino" && sm.type === "domino")
    return m.d1 === sm.d1 && m.d2 === sm.d2 ? "completed" : "off";
  if (m.type === "edge" && sm.type === "edge")
    return m.d1 === sm.d1 && m.d2 === sm.d2 ? "completed" : "off";
  return "off";
}
