/**
 * Bridges' explained hint: the per-game half of the guarantees.
 *
 * The cross-game guards already walk every tier for voice, length, marks,
 * overlay repaint, purity and resume (`engine/hint-*.test.ts`, enrolled by the
 * `hint()` declaration alone). What is here is what only this game can say:
 * which premises its corpus reaches, that its one reason-less rule is the
 * bookkeeping mark and nothing else, that a firing's sentence and its picture
 * hold the same numbers, and that the plan's own moves solve a real board
 * through the real `executeMove`.
 */
import { describe, expect, it } from "vitest";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  ALREADY_SOLVED,
  CONTRADICTION_UNLOCALIZED,
  FIX_MISTAKES_FIRST,
} from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { decodeSave, encodeSave } from "../../engine/save.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { observeMidend } from "../../engine/testing/drive-midend.ts";
import { newBridgesDesc } from "./generator.ts";
import { type BridgesHighlights, narrate } from "./hint.ts";
import { say } from "./hint-text.ts";
import { bridgesGame } from "./index.ts";
import {
  type BridgesFiring,
  type BridgesReason,
  type BridgesSpan,
  bridgesRecordingPass,
} from "./solver.ts";
import {
  BRIDGES_PRESETS,
  type BridgesMove,
  type BridgesParams,
  type BridgesState,
  decodeParams,
  G_LINEH,
  G_LINEV,
  G_NOLINEH,
  G_NOLINEV,
  type Island,
  newStateFromDesc,
} from "./state.ts";

type Kind = BridgesReason["kind"];

/**
 * Every premise the recording projection can speak, as a total record: adding
 * a variant fails to compile until the census below lists it, which is what
 * stops a new arm shipping unreached and unread
 * (docs/games/hints.md § "Census the reasons, not only the rungs").
 */
const REASON_KINDS: Record<Kind, true> = {
  exactSpace: true,
  everyNeighbor: true,
  wouldCloseLoop: true,
  needsThisWay: true,
  wouldSealGroup: true,
  wouldStarve: true,
  mustReachOut: true,
};

/**
 * The premise no *shipped* board can reach, with its reason. Every preset
 * Bridges offers has `allowloops` on, and the loop rung is the only one that
 * asks whether they are off, so the whole ladder can be certified by
 * `bridges-ladder.test.ts` and this arm still never speak. It is covered
 * instead by the loops-forbidden shapes below, which a player reaches through
 * the Type dialog.
 */
const UNREACHED_BY_PRESETS: Kind[] = ["wouldCloseLoop"];

/** Five, because the two connectivity arms are the rare ones: `mustReachOut`
 * fires on roughly one board in ten and three seeds miss it outright. */
const SEEDS = ["bh-a", "bh-b", "bh-c", "bh-d", "bh-e"];

/** The shipped presets, plus the axes the Type dialog varies that the ladder
 * reads: loops forbidden, and the two extremes of `maxb`. */
const SHAPES: { label: string; params: BridgesParams; shipped: boolean }[] = [
  ...BRIDGES_PRESETS.map((params) => ({
    label: bridgesGame.encodeParams(params, true),
    params,
    shipped: true,
  })),
  {
    label: "7x7 no loops",
    params: { ...BRIDGES_PRESETS[2], allowloops: false },
    shipped: false,
  },
  {
    label: "15x15 no loops, maxb 4",
    params: { ...BRIDGES_PRESETS[8], allowloops: false, maxb: 4 },
    shipped: false,
  },
  {
    // Normal, because Tricky refuses one bridge per line (`validateParams`).
    label: "15x15 Normal maxb 1",
    params: { ...BRIDGES_PRESETS[7], maxb: 1 },
    shipped: false,
  },
];

function makeBoard(params: BridgesParams, seed: string): BridgesState {
  const { desc } = newBridgesDesc(params, randomNew(seed));
  return newStateFromDesc(params, desc);
}

/** Every firing the deduction makes on this board, hidden ones included, plus
 * the island list a reason's `island` index names. */
