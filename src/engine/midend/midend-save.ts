import { loadDesc, loadVerdict, readBoard } from "../contract/desc-error.ts";
import type { Game } from "../contract/game.ts";
import { decodeSave, encodeSave, type SaveEnvelope } from "./save.ts";

/** What the midend records of a run beside its states. */
export interface RunRecord {
  cheated: boolean;
  elapsed: number;
  helped: boolean;
}

/**
 * A restart, as an entry of the move log: the step from the board as it was
 * played to the board as it started. Undo crosses it back to the played board,
 * as upstream's does (midend.c `movetype = RESTART`).
 *
 * `far` is the record of the play on the far side of the restart from the
 * cursor: its solver record, its time and its help. Each is a field of the
 * midend and not part of any state, and a restart is where they begin again,
 * so each restart keeps what the cursor left behind and the two are exchanged
 * whenever the cursor crosses.
 *
 * A restart also begins a run, play from a fresh board, which the player sees
 * as a board of its own: its moves are counted from it, and it is numbered as
 * a board is (`serial`), so what the app keeps per board follows the run.
 */
export class Restart {
  constructor(
    public far: RunRecord,
    readonly serial: number,
  ) {}
}

/** A board in play as a save holds it. */
export interface SavedBoard<Params, Move, Ui> {
  params: Params;
  /** The board in play, as its id names it. */
  desc: string;
  /** The desc state 0 was built from, which the move log replays onto. */
  startDesc: string;
  moveLog: readonly (Move | Restart)[];
  joined: readonly boolean[];
  pos: number;
  record: RunRecord;
  ui: Ui;
}

export function writeSave<Params, State, Move, Ui, DrawState>(
  game: Game<Params, State, Move, Ui, DrawState>,
  board: SavedBoard<Params, Move, Ui>,
): Uint8Array<ArrayBuffer> {
  const serMove = game.moveCodec?.serialize ?? ((m: Move) => m as unknown);
  const restarts = board.moveLog.flatMap((entry, at) =>
    entry instanceof Restart
      ? [
          {
            at,
            cheated: entry.far.cheated,
            elapsed: entry.far.elapsed,
            hinted: entry.far.helped,
          },
        ]
      : [],
  );
  const joined = board.joined.flatMap((joins, at) => (joins ? [at] : []));
  const { desc, startDesc, record } = board;
  const envelope: SaveEnvelope = {
    v: 3,
    puzzleId: game.id,
    params: game.encodeParams(board.params, true),
    desc,
    // Where the board in play is not the one state 0 was built from, the move
    // log needs the latter beside it.
    ...(desc === startDesc ? {} : { privDesc: startDesc }),
    moves: board.moveLog.map((entry) =>
      entry instanceof Restart ? null : serMove(entry),
    ),
    ...(restarts.length > 0 ? { restarts } : {}),
    ...(joined.length > 0 ? { joined } : {}),
    pos: board.pos,
    timerElapsed: record.elapsed,
    ...(record.helped ? { hinted: true } : {}),
    cheated: record.cheated,
    ...(game.uiCodec ? { ui: game.uiCodec.encode(board.ui) } : {}),
  };
  return encodeSave(envelope);
}

/** A save read and its board built, ready to replay. */
export interface OpenedSave<Params, State, Move> {
  env: SaveEnvelope;
  params: Params;
  /** The desc state 0 is built from. */
  stateDesc: string;
  /** State 0, as the desc built it under `params`. */
  loaded: State;
  /** The run record each restart keeps, under its place in the log. */
  restarts: Map<number, RunRecord>;
  deMove: (raw: unknown) => Move;
}

/** Read the save `data` for `game`, or say why it cannot be opened. */
export function readSave<Params, State, Move, Ui, DrawState>(
  game: Game<Params, State, Move, Ui, DrawState>,
  data: Uint8Array,
): { ok: true; save: OpenedSave<Params, State, Move> } | { ok: false; error: string } {
  let env: SaveEnvelope;
  try {
    env = decodeSave(data);
  } catch (e) {
    return { ok: false, error: `Could not read save: ${(e as Error).message}` };
  }
  if (env.puzzleId !== game.id) {
    return { ok: false, error: `Save is for "${env.puzzleId}", not "${game.id}"` };
  }
  let params: Params;
  try {
    params = game.decodeParams(env.params);
  } catch (e) {
    return { ok: false, error: `Invalid saved parameters: ${(e as Error).message}` };
  }
  // State 0 is rebuilt from the private desc when the save carries one: the
  // desc the board started from, where the public one names a board the
  // move log is about to arrive at (Mines' bakes in the first click, which
  // the log replays). Both must still read: a parser made stricter since
  // the save was written refuses it here rather than throwing, and a
  // restart rebuilds from the public one. The public desc is the board in
  // play, so it alone is asked whether its board can be finished.
  const stateDesc = env.privDesc ?? env.desc;
  const refused =
    env.privDesc === undefined ? null : loadVerdict(game, params, env.desc);
  if (refused !== null)
    return { ok: false, error: `Could not restore this saved game: ${refused}` };
  const loaded =
    env.privDesc === undefined
      ? loadDesc(game, params, stateDesc)
      : readBoard(game, params, stateDesc);
  if (!loaded.ok)
    return { ok: false, error: `Could not restore this saved game: ${loaded.error}` };
  // A restart written before a restart reset the clock carries no time of
  // its own: the time and the help ran on through it, so the far side's are
  // the save's.
  const restarts = new Map(
    env.restarts?.map((r): [number, RunRecord] => [
      r.at,
      {
        cheated: r.cheated,
        elapsed: r.elapsed ?? env.timerElapsed,
        helped: r.hinted ?? env.hinted === true,
      },
    ]),
  );
  const deMove = game.moveCodec?.deserialize ?? ((raw: unknown) => raw as Move);
  return {
    ok: true,
    save: { env, params, stateDesc, loaded: loaded.value, restarts, deMove },
  };
}
