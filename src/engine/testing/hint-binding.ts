/**
 * The check a bound game's every hint step owes (`Game.hintMarks`): its words
 * and its marks say the same thing, measured on the frame `redraw` paints.
 * A refusal that marks its cause (`markedDeadEnd`) owes the same, through
 * `redraw`'s `deadEnd`.
 *
 * 1. The explanation is the words' text.
 * 2. Every element the words name is drawn: narrowing it out of the words
 *    changes the frame.
 * 3. Nothing is drawn that the words do not name: with every reference
 *    narrowed out, the frame is the one with no hint shown.
 * 4. Every role the words name is one the game's legend lists, so the help's
 *    list of marks covers it.
 *
 * 2 and 3 hold only for a renderer that paints its hint marks from the words
 * (`hint-words.ts`'s `stepMarks`), which is the point: they need no statement
 * of what a glyph looks like or where an element sits, only whether the paint
 * comes and goes with the reference. Each frame is rendered from a fresh draw
 * state, so no tile cache can hide a difference.
 *
 * Dev/test-only; the hint-quality walk runs it on every step it visits.
 */

import type { HintStep } from "../game.ts";
import type { MarkedDeadEnd } from "../hint-refusal.ts";
import type { Narration } from "../hint-words.ts";
import type { AnyGame } from "./enrollment.ts";
import { RecordingDrawing } from "./recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./render-scenario.ts";

/** What is wrong with `step`, displayed over `state`, one line per defect;
 * empty when it is bound. */
export function bindingDefects(
  game: AnyGame,
  state: unknown,
  ui: unknown,
  step: HintStep<unknown>,
): string[] {
  if (!step.words) return ["the step has no words"];
  return defects(game, state, ui, step.words, step.explanation, (w) => ({
    hint: { ...step, words: w },
  }));
}

/** What is wrong with a marked refusal, displayed over `state`; empty when it
 * is bound. */
export function deadEndBindingDefects(
  game: AnyGame,
  state: unknown,
  ui: unknown,
  deadEnd: MarkedDeadEnd,
): string[] {
  return defects(game, state, ui, deadEnd.words, deadEnd.error, (w) => ({
    deadEnd: { ...deadEnd, words: w },
  }));
}

/** What `redraw` is given to show `words`. */
type Shown = (words: Narration) => {
  hint?: HintStep<unknown>;
  deadEnd?: MarkedDeadEnd;
};

function defects(
  game: AnyGame,
  state: unknown,
  ui: unknown,
  words: Narration,
  explanation: string,
  shown: Shown,
): string[] {
  const legend = game.hintMarks;
  if (!legend) return ["the game declares no hintMarks"];
  const out: string[] = [];
  if (words.text !== explanation)
    out.push(`explanation "${explanation}" is not its words "${words.text}"`);
  for (const r of words.refs)
    if (!(r.role in legend.roles))
      out.push(`names the ${r.role} role, which the legend does not list`);

  const palette = game.colors(DEFAULT_BACKGROUND);
  const tileSize = game.preferredTileSize ?? 32;
  const frame = (w?: Narration): string => {
    const rec = new RecordingDrawing(palette);
    const ds = game.newDrawState(state, tileSize);
    const { hint, deadEnd } = w ? shown(w) : {};
    game.redraw(rec, ds, null, state, 1, ui, 0, 0, hint, undefined, deadEnd);
    return JSON.stringify(rec.ops);
  };

  const full = frame(words);
  if (frame(words.narrow(() => false)) !== frame())
    out.push(
      "draws a mark no word names (the frame without its references is not the unhinted one)",
    );
  const named = new Set<string>();
  for (const r of words.refs)
    for (const e of r.elements) {
      const key = r.kind.key(e);
      const id = `${r.role}|${r.kind.name}|${key}`;
      if (named.has(id)) continue;
      named.add(id);
      // An element drawn inside this one marks it too (`MarkKind.within`), so
      // it goes with it: a ringed note rings its cell.
      const drop = new Set([id]);
      for (const q of words.refs)
        if (q.role === r.role)
          for (const f of q.elements) {
            const w = q.kind.within?.(f);
            if (w && w.kind === r.kind.name && w.key === key)
              drop.add(`${q.role}|${q.kind.name}|${q.kind.key(f)}`);
          }
      const without = words.narrow(
        (role, kind, k) => !drop.has(`${role}|${kind}|${k}`),
      );
      if (frame(without) === full) out.push(`names ${id}, which is not drawn`);
    }
  return out;
}