function allFirings(
  params: BridgesParams,
  seed: string,
): { firings: BridgesFiring[]; status: string; islands: Island[] } {
  const start = makeBoard(params, seed);
  const work = start.workingCopy();
  const pass = bridgesRecordingPass(
    work,
    params.difficulty,
    stepBudget("bridges test"),
  );
  const r = deduceHintPlan<BridgesState, BridgesFiring, string>({
    board: work,
    status: () => (pass.impossible() ? "broken" : pass.solved() ? "done" : "open"),
    incomplete: "open",
    next: () => pass.next(),
    showable: () => true,
  });
  return { firings: r.plan, status: r.status, islands: start.islands };
}

/** How many bridges run along this span on `state`. */
function spanBridges(state: BridgesState, span: BridgesSpan): number {
  const dx = Math.sign(span.x2 - span.x1);
  const dy = Math.sign(span.y2 - span.y1);
  return state.gridCount(span.x1 + dx, span.y1 + dy, dx ? G_LINEH : G_LINEV);
}

describe("the corpus reaches every premise, and the ledger says which it cannot", () => {
  const shipped = new Map<Kind, number>();
  const all = new Map<Kind, number>();
  let firingCount = 0;
  let stalled = 0;
  for (const { params, shipped: isShipped } of SHAPES) {
    for (const seed of SEEDS) {
      const { firings, status } = allFirings(params, seed);
      if (status !== "done") stalled++;
      for (const f of firings) {
        firingCount++;
        if (!f.reason) continue;
        all.set(f.reason.kind, (all.get(f.reason.kind) ?? 0) + 1);
        if (isShipped)
          shipped.set(f.reason.kind, (shipped.get(f.reason.kind) ?? 0) + 1);
      }
    }
  }

  it("looked at enough firings to mean anything", () => {
    // The vacuity guard: every assertion below passes over an empty census.
    expect(firingCount).toBeGreaterThan(2000);
    expect(stalled, "a board the deduction could not finish").toBe(0);
  });

  it("every premise fires somewhere in the corpus", () => {
    expect(Object.keys(REASON_KINDS).filter((k) => !all.has(k as Kind))).toEqual([]);
  });

  it("the shipped presets reach everything but the ledgered arm", () => {
    const missing = (Object.keys(REASON_KINDS) as Kind[]).filter(
      (k) => !shipped.has(k),
    );
    // Exactly the ledger, in both directions: an arm that starts firing on a
    // shipped board fails here just as loudly as one that stops.
    expect(missing.sort()).toEqual([...UNREACHED_BY_PRESETS].sort());
    // And the ledger's reason is derived rather than observed: the loop rung
    // returns at once when loops are allowed, and every preset allows them. A
    // preset that stopped allowing them would make the entry wrong, and this is
    // what notices.
    expect(BRIDGES_PRESETS.every((p) => p.allowloops)).toBe(true);
  });
});

/**
 * Boards whose plans once leaned on a limit the player could not see: the
 * working board held "at most one" on a span while the player's showed room
 * for two, and a later step counted the one. Pinned as descs, the input the
 * rung consumes, so a generator change cannot quietly stop producing them.
 */
const LIMITED = [
  "7x7i30e10m2d2:2e2a2a5a2a3a2g5b43i2c2a3c3",
  "7x7i30e10m2d2:3d2b2d4g4e5a2a3j2b3b2",
  "7x7i30e10m2d2:2e3a1a4a2a3a3g2b32d1h2a4b2a",
];

/** Where two boards disagree about a bridge, a cross or a limit, if anywhere. */
function unseen(player: BridgesState, work: BridgesState): string | null {
  for (let y = 0; y < work.h; y++) {
    for (let x = 0; x < work.w; x++) {
      for (const [dx, line, cross] of [
        [1, G_LINEH, G_NOLINEH],
        [0, G_LINEV, G_NOLINEV],
      ]) {
        const at = `(${x},${y}) ${dx ? "across" : "down"}`;
        if (player.gridCount(x, y, line) !== work.gridCount(x, y, line))
          return `bridges at ${at}`;
        if ((player.gridAt(x, y) & cross) !== (work.gridAt(x, y) & cross))
          return `cross at ${at}`;
        if (player.maximum(dx, x, y) !== work.maximum(dx, x, y))
          return `limit at ${at}: player ${player.maximum(dx, x, y)}, hint ${work.maximum(dx, x, y)}`;
      }
    }
  }
  return null;
}

