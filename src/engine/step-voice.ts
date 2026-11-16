/**
 * A step a description declares (`steps`), spoken: the one call a game makes
 * for a sentence its planner chooses. The compiled module binds it to its own
 * `STEPS` and `WORDS` as `voice`, so a game declares once what its marks are
 * drawn on and how its values print, and then names a step and supplies what
 * `StepsById` says it is told by.
 */
import type { MarkKind, Narration, Noun, Sentence } from "./hint-words.ts";
import {
  type Clauses,
  type StatedContext,
  statedParts,
  statedSentence,
} from "./stated.ts";

/** A unit a step's `unit` term names, said as this word. */
export type Unit = "row" | "column" | "block" | "diagonal";

/** The unit a line is, as a Latin reason names it. */
export const lineUnit = (line: "row" | "col"): Unit =>
  line === "row" ? "row" : "column";

/** A step as `StepsById` types it. */
interface StepType {
  readonly ring: string;
  readonly terms: object;
  readonly marks: object;
}

/** The module's `STEPS`, over the steps `S`: each kind's clauses by wording,
 * and the condition each wording is said under. */
export type StepTable<S extends { readonly [K in keyof S]: StepType }> = {
  readonly [K in keyof S]: {
    readonly ring: S[K]["ring"];
    readonly clauses: readonly Clauses[];
    readonly when: readonly (
      | null
      | ((t: S[K]["terms"], m: S[K]["marks"]) => boolean)
    )[];
  };
};

/** How a game's steps are spoken, declared once a game. */
export interface Voice<E> {
  /** What a reference is drawn on where `kinds` names no kind for its sort. */
  readonly kind: MarkKind<E>;
  /** The sorts drawn on another kind than `kind`, ring sorts included. */
  readonly kinds?: Readonly<Record<string, MarkKind<E>>>;
  /** The noun for a step's ring sort where it is not the game's cell (an edge,
   * a corner). */
  readonly nouns?: Readonly<Record<string, Noun>>;
  /** A value as the board draws it. */
  value(n: number): string;
  readonly noun?: Noun;
  readonly alongside?: string;
  readonly valueNoun?: string;
  readonly regions?: string;
  unit?(els: readonly E[]): string;
}

/** `K: T`, optional where `T` holds nothing. */
type Given<K extends string, T> =
  Record<never, never> extends T ? { readonly [k in K]?: T } : { readonly [k in K]: T };

/** What a step is told by: its terms and marks as the description declares
 * them, what it decides (`ring`), whether it is a later leg of its firing,
 * the values its strike removes, and the move's words where its clauses
 * state none. */
export type Said<S extends StepType, E> = Given<"terms", S["terms"]> &
  Given<"marks", S["marks"]> & {
    readonly ring?: readonly E[];
    readonly later?: boolean;
    readonly struck?: readonly number[];
    readonly closing?: Narration;
  };

export interface StepVoice<S extends { readonly [K in keyof S]: StepType }, E> {
  /** The step's sentence: the first wording whose condition holds. */
  sentence<K extends keyof S & string>(id: K, said: Said<S[K], E>): Sentence;
  /** What the step reads off the board, which a strike's conclusion joins:
   * the `look` of the wording that holds. */
  premise<K extends keyof S & string>(id: K, said: Said<S[K], E>): Narration;
  /** One part of the wording that holds, as a fragment another sentence
   * joins to its own words. */
  part<K extends keyof S & string>(
    id: K,
    part: keyof Clauses,
    said: Said<S[K], E>,
  ): Narration;
}

export function stepVoice<S extends { readonly [K in keyof S]: StepType }, E>(
  steps: StepTable<S>,
  voice: Voice<E>,
): StepVoice<S, E> {
  const { kinds, nouns, ...words } = voice;
  const spoken = (
    id: keyof S & string,
    said: Said<StepType, E>,
  ): { clauses: Clauses; cx: StatedContext<E> } => {
    const step = steps[id];
    const terms = (said.terms ?? {}) as S[typeof id]["terms"];
    const marks = (said.marks ?? {}) as S[typeof id]["marks"];
    const i = step.when.findIndex((w) => w === null || w(terms, marks));
    if (i < 0) throw new Error(`step ${id}: no wording holds`);
    return {
      clauses: step.clauses[i],
      cx: {
        ...words,
        ...(kinds === undefined ? {} : { kinds }),
        ringKind: kinds?.[step.ring] ?? voice.kind,
        noun: nouns?.[step.ring] ?? voice.noun,
        ring: said.ring ?? [],
        ...(said.later === undefined ? {} : { later: said.later }),
        ...(said.struck === undefined ? {} : { struck: said.struck }),
        terms: terms as Readonly<Record<string, unknown>>,
        marks: marks as StatedContext<E>["marks"],
        at: () => {
          throw new Error(`step ${id}: a step has no element terms`);
        },
      },
    };
  };
  const part = (
    id: keyof S & string,
    which: keyof Clauses,
    said: Said<StepType, E>,
  ): Narration => {
    const { clauses, cx } = spoken(id, said);
    const words = statedParts(clauses, cx)[which];
    if (words === undefined) throw new Error(`step ${id} states no ${which}`);
    return words;
  };
  return {
    sentence: (id, said) => {
      const { clauses, cx } = spoken(id, said as Said<StepType, E>);
      return statedSentence(clauses, cx, said.closing ?? null);
    },
    premise: (id, said) => part(id, "look", said as Said<StepType, E>),
    part: (id, which, said) => part(id, which, said as Said<StepType, E>),
  };
}
