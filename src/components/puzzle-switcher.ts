/**
 * **The quick-switch** — type a few letters, jump to any of the 57 games.
 *
 * It replaces the `Other puzzles` menu — a 57-item dropdown, wordless at phone
 * widths, which overflowed the puzzle screen's app bar at 390px. The owner
 * chose *replace*, not remove: a type-to-filter jump on `Ctrl/Cmd+K`, which
 * serves an experienced player better than a dropdown can and works from the
 * home screen too.
 *
 * **And a `Switch puzzle…` row in the Menu opens the same thing**, so a touch
 * player keeps the capability the menu provided. A keyboard-only affordance
 * would have quietly taken it away, which is not what "replace" was asked to
 * mean.
 *
 * ON THE `<dialog>`. Native, opened with `showModal()`, which brings the focus
 * trap, the inert background and the top layer with it rather than having them
 * hand-rolled. Escape is the one thing it does *not* get for free here: the
 * puzzle screen listens for Escape on `window` (it clears a reference
 * spotlight) and the board listens for keys of its own, so the handler below
 * stops an Escape that closed this dialog from traveling any further. The
 * `app-shell` Escape requirement is unaffected — that arm still runs whenever
 * this dialog is closed, which is every moment it is not on screen.
 *
 * The list is built from `puzzleIds` — the catalog itself — so a new game joins
 * by being in the catalog and by nothing else.
 */
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import {
  familyLabel,
  puzzleDataMap,
  puzzleIds,
  puzzlesInFamily,
} from "../puzzle/catalog.ts";
import { searchResults } from "../puzzle/catalog-search.ts";
import { puzzlePageUrl } from "../routing.ts";
import { settings } from "../store/settings.ts";
import { closeOnBackdropClick } from "../utils/dialog.ts";

/** How many recently played games head the list: a few, so the family's
 * games are still in view on a phone. */
const RECENT_SHOWN = 3;

import "@awesome.me/webawesome/dist/components/icon/icon.js";

@customElement("puzzle-switcher")
export class PuzzleSwitcher extends LitElement {
  /** The puzzle currently being played, marked in the list so a player can see
   * where they are. Empty on the home screen.
   *
   * A public `@property`, because the puzzle screen sets it as an attribute;
   * an `@state` field ignores attributes, which is how the "Playing" mark
   * once never appeared at all (`puzzle-switcher.test.ts` sets it the same
   * way). */
  @property()
  current = "";

  @state()
  private search = "";

  /** Index into {@link matches} of the row Enter would take. */
  @state()
  private active = 0;

  @query("dialog")
  private dialog?: HTMLDialogElement;

  @query("input")
  private input?: HTMLInputElement;

  /** Every game matching what has been typed, by the collection's one search
   * definition (`catalog-search.ts`) — so this box and the home screen's
   * cannot answer the same query differently.
   *
   * No game is ever excluded: this is a jump, not a catalog, and refusing to go
   * somewhere the player named would just be baffling. */
  private get hits(): readonly string[] {
    return this.sections.flatMap((s) => s.ids);
  }

  /**
   * The list in its groups, each under its heading, or one group with no
   * heading once anything is typed, where a search answers a question the
   * player has already asked.
   *
   * Before that, from a game: **Recently played**, the last few other games
   * played here, since the game a player switches to is most often one they
   * were just playing (owner, 2026-11-09); then **More like this**, the other
   * games in the current one's family, since opening the switcher from a game
   * is the moment a player asks "what else is like this?"; then the rest. A
   * game is listed once, in the first group that has it. On the home screen
   * nothing is current, and the list is the catalog.
   */
  private get sections(): readonly { label: string | null; ids: readonly string[] }[] {
    const family = puzzleDataMap[this.current]?.family;
    if (this.search.trim() || !family) {
      return [{ label: null, ids: searchResults(puzzleIds, this.search) }];
    }
    const recent = this.recent
      .filter((id) => id !== this.current)
      .slice(0, RECENT_SHOWN);
    const related = puzzlesInFamily(family).filter(
      (id) => id !== this.current && !recent.includes(id),
    );
    const rest = puzzleIds.filter(
      (id) => !recent.includes(id) && !related.includes(id),
    );
    return [
      { label: "Recently played", ids: recent },
      { label: `More ${familyLabel(family)}`, ids: related },
      { label: "All puzzles", ids: rest },
    ].filter((s) => s.ids.length > 0);
  }

  /** The puzzles played here, the most recently played first, as they stood
   * when the switcher last opened. */
  @state()
  private recent: readonly string[] = [];

  /** Show the switcher, cleared and focused. */
  open() {
    this.search = "";
    this.active = 0;
    void settings.recentlyPlayed().then((ids) => {
      this.recent = ids.filter((id) => id in puzzleDataMap);
    });
    this.dialog?.showModal();
    // After the update that renders the cleared value, or the caret lands in
    // the previous search.
    void this.updateComplete.then(() => this.input?.focus());
  }

  close() {
    this.dialog?.close();
  }