describe("every step stands on the board the player can see", () => {
  /**
   * Plays only the steps the plan shows onto a player's board, through the
   * real `executeMove`, and before each one compares it with the board the
   * deduction is reasoning from. Any bridge, cross or limit the deduction holds
   * and the player does not is a fact the step's sentence may be leaning on
   * that the player has no way to see (AGENTS.md, hint rule 6).
   */
  function walk(params: BridgesParams, desc: string) {
    const start = newStateFromDesc(params, desc);
    const work = start.workingCopy();
    const pass = bridgesRecordingPass(work, params.difficulty, stepBudget("bh"));
    let player = start;
    let before = work.workingCopy();
    const out = { shown: 0, limits: 0, hiddenMoves: 0, first: null as string | null };
    deduceHintPlan<BridgesState, BridgesFiring, string>({
      board: work,
      status: () => (pass.impossible() ? "broken" : pass.solved() ? "done" : "open"),
      incomplete: "open",
      next: () => {
        before = work.workingCopy();
        return pass.next();
      },
      showable: (_board, f) => {
        if (!f.reason) {
          if (f.ops.some((op) => op.op !== "M")) out.hiddenMoves++;
          return false;
        }
        out.shown++;
        if (f.ops.some((op) => op.op === "C")) out.limits++;
        const gap = unseen(player, before);
        if (gap && !out.first)
          out.first = `step ${out.shown} (${f.reason.kind}): ${gap}`;
        player = bridgesGame.executeMove(player, { ops: f.ops });
        return true;
      },
    });
    return out;
  }

  it("the pinned boards write the limits their later steps count", () => {
    for (const pd of LIMITED) {
      const [p, desc] = pd.split(":");
      const r = walk(decodeParams(p), desc);
      expect(r.first, pd).toBeNull();
      expect(r.limits, `${pd} wrote no limit`).toBeGreaterThan(0);
    }
  });

  it("and so does every board of the corpus", () => {
    let shown = 0;
    let limits = 0;
    for (const { params } of SHAPES) {
      for (const seed of SEEDS) {
        const { desc } = newBridgesDesc(params, randomNew(seed));
        const r = walk(params, desc);
        expect(r.first, `${bridgesGame.encodeParams(params, true)}:${desc}`).toBeNull();
        expect(r.hiddenMoves, "a firing moved the board without a sentence").toBe(0);
        shown += r.shown;
        limits += r.limits;
      }
    }
    // The vacuity guards: the comparison ran, and it ran across limits.
    expect(shown).toBeGreaterThan(1000);
    expect(limits).toBeGreaterThan(5);
  });
});

