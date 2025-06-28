import { Scene } from "phaser";
import Grid, { MatchData } from "./grid";
import Jewel from "./jewel";

const JEWEL_SIZE = 70;
const JEWEL_BASE_KEY = "jewel_base";
const SWAP_SPEED = 200;
const REMOVE_SPEED = 200;
const DROP_SPEED = 300;
const HIGHLIGHT_DELAY = 400;

export class GameScene extends Scene {
  private grid: Grid;
  private boardContainer: Phaser.GameObjects.Container;
  // This Map is the key to the fix. It robustly links a jewel's data to its sprite.
  private jewelSpriteMap: Map<number, Phaser.GameObjects.Sprite>;
  private firstSelection: Jewel | null = null;
  private selectionGlow: Phaser.GameObjects.Graphics | null = null;
  private highlightPool: Phaser.GameObjects.Graphics[] = [];
  private isAnimating = false;

  constructor() {
    super("GameScene");
  }

  init() {
    this.grid = new Grid();
    // Initialize the map here
    this.jewelSpriteMap = new Map();
  }

  preload() {
    const graphics = this.make.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillRoundedRect(0, 0, JEWEL_SIZE, JEWEL_SIZE, 12);
    graphics.generateTexture(JEWEL_BASE_KEY, JEWEL_SIZE, JEWEL_SIZE);
    graphics.destroy();
  }

  create() {
    this.createBoardView();
    this.setupInputHandler();
  }

  private createBoardView() {
    this.boardContainer = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2,
    );

    const gridGraphics = this.add.graphics();
    this.boardContainer.add(gridGraphics);

    for (let i = 0; i < 10; i++) {
      const rect = this.add.graphics();
      rect.setVisible(false);
      this.boardContainer.add(rect);
      this.highlightPool.push(rect);
    }

    for (let col = 0; col < this.grid.size; col++) {
      for (let row = 0; row < this.grid.size; row++) {
        const jewel = this.grid.board[col][row];
        const { x, y } = this.getSpritePosition(row, col);

        gridGraphics.fillStyle(0x000000, 0.2);
        gridGraphics.fillRect(
          x - this.grid.cellSize / 2,
          y - this.grid.cellSize / 2,
          this.grid.cellSize,
          this.grid.cellSize,
        );

        const jewelSprite = this.add.sprite(x, y, JEWEL_BASE_KEY);
        jewelSprite.setTint(jewel.color);
        this.boardContainer.add(jewelSprite);
        // Link the jewel's unique ID to its sprite object
        this.jewelSpriteMap.set(jewel.id, jewelSprite);
      }
    }

