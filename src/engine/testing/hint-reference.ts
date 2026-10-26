/**
 * Whether each reference in a step's words names a thing on the board and says
 * which mark it is (docs/hints.md § "Keep the narration terse"), so the
 * sentence reads against the board without a press. A reference is the words
 * a player presses, so the check reads each one's own words, by its index in
 * `Narration.refs`, and never the sentence around it.
 *
 * A reference passes when, read in this order, its words are:
 *
 * 1. the step's move ({@link MOVE}), which the board draws as a move;
 * 2. not a clause: no modal, no form of "be" or "have", none of the verbs
 *    that have stood in a reference's words;
 * 3. built on a role's word ("the outlined 6", "the ringed one");
 * 4. not a bare pro-form ("here", "it", "these", "the rest");
 * 5. or carrying a value: a number, a letter, an operator;
 * 6. or a phrase the game's legend teaches for the role ("the dotted
 *    squares"), where the game's mark is not drawn as its role's word says;
 * 7. or a noun phrase, opening on a determiner, that is "this" or "these"
 *    with a noun no other reference of its kind says in another role, or
 *    that names its thing by a relation to another ("its partner", "the same
 *    row", "the edge between them").
 *
 * What this cannot see: a clause whose verb is not in {@link VERB} reads as a
 * noun phrase, and a value or a relation is taken on its word, not checked to
 * single the thing out. The verb list is the census's (2026-10-19,
 * `name-every-reference-by-its-mark`), so a new verb in a reference is seen
 * only once it is added.
 *
 * Dev/test-only; the hint-quality walk runs it on every step it visits.
 */

import type { HintMarkLegend } from "../game.ts";
import { type MarkRef, type Narration, ROLE_ADJECTIVES } from "../hint-words.ts";

/** The roles' words, read from the engine's roles, and "numbered", which every
 * game's chain is drawn as (`hint-chain-pins.ts`). */
const ROLE_WORD = new RegExp(
  `\\b(?:${[...ROLE_ADJECTIVES, "numbered"].join("|")})\\b`,
  "i",
);

/** Modals, "be" and "have", and the verbs the census found in a reference. */
const VERB = new RegExp(
  `\\b(?:${[
    "must",
    "can",
    "can't",
    "cannot",
    "could",
    "would",
    "will",
    "should",
    "may",
    "might",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "has",
    "have",
    "had",
    "does",
    "do",
    "means?",
    "needs?",
    "leaves?",
    "go",
    "goes",
    "shows?",
    "touch(?:es)?",
    "shares?",
    "sits?",
    "rules?",
    "gives?",
    "pencil in",
    "join",
    "check",
    "slide",
  ].join("|")})\\b`,
  "i",
);

/** Words that stand for a thing without naming it. */
const PRO_FORM =
  /^(?:here|there|it|they|them|this|these|those|that|each|both|either|neither|one|this one|that one|these two|both these \w+|the other|the others|the rest|every one|at least one|this way|elsewhere)$/i;

/** A number, a letter or a letter's plural, "the b" (Group's elements), or an
 * operator. */
const VALUE =
  /\d|(?<![\w'])[A-Z]s?(?![\w'])|\b[Tt]he [a-z]\b|^[a-z](?:(?:, | and | or )[a-z])+$|[+−×÷·={}]/;

const DETERMINER =
  /^(?:the|this|these|those|that|its|their|a|an|every|each|both|either|neither|all|any|no|one|two|three|four|another|other|some|only)\b/i;

const DEICTIC = /^(?:this|these|those|that)\s+(.+)$/i;

const RELATION =
  /\b(?:its|their|other|between them|beside it|to its (?:left|right)|above|below|across|in it|there)\b|^the same\b/i;

/** The noun a deictic reference says, singular, so "this cell" and "these
 * cells" are one. */
function deicticNoun(words: string): string | null {
  const m = DEICTIC.exec(words);
  return m ? m[1].toLowerCase().replace(/s$/, "") : null;
}

/** Why one reference's words fail, or `null` when they name their mark. */
function judge(
  ref: MarkRef,
  words: string,
  taught: string,
  rivals: (noun: string) => boolean,
): string | null {
  if (ref.kind.name === "move") return null;
  if (VERB.test(words))
    return "is a clause: a reference is the thing pressed, so the verb goes outside it";
  if (ROLE_WORD.test(words)) return null;
  if (PRO_FORM.test(words))
    return `is a bare "${words}": name the thing, by its role's word or its value`;
  if (VALUE.test(words)) return null;
  if (taught.includes(words.toLowerCase())) return null;
  if (!DETERMINER.test(words))
    return "is not a noun phrase: a reference names a thing on the board";
  const noun = deicticNoun(words);
  if (noun !== null)
    return rivals(noun)
      ? `says "${words}" beside another reference of its kind in another role that says it too`
      : null;
  if (RELATION.test(words)) return null;
  return "names a thing but not which mark it is: say its role's word or its value";
}

/** What is wrong with the references in `words`, one line per defect; empty
 * when every reference names a thing and its mark. */
export function referenceDefects(words: Narration, legend: HintMarkLegend): string[] {
  const refs = words.refs;
  const said = new Map<number, string>();
  for (const span of words.spansIn("light"))
    if (span.ref !== null) said.set(span.ref, span.text.trim());
  // A deictic noun said in two roles of one kind does not say which is which.
  const deictic = new Map<string, Set<string>>();
  for (const [i, ref] of refs.entries()) {
    const noun = deicticNoun(said.get(i) ?? "");
    if (noun === null) continue;
    const key = `${ref.kind.name}|${noun}`;
    const roles = deictic.get(key) ?? new Set<string>();
    roles.add(ref.role);
    deictic.set(key, roles);
  }
  const out: string[] = [];
  for (const [i, ref] of refs.entries()) {
    const text = said.get(i) ?? "";
    const taught = (legend.roles[ref.role] ?? "").toLowerCase();
    const why = judge(
      ref,
      text,
      taught,
      (noun) => (deictic.get(`${ref.kind.name}|${noun}`)?.size ?? 0) > 1,
    );
    if (why) out.push(`its ${ref.role} reference "${text}" ${why}`);
  }
  return out;
}