describe("what the plan shows, and what it keeps to itself", () => {
  it("a reason-less firing is only ever the bookkeeping mark", () => {
    let hidden = 0;
    for (const { params } of SHAPES) {
      for (const seed of SEEDS) {
        for (const f of allFirings(params, seed).firings) {
          if (f.reason) continue;
          hidden++;
          // Nothing but `M`, which is what the fork's auto-mark aid already
          // draws: the island's own digit against its own bridges says it.
          expect(f.ops.every((op) => op.op === "M")).toBe(true);
        }
      }
    }
    expect(hidden, "no hidden firing to judge").toBeGreaterThan(500);
  });

  it("one firing is one step: every move in it runs from one island", () => {
    let multi = 0;
    let steps = 0;
    for (const { params } of SHAPES) {
      for (const seed of SEEDS) {
        const { firings, islands } = allFirings(params, seed);
        for (const f of firings) {
          if (!f.reason) continue;
          steps++;
          const focus = islands[f.reason.island];
          const spans = f.ops.filter((op) => op.op === "L" || op.op === "N");
          if (spans.length > 1) multi++;
          for (const op of spans) {
            expect(
              op.x1 === focus.x && op.y1 === focus.y,
              "a step carries a move from an island its premise is not about",
            ).toBe(true);
          }
        }
      }
    }
    // Not vacuous in either direction: some steps really do force several
    // bridges at once, which is what makes the single-origin claim worth
    // asserting rather than trivially true. Deleting the recorder's
    // per-premise early return in `Solver.ladder`'s sweep turns this red.
    expect(steps).toBeGreaterThan(1000);
    expect(multi).toBeGreaterThan(100);
  });

  it("the sentence's numbers are the picture's", () => {
    const seen = new Set<Kind>();
    for (const { params } of SHAPES) {
      for (const seed of SEEDS) {
        // A player board advanced by the plan's own moves, so a count is read
        // off the board as it was when the firing spoke.
        let player = makeBoard(params, seed);
        for (const f of allFirings(params, seed).firings) {
          const r = f.reason;
          if (r) {
            seen.add(r.kind);
            if (r.kind === "exactSpace") {
              const added = f.ops.reduce(
                (n, op) => (op.op === "L" ? n + op.n - spanBridges(player, op) : n),
                0,
              );
              expect(added, "the bridges drawn are not the ones counted").toBe(
                r.missing,
              );
            }
            if (r.kind === "everyNeighbor") {
              expect(r.ev.islands.length).toBe(r.neighbors);
            }
            if (r.kind === "wouldSealGroup" || r.kind === "mustReachOut") {
              expect(r.ev.islands.length).toBe(r.group);
            }
          }
          player = bridgesGame.executeMove(player, { ops: f.ops });
        }
      }
    }
    expect(seen.size, "no firing carried a reason").toBe(
      Object.keys(REASON_KINDS).length,
    );
  });

  it("the shown steps alone solve the board", () => {
    for (const { label, params } of SHAPES) {
      for (const seed of SEEDS) {
        let player = makeBoard(params, seed);
        for (const f of allFirings(params, seed).firings) {
          if (!f.reason) continue;
          player = bridgesGame.executeMove(player, { ops: f.ops });
        }
        // Every hidden firing is a mark, and `map_check` does not read marks —
        // so hiding them cannot cost the player the win (`engine/hint-plan.ts`:
        // never hide a change the win condition needs).
        expect(player.completed, `${label} ${seed} did not finish`).toBe(true);
      }
    }
  });

  it("never asks for a bridge across a cross the player has drawn", () => {
    // `interpretMove` refuses a bridge over a no-line, so a step asking for one
    // would be a move the player cannot make. The working copy keeps their
    // crosses, which zeroes `possibles` and takes the span out of the ladder.
    const params = BRIDGES_PRESETS[2];
    const start = makeBoard(params, "bh-a");
    const first = bridgesGame.hint?.(start, undefined, bridgesGame.newUi(start));
    expect(first?.ok).toBe(true);
    if (!first?.ok) return;
    const target = first.steps[0].move.ops.find((op) => op.op === "L");
    expect(target).toBeDefined();
    if (target?.op !== "L") return;
    const crossed = bridgesGame.executeMove(start, {
      ops: [{ op: "N", x1: target.x1, y1: target.y1, x2: target.x2, y2: target.y2 }],
    });
    const again = bridgesGame.hint?.(crossed, undefined, bridgesGame.newUi(crossed));
    if (!again?.ok) return;
    for (const step of again.steps) {
      for (const op of step.move.ops) {
        if (op.op !== "L") continue;
        const sameSpan =
          (op.x1 === target.x1 &&
            op.y1 === target.y1 &&
            op.x2 === target.x2 &&
            op.y2 === target.y2) ||
          (op.x1 === target.x2 &&
            op.y1 === target.y2 &&
            op.x2 === target.x1 &&
            op.y2 === target.y1);
        expect(sameSpan, "the hint asked for a bridge the game would refuse").toBe(
          false,
        );
      }
    }
  });
});

