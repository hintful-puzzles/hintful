/**
 * Every plan of every hint walk of one game, written one step a line, so a
 * change meant to keep a hint's steps can be compared with `cmp` against the
 * same dump run in a worktree of `HEAD`. Wider than the hint-walk fingerprint
 * (`src/engine/hint-walk-fingerprint.test.ts`): it starts each board from a
 * share of the solve move's ops already played, and lists every recomputed
 * plan whole, so a rung the fingerprint's boards never reach, or a change in
 * which firing a plan continues with, shows. `DUMP_OUT.rungs` counts the
 * rungs met, which is what the comparison looked at. A step's line holds the
 * marks its words draw, as the set of their keys, so a change to a step's
 * evidence shows where its sentence reads the same.
 *
 * `DUMP_GAME` the game's id, `DUMP_OUT` the file, `DUMP_DEALS` the boards a
 * preset (8).
 */
import { writeFileSync } from "node:fs";
import { it } from "vitest";
import { markKeys } from "../../src/engine/hint-words.ts";
import { dealt } from "../../src/engine/testing/dealt.ts";
import { gatePresets, HINT_GAMES } from "../../src/engine/testing/hint-games.ts";

const id = process.env["DUMP_GAME"] ?? "";
const out = process.env["DUMP_OUT"] ?? "";
const deals = Number(process.env["DUMP_DEALS"] ?? 8);
/** The shares of the solve move's ops played before a walk starts. */
const SHARES = [0, 0.15, 0.35, 0.6];
/** The plans a walk asks for before it is called wandering. */
const ROUND_CAP = 400;

it(`dumps every hint plan of ${id}`, () => {
  const game = HINT_GAMES.find(([g]) => g === id)?.[1];
  if (!game || out === "")
    throw new Error("set DUMP_GAME to a game with a hint, and DUMP_OUT");
  const lines: string[] = [];
  const rungs = new Map<string, number>();
  for (const { title, params } of gatePresets(game))
    for (let n = 0; n < deals; n++) {
      const { desc, aux } = dealt(game, params, n);
      const start = game.newState(params, desc);
      const solved = game.solve?.(start, start, aux);
      const move = solved?.ok ? (solved.move as { ops?: unknown }) : null;
      const all = Array.isArray(move?.ops) ? (move.ops as unknown[]) : [];
      for (const share of SHARES) {
        // A spread of ops, the same on every run.
        const ops = all.filter(
          (_, k) => (((k + 1) * 2654435761) >>> 0) % 1000 < share * 1000,
        );
        let state = start;
        if (ops.length > 0) {
          try {
            state = game.executeMove(start, { ...move, ops, solve: false });
          } catch (e) {
            lines.push(`== ${title} ${n} ${share} unplayable ${String(e)}`);
            continue;
          }
        }
        lines.push(`== ${title} ${n} ${share}`);
        let end = "wandering";
        for (let round = 0; round < ROUND_CAP; round++) {
          if (game.status(state) === "solved") {
            end = "solved";
            break;
          }
          const res = game.hint?.(state, aux);
          if (!res?.ok) {
            end = `refused ${res?.error}`;
            break;
          }
          for (const s of res.steps) {
            rungs.set(s.rung, (rungs.get(s.rung) ?? 0) + 1);
            lines.push(
              [
                s.rung,
                s.continuesPrevious ? "+" : "",
                s.explanation,
                s.words ? [...markKeys(s.words.refs)].sort().join(" ") : "",
                JSON.stringify(s.highlights),
                JSON.stringify(s.move),
              ].join(" | "),
            );
          }
          state = game.executeMove(state, res.steps[0].move);
        }
        lines.push(end);
      }
    }
  writeFileSync(out, `${lines.join("\n")}\n`);
  writeFileSync(
    `${out}.rungs`,
    `${[...rungs].map(([r, c]) => `${r} ${c}`).join("\n")}\n`,
  );
});