  protected override render() {
    const sections = this.sections;
    const hits = this.hits;
    let index = 0;
    return html`
      <dialog
          @keydown=${this.handleKeyDown}
          @close=${this.handleClose}
          @click=${closeOnBackdropClick}
      >
        <div part="panel">
          <label part="field">
            <wa-icon name="search" label="Search puzzles"></wa-icon>
            <input
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-label="Switch to puzzle"
                placeholder="Switch to a puzzle…"
                .value=${this.search}
                @input=${this.handleInput}
            >
          </label>
          ${
            hits.length > 0
              ? html`<ul part="list" role="listbox">
                  ${sections.map(
                    ({ label, ids }) =>
                      html`${
                        label === null
                          ? nothing
                          : html`<li part="group" role="presentation">${label}</li>`
                      }${repeat(
                        ids,
                        (id) => id,
                        (id) => this.renderMatch(id, index++ === this.active),
                      )}`,
                  )}
                </ul>`
              : html`<p part="empty">No puzzle matches “${this.search.trim()}”.</p>`
          }
        </div>
      </dialog>
    `;
  }

  private renderMatch(puzzleId: string, isActive: boolean) {
    const { name, objective } = puzzleDataMap[puzzleId];
    return html`
      <li role="option" aria-selected=${String(isActive)}>
        <a
            part="match"
            class=${isActive ? "active" : nothing}
            href=${puzzlePageUrl({ puzzleId })}
            tabindex="-1"
        >
          <span part="match-name">${name}</span>
          <span part="match-objective">${objective}</span>
          ${
            puzzleId === this.current
              ? html`<span part="match-current">Playing</span>`
              : nothing
          }
        </a>
      </li>
    `;
  }

  private handleInput(event: Event) {
    this.search = (event.target as HTMLInputElement).value;
    this.active = 0;
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const hits = this.hits;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.active = hits.length ? (this.active + 1) % hits.length : 0;
        this.scrollActiveIntoView();
        return;
      case "ArrowUp":
        event.preventDefault();
        this.active = hits.length ? (this.active - 1 + hits.length) % hits.length : 0;
        this.scrollActiveIntoView();
        return;
      case "Enter": {
        const puzzleId = hits[this.active];
        if (puzzleId) {
          event.preventDefault();
          window.location.href = puzzlePageUrl({ puzzleId }).toString();
        }
        return;
      }
      case "Escape":
        // The dialog closes itself; stop the same Escape from also reaching the
        // puzzle screen's window handler, which would clear a reference
        // spotlight the player never asked to lose.
        event.stopPropagation();
        return;
      default:
        // Every other key belongs to the input. Stopping them here keeps a
        // bare-letter app shortcut (`u`, `r`, `n`, `h`) from firing while
        // somebody is typing a puzzle's name.
        event.stopPropagation();
    }
  };

  private handleClose() {
    this.dispatchEvent(new Event("switcher-close", { bubbles: true, composed: true }));
  }

  private scrollActiveIntoView() {
    void this.updateComplete.then(() => {
      this.shadowRoot
        ?.querySelector("[part='match'].active")
        ?.scrollIntoView({ block: "nearest" });
    });
  }

  static override styles = css`
    :host {
      display: contents;
    }

    dialog {
      padding: 0;
      border: none;
      background: none;
      max-width: none;
      max-height: none;
      /* Sit high rather than centered: the list grows downward, and a panel
       * that re-centers on every keystroke is unreadable. */
      margin-block-start: 12vh;
      margin-inline: auto;

      &::backdrop {
        background-color: var(--wa-color-overlay-modal);
      }
    }

    [part="panel"] {
      box-sizing: border-box;
      width: min(32rem, calc(100vw - 2rem));
      display: flex;
      flex-direction: column;
      max-height: min(60vh, 32rem);

      background-color: var(--app-color-rail);
      color: var(--app-color-text);
      border: 1px solid var(--app-color-hairline);
      border-radius: var(--app-radius-container);
      box-shadow: var(--wa-shadow-l);
      overflow: hidden;
    }

    [part="field"] {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0.875rem;
      border-block-end: 1px solid var(--app-color-hairline);
      color: var(--app-color-text-quiet);

      input {
        flex: 1 1 auto;
        min-width: 0;
        border: none;
        background: none;
        outline: none;
        font: inherit;
        font-size: var(--app-font-size-item);
        color: var(--app-color-text);

        &::placeholder {
          color: var(--app-color-text-faint);
        }
      }
    }

    [part="list"] {
      flex: 1 1 auto;
      overflow-y: auto;
      margin: 0;
      padding: 0.25rem;
      list-style: none;
    }

    [part="match"] {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      /* Dense for a mouse — this is a list you scan — and a real tap target
       * wherever a finger is the pointer. */
      min-height: var(--app-row-rail);
      padding: 0.25rem 0.625rem;
      border-radius: var(--app-radius-control);
      text-decoration: none;
      color: inherit;

      @media (pointer: coarse) {
        min-height: var(--app-tap-min);
      }

      &.active {
        background-color: var(--app-color-row-rule);
      }
    }

    [part="match-name"] {
      flex: 0 0 auto;
      font-size: var(--app-font-size-body);
      font-weight: var(--wa-font-weight-semibold);
    }

    [part="match-objective"] {
      flex: 1 1 auto;
      min-width: 0;
      font-size: var(--app-font-size-detail);
      color: var(--app-color-text-quiet);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    [part="match-current"] {
      flex: 0 0 auto;
      font-family: var(--app-font-mono);
      font-size: var(--app-font-size-micro);
      color: var(--app-color-link);
    }

    [part="group"] {
      padding: 0.5rem 0.625rem 0.25rem;
      font-size: var(--app-font-size-micro);
      font-weight: var(--wa-font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--app-color-text-quiet);
    }

    [part="empty"] {
      margin: 0;
      padding: 1rem 0.875rem;
      font-size: var(--app-font-size-body);
      color: var(--app-color-text-quiet);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "puzzle-switcher": PuzzleSwitcher;
  }
}
