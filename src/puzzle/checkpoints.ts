import { signal } from "@lit-labs/signals";

/** How a run the engine reports relates to the run in play: the same one, one
 * behind it that Undo brought back, or another. */
export type RunArrival = "same" | "undone" | "other";

/**
 * The move numbers the player has set as checkpoints. Checkpoints are move
 * numbers in one run, so they go with it when it is left and come back when
 * Undo or Redo brings it back. A run that arrives with none of its own kept
 * here starts with none.
 */
export class Checkpoints {
  // TODO: use reactive set (from signal-utils) rather than replacing value
  private readonly _moves = signal<ReadonlySet<number>>(new Set());
  /** The engine's number for the run in play (`NotifyGameStateChange.board`). */
  private run = 0;
  /** The checkpoints of the runs left, under their numbers. */
  private readonly left = new Map<number, ReadonlySet<number>>();

  public get moves(): ReadonlySet<number> {
    return this._moves.get();
  }

  public set moves(value: Iterable<number>) {
    this._moves.set(new Set(value));
  }

  public add(move: number): void {
    if (!this.moves.has(move)) {
      const moves = new Set(this.moves);
      moves.add(move);
      this._moves.set(moves);
    }
  }

  public remove(move: number): void {
    if (this.moves.has(move)) {
      const moves = new Set(this.moves);
      moves.delete(move);
      this._moves.set(moves);
    }
  }

  /** Follow the engine to run `run`, putting the checkpoints of the run left
   * away and bringing back any kept for this one. */
  public follow(run: number): RunArrival {
    if (run === this.run) return "same";
    if (this.moves.size > 0) this.left.set(this.run, this.moves);
    else this.left.delete(this.run);
    this._moves.set(this.left.get(run) ?? new Set());
    // The engine numbers a run as it begins, and a run begun drops every run
    // ahead of it, so a lower number is a run behind: Undo brought it back.
    const undone = run < this.run;
    this.run = run;
    return undone ? "undone" : "other";
  }

  /** The run in play went from `before` moves to `after`: drop the
   * checkpoints past its end. */
  public purge(before: number, after: number): void {
    if (after < before && this.moves.size > 0) {
      // BUG: this can't distinguish these two cases:
      //   - set checkpoint; undo; redo (shouldn't purge checkpoint == totalMoves)
      //   - set checkpoint; undo; move (_should_ purge checkpoint >= totalMoves)
      // To avoid unexpected purging, keep a checkpoint at totalMoves:
      const kept = [...this.moves].filter((c) => c <= after);
      if (kept.length < this.moves.size) {
        this._moves.set(new Set(kept));
      }
    }
  }
}
