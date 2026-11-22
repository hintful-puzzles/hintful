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
import { TIERS } from "../solve/ladder-runtime.ts";
import { asDealt } from "./answer.ts";
import {
  type FillBoard,
  isAnswerOf,
  type LadderedFillModule,
  ladderOf,
  marksOf,
  solveBoard,
} from "./board.ts";
import { applyEdit, type Edit } from "./edit.ts";
import { type FillLink, LINK } from "./marks.ts";
import type { FillPlay } from "./play.ts";

/** A square a step decides, and the value it asks; or, as a `mark`, the
 * element it asks the square's mark to name. */
export interface FillTarget extends Point {
  readonly value: number;
  readonly mark?: true;
}

export type FillHint = FiringHint<FillTarget>;

/** What the hint reads of a fill game's compiled module beside its ladder. */
export interface FillHintModule<C> extends LadderedFillModule<C> {
  /** Every kind of step a firing can be. */
  readonly SAYS_KINDS: readonly string[];
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
}

/** A fill game's `Game.hint`, but for its legend of marks, its gesture, and
 * what a placement rules out where the description says. */
export interface FillHintHooks<C>
  extends FiringHintParts<FillBoard<C>, Edit, FillHint, string> {
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

export function fillHint<C extends object>(
  module: FillHintModule<C>,
): { hint: FillHintHooks<C>; rulesOut?: RulesOut<FillBoard<C>, Edit> } {
  const links = module.play?.links;
  // Where every value is a piece of the pair, a step names it by the pair's
  // word for it ("a block").
  const pairs = Object.entries(module.play?.values ?? {}).map(
    ([v, { paint }]) =>
      [
        Number(v),
        paint in PAINTERS ? PAINTERS[paint as PainterName].pair : undefined,
      ] as const,
  );
  const pieces =
    pairs.length > 0 && pairs.every(([, p]) => p !== undefined)
      ? Object.fromEntries(pairs as (readonly [number, PairIndex])[])
      : null;
  // A board's tier is its deal's, which no move changes: every board of one
  // game shares its `dealt`.
  const lowest = new WeakMap<C, number>();
  const tierOf = (board: FillBoard<C>): number => {
    const known = lowest.get(board.dealt);
    if (known !== undefined) return known;
    const top = module.tiers.length - 1;
    const dealt = asDealt(board);
    let tier = 0;
    while (tier < top && solveBoard(module, dealt, tier).verdict !== "solved") tier++;
    lowest.set(board.dealt, tier);
    return tier;
  };

  const described = describedFiringHint<
    FillBoard<C>,
    Edit,
    FillTarget,
    Record<string, never>,
    string
  >({
    name: "fill hint",
    walk(board, cap) {
      const { marks, ok } = marksOf(module, board);
      if (!ok) return null;
      const { entries } = ladderOf(module, board);
      if (links?.glance === undefined) return { marks, entries };
      const walk = glanceWalk(
        entries,
        { glance: links.glance, askBefore: links.askBefore ?? [] },
        board.mark.slice(),
        { [TIERS]: cap },
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
    ...(module.SAYS_EACH === undefined ? {} : { each: module.SAYS_EACH }),
    ...(module.SAYS_LEGS === undefined ? {} : { legs: module.SAYS_LEGS }),
    ...(module.RULES_OUT === undefined ? {} : { rulesOut: module.RULES_OUT }),
    width: (b) => b.w,
    size: (b) => b.values.length,
    valueAt: (b, c) => b.values[c],
    execute: (b, m) => applyEdit(module, b, m),
    // Every move is an edit, and one the step does not ask for is judged off.
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
      const at = (t: FillTarget) => [t.y * b.w + t.x, t.value];
      const set = targets.filter((t) => t.mark !== true).flatMap(at);
      const mark = targets.filter((t) => t.mark === true).flatMap(at);
      return {
        ...(set.length > 0 ? { set } : {}),
        ...(mark.length > 0 ? { mark } : {}),
      };
    },
    ...(module.STATED === undefined ? {} : { stated: module.STATED }),
    ...(pieces === null ? {} : { piece: (n: number) => pieces[n] }),
    say: {},
  });
  return {
    hint: { ...described.hint, rungs: module.SAYS_KINDS },
    ...(described.rulesOut === undefined ? {} : { rulesOut: described.rulesOut }),
  };
}
