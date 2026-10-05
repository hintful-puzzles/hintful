/**
 * The positions a hint's rungs are tested on: found by one scan, pinned as
 * inputs, and found again by one command.
 *
 * A hint test needs a board on which each rung fires. A pin is the right shape
 * for it (an input, never a seed: AGENTS.md § "Method"), and the costly one to
 * keep, because the scan that found it used to be written for the occasion and
 * deleted. {@link describeHintPins} keeps the scan beside the pins: it pins one
 * position for every rung the game declares (`Game.hintRungs`), and a pin that
 * stops firing fails with the command that scans again, `npm run hint-scan`
 * (`scripts/hint-scan.ts`), which writes the pins into the test file.
 *
 * A step says which rung it is (`HintStep.rung`), so a rung's pin is keyed on
 * that id and never on the sentence. A game's further kinds, about a step's
 * shape or its board, are predicates over the step.
 *
 * The scan walks hint-guided play as `hint-resume.test.ts` does, taking the
 * plan's first step and asking again, so a position it reports is one a player
 * following hints reaches. Its report says how many of the positions walked
 * each kind held on, which is the power argument a pin owes: a kind that held
 * on 3 of 1,400 is one generator change from holding on none.
 *
 * Dev/test-only; never imported by production code.
 */
import { describe, expect, it } from "vitest";
import type { Game, HintStep } from "../game.ts";
import { randomNew } from "../random/index.ts";
import { type HintScanReport, SCAN_REPORT_MARK } from "./hint-scan-report.ts";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env;
/** Set (by `npm run hint-scan`) to scan again instead of testing the pins. */
const SCANNING = Boolean(env?.["HINT_SCAN"]);

/** A position: a board as `params:desc`, and the moves played on it. A bare
 * string is a board with no moves played. The moves may be their JSON, which
 * is how the scan writes more than a few: a formatter leaves a string on one
 * line, where the same moves as a literal run to hundreds. */
export type HintPin<Move> =
  | string
  | { readonly id: string; readonly moves: readonly Move[] | string };

/** A pin as the source text the scan reports. */
function pinSource<M>(pin: HintPin<M>): string {
  if (typeof pin === "string") return JSON.stringify(pin);
  const moves = JSON.stringify(pin.moves);
  const written = moves.length > 80 ? `'${moves}'` : moves;
  return `{ id: ${JSON.stringify(pin.id)}, moves: ${written} }`;
}

/**
 * What a position is pinned for:
 *
 * - a **rung id**: some step of the plan a hint gives there is of that rung;
 * - a **predicate** over the step the plan opens with and the board it is
 *   asked from, for what a rung id does not say: a step's shape (several
 *   cells, a journey), or the board's.
 *
 * A predicate reads the step's fields, `step.rung` first among them, and never
 * its sentence.
 */
export type HintKind<State, Move, Highlights, Rung extends string> =
  | Rung
  | ((step: HintStep<Move, Highlights, Rung>, state: State) => boolean);

/** How a scan deals its boards and walks them. */
export interface HintPositionScan<
  Params,
  State,
  Move,
  Ui,
  DrawState,
  Highlights,
  Rung extends string,
> {
  // biome-ignore lint/suspicious/noExplicitAny: the mistake type plays no part here.
  game: Game<Params, State, Move, Ui, DrawState, any, Highlights, Rung>;
  /** The boards the scan deals: every seed at each of these. */
  params: readonly Params[];
  /** How many seeds a params; 12 when omitted. */
  seeds?: number;
  /** The most hints followed on one board; 400 when omitted. */
  maxSteps?: number;
  /** A position's own desc, for a game whose board mid-game is one a desc can
   * write. The scan then reports a position as a board, with no moves. */
  descOf?: (state: State) => string;
  /** Moves the scan plays on a fresh board before it asks for a hint: a
   * mark-all, an opening click. A pin keeps them with the rest of its moves. */
  opening?: (state: State) => readonly Move[];
  /** The `Ui` a hint is asked under, where the kinds want one that `newUi`
   * does not give: a candidate reading. */
  ui?: (state: State) => Ui;
  /** A second line of play on every board, for kinds that following the hint
   * never meets: a hint keeps to winning lines, so the rungs about a losing
   * move are spoken only off them. It names the move played at each turn,
   * given the one the hint offers (null where it refuses), and ends the line
   * with null. */
  stray?: (state: State, turn: number, hinted: Move | null) => Move | null;
}