describe("following a step", () => {
  const params = BRIDGES_PRESETS[2];
  const start = makeBoard(params, "bh-a");
  const ui = bridgesGame.newUi(start);

  it("shrinks in place while the player draws, then completes", () => {
    const r = bridgesGame.hint?.(start, undefined, ui);
    expect(r?.ok).toBe(true);
    if (!r?.ok) return;
    // A step whose one premise forces more than one bridge is the interesting
    // case, and it is what every board this generator makes opens with.
    const step = r.steps.find(
      (s) => s.move.ops.filter((op) => op.op === "L").length > 1,
    );
    expect(step, "no multi-bridge step in the opening plan").toBeDefined();
    if (!step) return;

    let state = start;
    let verdict: string | null = null;
    let legs = 0;
    while (legs < 20) {
      const op = step.move.ops.find((o) => o.op === "L");
      if (op?.op !== "L") break;
      legs++;
      // One drag adds one bridge, and the player drags from whichever end they
      // like, so the move is deliberately the reverse of the recorded op.
      const move: BridgesMove = {
        ops: [
          {
            op: "L",
            x1: op.x2,
            y1: op.y2,
            x2: op.x1,
            y2: op.y1,
            n: spanBridges(state, op) + 1,
          },
        ],
      };
      verdict = bridgesGame.hintKeepTrack?.(move, step, state) ?? null;
      state = bridgesGame.executeMove(state, move);
      if (verdict === "completed") break;
      expect(verdict, `leg ${legs}`).toBe("onTrack");
    }
    expect(verdict).toBe("completed");
    expect(legs, "the step never shrank").toBeGreaterThan(1);
  });

  it("calls an unrelated move off-plan", () => {
    const r = bridgesGame.hint?.(start, undefined, ui);
    expect(r?.ok, "no plan to go off").toBe(true);
    const step = r?.ok ? r.steps[0] : undefined;
    // Every island the step's own move does not touch, that still has a
    // neighbor to bridge to: the moves a player might make instead.
    const elsewhere = start.islands.filter(
      (is) =>
        !step?.move.ops.some(
          (op) => op.op !== "S" && op.op !== "M" && op.x1 === is.x && op.y1 === is.y,
        ) && is.points.some((pt) => pt.off > 0),
    );
    expect(elsewhere.length, "no unrelated move to try").toBeGreaterThan(4);
    let checked = 0;
    for (const is of elsewhere) {
      const pt = is.points.find((p) => p.off > 0);
      if (!pt || !step) continue;
      checked++;
      const move: BridgesMove = {
        ops: [
          {
            op: "L",
            x1: is.x,
            y1: is.y,
            x2: is.x + pt.off * pt.dx,
            y2: is.y + pt.off * pt.dy,
            n: 1,
          },
        ],
      };
      expect(bridgesGame.hintKeepTrack?.(move, step, start)).toBe("off");
    }
    expect(checked).toBe(elsewhere.length);
  });

  describe("a step that limits a span", () => {
    const [p, desc] = LIMITED[0].split(":");
    const board = newStateFromDesc(decodeParams(p), desc);
    const span = { x1: 0, y1: 0, x2: 6, y2: 0 };
    const stepTo = (op: BridgesMove["ops"][number]) => ({
      move: { ops: [op] },
      explanation: "",
      highlights: { targets: [], focus: null, islands: [], spans: [] },
    });
    const track = (m: BridgesMove, want: BridgesMove["ops"][number], on = board) =>
      bridgesGame.hintKeepTrack?.(m, stepTo(want), on);

    it("is followed by the limit the drag leaves, not by the ops that leave it", () => {
      const atMostOne = { op: "C" as const, ...span, n: 1 };
      const cross = { op: "N" as const, ...span };
      // The one drag that writes it, from either end.
      expect(track({ ops: [atMostOne] }, atMostOne)).toBe("completed");
      expect(
        track({ ops: [{ op: "C", x1: 6, y1: 0, x2: 0, y2: 0, n: 1 }] }, atMostOne),
      ).toBe("completed");
      // A cross is two drags from a free span, and the first is on the way.
      expect(track({ ops: [atMostOne] }, cross)).toBe("onTrack");
      const limited = bridgesGame.executeMove(board, { ops: [atMostOne] });
      expect(track({ ops: [{ ...atMostOne, n: 2 }, cross] }, cross, limited)).toBe(
        "completed",
      );
      // Past the step's limit, or back up from it, is the player's own way.
      expect(track({ ops: [cross] }, atMostOne)).toBe("off");
      expect(track({ ops: [{ ...atMostOne, n: 2 }] }, cross, limited)).toBe("off");
      // And a bridge where the step asks for a limit is not a limit.
      expect(track({ ops: [{ op: "L", ...span, n: 1 }] }, atMostOne)).toBe("off");
    });
  });
});

