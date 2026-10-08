import { SignalWatcher } from "@lit-labs/signals";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { query } from "lit/decorators/query.js";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { showAlert } from "../dialogs/alert-dialog.ts";
import { showToast } from "../dialogs/toast.ts";
import { assertNever } from "../engine/assert-never.ts";
import { PENCIL_MODE_BUTTON } from "../engine/pointer.ts";
import { type PuzzleData, puzzleDataMap } from "../puzzle/catalog.ts";
import { MIN_BAR_LENGTH } from "../puzzle/command-list.ts";
import type { PuzzleBarFitEvent } from "../puzzle/components/bar.ts";
import type { PuzzleEvent } from "../puzzle/components/context.ts";
import type { SwapButtonsEvent } from "../puzzle/components/game-controls.ts";
import type { PuzzleKeyUnhandledEvent } from "../puzzle/components/view-interactive.ts";
import { dealNewGame } from "../puzzle/deal-actions.ts";
import {
  gridLayout,
  gridTemplateAreas,
  menuFits,
  type WindowShape,
  windowShape,
} from "../puzzle/layout.ts";
import type { Puzzle } from "../puzzle/puzzle.ts";
import {
  CHECK_OUT_OF_REACH,
  checkAndSave,
  mistakesFound,
  quickLoadPuzzle,
} from "../puzzle/quick-save-actions.ts";
import { bareCommand, chordCommand } from "../puzzle/shortcuts.ts";
import { helpUrl, homePageUrl } from "../routing.ts";
import { savedGames } from "../store/saved-games.ts";
import { settings } from "../store/settings.ts";
import { cssWATweaks } from "../utils/css.ts";
import { closeOnBackdropClick } from "../utils/dialog.ts";
import { preventDoubleTapZoomOnButtons } from "../utils/events.ts";
import { debounced, sleep } from "../utils/timing.ts";
import { windowSize } from "../utils/window-size.ts";
import { Screen } from "./screen.ts";

// Register components
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/divider/divider.js";
import "@awesome.me/webawesome/dist/components/dropdown/dropdown.js";
import "@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/skeleton/skeleton.js";
import "../components/dynamic-content.ts";
import "../components/reference-panel.ts";
import "../puzzle/components/bar.ts";
import "../puzzle/components/context.ts";
import "../puzzle/components/game-controls.ts";
import "../puzzle/components/menu.ts";
import "../puzzle/components/type-menu.ts";
import "../puzzle/components/timer.ts";
import "../components/puzzle-switcher.ts";
import "../puzzle/components/view-interactive.ts";
import "../puzzle/components/end-notification.ts";

@customElement("puzzle-screen")
export class PuzzleScreen extends SignalWatcher(Screen) {
  /** The puzzle type, e.g. "blackbox" */
  @property({ type: String, attribute: "puzzleid" })
  puzzleId = "";

  /** A game ID or random seed, including encoded params */
  @property({ type: String, attribute: "gameid" })
  gameId?: string;

  /** Encoded params (ignored when puzzle-gameid provided) */
  @property({ type: String, attribute: "params" })
  params?: string;

  /** Dev-only icon-capture mode (set by `?screenshot`; see
   * `src/puzzle/icon-capture.ts`). Honored only in dev builds. */
  @property({ type: Boolean })
  screenshot = false;

  @state()
  private puzzleData?: PuzzleData;

  @state()
  private puzzleLoaded = false;

  @state()
  swapMouseButtons = false; // MouseButtonToggle current value

  /** Whether the (non-blocking) reference panel is docked open. Only meaningful
   * for a game whose `hasReference` is true (the toggle button only shows then). */
  @state()
  private referenceOpen = false;

  /** How many of the command list's leading entries the Bar has room for. The
   * Bar measures it and the Menu starts where it stops, so the two are given
   * the same number in the same render. */
  @state()
  private barLength = MIN_BAR_LENGTH;

  /** What the player last did with the Menu in this layout: opened it, closed
   * it, or nothing yet (`null`), which leaves it open exactly when it docks. */
  @state()
  private menuChoice: boolean | null = null;

  /** The window's shape, for the styles that follow it. */
  @property({ type: String, reflect: true })
  shape: WindowShape = "wide";

  /** The shape and docking the Menu's state was last chosen in. */
  private menuChoiceFor = "";

  @query("puzzle-context")
  private puzzleContext?: HTMLElementTagNameMap["puzzle-context"];

  get puzzle(): Puzzle | null {
    return this.puzzleContext?.puzzle ?? null;
  }

  /** If the current game has been saved or loaded, its filename. */
  savedFilename?: string;
  savedGameId: string | null = null;