/** A scan with the kinds it finds positions for, by name. */
type KindScan<P, S, M, U, D, H, R extends string> = HintPositionScan<
  P,
  S,
  M,
  U,
  D,
  H,
  R
> & { kinds: Record<string, HintKind<S, M, H, R>> };

/** The step of `steps` that makes the plan one of `kind`, and where it is. */
function stepOfKind<S, M, H, R extends string>(
  kind: HintKind<S, M, H, R>,
  steps: readonly HintStep<M, H, R>[],
  state: S,
): number {
  if (typeof kind === "string") return steps.findIndex((s) => s.rung === kind);
  return steps.length > 0 && kind(steps[0], state) ? 0 : -1;
}

/** The board a pin names, and the plan a hint gives there. */
function loadPosition<P, S, M, U, D, H, R extends string>(
  scan: HintPositionScan<P, S, M, U, D, H, R>,
  id: string,
  moves: readonly M[],
) {
  const { game } = scan;
  const colon = id.indexOf(":");
  const params = game.decodeParams(id.slice(0, colon));
  let state = game.newState(params, id.slice(colon + 1));
  for (const m of moves) state = game.executeMove(state, m);
  const ui = scan.ui?.(state) ?? game.newUi(state);
  const plan = game.hint?.(state, undefined, ui) ?? null;
  return { state, plan };
}

/** Walk hint-guided play on the scan's boards, and say how many positions each
 * kind held on and which of them is the one to pin. */
function scanHintPositions<P, S, M, U, D, H, R extends string>(
  scan: KindScan<P, S, M, U, D, H, R>,
): Pick<HintScanReport, "walked" | "boards"> & {
  kinds: Record<string, { held: number; pin: string | null }>;
} {
  const { game, descOf } = scan;
  const hint = game.hint?.bind(game);
  if (!hint) throw new Error(`${game.id} has no hint to scan`);
  const names = Object.keys(scan.kinds);
  /** A kind's best position so far: where its step opens the plan before
   * where it comes later, then the fewest moves played, which is the shortest
   * pin to keep and the least play for a later change to disturb. */
  const best = new Map<string, { at: number; depth: number; pin: HintPin<M> }>();
  const held = new Map<string, number>(names.map((k) => [k, 0]));
  let walked = 0;
  let boards = 0;
  for (const params of scan.params) {
    const encoded = game.encodeParams(params, true);
    for (let n = 0; n < (scan.seeds ?? 12); n++) {
      const { desc } = game.newDesc(params, randomNew(`hint-scan-${n}`));
      const id = `${encoded}:${desc}`;
      boards++;
      // One line of play following the hint, and one the game steers.
      for (const stray of scan.stray ? [null, scan.stray] : [null]) {
        let state = game.newState(params, desc);
        const moves: M[] = [...(scan.opening?.(state) ?? [])];
        for (const m of moves) state = game.executeMove(state, m);
        const ui = scan.ui?.(state) ?? game.newUi(state);
        for (let k = 0; k < (scan.maxSteps ?? 400); k++) {
          if (game.status(state) !== "ongoing") break;
          // With no `aux`, as a pin is loaded: a `params:desc` carries none.
          const plan = hint(state, undefined, ui);
          const steps = plan.ok ? plan.steps : [];
          if (steps.length > 0) walked++;
          for (const name of steps.length > 0 ? names : []) {
            const at = stepOfKind(scan.kinds[name], steps, state);
            if (at < 0) continue;
            held.set(name, (held.get(name) ?? 0) + 1);
            const was = best.get(name);
            const opens = at === 0;
            if (was) {
              const wasOpens = was.at === 0;
              if (wasOpens && !opens) continue;
              if (wasOpens === opens && moves.length >= was.depth) continue;
            }
            best.set(name, {
              at,
              depth: moves.length,
              pin: descOf
                ? `${encoded}:${descOf(state)}`
                : moves.length > 0
                  ? { id, moves: [...moves] }
                  : id,
            });
          }
          const hinted = steps[0]?.move ?? null;
          const next = stray ? stray(state, k, hinted) : hinted;
          if (next === null) break;
          state = game.executeMove(state, next);
          moves.push(next);
        }
      }
    }
  }
  return {
    walked,
    boards,
    kinds: Object.fromEntries(
      names.map((k) => {
        const b = best.get(k);
        return [k, { held: held.get(k) ?? 0, pin: b ? pinSource(b.pin) : null }];
      }),
    ),
  };
}

