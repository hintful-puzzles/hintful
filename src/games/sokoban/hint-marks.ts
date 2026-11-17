/**
 * What Sokoban's hint marks are drawn on, and what each mark means.
 */

import type { HintMarkLegend } from "../../engine/game.ts";
import type { MarkKind } from "../../engine/hint-words.ts";
import type { Push } from "./solver.ts";

/** A barrel, by its grid index. */
export const BARREL: MarkKind<number> = { name: "barrel", key: String };

/** A push: the barrel and the way it goes, drawn on the barrel's square and
 * the square it is pushed into. Keyed by both, because one barrel can have a
 * push that finishes and another that loses. */
export const PUSH: MarkKind<Push> = {
  name: "push",
  key: (p) => `${p.barrel}>${p.dir}`,
};

/** A target, by its grid index. */
export const GOAL: MarkKind<number> = { name: "target", key: String };

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "the push to make: the barrel, and the square it is pushed into.",
    outline:
      "a barrel that can never reach a target, or one the ringed barrel keeps from reaching a target (*the outlined barrel*); a target to leave empty until the ringed one is filled (*the outlined target*); or, as arrows from the ringed barrel, the ways it can be pushed and still finish (*the arrows*).",
    stripes:
      "another way to push the ringed barrel that would leave a barrel stuck for good (*the striped push*).",
  },
};