  private _autoSaveFilename: string | null = null;
  private get autoSaveFilename(): string | null {
    return this._autoSaveFilename;
  }
  private set autoSaveFilename(value: string | null) {
    // Persist autoSaveFilename in history state; restored in connectedCallback
    this._autoSaveFilename = value;
    const newState = {
      ...window.history.state,
      puzzleAutoSavePuzzleId: this.puzzleId,
      puzzleAutoSaveFilename: value,
    };
    window.history.replaceState(newState, "");
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", preventDoubleTapZoomOnButtons);
    window.addEventListener("keydown", this.handleBubbledKeyDown);
    const { puzzleAutoSaveFilename, puzzleAutoSavePuzzleId } =
      window.history.state ?? {};
    if (
      typeof puzzleAutoSaveFilename === "string" &&
      puzzleAutoSavePuzzleId === this.puzzleId
    ) {
      this._autoSaveFilename = puzzleAutoSaveFilename;
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", preventDoubleTapZoomOnButtons);
    window.removeEventListener("keydown", this.handleBubbledKeyDown);
  }

  protected override willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("puzzleId") && this.puzzleId) {
      const data = puzzleDataMap[this.puzzleId];
      if (!data) {
        throw new Error(`Unknown puzzleId ${this.puzzleId}`);
      }
      this.puzzleData = data;
      this.autoSaveFilename = null;
      this.puzzleLoaded = false;
      this.referenceOpen = false; // a new puzzle type may have no reference
      this.defaultHelpLabel = `${this.puzzleData.name} Help`;
    }
    // Crossing into another window shape, or losing the room to dock, switches
    // at once to that layout's own Menu state. What was chosen is in the
    // settings and stays there.
    const { shape, menuDocks } = this.layout;
    this.shape = shape;
    const menuChoiceFor = `${shape} ${menuDocks ? "docked" : "over"}`;
    if (menuChoiceFor !== this.menuChoiceFor) {
      this.menuChoiceFor = menuChoiceFor;
      this.menuChoice = null;
    }
  }

  protected override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    // A modal dialog is opened by a call, not by an attribute.
    const over = this.menuOver;
    if (over && this.menuOpen !== over.open) {
      if (this.menuOpen) over.showModal();
      else over.close();
    }
  }

  override render() {
    if (!this.puzzleData) {
      throw new Error("PuzzleScreen.render without puzzleData");
    }

    if (this.screenshot && import.meta.env.DEV) {
      return this.renderCaptureMode();
    }

    return html`
      <puzzle-context 
          puzzleid=${this.puzzleId}
          @puzzle-loaded=${this.handlePuzzleLoaded}
          @puzzle-params-change=${this.handlePuzzleParamsChange}
          @puzzle-game-state-change=${this.handlePuzzleGameStateChange}
      >
        ${this.renderPanels()}

        <puzzle-switcher current=${this.puzzleId}></puzzle-switcher>
        ${settings.showEndNotification ? this.renderEndNotification() : nothing}
        <dynamic-content></dynamic-content>
      </puzzle-context>
    `;
  }

  /**
   * The layout in force: the window's shape, the player's choices for that
   * shape over its default, and whether the Menu can dock.
   *
   * A Menu that cannot dock without squeezing the board opens over it instead.
   * The stored choice is read here and never written, so it is in force again
   * when the window has the room.
   */
  private get layout() {
    const { width, height, rem } = windowSize.get();
    const shape = windowShape(width, height, rem);
    const choice = settings.layoutFor(shape);
    return {
      shape,
      choice,
      controlsSide: settings.layoutControlsSide,
      menuDocks: choice.keepMenuOpen && menuFits(width, height, rem, choice),
    };
  }

  /** Whether the Menu is showing: what the player last did with it in this
   * layout, or open exactly when it docks. */
  private get menuOpen(): boolean {
    return this.menuChoice ?? this.layout.menuDocks;
  }

  /**
   * The three panels and the board, as one grid whose areas the layout
   * chooses (`puzzle/layout.ts`). Each panel names its area and nothing else,
   * so where a panel docks is a property of the template and never of the
   * panel.
   */
  private renderPanels(): TemplateResult {
    const { shape, choice, controlsSide, menuDocks } = this.layout;
    const menuOpen = this.menuOpen;
    const grid = gridLayout({
      shape,
      controlsSide,
      bar: choice.bar,
      controls: choice.controls,
      menuDocked: menuDocks && menuOpen,
      reference: this.referenceOpen,
    });
    const gridStyle = styleMap({
      gridTemplateAreas: gridTemplateAreas(grid.areas),
      gridTemplateColumns: grid.columns.join(" "),
      gridTemplateRows: grid.rows.join(" "),
    });
    return html`
      <main class="controls-${controlsSide}" style=${gridStyle}>
        ${this.renderTopBar()}

        <div class="board-area">
          <puzzle-view-interactive
              role="figure"
              aria-label="interactive puzzle displayed as an image"
              ?longPress=${settings.rightButtonLongPress}
              ?swapMouseButtons=${this.swapMouseButtons}
              ?twoFingerTap=${settings.rightButtonTwoFingerTap}
              secondaryButtonAudioVolume=${settings.rightButtonAudioVolume}
              secondaryButtonHoldTime=${settings.rightButtonHoldTime}
              secondaryButtonDragThreshold=${settings.rightButtonDragThreshold}
              max-scale=${settings.maxScale}
              @puzzle-key-unhandled=${this.handleUnhandledPuzzleKey}
          >
            <wa-skeleton slot="loading" effect="sheen"></wa-skeleton>
          </puzzle-view-interactive>
        </div>

        ${this.renderWords()}

        <puzzle-game-controls
            along=${choice.controls}
            ?swap-buttons=${this.swapMouseButtons}
            ?reference-open=${this.referenceOpen}
            @puzzle-swap-buttons=${this.handleSwapButtons}
            @click=${this.handleChromeClick}
        ></puzzle-game-controls>

        <puzzle-bar
            along=${choice.bar}
            length=${this.barLength}
            ?menu-first=${choice.bar === "bottom" && controlsSide === "right"}
            ?menu-open=${menuOpen}
            @puzzle-bar-fit=${this.handleBarFit}
            @puzzle-menu-toggle=${this.toggleMenu}
            @click=${this.handleChromeClick}
        ></puzzle-bar>

        ${
          menuDocks && menuOpen
            ? html`<aside
                  class="menu-dock"
                  aria-label="Menu"
                  @click=${this.handleChromeClick}
                  @puzzle-menu-close=${this.toggleMenu}
              >${this.renderMenu()}</aside>`
            : nothing
        }
        ${
          this.referenceOpen
            ? html`<reference-panel
                @reference-close=${this.handleReferenceClose}
              ></reference-panel>`
            : nothing
        }
      </main>

      ${
        menuDocks
          ? nothing
          : html`<dialog
                class="menu-over ${shape === "tall" ? "sheet" : `drawer-${controlsSide === "right" ? "left" : "right"}`}"
                aria-label="Menu"
                @click=${this.handleMenuOverClick}
                @close=${this.handleMenuOverClosed}
                @keydown=${this.handleMenuOverKeyDown}
                @wa-select=${this.handleMenuOverSelect}
                @puzzle-menu-close=${this.toggleMenu}
            >${this.renderMenu()}</dialog>`
      }
    `;
  }

  /** The Menu's content, the same whether it is docked or over the board. */
  private renderMenu(): TemplateResult {
    return html`
      <puzzle-menu
          bar-length=${this.barLength}
          gameName=${this.puzzleData?.name ?? ""}
          helpHref=${helpUrl(this.puzzleId).href}
      ></puzzle-menu>
    `;
  }

  /**
   * The readout row: back, the game's name, its parameter chips, then the
   * solve timer when the player has it on. **Readouts, not commands**, in one
   * row at 320px: the commands are in the three panels, so nothing here
   * competes for the width.
   *
   * **The move counter is not here.** It is the timeline control, and the
   * Menu's Board group carries it. It was the widest item in the row, and with
   * the timer on it squeezed the game's name to two letters.
   */
  private renderTopBar(): TemplateResult {
    return html`
      <header class="top-bar">
        <a class="top-back" href=${homePageUrl().href} aria-label="All puzzles">
          <wa-icon name="back-to-catalog"></wa-icon>
          <span class="top-back-label">All puzzles</span>
        </a>
        <h1 class="top-name">${this.puzzleData?.name ?? ""}</h1>
        <puzzle-type-menu
            class="top-chips"
            presentation="chips"
            placement="bottom"
        ></puzzle-type-menu>
        <puzzle-timer></puzzle-timer>
      </header>
    `;
  }

  /**
   * What the app has to say about the board, under it at every size: the
   * game's status line, the hint's explanation, and a deal still being looked
   * for.
   *
   * **None of it is in a panel**, so showing or clearing a hint moves no
   * control: the board gives up the height. It sits above a bottom Bar, where
   * a thumb resting on the controls cannot cover the sentence that explains
   * the move.
   */
  private renderWords(): TemplateResult {
    const puzzle = this.puzzle;
    const explanation = puzzle?.activeHintExplanation || puzzle?.helpMessage;
    const status = puzzle?.wantsStatusbar ? puzzle.statusbarText : null;
    return html`
      <div class="words">
        ${
          // A status line is part of the board, not a command: Flood's move
          // limit, Mines' remaining count. Absent, not blank, for a game with
          // nothing to say.
          status ? html`<div class="status" role="status">${status}</div>` : nothing
        }
        ${
          explanation
            ? html`<div class="hint" role="status">
                ${
                  puzzle?.hintJourney
                    ? html`<span class="hint-journey">${puzzle.hintJourney}</span>`
                    : nothing
                }
                ${explanation}
              </div>`
            : nothing
        }
        ${
          // Apart from the hint: the board in play takes moves and hints while
          // a deal is looked for, and the way out stays in reach through them.
          puzzle?.dealMessage
            ? html`<div class="deal" @click=${this.handleChromeClick}>
                <span role="status">${puzzle.dealMessage}</span>
                ${
                  puzzle.canStopDeal
                    ? html`<button type="button" data-command="stop-deal">Stop</button>`
                    : nothing
                }
              </div>`
            : nothing
        }
      </div>
    `;
  }

  /**
   * Minimal dev-only layout for `?screenshot` icon capture: just the
   * canvas plus a capture bar (re-roll the board, then capture both
   * committed icon PNGs). Keeps `puzzle-context` so the puzzle still
   * loads and renders. See `src/puzzle/icon-capture.ts`.
   */
  private renderCaptureMode(): TemplateResult {
    return html`
      <puzzle-context
          puzzleid=${this.puzzleId}
          @puzzle-loaded=${this.handlePuzzleLoaded}
          @puzzle-params-change=${this.handlePuzzleParamsChange}
          @puzzle-game-state-change=${this.handlePuzzleGameStateChange}
      >
        <main class="capture-mode">
          <header class="capture-bar">
            <span class="capture-title">Icon capture · ${
              this.puzzleData?.name ?? this.puzzleId
            }</span>
            <wa-button
                size="small" appearance="filled" variant="neutral"
                data-command="new-game"
            >
              <wa-icon slot="start" name="new-game"></wa-icon>
              New game
            </wa-button>
            <wa-button
                size="small" appearance="filled" variant="brand"
                data-command="capture-icons"
                ?disabled=${!this.puzzleLoaded}
            >
              <wa-icon slot="start" name="copy-image"></wa-icon>
              Capture icons
            </wa-button>
          </header>

          <puzzle-view-interactive
              role="figure"
              aria-label="interactive puzzle displayed as an image"
              max-scale=${settings.maxScale}
          >
            <wa-skeleton slot="loading" effect="sheen"></wa-skeleton>
          </puzzle-view-interactive>
        </main>

        <dynamic-content></dynamic-content>
      </puzzle-context>
    `;
  }

  private renderEndNotification() {
    const otherPuzzlesUrl = homePageUrl().href;
    return html`
      <puzzle-end-notification>
        <wa-button
            slot="extra-actions-solved"
            data-command="share"
        >
          <wa-icon slot="start" name="share"></wa-icon>
          Share
        </wa-button>
        <wa-button
            slot="extra-actions-solved"
            data-command="change-type"
        >
          <wa-icon slot="start" name="puzzle-type"></wa-icon>
          Change type
        </wa-button>
        <wa-button
            slot="extra-actions-solved"
            href=${otherPuzzlesUrl}
        >
          <wa-icon slot="start" name="back-to-catalog"></wa-icon>
          Other puzzles
        </wa-button>
      </puzzle-end-notification>
    `;
  }

  private handleSwapButtons = (event: SwapButtonsEvent) => {
    this.swapMouseButtons = event.detail.swap;
  };

  private handleBarFit = (event: PuzzleBarFitEvent) => {
    this.barLength = event.detail.length;
  };

  //
  // Commands
  //

  protected override registerCommandHandlers() {
    super.registerCommandHandlers();
    Object.assign(this.commandMap, {
      "capture-icons": this.handleCaptureIcons,
      "change-type": this.showTypeMenu,
      "check-and-save": this.handleCheckAndSave,
      "check-only": this.handleCheckOnly,
      "quick-load": this.handleQuickLoad,
      undo: () => this.puzzle?.undo(),
      redo: () => this.puzzle?.redo(),
      "mark-all": this.handleMarkAll,
      "toggle-pencil-mode": this.handleTogglePencilMode,
      "toggle-auto-hint": this.handleAutoHintToggle,
      "switch-puzzle": this.openPuzzleSwitcher,
      "copy-image": () => this.puzzle?.copyImage(),
      "enter-gameid": this.showEnterGameIDDialog,
      "load-game": this.showLoadGameDialog,
      "new-game": () => this.puzzle && dealNewGame(this.puzzle),
      "stop-deal": () => this.puzzle?.stopDeal(),
      redraw: () => this.shadowRoot?.querySelector("puzzle-view-interactive")?.redraw(),
      "restart-game": () => this.puzzle?.restartGame(),
      "save-game": this.showSaveGameDialog,
      "toggle-reference": this.toggleReference,
      share: this.showShareDialog,
      solve: () => this.puzzle?.solve(),
      hint: () => this.puzzle?.hint(),
    });
  }

  /**
   * Give the keyboard back to the board.
   *
   * Every control here is a one-shot action on the puzzle, and the board is
   * what the player wants to be typing at once it has run. Nothing else does
   * it: the game menu focuses its own trigger as it closes, a clicked button
   * keeps focus on itself, and `handleBubbledKeyDown`'s redirect only steps in
   * when *nothing at all* is focused — so without this a single click leaves
   * the board deaf in every keyboard-playable game.
   *
   * Always deferred a microtask, because both `wa-dropdown` (as it closes) and
   * a clicked button focus themselves out from under us otherwise.
   */
  private focusBoard() {
    queueMicrotask(() => {
      this.shadowRoot
        ?.querySelector("puzzle-view-interactive")
        ?.focus({ preventScroll: true });
    });
  }

  /**
   * Commands — the game menu, and every `data-command` control.
   *
   * Commands that open a dialog need no exception: the dialog takes focus for
   * itself when it opens, and because we moved focus first it hands it back to
   * the *board* when it closes, rather than to whichever button opened it.
   */
  protected override handleCommand(command: string): boolean {
    const handled = super.handleCommand(command);
    if (handled) {
      // A command chosen from a Menu that is over the board has been chosen:
      // a menu that stays open over the result of its own command is covering
      // the thing the player asked to see. A docked Menu covers nothing.
      this.closeMenuOver();
      this.focusBoard();
    }
    return handled;
  }

  /**
   * A click anywhere in the chrome hands the keyboard back to the board.
   *
   * Two things must NOT hand focus over. A click that *opens* a menu, because
   * the open menu needs the focus for its own arrow-key navigation — hence the
   * `slot="trigger"` test. And a keyboard activation (tab to the control, press
   * Enter), which arrives as a click with `detail === 0`: that user is moving
   * through the tab order deliberately and would not thank us for throwing them
   * out of it. Only a real pointer click hands the keyboard back.
   *
   * This is separate from `handleCommand`'s own `focusBoard` because a control
   * may be a `data-command` *and* a menu trigger; the composed-path test is
   * what tells them apart, and only a real event carries a path.
   */
  private handleChromeClick = (event: MouseEvent) => {
    if (event.detail === 0) return;
    const opensAMenu = event
      .composedPath()
      .some((el) => el instanceof HTMLElement && el.getAttribute("slot") === "trigger");
    if (!opensAMenu) this.focusBoard();
  };

  /** Toggle the non-blocking reference panel (the toolbar reference button and
   * the game menu both route here via `data-command="toggle-reference"`).
   * Closing deliberately KEEPS any board spotlight: on a small screen the common
   * flow is mark a domino, close the (large) panel to see the board, then place
   * it. Escape (or re-clicking the chip) clears the spotlight. */
  private toggleReference() {
    this.referenceOpen = !this.referenceOpen;
  }

  private handleReferenceClose = () => {
    this.referenceOpen = false;
  };

  private async showShareDialog(panel?: string) {
    await import("../dialogs/share-dialog.ts");
    const dialog = await this.dynamicContent?.addItem({
      tagName: "share-dialog",
      render: () => html`<share-dialog></share-dialog>`,
    });
    if (dialog && !dialog.open) {
      await dialog.reset();
      dialog.open = true;
    }
    if (dialog && panel) {
      await dialog.updateComplete;
      await dialog.showPanel(panel);
    }
  }

  private async showLoadGameDialog() {
    await import("../dialogs/saved-game-dialogs.ts");
    const dialog = await this.dynamicContent?.addItem({
      tagName: "load-game-dialog",
      render: () => html`
        <load-game-dialog
            puzzleid=${this.puzzleId}
            @load-game-import=${this.handleImportGame}
            @load-game-load=${this.handleLoadGame}
        ></load-game-dialog>
      `,
    });
    if (dialog && !dialog.open) {
      const puzzle = this.shadowRoot?.querySelector("puzzle-context")?.puzzle;
      dialog.gameInProgress = (puzzle?.totalMoves ?? 0) > 0;
      dialog.open = true;
    }
  }

  private async showSaveGameDialog() {
    await import("../dialogs/saved-game-dialogs.ts");
    const dialog = await this.dynamicContent?.addItem({
      tagName: "save-game-dialog",
      render: () => html`
        <save-game-dialog
            puzzleid=${this.puzzleId}
            @save-game-export=${this.handleExportGame}
            @save-game-save=${this.handleSaveGame}
        ></save-game-dialog>
      `,
    });
    if (dialog && !dialog.open) {
      dialog.filename =
        this.savedFilename ?? (await savedGames.makeUntitledFilename(this.puzzleId));
      dialog.open = true;
    }
  }

  private async showEnterGameIDDialog() {
    await import("../dialogs/enter-gameid-dialog.ts");
    const dialog = await this.dynamicContent?.addItem({
      tagName: "enter-gameid-dialog",
      render: () => html`<enter-gameid-dialog></enter-gameid-dialog>`,
    });
    if (dialog && !dialog.open) {
      dialog.reset();
      dialog.open = true;
    }
  }

  private handleLoadGame = async (event: HTMLElementEventMap["load-game-load"]) => {
    // (dynamic-content event listener: must be self-bound function)
    const dialog = event.target as HTMLElementTagNameMap["load-game-dialog"];
    const { filename } = event.detail;
    const puzzle = this.shadowRoot?.querySelector("puzzle-context")?.puzzle;
    if (puzzle && filename) {
      event.preventDefault(); // we'll close the dialog if successful
      const { error, gameId } = await savedGames.loadGame(puzzle, filename);
      if (error !== undefined) {
        // TODO: display error in dialog (like enter-gameid-dialog does)
        await showAlert({
          label: "Unable to load game",
          message: error,
          type: "error",
        });
      } else if (gameId) {
        this.savedGameId = gameId;
        this.savedFilename = filename;
        dialog.open = false;
      }
    }
  };

  private handleSaveGame = async (event: HTMLElementEventMap["save-game-save"]) => {
    // (dynamic-content event listener: must be self-bound function)
    const dialog = event.target as HTMLElementTagNameMap["save-game-dialog"];
    const { filename } = event.detail;
    const puzzle = this.shadowRoot?.querySelector("puzzle-context")?.puzzle;
    if (puzzle && filename) {
      event.preventDefault(); // we'll close the dialog if successful
      await savedGames.saveGame(puzzle, filename);
      this.savedGameId = puzzle.currentGameId;
      this.savedFilename = filename;
      dialog.open = false;
    }
  };

  private handleImportGame = async (
    _event: HTMLElementEventMap["load-game-import"],
  ) => {
    // (dynamic-content event listener: must be self-bound function)
    const puzzle = this.shadowRoot?.querySelector("puzzle-context")?.puzzle;
    if (puzzle) {
      const input = Object.assign(document.createElement("input"), {
        type: "file",
        multiple: false,
        accept: ".sav,.sgt,.sgtpuzzle,.txt",
        onchange: async () => {
          const file = input.files?.[0];
          if (file) {
            const data = new Uint8Array(await file.arrayBuffer());
            const errorMessage = await puzzle.loadGame(data);
            if (errorMessage) {
              await showAlert({
                label: "Unable to import game",
                message: `${file.name}: ${errorMessage}`,
                type: "error",
              });
            }
          }
        },
        onerror: async (error: unknown) => {
          await showAlert({
            label: "Unable to import game",
            message: String(error),
            type: "error",
          });
        },
      });
      input.click();
    }
  };

  private handleExportGame = async (event: HTMLElementEventMap["save-game-export"]) => {
    // (dynamic-content event listener: must be self-bound function)
    const puzzle = this.shadowRoot?.querySelector("puzzle-context")?.puzzle;
    if (puzzle) {
      const type = "application/octet-stream"; // or text/plain, or a type registered to us (upstream uses octet-stream)
      const data = await puzzle.saveGame();
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toLocaleString();
      const filename = event.detail.filename || `${puzzle.displayName} ${dateStr}`;
      const anchor = Object.assign(document.createElement("a"), {
        href: url,
        download: `${filename}.sav`,
        type,
      });
      anchor.click();
      await sleep(10);
      URL.revokeObjectURL(url);
    }
  };

  private async handleCaptureIcons() {
    // Dev-only: produce the two committed icon PNGs from the live board.
    // A prototype method, not an arrow field, so it exists when the base-class
    // constructor calls registerCommandHandlers.
    const puzzle = this.puzzle;
    if (!puzzle) return;
    const { captureIcons } = await import("../puzzle/icon-capture.ts");
    await captureIcons(puzzle, this.puzzleId);
  }

  /**
   * Combined Check-&-Save (shared with the toolbar button and Cmd/Ctrl+S
   * — logic in `quick-save-actions.ts`). A prototype method, not an arrow
   * field, so it exists when the base-class constructor calls
   * `registerCommandHandlers`.
   */
  private async handleCheckAndSave() {
    if (this.puzzle) await checkAndSave(this.puzzle);
  }

  /** Restore the quick-save slot for the current puzzle — `Back to last save`. */
  private async handleQuickLoad() {
    if (this.puzzle) await quickLoadPuzzle(this.puzzle);
  }

  /**
   * `Check without saving` — the quiet sibling of Check & save: the same check
   * (`Puzzle.check`), without the save.
   *
   * The combined command is deliberate and is what most players want: it
   * verifies first and refuses to save over a mistake, so a saved checkpoint is
   * a known-good one. What it cannot serve is a narrow case created by the
   * store: **the quick-save slot is one per puzzle**, so checking overwrites
   * it. A player who saved deliberately before a speculative branch, and then
   * checks while the board is still consistent, silently loses the position
   * they were keeping. That player wants this.
   *
   * The engine has already highlighted what it found by the time this
   * resolves, so the report is a non-blocking toast either way. An
   * interrupting modal is what Check & save uses to say "and I did not save";
   * there is nothing here to not do, so there is nothing to interrupt for.
   */
  private async handleCheckOnly() {
    const puzzle = this.puzzle;
    if (!puzzle?.canCheck) return;
    const verdict = await puzzle.check();
    switch (verdict.kind) {
      case "mistakes": {
        const n = verdict.count;
        showToast({
          label: mistakesFound(n),
          message:
            `The problem ${n === 1 ? "cell is" : "cells are"} highlighted. ` +
            "Your last save is untouched.",
          type: "warning",
        });
        return;
      }
      case "dead-end":
        showToast({
          label: "Dead end",
          message: verdict.reason,
          type: "warning",
          duration: 6000,
        });
        return;
      case "out-of-reach":
        showToast({
          label: "Couldn't tell",
          message: CHECK_OUT_OF_REACH,
          type: "info",
          duration: 6000,
        });
        return;
      case "sound":
        showToast(
          verdict.mistakesChecked
            ? {
                label: "No mistakes",
                message: "Nothing on the board is wrong so far.",
                type: "success",
              }
            : {
                label: "Nothing wrong found",
                message:
                  "Nothing the check can see stops this position being finished.",
                type: "success",
              },
        );
        return;
      default:
        assertNever(verdict, "check without saving");
    }
  }

  /** Inject the 'M' key (ASCII 77): the game's adaptive Mark-all press — fill
   * every cell that has no pencil marks yet, else clear the candidates already
   * ruled out by a placed value. Only games with `canMarkAll` show the
   * control. */
  private async handleMarkAll() {
    await this.puzzle?.processKey(77);
  }

  /** The bare P shortcut: send the Marks key's code, which toggles pencil mode in
   * every game that has one. Reached only once the game has declined `p`, so a
   * game typing that letter keeps it. */
  private async handleTogglePencilMode() {
    await this.puzzle?.processKey(PENCIL_MODE_BUTTON);
  }

  /** `Auto-solve for me`, and `Stop auto-solving` while it runs. */
  private handleAutoHintToggle() {
    const puzzle = this.puzzle;
    if (!puzzle) return;
    if (puzzle.autoHintActive) {
      puzzle.stopAutoHint();
    } else {
      puzzle.startAutoHint();
    }
  }

  /** The quick-switch, shared with the home screen: `Ctrl/Cmd+K`, and the
   * `Switch puzzle…` row in the Menu so touch keeps the capability the
   * `Other puzzles` menu used to provide. */
  private openPuzzleSwitcher() {
    this.shadowRoot?.querySelector("puzzle-switcher")?.open();
  }

  /** The Menu over the board, where it does not dock: a sheet in a tall
   * window, a drawer on the Menu's side in a wide one. */
  private get menuOver(): HTMLDialogElement | null {
    return this.shadowRoot?.querySelector<HTMLDialogElement>(".menu-over") ?? null;
  }

  /**
   * The Bar's `Menu` button, and the Menu's own close button. The choice is
   * for this layout and this visit: it is dropped when the layout changes, and
   * `Keep the Menu open` in Preferences is what says how it starts.
   */
  private toggleMenu = () => {
    this.menuChoice = !this.menuOpen;
  };

  private closeMenuOver() {
    if (!this.layout.menuDocks) this.menuChoice = false;
  }

  /** The dialog closed itself (Escape): keep the state in step with it. */
  private handleMenuOverClosed = () => {
    this.menuChoice = false;
  };

  /** Escape closes the Menu and goes no further: the board must not also see
   * it and drop a reference spotlight the player never asked to lose. */
  private handleMenuOverKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") event.stopPropagation();
  };

  /**
   * A choice made in a menu inside the Menu, a checkpoint picked from the
   * timeline, closes a Menu that is over the board, as a command chosen from
   * it does. The trigger that opened that menu must *not* close it, which is
   * why the timeline is a menu here and not a command: closing the Menu takes
   * the timeline with it.
   */
  private handleMenuOverSelect = () => {
    this.closeMenuOver();
    this.focusBoard();
  };

  /** A tap does both jobs: outside the Menu it dismisses, inside it hands the
   * keyboard back like any other chrome click. */
  private handleMenuOverClick = (event: MouseEvent) => {
    closeOnBackdropClick(event);
    this.handleChromeClick(event);
  };

  private async showTypeMenu() {
    // (from the button in the puzzle-end-notification)
    await this.shadowRoot?.querySelector("puzzle-end-notification")?.hide();
    this.shadowRoot?.querySelector("puzzle-type-menu")?.show();
  }

  private async handlePuzzleLoaded(event: PuzzleEvent) {
    const { puzzle } = event.detail;
    event.preventDefault(); // We'll set up our own new game (or restore one from autoSave)

    // `this.puzzle` reads through a `@query`, which is not reactive, and the
    // first render ran before the puzzle existed. Without this, what the
    // screen draws from it (the status line, the hint's words) keeps that
    // puzzle-less render until `puzzleLoaded` is set, which waits for the
    // first board to be dealt: seconds, on a slow phone.
    this.requestUpdate();

    await settings.loaded;
    const prefs = await settings.getPuzzlePreferences(puzzle.puzzleId);
    await puzzle.setPreferences(prefs);

    // Set up the default params for all new games in this session.
    // Prefer the url's ?type=<params> if provided from the router and valid.
    // Otherwise, try the last used params stored in our settings.
    // Otherwise the first preset: see below.
    // This applies even when puzzleGameId is provided, to set the default
    // params for subsequent new games.
    const settingsParams = await settings.getParams(puzzle.puzzleId);
    let paramsChosen = false;
    for (const params of [this.params, settingsParams]) {
      if (params) {
        const error = await puzzle.setParams(params);
        if (!error) {
          paramsChosen = true;
          break; // successfully set default params
        }
        console.warn(
          `Error setting puzzle ${puzzle.puzzleId} params to "${params}": ` +
            `${error}. Ignoring.`,
        );
        if (params === settingsParams) {
          // Don't try those again. Say so, because the board the player gets
          // is not the one they last chose. The toast names no board of its
          // own: a saved game restored below may bring its own type.
          await settings.setParams(puzzle.puzzleId, null);
          showToast({
            label: "Your last board type could not be restored",
            message: "It may be from an older version of the app.",
            type: "warning",
            duration: 6000,
          });
        } else {
          void showAlert({
            label: `Ignoring invalid type in URL`,
            message: `type=${params}: ${error}`,
            type: "warning",
          });
        }
      }
    }
    if (!paramsChosen) {
      // A player who has never chosen a type starts on the first preset, not
      // on the game's `defaultParams()`, which is often a mid-sized, mid-tier
      // board and slower to deal (owner, 2026-09-26: "on every fresh use, we
      // have it use the easiest game type"). Every presets menu ran smallest
      // and easiest first when all of them were read on that date.
      await this.chooseFirstPreset(puzzle);
    }

    // TODO: restore custom presets from settings

    // Ensure there's a game, from (in order of preference)
    // - puzzleGameId (URL hash from router)
    // - the most recent autoSave
    // - the board this puzzle last dealt
    // - a new game
    let hasGame = false;

    if (this.gameId) {
      const error = await puzzle.newGameFromId(this.gameId);
      if (!error) {
        hasGame = true;
        // A link to the board already in progress here resumes it: a player
        // reopening their own shared link, or tapping it twice, expects their
        // moves. Matched on the dealt board's id, since the link may carry a
        // seed where the autosave records the desc.
        const resumable =
          puzzle.currentGameId &&
          (await savedGames.findAutoSaveOfGame(puzzle.puzzleId, puzzle.currentGameId));
        this.autoSaveFilename =
          resumable && (await savedGames.restoreAutoSavedGame(puzzle, resumable))
            ? resumable
            : savedGames.makeAutoSaveFilename();
      } else {
        void showAlert({
          label: `Ignoring invalid id in URL`,
          message: `id=${this.gameId}: ${error}`,
          type: "warning",
        });
      }
    }

    if (!this.autoSaveFilename) {
      this.autoSaveFilename = await savedGames.findMostRecentAutoSave(puzzle.puzzleId);
    }
    if (!hasGame && !this.params && this.autoSaveFilename) {
      // Restore a recent autosave, unless params in url (which might not match)
      hasGame = await savedGames.restoreAutoSavedGame(puzzle, this.autoSaveFilename);
    }

    if (!hasGame && !this.params) {
      // No autosave, which means no move was ever made on the board this puzzle
      // was last showing — so re-deal *that* board rather than a new one. Same
      // `!this.params` condition as the autosave above: a type asked for in the
      // URL wins over a remembered board that may not match it.
      const lastGameId = await settings.getLastGameId(puzzle.puzzleId);
      if (lastGameId) {
        const error = await puzzle.newGameFromId(lastGameId);
        if (error) {
          // The player never asked for this board, so its loss is not a decision
          // to put in front of them — unlike the URL case above, which alerts.
          // Forget it so the next load does not retry, and deal a fresh game.
          console.warn(
            `Dropping unusable remembered board for ${puzzle.puzzleId}: ` +
              `${lastGameId}: ${error}`,
          );
          await settings.setLastGameId(puzzle.puzzleId, null);
        } else {
          hasGame = true;
        }
      }
    }

    if (!hasGame && !(await dealNewGame(puzzle))) {
      // The remembered type found no board, or the player stopped the search
      // for one, and there is none on screen to keep. The first preset always
      // deals, and its deal has no way out: there is nothing to go back to.
      await this.chooseFirstPreset(puzzle);
      const outcome = await puzzle.newGame({ canStop: false });
      if (outcome !== "dealt") {
        throw new Error(
          `${puzzle.puzzleId} could not deal its first preset: ${JSON.stringify(outcome)}`,
        );
      }
    }

    this.puzzleLoaded = true;
    await this.shadowRoot?.querySelector("puzzle-context")?.updateComplete;
  }

  private async chooseFirstPreset(puzzle: Puzzle): Promise<void> {
    const first = (await puzzle.getPresets(true)).find((entry) => !entry.submenu);
    if (!first) return;
    const error = await puzzle.setParams(first.params);
    if (error) {
      throw new Error(
        `${puzzle.puzzleId} rejects its own first preset "${first.params}": ${error}`,
      );
    }
  }

  private async handlePuzzleParamsChange(event: PuzzleEvent) {
    // (Ignore params change as puzzle is loading -- that's its default value.)
    const { puzzle } = event.detail;
    if (
      this.puzzleLoaded &&
      puzzle.params &&
      puzzle.params !== (await settings.getParams(puzzle.puzzleId))
    ) {
      await settings.setParams(puzzle.puzzleId, puzzle.params);
    }
  }

  @debounced(250)
  private async handlePuzzleGameStateChange(event: PuzzleEvent) {
    const { puzzle } = event.detail;
    if (puzzle.currentGameId) {
      if (puzzle.currentGameId !== this.savedGameId) {
        this.savedFilename = undefined;
        this.savedGameId = puzzle.currentGameId;
        // Remember the board itself, so reopening this puzzle shows it again
        // rather than dealing a new one. Inside this guard rather than beside
        // it: the handler fires on every state change, so an unguarded write
        // would put a DB round-trip behind every move to store a value that did
        // not change. Not an autosave — see `PuzzleSettings.lastGameId`.
        await settings.setLastGameId(puzzle.puzzleId, puzzle.currentGameId);
      }
      if (puzzle.totalMoves > 0 && !puzzle.isSolved) {
        // Wait to autosave until the user has made at least one actual move,
        // to avoid autosaving from just browsing through puzzles.
        this.autoSaveFilename ??= savedGames.makeAutoSaveFilename();
        await savedGames.autoSaveGame(puzzle, this.autoSaveFilename);
      } else if (this.autoSaveFilename) {
        // Don't retain autosave for solved or unstarted puzzle.
        const autoSaveFilename = this.autoSaveFilename;
        this.autoSaveFilename = null;
        await savedGames.removeAutoSavedGame(puzzle, autoSaveFilename);
      }
    }
  }

  /**
   * The always-on chords, from `shortcuts.ts` — the same table the Bar and the
   * Menu read to label a control, so a shown key is a bound key by construction.
   *
   * `preventDefault` on a match, which is what suppresses the browser's own
   * `Ctrl/Cmd+S` save dialog; the modifier means these can never collide with a
   * game's letter input, because the board declines a key with Ctrl held
   * (`wantsKeyEvent`).
   */
  private handleBubbledKeyDown = async (event: KeyboardEvent) => {
    const chord = chordCommand(event);
    if (chord) {
      event.preventDefault();
      this.handleCommand(chord);
      return;
    }
    // Escape clears a reference spotlight — the quick dismiss for a highlight
    // that (deliberately) persists after the panel is closed. When the panel is
    // open, route through it so the chip deselects too; when closed, clear the
    // board spotlight directly. Doesn't preventDefault/stop, so it still
    // composes with any other Escape handling (e.g. closing a dialog).
    if (event.key === "Escape") {
      const panel = this.shadowRoot?.querySelector("reference-panel");
      if (panel) panel.clearSelection();
      else if (this.puzzle?.hasReference) void this.puzzle.selectReference(null);
    }
    // If a key event arrives at the document when nothing else is focused,
    // focus the puzzle and redirect the event to it.
    if (event.key === "Tab") {
      // Don't redirect keyboard navigation
      return;
    }
    const activeElement = document.activeElement;
    if (activeElement === document.body || activeElement === document.documentElement) {
      // Only redirect keys that are potentially handled by the puzzle.
      // (Don't focus the puzzle on Shift or Alt or NextTrack or FnLock.)
      const puzzleView = this.shadowRoot?.querySelector("puzzle-view-interactive");
      if (puzzleView?.wantsKeyEvent(event)) {
        puzzleView.focus();
        await puzzleView.handleKeyEvent(event);
      }
    }
  };

  /**
   * A bare letter the game turned down.
   *
   * This is where `u` / `r` / `n` / `h` become Undo / Redo / New game / Next
   * hint — **after** the game has had the key and declined it, which is what
   * makes the suppression a derivation rather than a roster. Undead keeps its
   * `z`/`v`/`g`, Salad keeps its letters, and neither had to say so anywhere.
   *
   * Behind `settings.oneKeyShortcuts` (default on), the same preference
   * upstream's `midend.c` carries — but where upstream must intercept the key
   * *before* the game runs, and therefore takes the letter away from every game
   * whenever the preference is on, this only ever spends a keypress nothing
   * else wanted.
   */
  private handleUnhandledPuzzleKey = (event: PuzzleKeyUnhandledEvent) => {
    if (!settings.oneKeyShortcuts) return;
    const command = bareCommand(event.detail);
    if (command) this.handleCommand(command);
  };

  //
  // Styles
  //

  static override styles = [
    cssWATweaks,
    css`
      :host {
        display: block;
        box-sizing: border-box;
        /* Dynamic viewport units Baseline 2023 */
        width: 100vw;
        height: 100vh;
        width: 100dvw;
        /* The window's measured height; see utils/app-height.ts. */
        height: var(--app-height, 100dvh);
      }
      
      /*
       * One grid, whose template the layout settings choose and renderPanels
       * writes on the element. Each region below names its area and nothing
       * else: where a panel docks is never decided here.
       *
       * The board's row and column are the ones that flex, so the canvas fills
       * what the panels leave. No region but the Menu scrolls.
       */
      main {
        height: 100%;
        box-sizing: border-box;
        display: grid;
        overflow: hidden;
        background-color: var(--wa-color-brand-fill-quiet);
        color: var(--wa-color-text-normal);
      }

      .top-bar {
        grid-area: top;
      }
      .board-area {
        grid-area: board;
      }
      .words {
        grid-area: words;
      }
      puzzle-game-controls {
        grid-area: controls;
      }
      puzzle-bar {
        grid-area: bar;
      }
      .menu-dock {
        grid-area: menu;
      }
      reference-panel {
        grid-area: reference;
      }

      /* A panel beside the board is ruled off on the edge that faces it. */
      main.controls-right {
        .menu-dock,
        puzzle-bar[along="side"] {
          border-inline-end: 1px solid var(--app-color-hairline);
        }
        puzzle-game-controls[along="side"],
        reference-panel {
          border-inline-start: 1px solid var(--app-color-hairline);
        }
      }
      main.controls-left {
        .menu-dock,
        puzzle-bar[along="side"] {
          border-inline-start: 1px solid var(--app-color-hairline);
        }
        puzzle-game-controls[along="side"],
        reference-panel {
          border-inline-end: 1px solid var(--app-color-hairline);
        }
      }
      :host([shape="tall"]) reference-panel {
        border-inline: none;
        border-block-start: 1px solid var(--app-color-hairline);
      }

      /* Dev-only icon-capture mode (?screenshot). */
      main.capture-mode {
        display: flex;
        flex-direction: column;
      }
      .capture-bar {
        display: flex;
        align-items: center;
        gap: var(--wa-space-s);
        padding: var(--wa-space-xs) var(--wa-space-s);
        background-color: var(--app-theme-color);

        .capture-title {
          margin-inline-end: auto;
          font-weight: var(--wa-font-weight-semibold);
        }
      }

      .board-area {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: var(--app-spacing);
      }

      .menu-dock {
        min-height: 0;
        overflow-y: auto;
        background-color: var(--app-color-rail);
      }

      puzzle-view-interactive {
        flex: 1 1 auto;
        min-height: 5rem; /* allows flexing */
        min-width: 5rem;

        --spacing: var(--app-spacing);
        --background-color: var(--wa-color-surface-default);
        --border-radius: var(--app-radius-container);
      }

      /* In a tall window, width is what sizes most boards, and the board's own
       * border already holds its clues and labels: a margin outside the card
       * plus padding inside it spent 48px of a 412px screen on nothing. The
       * card keeps a thin edge so its rounded corners still read. A short
       * window is as tight the other way. */
      :host(:not([shape="wide"])) .board-area {
        padding: var(--wa-space-xs);
      }
      :host(:not([shape="wide"])) puzzle-view-interactive {
        --spacing: var(--wa-space-xs);
      }

      .top-bar {
        box-sizing: border-box;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: var(--wa-space-s);
        padding-inline: var(--wa-space-m);
        padding-block: var(--wa-space-2xs);
        background-color: var(--app-color-rail);
        border-block-end: 1px solid var(--app-color-hairline);
      }

      .top-back {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        min-width: var(--app-tap-min);
        min-height: var(--app-tap-min);
        font-size: var(--app-font-size-support);
        color: var(--app-color-text-quiet);
        text-decoration: none;

        @media (hover: hover) {
          &:hover {
            color: var(--app-color-link);
          }
        }
      }

      /* The link's words where the row has the width for them; its aria-label
       * says them everywhere. */
      :host(:not([shape="wide"])) .top-back-label {
        display: none;
      }
      :host([shape="short"]) .top-back {
        min-height: 2.25rem;
      }

      /* **The chips give way, not the name.** A clipped chip still opens the
       * type menu and names the whole type to a screen reader; a clipped name
       * leaves the bar anonymous. The cap binds only for a long name on the
       * narrowest phones, where it ellipsizes rather than pushing the timer off
       * the row. */
      .top-name {
        flex: 0 0 auto;
        margin: 0;
        line-height: inherit;
        max-width: 45%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--app-font-size-item);
        font-weight: var(--wa-font-weight-bold);
      }

      /* overflow: hidden as well as min-width: 0, because a no-wrap chip in a box
       * allowed to shrink otherwise spills out of it, under the timer. */
      .top-chips {
        flex: 0 1 auto;
        min-width: 0;
        overflow: hidden;
      }
      .top-chips::part(trigger) {
        flex-wrap: nowrap;
      }
      .top-chips::part(chip) {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* An M:SS at the end of the row reads as a time without its icon, and
       * the icon's width is better spent on the chips. */
      .top-bar puzzle-timer::part(base) {
        flex: 0 0 auto;
        margin-inline-start: auto;
      }
      .top-bar puzzle-timer::part(icon) {
        display: none;
      }

      /* The status line and the hint sit under the board and above a bottom
       * Bar, where a thumb resting on the controls cannot cover them: the
       * whole point of an explained hint is that it can be read. A column no
       * wider than a line of prose reads well at, centered under the board. */
      .words {
        box-sizing: border-box;
        min-width: 0;
        width: 100%;
        max-width: 44rem;
        justify-self: center;
        padding-inline: var(--app-spacing);
      }
      :host(:not([shape="wide"])) .words {
        padding-inline: var(--wa-space-xs);
      }

      .status,
      .hint {
        margin-block-end: var(--wa-space-xs);
        font-size: var(--app-font-size-support);
        line-height: var(--wa-line-height-normal);
      }

      .status {
        text-align: center;
        color: var(--app-color-text-secondary);
        font-variant-numeric: tabular-nums;
      }

      .hint {
        padding: 0.5rem 0.625rem;
        border: 1px solid var(--app-color-hint-border);
        border-radius: var(--app-radius-hint);
        background-color: var(--app-color-hint-surface);
        color: var(--app-color-hint-ink);
      }

      .deal {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin-block-end: var(--wa-space-xs);
        padding-inline-start: 0.625rem;
        border: 1px solid var(--app-color-hairline);
        border-radius: var(--app-radius-hint);
        color: var(--app-color-text-secondary);
        font-size: var(--app-font-size-support);

        button {
          min-width: var(--app-tap-min);
          min-height: var(--app-tap-min);
          padding-inline: 1rem;
          border: none;
          border-inline-start: 1px solid var(--app-color-hairline);
          background: none;
          color: var(--app-color-text);
          font: inherit;
          cursor: pointer;
        }
      }

      .hint-journey {
        display: block;
        font-family: var(--app-font-mono);
        font-size: var(--app-font-size-micro);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        opacity: 0.75;
      }

      /* The Menu over the board, where it does not dock. The dialog is sized
       * to its content, so a click on its backdrop is a click outside the
       * Menu (utils/dialog.ts). */
      .menu-over {
        max-width: none;
        max-height: none;
        margin: 0;
        padding: 0;
        border: none;
        background-color: var(--app-color-rail);
        color: var(--app-color-text);
        overflow-y: auto;

        &::backdrop {
          background-color: var(--wa-color-overlay-modal);
        }
      }

      /* A sheet from the bottom in a tall window. */
      .menu-over.sheet {
        width: 100%;
        max-height: 80dvh;
        margin-block-start: auto;
        border-start-start-radius: var(--app-radius-container);
        border-start-end-radius: var(--app-radius-container);
        padding-block-end: env(safe-area-inset-bottom);
      }

      /* A drawer on the Menu's side in a landscape one. */
      .menu-over.drawer-left,
      .menu-over.drawer-right {
        width: min(18rem, 85vw);
        height: 100%;
      }
      .menu-over.drawer-left {
        margin-inline-end: auto;
      }
      .menu-over.drawer-right {
        margin-inline-start: auto;
      }

      puzzle-end-notification {
        &::part(dialog) {
          /* Position at bottom, aligned with puzzle controls */
          margin-block-end: var(--app-padding);
        }

        :has(share-dialog[open]) & {
          /* Hide the end notification and its extra backdrop
           * while share-dialog is open above it */
          --opacity: 0;
        }

        & wa-button::part(label) {
          /* Align icons at left of buttons, center labels */
          flex: 1 1 auto;
          text-align: center;
        }
      }

      wa-skeleton {
        --color: var(--wa-color-brand-fill-quiet);
        --sheen-color: var(--wa-color-brand-fill-normal);
        &::part(indicator) {
          border-radius: 0;
        }
      }
  
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "puzzle-screen": PuzzleScreen;
  }
}
