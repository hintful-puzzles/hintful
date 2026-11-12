/**
 * A fingerprint of every step a game's hint walk shows, so a change to how
 * steps are built can be held to "the same words and the same marks".
 *
 * A walk deals a board, then asks for a hint and plays the whole plan, over
 * and over, until the board is solved or the hint refuses. Each step is
 * written as one line: its rung, its words, the marks the words name, its
 * highlights, its move and whether it continues the journey. The lines are
 * hashed a board, so a snapshot is small; `walkLines` gives the full lines, to
 * read a difference by.
 *
 * Dev/test-only; never imported by production code.
 */
import { markKeys } from "../hint-words.ts";
import { dealt } from "./dealt.ts";
import type { AnyGame } from "./hint-games.ts";

/** The rounds a walk takes before it is called wandering. */
const ROUND_CAP = 400;

/** FNV-1a over the text, twice with different multipliers: a label for a
 * walk, not a defense. */
function hashOf(text: string): string {
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    a = Math.imul(a ^ text.charCodeAt(i), 0x01000193);
    b = Math.imul(b ^ text.charCodeAt(i), 0x811c9dc5);
  }
  const hex = (n: number): string => (n >>> 0).toString(16).padStart(8, "0");
  return hex(a) + hex(b);
}

/** One step, as the line a fingerprint holds. */
function stepLine(step: {
  rung: string;
  explanation: string;
  words?: { refs: Parameters<typeof markKeys>[0] };
  highlights?: unknown;
  move: unknown;
  continuesPrevious?: boolean;
}): string {
  const marks = step.words ? [...markKeys(step.words.refs)].sort() : [];
  return [
    step.rung,
    step.continuesPrevious ? "continues" : "",
    step.explanation,
    marks.join(","),
    JSON.stringify(step.highlights ?? null),
    JSON.stringify(step.move),
  ].join(" | ");
}

/** Every step of the walk of one dealt board, in the order a player meets
 * them, and the last thing that happened (`solved`, or the hint's refusal). */
export function walkLines(
  game: AnyGame,
  params: unknown,
  n: number,
): { lines: string[]; end: string } {
  const { desc, aux } = dealt(game, params, n);
  let state = game.newState(params, desc);
  const lines: string[] = [];
  for (let round = 0; round < ROUND_CAP; round++) {
    if (game.status(state) === "solved") return { lines, end: "solved" };
    const res = game.hint?.(state, aux);
    if (!res) throw new Error("the game has no hint()");
    if (!res.ok) return { lines, end: res.error };
    for (const step of res.steps) {
      if (game.status(state) === "solved") break;
      lines.push(stepLine(step));
      state = game.executeMove(state, step.move);
    }
  }
  return { lines, end: "wandering" };
}

/** `title`, its step count, how the walk ended and a hash of its lines: what a
 * snapshot holds a board to. */
export function fingerprint(
  game: AnyGame,
  title: string,
  params: unknown,
  n: number,
): string {
  const { lines, end } = walkLines(game, params, n);
  const text = lines.join("\n");
  // What the walk looked at: a rung no board reaches is not held by the hash.
  const rungs = new Map<string, number>();
  for (const l of lines) {
    const rung = l.slice(0, l.indexOf(" | "));
    rungs.set(rung, (rungs.get(rung) ?? 0) + 1);
  }
  const census = [...rungs]
    .sort()
    .map(([r, n]) => `${r}:${n}`)
    .join(" ");
  return `${title} #${n}: ${lines.length} steps, ${end}, ${hashOf(text)} [${census}]`;
}
