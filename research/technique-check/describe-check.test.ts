/**
 * Every technique the app compiles, checked sound against its description's
 * rules (`describe-check.ts`), and a planted defect in each that must come
 * out unsound. Writes `results-describe.txt`.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { globSync } from "tinyglobby";
import { expect, it } from "vitest";
import {
  isFormal,
  isLibrary,
  type Technique,
  withEveryVariation,
} from "../../src/describe/description.ts";
import { loadDescriptionFile } from "../../src/describe/load.ts";
import {
  type Plants,
  parsePlants,
  plantsPath,
  type TechniquePlant,
} from "../../src/describe/plants.ts";
import {
  CHECK_BUDGET_MS,
  CHECKED_ORDERS,
  checkedAs,
  gameFingerprint,
  heldVerdict,
  isDeadEndKey,
  libraryFingerprint,
  soundnessKey,
} from "../../src/describe/soundness.ts";
import {
  checkTechnique,
  hasAnswer,
  impossibleKinds,
  libraryDescription,
  planted,
  regionCells,
  SampledBoards,
  sizeLabel,
  sizings,
  type Verdict,
  type World,
  worldsOf,
} from "./describe-check.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** The orders each is checked at: 4 is the least a set or fish of two fits. */
const ORDERS = CHECKED_ORDERS;

/** How many of a technique's first binders each query fixes, one query a
 * value of them: `CHECK_SPLIT`, 1 by default. A deeper split makes more,
 * smaller queries, for a technique whose one query a value of its first
 * binder outgrows z3's heap (Mines' `region` on a 4×4 board). */
const SPLIT = Number(process.env["CHECK_SPLIT"] ?? 1);

/** `CHECK_SHARD=i/n`: only every nth of a technique's split queries, from the
 * ith, so that a check too long for one z3 heap, which only grows, runs as n
 * processes, each recorded as it passes and the n folded into the verdict. */
const SHARD = ((s) => {
  if (s === undefined) return null;
  const [index, of] = s.split("/").map(Number);
  if (!(Number.isInteger(index) && Number.isInteger(of) && 0 <= index && index < of))
    throw new Error(`CHECK_SHARD wants i/n with 0 <= i < n, not ${s}`);
  return { index, of };
})(process.env["CHECK_SHARD"]);

const lines: string[] = [];
/** A result line, and to `CHECK_LOG` as it comes, for a long run's watching. */
const say = (s: string): void => {
  console.log(s);
  lines.push(s);
  const log = process.env["CHECK_LOG"];
  if (log) appendFileSync(log, `${s}\n`);
};
/** A progress line, to `CHECK_LOG` only: no part of the results. */
const trace = (s: string): void => {
  const log = process.env["CHECK_LOG"];
  if (log) appendFileSync(log, `${s}\n`);
};
/** A verdict's line. One found on sampled boards alone (`onSamples`) says
 * `held`, as its record does, not `sound`. */
const line = (where: string, v: Verdict, want: string, onSamples = false): void => {
  const ok = v.verdict === want || want === "either";
  const said = onSamples && v.verdict === "sound" ? "held" : v.verdict;
  say(
    `${ok ? "ok " : "BAD"} ${where.padEnd(10)} ${v.technique.padEnd(30)} ${String(v.order).padEnd(2)} ${said.padEnd(8)} (want ${want.padEnd(8)}) ${String(v.queries).padStart(5)} queries ${v.seconds.toFixed(1).padStart(6)}s${v.at ? `   at ${v.at}` : ""}`,
  );
};

/**
 * Each technique sound in every world where the world has an answer, from the
 * least order up to the first where each of its planted defects comes out
 * unsound: the least board on which the check is shown to catch a defect. A
 * larger one costs many times more and, on every game checked to 2026-11-07,
 * caught nothing the least such board did not. A defect still uncaught at the
 * last order fails. The plants are the description's (`describe/plants.ts`),
 * and a library's `once` plants are planted as well.
 *
 * The whole is held to {@link CHECK_BUDGET_MS}. Where a technique is not
 * proved whole by {@link WHOLE} of it, it is asked on sampled boards, their
 * answers and clues fixed and every position of the marks on each, until
 * {@link SAMPLED} of it; with no defect found it is taken as holding
 * (`held`). A planted defect is caught the same way in the rest, or the check
 * fails: a check that cannot catch a defect in the time says nothing.
 */