/** The report as a reader takes it, over the line the script takes. */
function reportText(report: HintScanReport): string {
  const lines = [
    `${report.game}: ${report.walked} positions walked on ${report.boards} boards.`,
    "",
  ];
  for (const [name, kind] of Object.entries(report.kinds)) {
    lines.push(`  /** Held on ${kind.held} of ${report.walked} positions walked. */`);
    lines.push(
      kind.pin === null ? `  // ${name}: not found` : `  ${name}: ${kind.pin},`,
    );
  }
  for (const [name, kind] of Object.entries(report.unreached))
    if (kind.held > 0)
      lines.push(`  // ${name}: listed unreached, and held on ${kind.held}`);
  lines.push("", SCAN_REPORT_MARK + JSON.stringify(report));
  return lines.join("\n");
}

/** A pinned position, loaded: the board, and the plan a hint gives there. */
export interface PinnedPosition<State, Move, Highlights, Rung extends string = string> {
  /** The pin, as `renderScenario` takes it. */
  id: string;
  moves: readonly Move[];
  state: State;
  /** The step of the pin's kind: the first of its rung in the plan, or the
   * step the plan opens with when the kind is a predicate. */
  step: HintStep<Move, Highlights, Rung>;
  /** Where {@link step} is in {@link steps}. */
  index: number;
  steps: readonly HintStep<Move, Highlights, Rung>[];
}

/** What stands in for a pin that does not load while a scan runs, so that a
 * `pinned()` call in a `describe` body cannot stop the file being collected,
 * and with it the scan: anything read off it, or called on it, is itself. */
function standIn<T>(): T {
  const absorb: unknown = new Proxy(() => absorb, {
    get: (_t, key) =>
      key === Symbol.iterator
        ? function* () {}
        : key === Symbol.toPrimitive
          ? () => ""
          : absorb,
    apply: () => absorb,
  });
  return absorb as T;
}

function declarePins<P, S, M, U, D, H, R extends string>(
  spec: KindScan<P, S, M, U, D, H, R> & {
    pins: Partial<Record<string, HintPin<M>>>;
    unreached: readonly string[];
  },
): (kind: string) => PinnedPosition<S, M, H, R> {
  const { game } = spec;
  const again = (): string => {
    const path = expect.getState().testPath ?? "<this file>";
    return `npm run hint-scan -- ${path.slice(path.indexOf("src/"))}`;
  };

  /** The pin's position if it still fires its kind, or why it does not. */
  const load = (kind: string): PinnedPosition<S, M, H, R> | string => {
    const pin = spec.pins[kind];
    if (pin === undefined) return `no position is pinned for "${kind}"`;
    if (!(kind in spec.kinds)) return `"${kind}" is not a kind of this scan`;
    const id = typeof pin === "string" ? pin : pin.id;
    const played = typeof pin === "string" ? [] : pin.moves;
    const moves: readonly M[] =
      typeof played === "string" ? (JSON.parse(played) as M[]) : played;
    // A board the game no longer accepts is a stale pin like any other, which
    // the scan replaces; thrown from here it would end the scan instead.
    let position: ReturnType<typeof loadPosition<P, S, M, U, D, H, R>>;
    try {
      position = loadPosition(spec, id, moves);
    } catch (e) {
      return `the position pinned for "${kind}" no longer loads (${String(e)})`;
    }
    const { state, plan } = position;
    const steps = plan?.ok ? plan.steps : [];
    const index = stepOfKind(spec.kinds[kind], steps, state);
    if (index < 0) {
      const said = plan?.ok
        ? `"${plan.steps[0].explanation}" (${plan.steps.map((s) => s.rung).join(", ")})`
        : (plan?.error ?? "none");
      return `the position pinned for "${kind}" no longer fires it (the hint there: ${said})`;
    }
    return { id, moves, state, step: steps[index], index, steps };
  };

  // A pin is loaded once: its hint may be a search, and every test that reads
  // it would otherwise pay for the plan again.
  const loaded = new Map<string, PinnedPosition<S, M, H, R> | string>();
  const at = (kind: string): PinnedPosition<S, M, H, R> => {
    let position = loaded.get(kind);
    if (position === undefined) {
      position = load(kind);
      loaded.set(kind, position);
    }
    if (typeof position !== "string") return position;
    if (SCANNING) return standIn();
    throw new Error(`${game.id}: ${position}. Find one:\n  ${again()}`);
  };

  describe(`${game.id}: pinned hint positions`, () => {
    it.skipIf(SCANNING)("every kind's pin fires its kind", () => {
      const names = Object.keys(spec.kinds);
      // Vacuity: a spec with no kinds would pin nothing and pass.
      expect(names.length).toBeGreaterThan(0);
      for (const kind of names) at(kind);
    });

    // Which rung a pin fires is keyed on its id, so this is where a rung's
    // wording is held: rewording a sentence shows as this snapshot's diff.
    it.skipIf(SCANNING)("says, at each pin", () => {
      const said = Object.keys(spec.kinds).map((kind) => [
        kind,
        at(kind).step.explanation,
      ]);
      expect(Object.fromEntries(said)).toMatchSnapshot();
    });

    it.runIf(SCANNING)("scan (HINT_SCAN): the report is the failure", () => {
      // The excused rungs are scanned too, so one that fires is reported.
      const excused = Object.fromEntries(spec.unreached.map((r) => [r, r as R]));
      const scanned = scanHintPositions({
        ...spec,
        kinds: { ...spec.kinds, ...excused },
      });
      const kinds: HintScanReport["kinds"] = {};
      const unreached: HintScanReport["unreached"] = {};
      for (const [name, kind] of Object.entries(scanned.kinds)) {
        if (name in excused) unreached[name] = kind;
        else kinds[name] = { ...kind, kept: typeof load(name) !== "string" };
      }
      const { walked, boards } = scanned;
      throw new Error(reportText({ game: game.id, walked, boards, kinds, unreached }));
    });
  });

  return at;
}

