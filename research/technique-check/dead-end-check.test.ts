/**
 * Every dead-end claim the app compiles, checked sound by searching every
 * position of small boards (`dead-end-check.ts`), and a planted defect beside
 * each that must come out unsound. Records each claim found sound, and that
 * fired on some board, in `src/describe/soundness.json`; writes
 * `results-dead-end.txt`. `GAMES="sixteen twiddle"` narrows it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { globSync } from "tinyglobby";
import { expect, it } from "vitest";
import {
  isPlanning,
  type PlanningJson,
  planningWith,
} from "../../src/describe/description.ts";
import { loadDescriptionFile } from "../../src/describe/load.ts";
import { parsePlants, plantsPath } from "../../src/describe/plants.ts";
import {
  deadEndFingerprint,
  deadEndKey,
  isDeadEndKey,
} from "../../src/describe/soundness.ts";
import { checkWorld, compiled, worldName, worlds } from "./dead-end-check.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** The description with claim `id` replaced by `src`, wherever it is stated. */
function planting(d: PlanningJson, id: string, src: string): PlanningJson {
  if (d.deadEnds?.[id] !== undefined)
    return { ...d, deadEnds: { ...d.deadEnds, [id]: src } };
  const variations = Object.fromEntries(
    Object.entries(d.variations ?? {}).map(([name, v]) => [
      name,
      v.add?.deadEnds?.[id] === undefined
        ? v
        : { ...v, add: { ...v.add, deadEnds: { ...v.add.deadEnds, [id]: src } } },
    ]),
  );
  return { ...d, variations };
}

it("checks every dead-end claim sound, and finds every planted one unsound", async () => {
  const only = process.env["GAMES"]?.split(/[ ,]+/).filter(Boolean) ?? null;
  const sources = globSync("src/games/*/*.description.yaml", { cwd: ROOT }).sort();
  const resultsPath = fileURLToPath(new URL("results-dead-end.txt", import.meta.url));
  // A narrowed run keeps the other games' lines, as it keeps their verdicts.
  const blocks = new Map<string, string[]>();
  if (only !== null) {
    let game = "";
    for (const line of readFileSync(resultsPath, "utf8").split("\n")) {
      if (line === "") continue;
      if (!line.startsWith(" ")) game = line.split(/[ :]/)[0];
      if (!only.includes(game)) blocks.set(game, [...(blocks.get(game) ?? []), line]);
    }
  }
  let lines: string[] = [];
  const verdicts: Record<string, string> = {};
  const bad: string[] = [];
  const checked: string[] = [];
  for (const source of sources) {
    const d = loadDescriptionFile(readFileSync(`${ROOT}${source}`, "utf8"), source);
    if (!isPlanning(d) || (only !== null && !only.includes(d.game))) continue;
    checked.push(`${source}#`);
    lines = [];
    blocks.set(d.game, lines);
    const claims = planningWith(d, Object.keys(d.variations ?? {})).deadEnds;
    // Nothing to find sound.
    if (claims.length === 0) {
      lines.push(`${d.game}: states no dead-end claim`);
      continue;
    }
    const plantsAt = plantsPath(source);
    const plants = parsePlants(readFileSync(`${ROOT}${plantsAt}`, "utf8"), plantsAt);
    const ws = await worlds(d);
    const run = async (desc: PlanningJson, label: string) => {
      const mod = await compiled(desc, label);
      return ws.map(({ world, layers }) => checkWorld(desc, mod, world, layers));
    };
    const t0 = performance.now();
    const all = await run(d, "stated");
    const seconds = (performance.now() - t0) / 1000;
    const moveless = all.filter((r) => r.moveless).map((r) => worldName(r.world));
    if (moveless.length > 0)
      lines.push(
        `${d.game}: no move on any position, so not checked: ${moveless.join("; ")}`,
      );
    const results = all.filter((r) => !r.moveless);
    for (const r of results) {
      lines.push(
        `${d.game} ${worldName(r.world)}: ${r.positions} positions, ${r.finishable} can finish, ${r.missed} that cannot are claimed by none` +
          (r.beyond === 0 ? "" : `, ${r.beyond} with a move out of the window`) +
          (r.broken === null ? "" : `; BROKEN: ${r.broken}`),
      );
      if (r.broken !== null) bad.push(`${d.game} ${worldName(r.world)}: ${r.broken}`);
    }
    for (const { id, src } of claims) {
      let fires = 0;
      let unsound: string | null = null;
      for (const r of results) {
        const c = r.claims.get(id);
        if (c === undefined) continue;
        fires += c.fires;
        if (c.unsound > 0) unsound ??= `${worldName(r.world)} at ${c.witness}`;
        lines.push(
          `  ${id} in ${worldName(r.world)}: holds of ${c.fires}, ${c.unsound} of them can finish`,
        );
      }
      const verdict =
        unsound !== null
          ? `UNSOUND in ${unsound}`
          : fires === 0
            ? "never fires"
            : "sound";
      lines.push(`${d.game} ${id}: ${verdict} (${seconds.toFixed(1)}s for the game)`);
      if (verdict === "sound")
        verdicts[deadEndKey(source, id)] = deadEndFingerprint(d, src);
      else bad.push(`${d.game} ${id}: ${verdict}`);
      const plant = plants.deadEnds[id];
      if (plant === undefined) {
        bad.push(`${d.game} ${id}: no planted defect`);
        continue;
      }
      const planted = await run(planting(d, id, plant), `planted-${id}`);
      const caught = planted.some(
        (r) => !r.moveless && (r.claims.get(id)?.unsound ?? 0) > 0,
      );
      lines.push(
        `${d.game} ${id} planted: ${caught ? "unsound, as it must be" : "NOT CAUGHT"}`,
      );
      if (!caught) bad.push(`${d.game} ${id}: the planted defect is not caught`);
    }
  }
  const games = [...blocks.keys()].sort();
  writeFileSync(
    resultsPath,
    `${games.flatMap((g) => blocks.get(g) ?? []).join("\n")}\n`,
  );
  const path = `${ROOT}src/describe/soundness.json`;
  const kept = Object.fromEntries(
    Object.entries(
      JSON.parse(readFileSync(path, "utf8")) as Record<string, string>,
    ).filter(
      ([k]) =>
        !isDeadEndKey(k) || (only !== null && !checked.some((s) => k.startsWith(s))),
    ),
  );
  writeFileSync(
    path,
    `${JSON.stringify(Object.fromEntries(Object.entries({ ...kept, ...verdicts }).sort()), null, 2)}\n`,
  );
  expect(bad).toEqual([]);
});
