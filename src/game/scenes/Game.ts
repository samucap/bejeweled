import { Scene } from "phaser";
import Grid, { MatchData } from "./grid";
import Jewel from "./jewel";

const JEWEL_SIZE = 70;
const JEWEL_BASE_KEY = "jewel_base";
const SWAP_SPEED = 200;
const REMOVE_SPEED = 1000;
const DROP_SPEED = 800;

export class GameScene extends Scene {
  private grid: Grid;
  private boardContainer: Phaser.GameObjects.Container;
  private jewelSprites: Phaser.GameObjects.Sprite[][] = [];
  private firstSelection: Jewel | null = null;
  private selectionGlow: Phaser.GameObjects.Graphics | null = null;
  private isAnimating = false;

  constructor() {
    super("GameScene");
  }

  init() {
    this.grid = new Grid();
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

  /**
   * Renders the initial grid and jewel sprites.
   */
  private createBoardView() {
    this.boardContainer = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2,
    );

    const gridGraphics = this.add.graphics();
    this.boardContainer.add(gridGraphics);

    for (let col = 0; col < this.grid.size; col++) {
      this.jewelSprites[col] = [];
      for (let row = 0; row < this.grid.size; row++) {
        const { x, y } = this.getSpritePosition(row, col);

        gridGraphics.fillStyle(0x000000, 0.2);
        gridGraphics.fillRect(
          x - this.grid.cellSize / 2,
          y - this.grid.cellSize / 2,
          this.grid.cellSize,
          this.grid.cellSize,
        );

        const jewelSprite = this.add.sprite(x, y, JEWEL_BASE_KEY);
        jewelSprite.setTint(this.grid.board[col][row].color);
        this.boardContainer.add(jewelSprite);
        this.jewelSprites[col][row] = jewelSprite;
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

  /**
   * Sets up the pointer down event for jewel selection.
   */
  private setupInputHandler() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isAnimating) return;
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

  /**
   * Main function to handle swapping and the resulting animation cascade.
   */
  private swapAndCheck(jewel1: Jewel, jewel2: Jewel) {
    this.isAnimating = true;
    this.animateSwap(jewel1, jewel2, () => {
      this.grid.swap(jewel1, jewel2);
      const cascadeData = this.grid.findAllMatches();

      if (cascadeData) {
        this.animateCascade(cascadeData, 0);
      } else {
        // No match, swap back
        this.animateSwap(jewel1, jewel2, () => {
          this.grid.swap(jewel1, jewel2); // Swap back in the grid
          this.isAnimating = false;
        });
      }
    });
  }

  /**
   * Recursively animates each step of the match-and-clear cascade.
   */
  private animateCascade(cascadeData: MatchData[], index: number) {
    if (index >= cascadeData.length) {
      this.syncSpritesWithBoard();
      this.isAnimating = false;
      return;
    }
    const matchData = cascadeData[index];
    this.animateRemoval(matchData.removed, () => {
      this.animateDropDown(matchData.slid, matchData.new, () => {
        this.animateCascade(cascadeData, index + 1);
      });
    });
  }

  private animateSwap(jewel1: Jewel, jewel2: Jewel, onComplete: () => void) {
    const sprite1 = this.jewelSprites[jewel1.col][jewel1.row];
    const sprite2 = this.jewelSprites[jewel2.col][jewel2.row];

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
      onComplete: () => {
        this.updateSpriteArrayAfterSwap(jewel1, jewel2);
        onComplete();
      },
    });
  }

  private animateRemoval(removed: Jewel[], onComplete: () => void) {
    if (removed.length === 0) {
      onComplete();
      return;
    }
    this.tweens.add({
      targets: removed.map((j) => this.jewelSprites[j.col][j.row]),
      scale: 0,
      alpha: 0,
      duration: REMOVE_SPEED,
      ease: "quad.in",
      onComplete,
    });
  }

  private animateDropDown(
    slid: MatchData["slid"],
    newJewels: MatchData["new"],
    onComplete: () => void,
  ) {
    let animations = 0;
    const onAnimComplete = () => {
      animations--;
      if (animations === 0) {
        this.syncSpritesWithBoard();
        onComplete();
      }
    };

    if (slid.length === 0 && newJewels.length === 0) {
      onComplete();
      return;
    }

    // Animate sliding jewels
    slid.forEach(({ jewel, fromRow }) => {
      animations++;
      const sprite = this.jewelSprites[jewel.col][fromRow];
      const { y } = this.getSpritePosition(jewel.row, jewel.col);
      this.tweens.add({
        targets: sprite,
        y,
        duration: DROP_SPEED,
        ease: "quad.out",
        onComplete: onAnimComplete,
      });
    });

    // Animate new jewels
    newJewels.forEach((jewel) => {
      animations++;
      const { x, y } = this.getSpritePosition(jewel.row, jewel.col);
      const sprite = this.findUnusedSprite(jewel.col);
      sprite.x = x;
      sprite.y = y - this.grid.cellSize * this.grid.size;
      sprite.setTint(jewel.color).setAlpha(1).setScale(1);
      this.tweens.add({
        targets: sprite,
        y,
        duration: DROP_SPEED,
        ease: "quad.out",
        onComplete: onAnimComplete,
      });
    });
  }

  /**
   * Finds a sprite in a column that is invisible and can be reused for a new jewel.
   */
  private findUnusedSprite(col: number): Phaser.GameObjects.Sprite {
    for (let row = 0; row < this.grid.size; row++) {
      const sprite = this.jewelSprites[col][row];
      if (sprite.alpha === 0) {
        return sprite;
      }
    }
    // Fallback, should not happen in normal flow
    return this.jewelSprites[col][0];
  }

  /**
   * After animations, this ensures the jewelSprites array matches the grid data model exactly.
   */
  private syncSpritesWithBoard() {
    const newSpriteGrid: Phaser.GameObjects.Sprite[][] = this.grid.board.map(
      () => [],
    );

    const availableSprites: Phaser.GameObjects.Sprite[] = [];
    this.jewelSprites.forEach((col) =>
      col.forEach((s) => availableSprites.push(s)),
    );

    this.grid.board.forEach((col, c) => {
      col.forEach((jewel, r) => {
        const pos = this.getSpritePosition(r, c);
        let foundSprite: Phaser.GameObjects.Sprite | undefined;

        // Find the sprite that already represents this jewel, if any
        const spriteIndex = availableSprites.findIndex(
          (s) => s.x === pos.x && s.y === pos.y,
        );
        if (spriteIndex !== -1) {
          foundSprite = availableSprites.splice(spriteIndex, 1)[0];
        } else {
          // If no sprite is at the target location, grab any available one
          foundSprite = availableSprites.pop();
        }

        if (foundSprite) {
          foundSprite.setPosition(pos.x, pos.y);
          foundSprite.setTint(jewel.color);
          foundSprite.setAlpha(1).setScale(1);
          newSpriteGrid[c][r] = foundSprite;
        }
      });
    });

    this.jewelSprites = newSpriteGrid;
  }

  private updateSpriteArrayAfterSwap(jewel1: Jewel, jewel2: Jewel) {
    const { row: r1, col: c1 } = jewel1;
    const { row: r2, col: c2 } = jewel2;
    [this.jewelSprites[c1][r1], this.jewelSprites[c2][r2]] = [
      this.jewelSprites[c2][r2],
      this.jewelSprites[c1][r1],
    ];
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
