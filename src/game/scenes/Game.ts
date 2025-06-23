// --- src/scenes/GameScene.ts ---

import { Scene } from "phaser";
import Grid from "./grid";
import Jewel from "./jewel";

// --- Constants ---
const JEWEL_SIZE = 70;
const JEWEL_BASE_KEY = "jewel_base";
const SWAP_SPEED = 200; // Speed of jewel swap in ms

export class GameScene extends Scene {
  private grid: Grid;
  private boardContainer: Phaser.GameObjects.Container;
  private jewelSprites: Phaser.GameObjects.Sprite[][] = [];

  // State variables
  private firstSelection: Jewel | null = null;
  private selectionGlow: Phaser.GameObjects.Graphics | null = null;
  private isSwapping = false;

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
    this.input.keyboard?.on("keydown-SPACE", () =>
      this.scene.start("AnimatedScene"),
    );
  }

  private createBoardView() {
    // Create a container to hold all board elements for easy centering.
    //const boardWidth = this.grid.size * this.grid.cellSize;
    this.boardContainer = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2,
    );

    const gridGraphics = this.add.graphics();
    this.boardContainer.add(gridGraphics);

    for (let row = 0; row < this.grid.size; row++) {
      this.jewelSprites[row] = [];
      for (let col = 0; col < this.grid.size; col++) {
        // Calculate position relative to the container's center
        const x = (col - this.grid.size / 2) * this.grid.cellSize;
        const y = (row - this.grid.size / 2) * this.grid.cellSize;

        gridGraphics.fillStyle(0x000000, 0.2);
        gridGraphics.fillRect(x, y, this.grid.cellSize, this.grid.cellSize);

        const jewelSprite = this.add.sprite(
          x + this.grid.cellSize / 2,
          y + this.grid.cellSize / 2,
          JEWEL_BASE_KEY,
        );
        jewelSprite.setTint(this.grid.board[row][col].color);
        this.boardContainer.add(jewelSprite);
        this.jewelSprites[row][col] = jewelSprite;
      }
    }

    // Create the selection glow and add it to the container
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
      if (this.isSwapping) return;

      // --- THIS IS THE FIX ---
      // Convert the global pointer coordinates to the container's local coordinates
      const touchPoint = this.boardContainer.pointToContainer(
        pointer,
      ) as Phaser.Math.Vector2;

      const boardWidth = this.grid.size * this.grid.cellSize;
      // Now calculate the column and row based on the container-local point
      const col = Math.floor(
        (touchPoint.x + boardWidth / 2) / this.grid.cellSize,
      );
      const row = Math.floor(
        (touchPoint.y + boardWidth / 2) / this.grid.cellSize,
      );

      // Bounds check
      if (
        col >= 0 &&
        col < this.grid.size &&
        row >= 0 &&
        row < this.grid.size
      ) {
        this.handleCellClick(row, col);
      }
    });
  }

  private handleCellClick(row: number, col: number) {
    const clickedJewel = this.grid.board[row][col];

    if (!this.firstSelection) {
      this.firstSelection = clickedJewel;
      this.showSelectionIndicator(row, col);
    } else {
      if (this.validNeighbor(this.firstSelection, clickedJewel)) {
        this.hideSelectionIndicator();
        this.swapJewels(this.firstSelection, clickedJewel);
        this.firstSelection = null;
      } else {
        // If it's the same jewel, deselect it. Otherwise, select the new one.
        if (this.firstSelection === clickedJewel) {
          this.firstSelection = null;
          this.hideSelectionIndicator();
        } else {
          this.firstSelection = clickedJewel;
          this.showSelectionIndicator(row, col);
        }
      }
    }
  }

  private validNeighbor(jewel1: Jewel, jewel2: Jewel): boolean {
    const rowDiff = Math.abs(jewel1.row - jewel2.row);
    const colDiff = Math.abs(jewel1.col - jewel2.col);
    return rowDiff + colDiff === 1;
  }

  private swapJewels(jewel1: Jewel, jewel2: Jewel) {
    this.isSwapping = true;

    // We need the sprites from their ORIGINAL positions
    const sprite1 = this.jewelSprites[jewel1.row][jewel1.col];
    const sprite2 = this.jewelSprites[jewel2.row][jewel2.col];

    // Get the target positions (which are the current positions of the other sprite)
    const targetX1 = sprite2.x;
    const targetY1 = sprite2.y;
    const targetX2 = sprite1.x;
    const targetY2 = sprite1.y;

    // Animate sprite1 to sprite2's position
    this.tweens.add({
      targets: sprite1,
      x: targetX1,
      y: targetY1,
      duration: SWAP_SPEED,
      ease: "quad.out",
    });

    // Animate sprite2 to sprite1's position and set the onComplete callback
    this.tweens.add({
      targets: sprite2,
      x: targetX2,
      y: targetY2,
      duration: SWAP_SPEED,
      ease: "quad.out",
      onComplete: () => {
        // --- THIS IS THE FIX ---
        // After the visual swap, update the data model and the sprite array
        this.grid.updateBoard(jewel1, jewel2);
        this.updateSpriteArrayAfterSwap(jewel1, jewel2);
        this.isSwapping = false;

        // Future logic: check for matches here
      },
    });
  }

  /** Swaps the sprites in the view array to match the data model. */
  private updateSpriteArrayAfterSwap(jewel1: Jewel, jewel2: Jewel) {
    // Note: the jewel objects' row/col have already been updated by the grid
    const { row: row1, col: col1 } = jewel1; // New positions
    const { row: row2, col: col2 } = jewel2; // New positions

    const sprite1 = this.jewelSprites[row2][col2];
    const sprite2 = this.jewelSprites[row1][col1];

    this.jewelSprites[row1][col1] = sprite1;
    this.jewelSprites[row2][col2] = sprite2;
  }

  private showSelectionIndicator(row: number, col: number) {
    if (!this.selectionGlow) return;

    // --- THIS IS THE FIX ---
    // Calculate the position for the glow relative to the container's center
    //const boardWidth = this.grid.size * this.grid.cellSize;
    const x = (col - this.grid.size / 2) * this.grid.cellSize + 2;
    const y = (row - this.grid.size / 2) * this.grid.cellSize + 2;

    this.selectionGlow.setPosition(x, y);
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
