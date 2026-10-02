import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement, nothing } from "lit";
import { query } from "lit/decorators/query.js";
import { customElement, state } from "lit/decorators.js";
import { puzzleContext } from "../puzzle/contexts.ts";
import type { Puzzle } from "../puzzle/puzzle.ts";
import { puzzlePageUrl } from "../routing.ts";
import { cssWATweaks } from "../utils/css.ts";
import { readGameLink } from "./game-link.ts";

// Register components
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/callout/callout.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/input/input.js";

@customElement("enter-gameid-dialog")
export class EnterGameIDDialog extends SignalWatcher(LitElement) {
  @consume({ context: puzzleContext, subscribe: true })
  @state()
  private puzzle?: Puzzle;

  @state()
  private gameid?: string;

  @state()
  private error?: string;

  /** Why the pasted link opens no game, shown on OK. */
  private linkError?: string;

  /** The puzzle a pasted link is for, when it is not this one: OK goes there. */
  @state()
  private otherPuzzle?: string;

  @query("wa-dialog", true)
  protected dialog?: HTMLElementTagNameMap["wa-dialog"];

  get open(): boolean {
    return this.dialog?.open ?? false;
  }
  set open(value: boolean) {
    if (this.dialog) {
      this.dialog.open = value;
    }
  }

  reset() {
    this.gameid = undefined;
    this.linkError = undefined;
    this.otherPuzzle = undefined;
    this.error = undefined;
  }

  protected override render() {
    const callout = this.error
      ? html`
          <wa-callout variant="danger">
            <wa-icon slot="icon" name="error"></wa-icon>
            <strong>That game won’t open.</strong>
            ${this.error}
          </wa-callout>
        `
      : this.puzzle?.totalMoves &&
          !this.otherPuzzle &&
          this.gameid !== this.puzzle.currentGameId
        ? html`
          <wa-callout variant="warning">
            <wa-icon slot="icon" name="warning"></wa-icon>
            This will replace the game in progress
          </wa-callout>
        `
        : nothing;

    return html`
      <wa-dialog>
        <div slot="label">Open a shared game</div>

        <wa-input
            autofocus
            .value=${this.gameid}
            @input=${this.handleInputChange}
            @focus=${this.handleInputFocus}
            @keydown=${this.handleInputKeydown}
        >
          <div slot="label">
            Paste the link to a game
          </div>
          <div slot="hint">
            The link someone sent you, from Share › This specific game
          </div>
        </wa-input>
        
        ${callout}

        <footer slot="footer">
          <wa-button
              @click=${this.handleCancelClick}
          >Cancel</wa-button>
          <wa-button
              variant="brand"
              ?disabled=${!this.gameid}
              @click=${this.handleOKClick}
          >OK</wa-button>
        </footer>
      </wa-dialog>
    `;
  }

  private handleInputChange(event: UIEvent) {
    const input = event.target as HTMLElementTagNameMap["wa-input"];
    const value = input.value?.trim() ?? "";
    const link = readGameLink(value);
    const game = link && "gameId" in link ? link : null;
    const gameid = game ? game.gameId : value;
    if (gameid !== this.gameid) {
      this.gameid = gameid;
      this.linkError = link && "error" in link ? link.error : undefined;
      this.otherPuzzle =
        game?.puzzleId && game.puzzleId !== this.puzzle?.puzzleId
          ? game.puzzleId
          : undefined;
      this.error = undefined;
    }
  }

  private handleInputFocus(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
  }

  private async handleInputKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.handleInputChange(event);
      if (this.gameid) {
        await this.handleOKClick();
      }
    }
  }

  private async handleOKClick() {
    if (this.linkError) {
      this.error = this.linkError;
      return;
    }
    if (this.otherPuzzle && this.gameid) {
      // The game in progress here stays saved; the puzzle's page reports an ID
      // it cannot load and falls back to its own board.
      window.location.assign(
        puzzlePageUrl({ puzzleId: this.otherPuzzle, puzzleGameId: this.gameid }),
      );
      return;
    }
    if (this.gameid && this.gameid === this.puzzle?.currentGameId) {
      // The link is to the board already being played: keep the moves.
      this.open = false;
      return;
    }
    if (this.puzzle && this.gameid) {
      const error = await this.puzzle.newGameFromId(this.gameid);
      if (error) {
        this.error = error;
      } else {
        this.open = false;
      }
    }
  }

  private handleCancelClick() {
    this.open = false;
  }

  static override styles = [
    cssWATweaks,
    css`
      :host {
        display: contents;
      }
  
      wa-dialog {
        --width: min(calc(100vw - 2 * var(--wa-space-l)), 35rem);
      }
  
      wa-dialog::part(body) {
        display: flex;
        flex-direction: column;
        gap: var(--wa-space-l);
      }
  
      footer {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        justify-content: end;
        align-items: center;
        gap: var(--wa-space-s);
      }
      
      wa-input::part(label) {
        margin-bottom: var(--wa-space-s);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "enter-gameid-dialog": EnterGameIDDialog;
  }
}
