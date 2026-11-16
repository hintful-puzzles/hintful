/**
 * The rules a hint's words are held to, in one copy: the render applies them
 * as it builds a sentence (`hint-words.ts`), the hint tests as they walk one
 * (`testing/hint-reference.ts`, `hint-retired-phrases.test.ts`), and the
 * describe compiler to every wording a description states, when it compiles
 * (`describe/lint.ts`). It imports nothing: the describe script runs it under
 * Node's type stripping.
 */

/**
 * How long a step's sentence may be: short enough to read at a glance (owner,
 * 2026-09-10: *"a character limit as a linter"*), with no exception as the aim
 * (owner, 2026-10-18). `hint-quality.test.ts` holds every step to it, a
 * description's wording is bounded against it when it compiles, and a
 * sentence with an optional clause (an example) drops the clause where it
 * would run over.
 */
export const NARRATION_LIMIT = 120;

/** What a mark means. The engine owns the four, and a game adds one only when
 * none fits, saying why in its change. A ring is round, and only the engine
 * draws one (`GameDrawing.drawRing`); a note a step rules out is struck, not
 * ringed, because a grid of notes leaves no room for a ring round one
 * (`make-rings-round`, D6). */
export type MarkRole = "ring" | "outline" | "stripes" | "strike";

/** Each role's word, as a sentence says it of a marked element: "the ringed
 * square". */
export const ROLE_WORDS: Readonly<Record<MarkRole, string>> = {
  ring: "ringed",
  outline: "outlined",
  stripes: "striped",
  strike: "struck",
};

/** Every role's word, in the engine's order. */
export const ROLE_ADJECTIVES: readonly string[] = Object.values(ROLE_WORDS);

/** Adjectives the collection used for marks before the roles were fixed. A
 * bound sentence never says them: each named a mark that now has a role's word.
 * "Shaded" is not among them although it once named a mark, because in a
 * shading genre it is what the rules call a cell's state (Bricks: "each shaded
 * cell must have one below it"), and a hint speaks the rules' words. */
const RETIRED_ADJECTIVES = ["hatched", "highlighted"] as const;

/** A literal that says what only a reference may. "There" names a place except
 * as the existential ("there is one way left"), which points at nothing; "there
 * would" alone is still a place ("a bulb there would…"). */
const UNBOUND = new RegExp(
  `\\b(?:this|these|here|there(?!\\s+(?:is|are|would\\s+be)\\b|['’]s\\b)|${[...ROLE_ADJECTIVES, ...RETIRED_ADJECTIVES].join("|")})\\b`,
  "i",
);

/** Why literal words `s` may not stand outside a reference, or `null`. */
export function unboundDefect(s: string): string | null {
  const m = UNBOUND.exec(s);
  return m === null
    ? null
    : `"${m[0]}" in "${s}" must be a reference to a mark (hint-words.ts's mark.*)`;
}

/** Why `s`, the words of a reference in `role`, may not name it, or `null`:
 * another role's word, or a retired one. */
export function adjectiveDefect(role: MarkRole, s: string): string | null {
  for (const other of Object.keys(ROLE_WORDS) as MarkRole[]) {
    if (other === role) continue;
    if (new RegExp(`\\b${ROLE_WORDS[other]}\\b`, "i").test(s))
      return `a ${role} reference says "${ROLE_WORDS[other]}" in "${s}"`;
  }
  for (const adj of RETIRED_ADJECTIVES)
    if (new RegExp(`\\b${adj}\\b`, "i").test(s))
      return `"${adj}" is no mark's word, in "${s}"`;
  return null;
}

/**
 * The phrases the hint vocabulary retired (`standardize-hint-vocabulary`, owner
 * 2026-11-13):
 *
 * - "rule out" as a verb for what a move does: a mark ends "must be {the
 *   game's off-mark}" and a struck value or note ends "must go".
 * - ", so there is something to cross out", which said why a populate step
 *   exists and nothing the board does not already show.
 */
export const RETIRED_PHRASE =
  /\brule out\b|phrase`[^`]*\brules out\b|something to cross out/i;

/** "is out" / "are out" as a move's closing, retired with "rule out".
 * Mastermind's framed colors keep it: the color is out of the answer, and no
 * mark of the player's is. */
export const IS_OUT = /\b(?:is|are) out\b/i;
