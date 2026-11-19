/**
 * A non-blocking, responsive "reference aid" panel: a game's inventory of
 * pieces, or its dictionary, with each item's status on the board, and a
 * click that spotlights an item.
 *
 * Generic over the game: it renders whatever the game's reference model is
 * (`ReferenceModel`), under the aid's title, narrowed by the search box and
 * filter buttons the model asks for (`reference-filter.ts`), and echoes clicks
 * back through `Puzzle.selectReference`. It is only ever mounted when
 * `puzzle.referenceTitle` is not null.
 *
 * Presentation is deliberately NOT a modal: it is a region of the puzzle
 * screen's grid (`puzzle/layout.ts`), so the board stays visible and
 * interactive while the panel is open.
 */

import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { ReferenceItem, ReferenceModel } from "../engine/types.ts";
import { puzzleContext } from "../puzzle/contexts.ts";
import type { Puzzle } from "../puzzle/puzzle.ts";
import { narrowReference } from "./reference-filter.ts";

import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

/** What an item's tooltip adds to its label for its status. */
const STATUS_WORDS: Readonly<Record<ReferenceItem["status"], string>> = {
  outstanding: "",
  placed: ", placed",
  conflict: ", placed more than once",
  ruledOut: ", ruled out",
};

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

  /** The search text and the pressed filter (`0`, "All"): the panel's view of
   * the list, never the game's, kept while open and reset for another game. */
  @state()
  private query = "";
  @state()
  private pressed = 0;

  /** Which (puzzle, move, hint step) the current `model` was fetched for, so
   * we refetch once per change of the board or of the hint's marked items
   * rather than on every render. */
  private fetchedPuzzle?: Puzzle;
  private fetchedFor = "";

  protected override updated() {
    const puzzle = this.puzzle;
    if (!puzzle) return;
    const at = `${puzzle.currentMove}\n${puzzle.activeHintExplanation}`;
    if (this.fetchedPuzzle !== puzzle || this.fetchedFor !== at) {
      if (this.fetchedPuzzle !== puzzle) {
        this.query = "";
        this.pressed = 0;
      }
      this.fetchedPuzzle = puzzle;
      this.fetchedFor = at;
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
    const puzzle = this.puzzle;
    if (!puzzle) return;
    await puzzle.selectReference(next);
    // The game decides what a selection leaves selected: Wordguess writes the
    // word into its row and keeps nothing selected in the list.
    await this.refresh(puzzle);
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
    void this.puzzle?.activeHintExplanation;

    const model = this.model;
    const title = this.puzzle?.referenceTitle;
    if (model === null || !title) return nothing;
    const hinted = new Set(model.hinted);
    const { sections, buttons } = narrowReference(model, this.query, this.pressed);
    return html`
      <div class="panel" role="region" aria-label=${title}>
        <header>
          <span class="title">${title}</span>
          <wa-button appearance="plain" size="small" @click=${this.handleClose}>
            <wa-icon name="xmark" library="system" label="Close ${title.toLowerCase()}"></wa-icon>
          </wa-button>
        </header>
        <p class="hint">${model.instructions}</p>
        ${
          model.search
            ? html`<input
                class="search"
                type="search"
                placeholder="Search"
                aria-label="Search the ${title.toLowerCase()}"
                autocomplete="off"
                spellcheck="false"
                .value=${this.query}
                @input=${(e: Event) => {
                  this.query = (e.target as HTMLInputElement).value;
                }}
                @keydown=${(e: KeyboardEvent) => {
                  // Typed letters are the search's, never the board's keys.
                  if (e.key !== "Escape") e.stopPropagation();
                }}
              />`
            : nothing
        }
        ${
          buttons.length === 0
            ? nothing
            : html`<div class="filters" role="group" aria-label="Show">
                ${buttons.map(
                  (b, i) => html`<button
                    class="filter"
                    aria-pressed=${i === this.pressed}
                    @click=${() => {
                      this.pressed = i;
                    }}
                  >
                    ${b.label} <span class="count">${b.count}</span>
                  </button>`,
                )}
              </div>`
        }
        <div class="sections">
          ${sections.map(
            (section) => html`
              ${section.heading === null ? nothing : html`<h3>${section.heading}</h3>`}
              <div class="grid">
                ${section.items.map((item) => this.renderItem(item, hinted.has(item.key)))}
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  private renderItem(item: ReferenceItem, hinted: boolean) {
    const [a, b] = item.pips ?? [];
    const selected = this.selectedKey === item.key;
    // The name, not only the tooltip, so a screen reader hears the status.
    const described = `${item.label}${STATUS_WORDS[item.status]}${hinted ? ", in the hint" : ""}`;
    return html`
      <button
          class="chip ${item.status} ${selected ? "selected" : ""} ${hinted ? "hinted" : ""}"
          aria-pressed=${selected}
          aria-label=${described}
          title=${described}
          @click=${() => this.handleItem(item.key)}
      >
        ${
          item.pips
            ? html`<span class="half">${a}</span><span class="half">${b}</span>`
            : html`<span class="word">${item.label}</span>`
        }
        ${
          item.status === "placed"
            ? html`<wa-icon class="badge" name="check" library="system"></wa-icon>`
            : item.status === "conflict"
              ? html`<wa-icon class="badge warn" name="warning" library="system"></wa-icon>`
              : nothing
        }
      </button>
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

    .search {
      box-sizing: border-box;
      width: 100%;
      margin: 0 0 var(--wa-space-xs);
      padding: var(--wa-space-2xs) var(--wa-space-xs);
      border: var(--wa-border-width-s) solid var(--wa-color-neutral-border-normal);
      border-radius: var(--wa-border-radius-m);
      background: var(--wa-color-surface-default);
      color: var(--wa-color-text-normal);
      font: inherit;
    }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--wa-space-2xs);
      margin: 0 0 var(--wa-space-xs);
    }
    .filter {
      padding: var(--wa-space-3xs) var(--wa-space-xs);
      border: var(--wa-border-width-s) solid var(--wa-color-neutral-border-normal);
      border-radius: var(--wa-border-radius-pill);
      background: var(--wa-color-surface-default);
      color: var(--wa-color-text-normal);
      cursor: pointer;
      font: inherit;
      font-size: var(--wa-font-size-smaller);
    }
    .filter[aria-pressed="true"] {
      border-color: var(--wa-color-brand-border-loud);
      background: var(--wa-color-brand-fill-quiet);
      color: var(--wa-color-brand-on-quiet);
    }
    .filter .count {
      font-variant-numeric: tabular-nums;
      color: var(--wa-color-text-quiet);
    }

    .sections {
      flex: 1 1 auto;
      overflow-y: auto;
    }
    h3 {
      margin: var(--wa-space-xs) 0 var(--wa-space-2xs);
      font-size: var(--wa-font-size-smaller);
      font-weight: var(--wa-font-weight-semibold);
      color: var(--wa-color-text-quiet);
    }

    .grid {
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
    .chip .word {
      padding: 0.25em 0.5em;
      font-weight: var(--wa-font-weight-semibold);
      letter-spacing: 0.05em;
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
    .chip.ruledOut {
      color: var(--wa-color-text-quiet);
      border-style: dashed;
      text-decoration: line-through;
    }
    /* After the statuses, so a word the hint names reads as the hint's even
       where it is placed or ruled out. */
    .chip.hinted {
      border-color: var(--app-color-hint-border);
      background: var(--app-color-hint-surface);
      color: var(--wa-color-text-normal);
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