async function checkAll(
  worlds: readonly World[],
  id: string,
  stated: Plants,
): Promise<{ failed: string[]; held: boolean; whole: number; boards: number }> {
  const bad: string[] = [];
  let held = false;
  // The boards the technique was asked on, and those it was proved on whole.
  let boardsAsked = 0;
  let whole = 0;
  const start = performance.now();
  const deadline = start + CHECK_BUDGET_MS;
  const own = stated.techniques[id];
  // `plants.test.ts` holds every technique to a plant, so none is missing.
  if (own === undefined) throw new Error(`${id} has no planted defect`);
  const plants = [
    { label: "planted", plant: own },
    { label: "planted once", plant: stated.once[id] },
  ].filter((p): p is { label: string; plant: TechniquePlant } => p.plant !== undefined);
  for (const order of ORDERS) {
    const caught = plants.map(() => false);
    let tried = false;
    // Each world at each assignment of the sizes the order leaves free.
    const boards = worlds.flatMap(({ where, d }) =>
      sizings(d, order).map((sizes) => ({
        where: [where, ...[...sizes].map(([n, v]) => sizeLabel(order, n, v))].join(" "),
        d,
        sizes,
      })),
    );
    for (const { where, d, sizes } of boards) {
      // A technique a modifier adds is checked where the modifier is on.
      const t = d.techniques.find((x) => x.id === id);
      const cells = await regionCells(d, order, sizes);
      if (t === undefined || !(await hasAnswer(d, order, sizes, cells))) continue;
      // The boards sampled so far, shared by the technique and its plants.
      const sampled = new SampledBoards(d, order, sizes, cells);
      const pinned = async (
        tp: Technique,
        split: number,
        by: number,
      ): Promise<Verdict> => {
        const { v, asked, every } = await sampled.ask(tp, split, by, {
          shard: SHARD ?? undefined,
        });
        say(
          `..  ${where.padEnd(10)} ${tp.id}: not proved whole in time, asked on ${asked} boards${every ? ", one an answer, every answer" : ""}: ${v.verdict === "sound" ? "no defect" : v.verdict}`,
        );
        return v;
      };
      let v = await checkTechnique(d, t, order, sizes, SPLIT, cells, {
        shard: SHARD ?? undefined,
        progress: (done, of, at) =>
          trace(`..  ${where} ${id} ${order}: ${done} of ${of}, at ${at}`),
        deadline: Math.min(deadline, start + CHECK_BUDGET_MS * WHOLE),
      });
      boardsAsked++;
      const onSamples = v.outOfTime === true;
      if (onSamples) {
        held = true;
        v = await pinned(
          t,
          SPLIT,
          Math.min(deadline, start + CHECK_BUDGET_MS * SAMPLED),
        );
      } else whole++;
      line(where, v, "sound", onSamples);
      // Out of time with no defect found holds; a defect, or a verdict z3
      // could not reach for another reason, does not.
      if (v.verdict === "unsound" || (v.verdict === "unknown" && !v.outOfTime))
        bad.push(`${id} ${order}`);
      for (const [i, { label, plant }] of plants.entries()) {
        tried = true;
        // A plant one board of the order has caught is not asked again: the
        // check is shown to catch it, and a later board's whole query may
        // outgrow the heap (Bridges' `tooMany` at three bridges a line).
        if (caught[i]) continue;
        const tp = { ...planted(t, plant), id: `${t.id} (${label})` };
        let p = await checkTechnique(d, tp, order, sizes, 1, cells, {
          deadline: Math.min(deadline, performance.now() + CHECK_BUDGET_MS / 10),
        });
        const plantSampled = p.outOfTime === true;
        if (plantSampled) p = await pinned(tp, 1, deadline);
        line(
          where,
          p,
          p.verdict === "unsound" || boards.length === 1 ? "unsound" : "either",
          plantSampled,
        );
        if (p.verdict === "unsound") caught[i] = true;
      }
    }
    if (tried && caught.every((c) => c)) break;
    if (order === ORDERS[ORDERS.length - 1] || performance.now() > deadline)
      for (const [i, c] of caught.entries())
        if (tried && !c) bad.push(`${id} ${plants[i].label} ${order}`);
    if (performance.now() > deadline) break;
  }
  return { failed: bad, held, whole, boards: boardsAsked };
}