describe("a board shared without its difficulty", () => {
  it("is hinted at the tier it needs, all the way to solved", () => {
    // Reported by the owner: shared by the id that omits the difficulty, this
    // board loaded as Easy, and the hint, capped at Easy's rules, ran out at
    // move 10. The midend grades such a board on load. It graded Tricky until
    // sealing off moved to Normal; the move it was missing is that rule.
    const shared = "10x10m2:a2a4e31c2a4a1l1b1e5b4b4a1m1f43j2a4e43d4a2b";
    const me = new Midend(bridgesGame);
    expect(me.newGameFromId(shared)).toBeNull();
    const params = decodeParams(me.getParams());
    expect(params.difficulty).toBe(1);

    let state = newStateFromDesc(params, shared.slice(shared.indexOf(":") + 1));
    const ui = bridgesGame.newUi(state);
    let moves = 0;
    while (!state.completed && moves < 200) {
      const r = bridgesGame.hint?.(state, undefined, ui);
      if (!r?.ok) throw new Error(`move ${moves}: ${r?.error}`);
      state = bridgesGame.executeMove(state, r.steps[0].move);
      moves++;
    }
    expect(state.completed).toBe(true);
  });

  it("pinned Easy by a build that mislabeled it, reopens at Normal and hints to solved", () => {
    // Reported by the owner the next day: loaded as Easy before grading
    // existed, the board was remembered and autosaved with Easy pinned, and
    // every refresh reopened it from one of those as Easy, where the hint runs
    // out at move 10. Both records are corrected on load.
    const desc = "a2a4e31c2a4a1l1b1e5b4b4a1m1f43j2a4e43d4a2b";
    const easy = `10x10i30e10m2d0:${desc}`;
    const byId = new Midend(bridgesGame);
    expect(byId.newGameFromId(easy)).toBeNull();
    const bySave = new Midend(bridgesGame);
    const stale = encodeSave({
      ...decodeSave(byId.saveGame()),
      params: "10x10i30e10m2d0",
    });
    expect(bySave.loadGame(stale)).toBeNull();

    for (const me of [byId, bySave]) {
      expect(decodeParams(me.getParams()).difficulty).toBe(1);
      const o = observeMidend(me);
      const status = () => o.last("game-state-change")?.status ?? "";
      for (let moves = 0; !status().startsWith("solved") && moves < 200; moves++) {
        expect(me.executeHint()).toBeNull();
        me.timer(10);
      }
      expect(status()).toMatch(/^solved/);
    }
  });
});

describe("refusing", () => {
  const params = BRIDGES_PRESETS[2];
  const start = makeBoard(params, "bh-a");
  const ui = bridgesGame.newUi(start);

  it("refuses a solved board with the collection's wording", () => {
    const solved = bridgesGame.solve?.(start, start);
    expect(solved?.ok).toBe(true);
    if (!solved?.ok) return;
    const done = bridgesGame.executeMove(start, solved.move);
    expect(bridgesGame.hint?.(done, undefined, ui)).toEqual({
      ok: false,
      error: ALREADY_SOLVED,
    });
  });

  it("refuses a board with a wrong bridge on it", () => {
    const is = [...start.islands]
      .sort((a, b) => a.count - b.count)
      .find((i) => i.points.filter((p) => p.off > 0).length > 1);
    expect(is).toBeDefined();
    if (!is) return;
    let wrong = start;
    for (const pt of is.points) {
      if (!pt.off) continue;
      wrong = bridgesGame.executeMove(wrong, {
        ops: [
          {
            op: "L",
            x1: is.x,
            y1: is.y,
            x2: is.x + pt.off * pt.dx,
            y2: is.y + pt.off * pt.dy,
            n: params.maxb,
          },
        ],
      });
    }
    expect(bridgesGame.findMistakes?.(wrong).length).toBeGreaterThan(0);
    expect(bridgesGame.hint?.(wrong, undefined, ui)).toEqual({
      ok: false,
      error: FIX_MISTAKES_FIRST,
    });
  });

  it("refuses an annotation `findMistakes` cannot see, and says so honestly", () => {
    // Marking an island complete before it is locks bridges it still needs. No
    // entry is wrong, so there is nothing to highlight and `FIX_MISTAKES_FIRST`
    // would promise a highlight that never comes.
    const first = start.islands[0];
    const marked = bridgesGame.executeMove(start, {
      ops: [{ op: "M", x: first.x, y: first.y }],
    });
    expect(bridgesGame.findMistakes?.(marked).length).toBe(0);
    expect(bridgesGame.hint?.(marked, undefined, ui)).toEqual({
      ok: false,
      error: CONTRADICTION_UNLOCALIZED,
    });
  });
});

