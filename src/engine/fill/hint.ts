/**
 * A fill game's hint, built from its board: the compiled ladder walked from
 * the player's own values and marks, a step a firing, each worded by what the
 * description's `says` states (`engine/hint/described-firing-hint.ts`). The
 * walk begins at the lowest tier that finishes the board as dealt, so a hint
 * teaches what the board needs. No game writes a hook
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 5).
 *
 * A step decides values and, where the game's mark is a link, marks: a link
 * the step asks for is ringed as `LINK`, and drawn by the link's drag. Where
 * the description reads some links at a glance (`play.glance`), the walk
 * reads them before each step and asks only for a deeper one that a step
 * rests on (`engine/hint/glance.ts`).
 */

import type { RulesOut } from "../contract/game.ts";
import type { MarkKind } from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import {
  describedFiringHint,
  type FiringHint,
  type FiringHintParts,
} from "../hint/described-firing-hint.ts";
import { premiseOf } from "../hint/described-hint.ts";
import type { DescribedRulesOut } from "../hint/described-rules-out.ts";
import { glanceWalk } from "../hint/glance.ts";
import type { Clauses } from "../hint/stated.ts";
import type { PairIndex } from "../render/piece.ts";
import { PAINTERS, type PainterName } from "../render/pieces/index.ts";
import type { CellMarks } from "../solve/cell-marks.ts";
import { type ClueList, MARK } from "../solve/describe-runtime.ts";
import {
  asDealt,
  capsOf,
  type FillBoard,
  isAnswerOf,
  type LadderedFillModule,
  marksOf,
  solveBoard,
  spaceOf,
} from "./board.ts";
import type { CandidateFillHint } from "./candidates.ts";
import { elementAtPoint, pointOfElement } from "./edge-target.ts";
import { ASKED_EDGE, type FillLink, LINK } from "./marks.ts";
import { applyMove, type FillMove } from "./notes.ts";
import type { FillPlay } from "./play.ts";

/** A square a step decides, and the value it asks; or, as a `mark`, the
 * element it asks the square's mark to name. On an answer on the edges, the
 * point is the edge's half-grid point (`edge-target.ts`). */
export interface FillTarget extends Point {
  readonly value: number;
  readonly mark?: true;
}

/** What a step of the fill walk marks. */
export type FiringFillHint = FiringHint<FillTarget>;

/** A step's marks: the fill walk's, or on a board that keeps notes the
 * candidate walk's (`candidates.ts`). */
export type FillHint = FiringFillHint | CandidateFillHint;

/** What the hint reads of a fill game's compiled module beside its ladder. */
export interface FillHintModule<C> extends LadderedFillModule<C> {
  /** Every kind of step a firing can be: none where the description words
   * no technique of its own. */
  readonly SAYS_KINDS?: readonly string[];
  readonly STATED?: Readonly<
    Record<
      string,
      { readonly step?: readonly Clauses[]; readonly fact?: readonly Clauses[] }
    >
  >;
  readonly SAYS_EACH?: readonly string[];
  readonly SAYS_LEGS?: readonly string[];
  readonly RULES_OUT?: DescribedRulesOut;
  /** How the game is played: where a cell's mark is a link, the kind of clue
   * it names. */
  readonly play?: FillPlay;
  /** The kinds of clue written as a number on their cell, which a step
   * names a square by ("this 2"). */
  readonly numbers?: readonly string[];
}

/** A fill game's `Game.hint`, but for its legend of marks, its gesture, and
 * what a placement rules out where the description says. */
export interface FillHintHooks<C>
  extends FiringHintParts<FillBoard<C>, FillMove, FiringFillHint, string> {
  readonly rungs: readonly string[];
}

/** The cell of clue `q` of the kind `links` names: a link's far end. */
export function linkedCell<C>(
  board: FillBoard<C>,
  links: { readonly clue: string },
  q: number,
): number {
  return (board.dealt[links.clue as keyof C] as ClueList).at[q];
}

/** The member of the pair each value's piece is, where every value's piece
 * is one, so that a step names it by the pair's word for it ("a block");
 * `null` where any is not. */
export function pairPieces(
  play?: Pick<FillPlay, "values">,
): Readonly<Record<number, PairIndex>> | null {
  const pairs = Object.entries(play?.values ?? {}).map(
    ([v, { paint }]) =>
      [
        Number(v),
        paint in PAINTERS ? PAINTERS[paint as PainterName].pair : undefined,
      ] as const,
  );
  return pairs.length > 0 && pairs.every(([, p]) => p !== undefined)
    ? Object.fromEntries(pairs as (readonly [number, PairIndex])[])
    : null;
}

/** A board's tier: the lowest at which the ladder finishes it as dealt,
 * which a hint teaches nothing past. */
export function tierOfBoard<C extends object>(
  module: LadderedFillModule<C>,
): (board: FillBoard<C>) => number {
  // A board's tier is its deal's, which no move changes: every board of one
  // game shares its `dealt`.
  const lowest = new WeakMap<C, number>();
  return (board) => {
    const known = lowest.get(board.dealt);
    if (known !== undefined) return known;
    const top = module.tiers.length - 1;
    const dealt = asDealt(board);
    let tier = 0;
    while (tier < top && solveBoard(module, dealt, tier).verdict !== "solved") tier++;
    lowest.set(board.dealt, tier);
    return tier;
  };
}

