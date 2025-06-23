import { Scene } from "phaser";

import Grid from "./grid";

// --- Constants ---
//const GRID_SIZE = 8;
//const CELL_SIZE = 80;
const JEWEL_SIZE = 70;
const JEWEL_BASE_KEY = "jewel_base";
const SWAP_SPEED = 200; // Speed of jewel swap in ms

export class GameScene extends Scene {
  private grid: Grid;
  private firstSelection: number[] = [];
  private isSwapping = false; // Flag to prevent clicks during animation
  // The view layer for our game board (the Phaser sprites)
  private jewelSprites: Phaser.GameObjects.Sprite[][] = [];
  private boardContainer: Phaser.GameObjects.Container;
  private selectionGlow: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super("GameScene");
  }

  /**
   * init() is called by Phaser before preload(). It's the perfect place
   * to initialize data structures and state.
   */
  init() {
    console.log("Initializing data model...");
    this.grid = new Grid();
  }

  /**
   * preload() is for loading assets.
   */
  preload() {
    // Create our single, reusable white jewel texture
    const graphics = this.make.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillRoundedRect(0, 0, JEWEL_SIZE, JEWEL_SIZE, 12);
    graphics.generateTexture(JEWEL_BASE_KEY, JEWEL_SIZE, JEWEL_SIZE);
    graphics.destroy();
  }

  /**
   * create() is for creating game objects and setting up the scene.
   * Its main job is to render the view based on the model.
   */
  create() {
    this.createBoardView();
    this.setupInputHandler();
    this.glowSelection();
  }

  private glowSelection() {
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

        // Draw background cell - USE cellSize, NOT size
        gridGraphics.fillStyle(0x000000, 0.2);
        gridGraphics.fillRect(x, y, this.grid.cellSize, this.grid.cellSize);

        //TODO: this should prolly be in Jewel
        // Create jewel sprite - USE cellSize for centering
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

    this.glowSelection();
  }

  /**
   * Sets up a single, scene-wide pointer handler to manage all clicks.
   */
  private setupInputHandler() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isSwapping) return;

      const col = Math.floor(pointer.x / this.grid.cellSize);
      const row = Math.floor(pointer.y / this.grid.cellSize);

      // Bounds check: Ensure the click is within the grid
      if (
        col >= 0 &&
        col < this.grid.size &&
        row >= 0 &&
        row < this.grid.size
      ) {
        // valid grid cell
        this.handleCellClick(row, col);
      }
    });
  }

  /**
   * Handles the logic when a valid grid cell is clicked.
   * @param row The row of the clicked cell.
   * @param col The column of the clicked cell.
   */
  private handleCellClick(row: number, col: number) {
    if (!this.firstSelection.length) {
      this.firstSelection = [row, col];
      this.showSelectionIndicator(row, col);
    } else {
      // TODO: logic for clicks
      // if same just unselect
      if (this.areNeighbors(this.firstSelection, row, col)) {
        // It's a valid neighbor, let's swap
        this.hideSelectionIndicator();
        this.grid.checkBoard(row, col);
        this.swapJewels(this.firstSelection, row, col);
        this.firstSelection = []; // Reset selection
      } else {
        // Not a neighbor. If it's the same jewel, deselect it. Otherwise, select the new one.
        if (this.firstSelection[0] === row && this.firstSelection[1] === col) {
          this.firstSelection = []; // Reset selection
          this.hideSelectionIndicator();
        } else {
          this.firstSelection = [row, col];
          this.showSelectionIndicator(row, col);
        }
      }
    }
  }

  private areNeighbors(
    first: number[],
    currRow: number,
    currCol: number,
  ): boolean {
    const rowDiff = Math.abs(first[0] - currRow);
    const colDiff = Math.abs(first[1] - currCol);
    return rowDiff + colDiff === 1;
  }

  private swapJewels(first: number[], currRow: number, currCol: number) {
    this.isSwapping = true;
    console.log(
      `Swapping (${first[0]}, ${first[1]}) with (${currRow}, ${currCol})`,
    );

    const sprite1 = this.jewelSprites[first[0]][first[1]];
    const sprite2 = this.jewelSprites[currRow][currCol];

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

    // Animate sprite2 to sprite1's position
    this.tweens.add({
      targets: sprite2,
      x: targetX2,
      y: targetY2,
      duration: SWAP_SPEED,
      ease: "quad.out",
      onComplete: () => {
        this.isSwapping = false;
      },
    });
  }

  // Swap the sprites in the view array

  private showSelectionIndicator(row: number, col: number) {
    if (!this.selectionGlow) return;

    const x = col * this.grid.cellSize + 2;
    const y = row * this.grid.cellSize + 2;
    this.selectionGlow.setPosition(x, y);
    this.selectionGlow.setVisible(true);

    // Add a pulsating "glow" animation
    this.tweens.add({
      targets: this.selectionGlow,
      alpha: 0.4,
      duration: 400,
      yoyo: true,
      repeat: -1, // Loop forever
    });
  }

  private hideSelectionIndicator() {
    if (!this.selectionGlow) return;
    this.tweens.killTweensOf(this.selectionGlow); // Stop the glow animation
    this.selectionGlow.setAlpha(1); // Reset alpha
    this.selectionGlow.setVisible(false);
  }
}