describe("the sentences at their extremes", () => {
  // The only instrument that can read a sentence a board never produces
  // (docs/games/hints.md § "Census the reasons, not only the rungs").
  it("reads correctly at the smallest and largest values", () => {
    expect(say.exactSpace(1, 1)).toContain("one more bridge");
    expect(say.exactSpace(16, 8)).toContain("8 more bridges");
    expect(say.everyNeighbor(1, 1)).toContain("just one neighbor");
    expect(say.everyNeighbor(4, 2)).toContain("either neighbor");
    expect(say.everyNeighbor(16, 4)).toContain("any 3 of its 4 neighbors");
    expect(say.needsThisWay(3, 0)).toContain("no bridges at all");
    expect(say.needsThisWay(3, 1)).toContain("at most 1 bridge from");
    expect(say.needsThisWay(3, 2)).toContain("at most 2 bridges from");
    expect(say.wouldSealGroup(2, 0)).toContain("these 2 islands");
    expect(say.wouldSealGroup(2, 0)).toMatch(/^A bridge here .* must be blocked\.$/);
    expect(say.wouldSealGroup(2, 1)).toMatch(
      /^Two bridges here .* at most one can run/,
    );
    expect(say.wouldSealGroup(2, 3)).toMatch(/^Four bridges here .* at most three can/);
    expect(say.wouldStarve(5, true, 0)).toContain("this 5 itself");
    expect(say.wouldStarve(5, false, 0)).toContain("the outlined island");
    expect(say.wouldStarve(5, false, 1)).toMatch(/^Two bridges .* at most one can run/);
    for (const s of [
      say.exactSpace(16, 8),
      say.everyNeighbor(16, 4),
      say.wouldCloseLoop,
      say.needsThisWay(16, 12),
      say.wouldSealGroup(64, 3),
      say.wouldStarve(16, false, 3),
      say.wouldStarve(16, true, 3),
      say.mustReachOut(16),
    ]) {
      expect(s.length, s).toBeLessThanOrEqual(120);
    }
  });

  it("names the starved island only when one is outlined", () => {
    // The sentence's self arm and the picture's filter run the same test, so
    // "the outlined island" is never spoken over an empty outline.
    const state = makeBoard(BRIDGES_PRESETS[2], "bh-a");
    expect(
      narrate(state, {
        kind: "wouldStarve",
        island: 0,
        limit: 0,
        ev: { islands: [0], spans: [] },
      }),
    ).toContain("itself");
    expect(
      narrate(state, {
        kind: "wouldStarve",
        island: 0,
        limit: 0,
        ev: { islands: [1], spans: [] },
      }),
    ).toContain("the outlined island");
  });
});

describe("the marks", () => {
  it("marks an island for every step, and never twice", () => {
    let recolored = 0;
    let outlined = 0;
    for (const { params } of SHAPES) {
      for (const seed of SEEDS) {
        let state = makeBoard(params, seed);
        for (let step = 0; step < 40; step++) {
          const r = bridgesGame.hint?.(state, undefined, bridgesGame.newUi(state));
          if (!r?.ok) break;
          const hl = r.steps[0].highlights as BridgesHighlights;
          expect(hl.targets.length, "a step that decides nothing").toBeGreaterThan(0);
          // Something beside the action is always marked, so the premise is
          // never carried by the sentence alone.
          expect(
            hl.focus !== null || hl.islands.length > 0,
            "a step with no island marked",
          ).toBe(true);
          // And never both ways at once: an island is the one the words name,
          // or one of the ones they outline.
          expect(
            hl.islands.some((i) => i.x === hl.focus?.x && i.y === hl.focus?.y),
          ).toBe(false);
          if (hl.focus) recolored++;
          if (hl.islands.length > 0) outlined++;
          state = bridgesGame.executeMove(state, r.steps[0].move);
        }
      }
    }
    expect(recolored).toBeGreaterThan(100);
    expect(outlined).toBeGreaterThan(100);
  });

  it("outlines a group whenever a sentence counts one", () => {
    let seen = 0;
    let empty = 0;
    for (const { params } of SHAPES) {
      for (const seed of SEEDS) {
        const { firings } = allFirings(params, seed);
        for (const f of firings) {
          const r = f.reason;
          if (r?.kind !== "mustReachOut") continue;
          seen++;
          // "the outlined group" has to be something: the source island is
          // recolored rather than outlined here, so the group must hold more
          // than it.
          if (r.ev.islands.filter((i) => i !== r.island).length === 0) empty++;
        }
      }
    }
    expect(seen, "the corpus produced no group-sealing step").toBeGreaterThan(0);
    expect(empty, "a step said 'the outlined group' over nothing").toBe(0);
  });
});