export function fillHint<C extends object>(
  module: FillHintModule<C>,
): { hint: FillHintHooks<C>; rulesOut?: RulesOut<FillBoard<C>, FillMove> } {
  const links = module.play?.links;
  const pieces = pairPieces(module.play);
  const tierOf = tierOfBoard(module);

  const described = describedFiringHint<
    FillBoard<C>,
    FillMove,
    FillTarget,
    Record<string, never>,
    string
  >({
    name: "fill hint",
    caps: (cap) => capsOf(module, cap),
    walk(board, cap) {
      const { marks, ok, entries } = marksOf(module, board);
      if (!ok) return null;
      if (links?.glance === undefined) return { marks, entries };
      const walk = glanceWalk(
        entries,
        { glance: links.glance, askBefore: links.askBefore ?? [] },
        board.mark.slice(),
        capsOf(module, cap),
        premiseOf,
      );
      const names = new Map(entries.map((e) => [e.id, e.name]));
      return {
        marks,
        entries: walk.entries,
        settle: walk.settle,
        fallback: walk.fallback,
        // A link is written at both its ends, and an ask where the firing it
        // was offered for reads, which is where the work goes next.
        writes: (taken) => {
          const out: number[] = [];
          for (let i = 0; i < taken.facts.length; i += 3) {
            const at = taken.facts[i + 1];
            out.push(at);
            if (taken.facts[i] === MARK)
              out.push(linkedCell(board, links, taken.facts[i + 2]));
          }
          return [...out, ...walk.serves(taken)];
        },
        name: (technique) => names.get(technique) ?? technique,
      };
    },
    // Where an open cell reads as a value, the values can be the answer
    // before every cell is decided, and a plan ends there.
    ...(module.play?.blank === undefined
      ? {}
      : {
          done: (board: FillBoard<C>, m: CellMarks): boolean =>
            isAnswerOf(
              module,
              board,
              Uint8Array.from(m.grid, (v) => (v === 0 ? (module.play?.blank ?? 0) : v)),
            ),
        }),
    tiers: { lowest: tierOf, count: module.tiers.length },
    // What a placement decides on is washed, which the board already shows:
    // a bulb lights its lines, and a player does not cross each.
    ...(module.washed === undefined ? {} : { consequences: false }),
    ...(module.SAYS_EACH === undefined ? {} : { each: module.SAYS_EACH }),
    ...(module.SAYS_LEGS === undefined ? {} : { legs: module.SAYS_LEGS }),
    ...(module.RULES_OUT === undefined ? {} : { rulesOut: module.RULES_OUT }),
    width: (b) => b.w,
    // On the edges a step names an edge by its half-grid point, where the
    // gesture clicks, and rings it there.
    ...(module.answerSort !== "edge"
      ? {}
      : {
          elements: {
            point: (b: FillBoard<C>, e: number) =>
              pointOfElement(spaceOf(module, b), e),
            index: (b: FillBoard<C>, p: Point) => elementAtPoint(spaceOf(module, b), p),
            ringKind: ASKED_EDGE,
            ringNoun: "edge",
          },
        }),
    size: (b) => b.values.length,
    valueAt: (b, c) => b.values[c],
    execute: (b, m) => applyMove(module, b, m),
    // Every move may be part of a step: one that sets no value the step asks
    // for, a note's, is judged off by what it changed.
    foreign: () => false,
    target: (at, n) => ({ ...at, value: n }),
    want: (t) => t.value,
    ...(links === undefined
      ? {}
      : {
          marks: {
            target: (at: Point, q: number): FillTarget => ({
              ...at,
              value: q,
              mark: true,
            }),
            isMark: (t: FillTarget) => t.mark === true,
            markAt: (b: FillBoard<C>, c: number) => b.mark[c],
            ring: {
              kind: LINK as MarkKind<unknown>,
              of: (t: FillTarget, b: FillBoard<C>): FillLink => {
                const cell = t.y * b.w + t.x;
                return { cell, to: linkedCell(b, links, t.value) };
              },
            },
          },
        }),
    move: (targets, b) => {
      const cell = (t: FillTarget) => [t.y * b.w + t.x, t.value];
      const element = (t: FillTarget) =>
        module.answerSort === "edge"
          ? [elementAtPoint(spaceOf(module, b), t), t.value]
          : cell(t);
      const set = targets.filter((t) => t.mark !== true).flatMap(element);
      const mark = targets.filter((t) => t.mark === true).flatMap(cell);
      return {
        ...(set.length > 0 ? { set } : {}),
        ...(mark.length > 0 ? { mark } : {}),
      };
    },
    ...(module.STATED === undefined ? {} : { stated: module.STATED }),
    ...(pieces === null ? {} : { piece: (n: number) => pieces[n] }),
    // The number written on a square, the first of the kinds that has one.
    shows: (b, { x, y }) => {
      for (const kind of module.numbers ?? []) {
        const list = b.dealt[kind as keyof C] as ClueList;
        const k = list.byAt[y * b.w + x];
        if (k >= 0) return list.v[k];
      }
      return -1;
    },
    say: {},
  });
  return {
    hint: { ...described.hint, rungs: module.SAYS_KINDS ?? [] },
    ...(described.rulesOut === undefined ? {} : { rulesOut: described.rulesOut }),
  };
}