/**
 * Declare a game's pinned hint positions, one for every rung it declares
 * (`Game.hintRungs`) and one for each further kind, and return the loader a
 * test reads them through.
 *
 * It declares one test: every pin's plan still fires its kind. A rung's pin is
 * a position whose plan holds a step of that rung; a further kind's is one
 * whose plan opens with a step the predicate accepts. `npm run hint-scan --
 * <this file>` scans again and writes the pins.
 *
 * The types require a pin for every rung, so a game that adds a rung does not
 * compile until it has one. A rung no board is known to fire goes in
 * `unreached` with the reason, which is a shortfall on show: empty is the goal
 * (`describeLadderCensus`'s `unreached` is the same ledger). One call a game;
 * a test file that wants positions of its own besides takes
 * {@link describeHintKindPins}.
 */
export function describeHintPins<
  P,
  S,
  M,
  U,
  D,
  H,
  R extends string,
  K extends string = never,
  X extends R = never,
>(
  spec: HintPositionScan<P, S, M, U, D, H, R> & {
    /** Further kinds, by a name that is no rung's. */
    kinds?: Record<K, HintKind<S, M, H, R>>;
    /** The rungs with no pin, each with why no board fires it. */
    unreached?: Record<X, string>;
    // The kinds are named by `kinds` and `unreached`, never by the pins.
    pins: Record<Exclude<R, NoInfer<X>> | NoInfer<K>, HintPin<M>>;
  },
): (kind: Exclude<R, X> | K) => PinnedPosition<S, M, H, R> {
  const { game } = spec;
  const rungs = game.hintRungs;
  if (!rungs) throw new Error(`${game.id} declares no hintRungs to pin`);
  const unreached = Object.keys(spec.unreached ?? {});
  const further = (spec.kinds ?? {}) as Record<string, HintKind<S, M, H, R>>;
  for (const name of Object.keys(further))
    if ((rungs as readonly string[]).includes(name))
      throw new Error(`${game.id}: the kind "${name}" has a rung's name`);
  const kinds: Record<string, HintKind<S, M, H, R>> = { ...further };
  for (const rung of rungs) if (!unreached.includes(rung)) kinds[rung] = rung;
  return declarePins({ ...spec, kinds, unreached });
}

/**
 * Pin positions for kinds of a test file's own, beside the game's
 * {@link describeHintPins}: a frame a render test reads, a board shape. A kind
 * is a rung id or a predicate ({@link HintKind}).
 */
export function describeHintKindPins<
  P,
  S,
  M,
  U,
  D,
  H,
  R extends string,
  K extends string,
>(
  spec: HintPositionScan<P, S, M, U, D, H, R> & {
    kinds: Record<K, HintKind<S, M, H, R>>;
    pins: Record<NoInfer<K>, HintPin<M>>;
  },
): (kind: K) => PinnedPosition<S, M, H, R> {
  return declarePins({ ...spec, unreached: [] });
}
