/**
 * What a searching hint may say about the moves it did not offer.
 *
 * A search hint teaches by setting the move it offers against its rivals, the
 * other moves from the same position (docs/games/hints.md § "Judge the rivals
 * of a searched move"). Each rival is judged by the game: it finishes, it is
 * lost, or the search could not settle it. The judging draws on one allowance
 * counted in positions, never in time, so the same position always gets the
 * same verdicts and the same sentence. What the verdicts allow the step to
 * say is decided here, once, and so is the relation they put between the
 * look and the move: the only way to write "so" over a searched move's rivals
 * is to have judged them all lost (`hint-words.ts`'s `Relation`).
 */

import type { Relation } from "./hint-words.ts";

/** Positions the searches of one hint request may still visit between them.
 * Counted, never timed, so a position's verdicts do not depend on the
 * machine. */
export interface Allowance {
  left: number;
}

/** What judging one rival settled. */
export type Verdict = "finishes" | "lost" | "unknown";

declare const judged: unique symbol;

/** That every rival of a searched move was judged lost: what lets its
 * sentence conclude with "so". Only {@link judgeRivals} makes one. */
export interface RivalsLost {
  readonly [judged]: true;
}

const RIVALS_LOST = Object.freeze({}) as RivalsLost;

/**
 * What the verdicts let a step say about the rivals:
 *
 * - `none`: there were no rivals, so the move is the only one there is. Its
 *   relation says "so", as `only`'s does.
 * - `unsettled`: nothing settled is worth saying, so the game falls back on
 *   something the player can see. Never a claim about the rivals.
 * - `every`: every rival finishes too.
 * - `only`: every rival is lost. Its relation is the one that says "so".
 * - `onlyThese`: every rival was settled; `goods` finish and the rest are lost.
 * - `alsoThese`: `goods` finish, at least one rival is lost, and some were not
 *   settled, so the words claim nothing about those.
 */
export type RivalClaim<R> =
  | { readonly kind: "none"; readonly relation: Relation }
  | { readonly kind: "unsettled" }
  | { readonly kind: "every"; readonly relation: Relation }
  | { readonly kind: "only"; readonly relation: Relation }
  | {
      readonly kind: "onlyThese";
      readonly goods: readonly R[];
      readonly relation: Relation;
    }
  | {
      readonly kind: "alsoThese";
      readonly goods: readonly R[];
      readonly relation: Relation;
    };

/** The relation a claim gives the step's words, or null where it says
 * nothing about the rivals. */
export function claimRelation(claim: RivalClaim<unknown>): Relation | null {
  return claim.kind === "unsettled" ? null : claim.relation;
}

/**
 * Judge every rival of the offered move, in order, sharing `allowance`
 * positions between them, and say what the verdicts allow. `judge` settles one
 * rival within what the allowance still holds and draws down what it used; a
 * rival it cannot settle is `"unknown"`.
 */
export function judgeRivals<R>(
  rivals: readonly R[],
  allowance: number,
  judge: (rival: R, allowance: Allowance) => Verdict,
): { readonly verdicts: readonly Verdict[]; readonly claim: RivalClaim<R> } {
  const left: Allowance = { left: allowance };
  const verdicts = rivals.map((r) => judge(r, left));
  const goods = rivals.filter((_, i) => verdicts[i] === "finishes");
  const lost = verdicts.includes("lost");
  const unsettled = verdicts.includes("unknown");
  const oneOf: Relation = { kind: "oneOf" };
  const forced: Relation = { kind: "forced", rivals: RIVALS_LOST };
  const claim: RivalClaim<R> =
    rivals.length === 0
      ? { kind: "none", relation: forced }
      : !lost
        ? unsettled
          ? { kind: "unsettled" }
          : { kind: "every", relation: oneOf }
        : !unsettled
          ? goods.length > 0
            ? { kind: "onlyThese", goods, relation: oneOf }
            : { kind: "only", relation: forced }
          : goods.length > 0
            ? { kind: "alsoThese", goods, relation: oneOf }
            : { kind: "unsettled" };
  return { verdicts, claim };
}
