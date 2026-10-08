/**
 * A non-blocking, responsive "reference aid" panel — a checklist of a game's
 * fixed inventory of pieces with the player's found status, and click-to-
 * spotlight of a piece's candidate placements on the board.
 *
 * Generic over the game: it renders whatever `Game.reference()` returns
 * (`ReferenceModel`) and echoes clicks back through `Puzzle.selectReference`.
 * Dominosa is the first (and currently only) game that exposes a reference; the
 * panel is only ever mounted when `puzzle.hasReference` is true.
 *
 * Presentation is deliberately NOT a modal: it is a region of the puzzle
 * screen's grid (`puzzle/layout.ts`), so the board stays visible and
 * interactive while the panel is open.
 */

import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { ReferenceModel } from "../engine/types.ts";
import { puzzleContext } from "../puzzle/contexts.ts";
import type { Puzzle } from "../puzzle/puzzle.ts";

import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

@customElement("reference-panel")
export class ReferencePanel extends SignalWatcher(LitElement) {
  @consume({ context: puzzleContext, subscribe: true })
  @state()
  private puzzle?: Puzzle;

  @state()
  private model: ReferenceModel | null = null;

  /** The locally-selected key, kept in step with the engine's `selected` on
   * every refresh. Held locally too so a click styles instantly without waiting
   * on the async round-trip (selecting a piece is a `UI_UPDATE`, not a move, so
   * it never triggers a refresh of its own). */
  @state()
  private selectedKey: string | null = null;

  /** Which (puzzle, move) the current `model` was fetched for, so we refetch
   * exactly once per board change rather than on every render. */
  private fetchedPuzzle?: Puzzle;
  private fetchedMove = -1;

  protected override updated() {
    const puzzle = this.puzzle;
    if (!puzzle) return;
    const move = puzzle.currentMove;
    if (this.fetchedPuzzle !== puzzle || this.fetchedMove !== move) {
      this.fetchedPuzzle = puzzle;
      this.fetchedMove = move;
      void this.refresh(puzzle);
    }
  }

  private async refresh(puzzle: Puzzle) {
    const model = await puzzle.getReference();
    if (this.puzzle !== puzzle) return; // switched puzzles mid-flight
    this.model = model;
    // The engine is authoritative for selection: it persists a spotlight across
    // moves and clears it on completion.
    this.selectedKey = model?.selected ?? null;
  }

  private handleClose() {
    this.dispatchEvent(
      new CustomEvent("reference-close", { bubbles: true, composed: true }),
    );
  }

  private async handleItem(key: string) {
    const next = this.selectedKey === key ? null : key;
    this.selectedKey = next; // instant feedback
    await this.puzzle?.selectReference(next);
  }

  /** Clear the board spotlight and deselect the chip (an external quick-clear,
   * e.g. the Escape key). No-op when nothing is selected. */
  clearSelection() {
    if (this.selectedKey === null) return;
    this.selectedKey = null;
    void this.puzzle?.selectReference(null);
  }

  protected override render() {
    // Register the reactive dependency so a board change re-renders (and
    // `updated` refetches the found status).
    void this.puzzle?.currentMove;

    const items = this.model?.items ?? [];
    return html`
      <div class="panel" role="region" aria-label="Domino reference">
        <header>
          <span class="title">Dominoes</span>
          <wa-button appearance="plain" size="small" @click=${this.handleClose}>
            <wa-icon name="xmark" library="system" label="Close reference"></wa-icon>
          </wa-button>
        </header>
        <p class="hint">Tap a domino to highlight where it can go.</p>
        <div class="grid">
          ${items.map((item) => {
            const [a, b] = item.pips ?? [];
            const selected = this.selectedKey === item.key;
            return html`
              <button
                  class="chip ${item.status} ${selected ? "selected" : ""}"
                  aria-pressed=${selected}
                  title="Domino ${item.label}${
                    item.status === "placed"
                      ? " — placed"
                      : item.status === "conflict"
                        ? " — placed more than once"
                        : ""
                  }"
                  @click=${() => this.handleItem(item.key)}
              >
                <span class="half">${item.pips ? a : item.label}</span>
                ${item.pips ? html`<span class="half">${b}</span>` : nothing}
                ${
                  item.status === "placed"
                    ? html`<wa-icon class="badge" name="check" library="system"></wa-icon>`
                    : item.status === "conflict"
                      ? html`<wa-icon class="badge warn" name="warning" library="system"></wa-icon>`
                      : nothing
                }
              </button>
            `;
          })}
        </div>
      </div>
    `;
  }

  static override styles = css`
    :host {
      /* Fills the area the puzzle screen's grid gives it: beside the board in
       * a landscape window, under it in a tall one. */
      box-sizing: border-box;
      display: block;
      min-width: 0;
      min-height: 0;
      background-color: var(--wa-color-surface-raised);
    }

    .panel {
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: var(--wa-space-s);
      overflow: hidden;
    }

    header {
      display: flex;
      align-items: center;
      gap: var(--wa-space-xs);
    }
    .title {
      font-weight: var(--wa-font-weight-semibold);
      margin-inline-end: auto;
    }
    .hint {
      margin: 0 0 var(--wa-space-xs);
      font-size: var(--wa-font-size-smaller);
      color: var(--wa-color-text-quiet);
    }

    .grid {
      flex: 1 1 auto;
      overflow-y: auto;
      display: flex;
      flex-wrap: wrap;
      gap: var(--wa-space-2xs);
      align-content: flex-start;
    }

    .chip {
      position: relative;
      display: inline-flex;
      padding: 0;
      border: var(--wa-border-width-s) solid var(--wa-color-neutral-border-normal);
      border-radius: var(--wa-border-radius-m);
      background: var(--wa-color-surface-default);
      color: var(--wa-color-text-normal);
      cursor: pointer;
      font: inherit;
      font-variant-numeric: tabular-nums;
      overflow: hidden;
    }
    .chip .half {
      min-width: 1.4em;
      padding: 0.25em 0;
      text-align: center;
      font-weight: var(--wa-font-weight-semibold);
    }
    .chip .half + .half {
      border-inline-start: var(--wa-border-width-s) solid
        var(--wa-color-neutral-border-normal);
    }
    .chip:hover {
      border-color: var(--wa-color-brand-border-normal);
    }
    .chip.selected {
      /* The board's COL_REFERENCE yellow (colors.ts YELLOW, light base), so
         panel and board agree. */
      border-color: oklch(0.86 0.168 100);
      box-shadow: 0 0 0 2px oklch(0.86 0.168 100);
    }
    .chip.placed {
      color: var(--wa-color-text-quiet);
      background: var(--wa-color-neutral-fill-quiet);
    }
    .chip.conflict {
      border-color: var(--wa-color-danger-border-normal);
      color: var(--wa-color-danger-text-normal);
    }
    .badge {
      position: absolute;
      inset-block-start: -0.25em;
      inset-inline-end: -0.25em;
      font-size: 0.7em;
      color: var(--wa-color-success-fill-loud);
      background: var(--wa-color-surface-raised);
      border-radius: 50%;
    }
    .badge.warn {
      color: var(--wa-color-danger-fill-loud);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "reference-panel": ReferencePanel;
  }
}