    this.selectionGlow = this.add.graphics();
    this.selectionGlow.lineStyle(4, 0xffffff, 0.9);
    this.selectionGlow.strokeRoundedRect(
      0,
      0,
      this.grid.cellSize - 4,
      this.grid.cellSize - 4,
      14,
    );
    this.selectionGlow.setVisible(false);
    this.boardContainer.add(this.selectionGlow);
  }

  private setupInputHandler() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isAnimating) return;
      const { row, col } = this.getGridPosition(pointer);
      if (this.grid.board[col]?.[row]) {
        this.handleCellClick(row, col);
      }
    });
  }

  private handleCellClick(row: number, col: number) {
    const clickedJewel = this.grid.board[col][row];
    if (!this.firstSelection) {
      this.firstSelection = clickedJewel;
      this.showSelectionIndicator(row, col);
    } else {
      if (this.isValidNeighbor(this.firstSelection, clickedJewel)) {
        this.hideSelectionIndicator();
        this.swapAndCheck(this.firstSelection, clickedJewel);
        this.firstSelection = null;
      } else {
        this.firstSelection = clickedJewel;
        this.showSelectionIndicator(row, col);
      }
    }
  }

  private isValidNeighbor(jewel1: Jewel, jewel2: Jewel): boolean {
    return (
      Math.abs(jewel1.row - jewel2.row) + Math.abs(jewel1.col - jewel2.col) ===
      1
    );
  }

  private swapAndCheck(jewel1: Jewel, jewel2: Jewel) {
    this.isAnimating = true;
    this.animateSwap(jewel1, jewel2, () => {
      this.grid.swap(jewel1, jewel2);
      const cascadeData = this.grid.findAllMatches();
      if (cascadeData && cascadeData.length > 0) {
        this.animateCascade(cascadeData, 0);
      } else {
        // No match, swap back
        this.animateSwap(jewel1, jewel2, () => {
          this.grid.swap(jewel1, jewel2);
          this.isAnimating = false;
        });
      }
    });
  }

  private animateCascade(cascadeData: MatchData[], index: number) {
    if (index >= cascadeData.length) {
      this.isAnimating = false;
      return;
    }
    const matchData = cascadeData[index];
    const highlights = this.showHighlights(matchData.trash);
    this.time.delayedCall(HIGHLIGHT_DELAY, () => {
      this.animateRemoval(matchData.removed, highlights, () => {
        this.animateDropDown(matchData, () => {
          this.animateCascade(cascadeData, index + 1);
        });
      });
    });
  }

  private animateSwap(jewel1: Jewel, jewel2: Jewel, onComplete: () => void) {
    // Retrieve sprites directly by ID, which is much safer.
    const sprite1 = this.jewelSpriteMap.get(jewel1.id);
    const sprite2 = this.jewelSpriteMap.get(jewel2.id);
    if (!sprite1 || !sprite2) {
      console.error("Cannot find sprite for jewel in swap");
      onComplete();
      return;
    }
    this.tweens.add({
      targets: sprite1,
      x: sprite2.x,
      y: sprite2.y,
      duration: SWAP_SPEED,
      ease: "quad.out",
    });
    this.tweens.add({
      targets: sprite2,
      x: sprite1.x,
      y: sprite1.y,
      duration: SWAP_SPEED,
      ease: "quad.out",
      onComplete,
    });
  }

  private animateRemoval(
    removed: Jewel[],
    highlights: Phaser.GameObjects.Graphics[],
    onComplete: () => void,
  ) {
    if (!removed || removed.length === 0) {
      onComplete();
      return;
    }
    // Filter out any potential nulls if a jewel somehow has no sprite.
    const jewelSprites = removed
      .map((j) => this.jewelSpriteMap.get(j.id))
      .filter(Boolean);

    if (highlights && highlights.length > 0) {
      this.tweens.add({
        targets: highlights,
        alpha: 0,
        duration: REMOVE_SPEED,
        ease: "quad.in",
      });
    }

    if (jewelSprites.length > 0) {
      this.tweens.add({
        targets: jewelSprites,
        scale: 0,
        alpha: 0,
        duration: REMOVE_SPEED,
        ease: "quad.in",
        onComplete: () => {
          if (highlights) {
            highlights.forEach((h) => h.setVisible(false));
          }
          onComplete();
        },
      });
    } else {
      onComplete();
    }
  }

  private animateDropDown(matchData: MatchData, onComplete: () => void) {
    let animations = 0;
    const { slid, new: newJewels, removed } = matchData;
    const onAnimComplete = () => {
      animations--;
      if (animations === 0) onComplete();
    };

    if (slid.length === 0 && newJewels.length === 0) {
      onComplete();
      return;
    }

    // A reliable pool of sprites from the jewels that were just removed.
    const reusableSprites = removed
      .map((j) => this.jewelSpriteMap.get(j.id))
      .filter(Boolean);

    slid.forEach(({ jewel }) => {
      animations++;
      const sprite = this.jewelSpriteMap.get(jewel.id);
      if (!sprite) {
        onAnimComplete();
        return;
      } // Safety check
      const { y } = this.getSpritePosition(jewel.row, jewel.col);
      this.tweens.add({
        targets: sprite,
        y,
        duration: DROP_SPEED,
        ease: "quad.out",
        onComplete: onAnimComplete,
      });
    });

    newJewels.forEach((jewel) => {
      animations++;
      const { x, y } = this.getSpritePosition(jewel.row, jewel.col);
      // Get a sprite from the pool or create a new one as a fallback.
      const sprite =
        reusableSprites.pop() || this.add.sprite(x, y, JEWEL_BASE_KEY);
      if (!sprite.scene) {
        this.add.existing(sprite);
      } // Add to scene if it was removed

      sprite.x = x;
      sprite.y = y - this.grid.cellSize * this.grid.size; // Start off-screen
      sprite.setTint(jewel.color).setAlpha(1).setScale(1);

      this.jewelSpriteMap.set(jewel.id, sprite); // Link new jewel to its sprite

      this.tweens.add({
        targets: sprite,
        y,
        duration: DROP_SPEED,
        ease: "quad.out",
        onComplete: onAnimComplete,
      });
    });
  }

  private showHighlights(
    trash: MatchData["trash"],
  ): Phaser.GameObjects.Graphics[] {
    const activeHighlights: Phaser.GameObjects.Graphics[] = [];
    let poolIndex = 0;
    const singleCellTrash: { [col: number]: { from: number; len: number }[] } =
      {};
    for (const colStr in trash) {
      const col = parseInt(colStr);
      singleCellTrash[col] = [];
      trash[col].forEach((item) => {
        if (item.len > 1) {
          if (poolIndex >= this.highlightPool.length) return;
          const highlightRect = this.highlightPool[poolIndex++];
          const startPos = this.getSpritePosition(item.from, col);
          const endPos = this.getSpritePosition(item.from + item.len - 1, col);
          this.drawHighlightRect(
            highlightRect,
            startPos.x - this.grid.cellSize / 2,
            endPos.y - this.grid.cellSize / 2,
            this.grid.cellSize,
            this.grid.cellSize * item.len,
          );
          activeHighlights.push(highlightRect);
        } else {
          singleCellTrash[col].push(item);
        }
      });
    }
    const groupedByRow: { [row: number]: number[] } = {};
    for (const colStr in singleCellTrash) {
      const col = parseInt(colStr);
      singleCellTrash[col].forEach((item) => {
        if (!groupedByRow[item.from]) {
          groupedByRow[item.from] = [];
        }
        groupedByRow[item.from].push(col);
      });
    }
    for (const rowStr in groupedByRow) {
      const row = parseInt(rowStr);
      const cols = groupedByRow[row].sort((a, b) => a - b);
      if (cols.length < 3) continue;
      let currentRun = [cols[0]];
      for (let i = 1; i < cols.length; i++) {
        if (cols[i] === cols[i - 1] + 1) {
          currentRun.push(cols[i]);
        } else {
          if (currentRun.length >= 3) {
            if (poolIndex >= this.highlightPool.length) continue;
            const highlightRect = this.highlightPool[poolIndex++];
            const startPos = this.getSpritePosition(row, currentRun[0]);
            this.drawHighlightRect(
              highlightRect,
              startPos.x - this.grid.cellSize / 2,
              startPos.y - this.grid.cellSize / 2,
              currentRun.length * this.grid.cellSize,
              this.grid.cellSize,
            );
            activeHighlights.push(highlightRect);
          }
          currentRun = [cols[i]];
        }
      }
      if (currentRun.length >= 3) {
        if (poolIndex < this.highlightPool.length) {
          const highlightRect = this.highlightPool[poolIndex++];
          const startPos = this.getSpritePosition(row, currentRun[0]);
          this.drawHighlightRect(
            highlightRect,
            startPos.x - this.grid.cellSize / 2,
            startPos.y - this.grid.cellSize / 2,
            currentRun.length * this.grid.cellSize,
            this.grid.cellSize,
          );
          activeHighlights.push(highlightRect);
        }
      }
    }
    return activeHighlights;
  }

  private drawHighlightRect(
    rect: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    rect.clear();
    rect.fillStyle(0xffffff, 0.4);
    rect.fillRoundedRect(0, 0, width, height, 12);
    rect.setPosition(x, y).setVisible(true).setAlpha(0);
    this.tweens.add({
      targets: rect,
      alpha: 1,
      duration: 150,
      ease: "quad.out",
    });
  }

  private getSpritePosition(row: number, col: number) {
    const viewRow = this.grid.size - 1 - row;
    const x =
      (col - this.grid.size / 2) * this.grid.cellSize + this.grid.cellSize / 2;
    const y =
      (viewRow - this.grid.size / 2) * this.grid.cellSize +
      this.grid.cellSize / 2;
    return { x, y };
  }

  private getGridPosition(pointer: Phaser.Input.Pointer) {
    const touchPoint = this.boardContainer.pointToContainer(
      pointer,
    ) as Phaser.Math.Vector2;
    const col = Math.floor(
      (touchPoint.x + (this.grid.size * this.grid.cellSize) / 2) /
        this.grid.cellSize,
    );
    const viewRow = Math.floor(
      (touchPoint.y + (this.grid.size * this.grid.cellSize) / 2) /
        this.grid.cellSize,
    );
    const row = this.grid.size - 1 - viewRow;
    return { row, col };
  }

  private showSelectionIndicator(row: number, col: number) {
    if (!this.selectionGlow) return;
    const { x, y } = this.getSpritePosition(row, col);
    this.selectionGlow.setPosition(
      x - this.grid.cellSize / 2 + 2,
      y - this.grid.cellSize / 2 + 2,
    );
    this.selectionGlow.setVisible(true);
    this.tweens.add({
      targets: this.selectionGlow,
      alpha: 0.4,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });
  }

  private hideSelectionIndicator() {
    if (!this.selectionGlow) return;
    this.tweens.killTweensOf(this.selectionGlow);
    this.selectionGlow.setAlpha(1).setVisible(false);
  }
}