/** The shares of {@link CHECK_BUDGET_MS} by which a technique's whole proof,
 * and then its asking on sampled boards, stop: the rest is its plants'. */
const WHOLE = 0.4;
const SAMPLED = 0.6;

it("the techniques the app compiles are sound, and each planted defect is not", async () => {
  const bad: string[] = [];
  const verdicts: Record<string, string> = {};
  const sources = globSync("src/**/*.description.yaml", { cwd: ROOT }).sort();
  const files = new Map(
    sources.map((s) => [
      s,
      loadDescriptionFile(readFileSync(`${ROOT}${s}`, "utf8"), s),
    ]),
  );
  const libraries = [...files.values()].filter(isLibrary);
  // CHECK_GAMES narrows the run to some descriptions, by game or library
  // name, comma-separated; their verdicts then join the others recorded.
  const only = process.env["CHECK_GAMES"]?.split(",") ?? null;
  // CHECK_TECHNIQUES narrows a game's run further, by technique id.
  const techniques = process.env["CHECK_TECHNIQUES"]?.split(",") ?? null;
  // A technique whose recorded verdict is current is not checked again, unless
  // CHECK_AGAIN=1 or CHECK_TECHNIQUES names it; each verdict is recorded as
  // it is proved, so a run cut short keeps what it finished.
  const path = `${ROOT}src/describe/soundness.json`;
  const readVerdicts = (): Record<string, string> =>
    JSON.parse(readFileSync(path, "utf8")) as Record<string, string>;
  const recorded = readVerdicts();
  const again = process.env["CHECK_AGAIN"] === "1";
  // A shard records under its own key, and a shard run checks only the
  // shards not yet recorded, CHECK_TECHNIQUES or not, so it resumes.
  const at = (key: string): string =>
    SHARD === null ? key : `${key}@${SHARD.index}/${SHARD.of}`;
  const due = (key: string, fp: string, id: string): boolean =>
    again ||
    (SHARD === null && (techniques?.includes(id) ?? false)) ||
    (!checkedAs(fp, recorded[key]) && !checkedAs(fp, recorded[at(key)]));
  /** Record a technique found sound, or found holding on sampled answers
   * alone where `held` says so, and say which, with how many of the boards it
   * was asked on it was proved on whole. */
  const record = (
    key: string,
    fp: string,
    { held, whole, boards }: { held: boolean; whole: number; boards: number },
  ): void => {
    const v = held ? heldVerdict(fp) : fp;
    say(
      held
        ? `ok  ${key}: recorded held, proved whole on ${whole} of ${boards} boards and asked on sampled answers on the rest`
        : `ok  ${key}: recorded sound, proved whole on all ${boards} boards`,
    );
    let now = { ...readVerdicts(), [at(key)]: v };
    if (SHARD === null) verdicts[key] = v;
    else {
      const shards = Array.from(
        { length: SHARD.of },
        (_, i) => `${key}@${i}/${SHARD.of}`,
      );
      if (shards.every((s) => checkedAs(fp, now[s]))) {
        const all = shards.every((s) => now[s] === fp) ? fp : heldVerdict(fp);
        now = Object.fromEntries(
          Object.entries(now).filter(([k]) => !shards.includes(k)),
        );
        now[key] = all;
        verdicts[key] = all;
        say(
          `ok  ${key}: all ${SHARD.of} shards checked, recorded ${all === fp ? "sound" : "held"}`,
        );
      }
    }
    writeFileSync(
      path,
      `${JSON.stringify(Object.fromEntries(Object.entries(now).sort()), null, 2)}\n`,
    );
  };
  /** Keep a current verdict without checking it, and say so in the results. */
  const keep = (key: string, fp: string, id: string, where: string): void => {
    const k = checkedAs(fp, recorded[key]) ? key : at(key);
    if (k === key) verdicts[key] = recorded[key];
    say(
      `ok  ${where.padEnd(10)} ${id.padEnd(30)} current: recorded ${k} ${recorded[k]}`,
    );
  };
  for (const [source, file] of files) {
    const name = isLibrary(file) ? file.library : file.game;
    if (only !== null && !only.includes(name)) continue;
    const plantsAt = plantsPath(source);
    const plants = (): Plants =>
      parsePlants(readFileSync(`${ROOT}${plantsAt}`, "utf8"), plantsAt);
    if (isLibrary(file)) {
      const square = libraryDescription(file);
      const repeated = libraryDescription(file, true);
      const worlds = [
        { where: file.library, d: { ...square.d, techniques: square.techniques } },
        {
          where: `${file.library} +repeat`,
          d: { ...repeated.d, techniques: repeated.techniques },
        },
      ];
      for (const id of Object.keys(file.techniques)) {
        const key = soundnessKey(source, id);
        const fp = libraryFingerprint(file, id);
        if (!due(key, fp, id)) {
          keep(key, fp, id, file.library);
          continue;
        }
        const { failed, ...how } = await checkAll(worlds, id, plants());
        bad.push(...failed);
        if (failed.length === 0) record(key, fp, how);
      }
      continue;
    }
    if (!isFormal(file) || file.techniques === undefined) continue;
    const worlds = worldsOf(file, libraries, say);
    // A world or a clue kind no board of an order can hold goes unchecked
    // there, which the verdicts alone would not say.
    const note = say;
    for (const { where, d } of worlds)
      for (const order of ORDERS)
        for (const sizes of sizings(d, order)) {
          const at = [
            where,
            ...[...sizes].map(([n, v]) => sizeLabel(order, n, v)),
          ].join(" ");
          trace(`..  ${at}: whether any board of order ${order} has an answer`);
          const cells = await regionCells(d, order, sizes);
          if (!(await hasAnswer(d, order, sizes, cells))) {
            note(
              `--  ${at}: no board of order ${order} has an answer, so nothing is checked there`,
            );
            continue;
          }
          for (const kind of await impossibleKinds(d, order, sizes, cells))
            note(
              `--  ${at.padEnd(10)} no board of order ${order} holds a ${kind} clue, so no reading of one is checked there`,
            );
        }
    const own = new Set(
      worlds.flatMap(({ d }) =>
        d.techniques
          .filter((t) => !t.id.includes(".") && (techniques?.includes(t.id) ?? true))
          .map((t) => t.id),
      ),
    );
    for (const stated of withEveryVariation(file).techniques ?? []) {
      if ("use" in stated || !own.has(stated.id)) continue;
      const key = soundnessKey(source, stated.id);
      const fp = gameFingerprint(file, stated);
      if (!due(key, fp, stated.id)) {
        keep(key, fp, stated.id, file.game);
        continue;
      }
      const { failed, ...how } = await checkAll(worlds, stated.id, plants());
      bad.push(...failed);
      if (failed.length === 0) record(key, fp, how);
    }
  }
  writeFileSync(
    fileURLToPath(
      new URL(
        only === null && techniques === null
          ? "results-describe.txt"
          : `results-describe-${[...(only ?? []), ...(techniques ?? [])].join("-")}.txt`,
        import.meta.url,
      ),
    ),
    `${lines.join("\n")}\n`,
  );
  // Only the planted defects may fail; a verdict is recorded only for a
  // technique found sound. A narrowed run keeps the others' verdicts, less
  // those of the descriptions it checked, or of the techniques where it
  // names them, so runs of one game's techniques may go side by side; every
  // run keeps the dead-end checker's. A verdict written as it was proved is
  // kept by the same rule.
  const checked = [...files]
    .filter(
      ([, f]) => only === null || only.includes(isLibrary(f) ? f.library : f.game),
    )
    .map(([s]) => `${s}#`);
  const isChecked = (k: string): boolean =>
    checked.some((s) =>
      techniques === null
        ? k.startsWith(s)
        : techniques.some((id) => k === `${s}${id}`),
    );
  const kept: Record<string, string> = Object.fromEntries(
    Object.entries(
      JSON.parse(readFileSync(path, "utf8")) as Record<string, string>,
    ).filter(
      ([k]) =>
        isDeadEndKey(k) || ((only !== null || techniques !== null) && !isChecked(k)),
    ),
  );
  writeFileSync(
    path,
    `${JSON.stringify(Object.fromEntries(Object.entries({ ...kept, ...verdicts }).sort()), null, 2)}\n`,
  );
  expect(bad).toEqual([]);
});
