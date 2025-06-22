import { Scene } from 'phaser';

// --- Constants ---
const GRID_SIZE = 8;
const CELL_SIZE = 80;
const JEWEL_SIZE = 70;
const JEWEL_COLORS = [0xff3333, 0x3366ff, 0x33cc33, 0xffcc00, 0xff9900, 0x9933ff, 0xcccccc];
const JEWEL_BASE_KEY = 'jewel_base';
const SWAP_SPEED = 200; // Speed of jewel swap in ms

          // TODO: PUll this bitch out
/**
 * A simple class to represent the data for a single jewel.
 * This is our "Model" in the Model-View-Controller pattern.
 */
class Jewel {
    public row: number;
    public col: number;
    public color: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
        this.color = Phaser.Math.RND.pick(JEWEL_COLORS);
    }
}

export class GameScene extends Scene {
    // The data model for our game board
    private board: Jewel[][] = [];
    // The view layer for our game board (the Phaser sprites)
    private jewelSprites: Phaser.GameObjects.Sprite[][] = [];

    private firstSelection: Jewel | null = null;
    private selectionGlow: Phaser.GameObjects.Graphics | null = null;
    private isSwapping = false; // Flag to prevent clicks during animation
    
    constructor() {
        super('GameScene');
    }

    /**
     * init() is called by Phaser before preload(). It's the perfect place
     * to initialize data structures and state.
     */
    init() {
        console.log('Initializing data model...');
        this.createBoardModel();
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
        this.selectionGlow = this.add.graphics();
        this.selectionGlow.lineStyle(4, 0xffffff, 0.8);
        this.selectionGlow.strokeRoundedRect(0, 0, CELL_SIZE - 4, CELL_SIZE - 4, 14);
        this.selectionGlow.setVisible(false);
    }

    /**
     * Populates the `this.board` 2D array with Jewel data objects.
     */
    private createBoardModel() {
        for (let row = 0; row < GRID_SIZE; row++) {
            this.board[row] = [];
            for (let col = 0; col < GRID_SIZE; col++) {
                this.board[row][col] = new Jewel(row, col);
            }
        }
    }

    /**
     * Renders the visual representation of the board based on the data
     * in `this.board`.
     */
    private createBoardView() {
        const gridGraphics = this.add.graphics();

        for (let row = 0; row < GRID_SIZE; row++) {
            this.jewelSprites[row] = [];
            for (let col = 0; col < GRID_SIZE; col++) {
                const jewelData = this.board[row][col];
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE;

                // Draw the background cell
                gridGraphics.fillStyle(0x000000, 0.2);
                gridGraphics.lineStyle(1, 0xffffff, 0.15);
                gridGraphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                gridGraphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
                
                // Create the jewel sprite using our base texture
                const jewelSprite = this.add.sprite(
                    x + CELL_SIZE / 2,
                    y + CELL_SIZE / 2,
                    JEWEL_BASE_KEY
                );

                // Tint the sprite using the color from our data model
                jewelSprite.setTint(jewelData.color);

                // Store the sprite in our view array for later access
                this.jewelSprites[row][col] = jewelSprite;
            }
        }
    }

    /**
     * Sets up a single, scene-wide pointer handler to manage all clicks.
     */
    private setupInputHandler() {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.isSwapping) return;

            const col = Math.floor(pointer.x / CELL_SIZE);
            const row = Math.floor(pointer.y / CELL_SIZE);

            // Bounds check: Ensure the click is within the grid
            if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
                // We have a valid grid cell click, let's handle it
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
        // 1. Get the data from our model
        const jewelData = this.board[row][col];
        // 2. Get the sprite from our view array
        const jewelSprite = this.jewelSprites[row][col];

        if (!jewelData || !jewelSprite) {
            // Should not happen, but a good safe-guard
            return;
        }

        // 3. Print the information from the data model
        console.log(`Cell: (${row}, ${col}), Color: #${jewelData.color.toString(16)}`);
        if (!this.firstSelection) {
          this.firstSelection = jewelData;
          this.showSelectionIndicator(row, col);
        } else {
          // TODO: logic for clicks
          // if same just unselect
          if (this.areNeighbors(this.firstSelection, jewelData)) {
                // It's a valid neighbor, let's swap
                this.hideSelectionIndicator();
                this.swapJewels(this.firstSelection, jewelData);
                this.firstSelection = null; // Reset selection
            } else {
                // Not a neighbor. If it's the same jewel, deselect it. Otherwise, select the new one.
                if (this.firstSelection.row === row && this.firstSelection.col === col) {
                    this.firstSelection = null;
                    this.hideSelectionIndicator();
                } else {
                    this.firstSelection = jewelData;
                    this.showSelectionIndicator(row, col);
                }
            }

          // if not next to firstSelection do nothing, or print can't swap with that one.

          // swap jewels
          // check if there's sequence, starting from this row and col, loop negative and positive and check how many
// of the same you get
        }

        // 4. Trigger the animation on the correct sprite
        this.tweens.add({
            targets: jewelSprite,
            scale: 1,
            duration: 150,
            yoyo: true,
            ease: 'quad.out'
        });
    }

    /** Checks if two jewels are direct neighbors (not diagonal) */
    private areNeighbors(jewel1: Jewel, jewel2: Jewel): boolean {
        const rowDiff = Math.abs(jewel1.row - jewel2.row);
        const colDiff = Math.abs(jewel1.col - jewel2.col);
        return rowDiff + colDiff === 1;
    }

    /** The "Phaser Way" to swap two jewels with animation */
    private swapJewels(jewel1: Jewel, jewel2: Jewel) {
        this.isSwapping = true;
        console.log(`Swapping (${jewel1.row}, ${jewel1.col}) with (${jewel2.row}, ${jewel2.col})`);

        const sprite1 = this.jewelSprites[jewel1.row][jewel1.col];
        const sprite2 = this.jewelSprites[jewel2.row][jewel2.col];

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
            ease: 'quad.out'
        });

        // Animate sprite2 to sprite1's position
        this.tweens.add({
            targets: sprite2,
            x: targetX2,
            y: targetY2,
            duration: SWAP_SPEED,
            ease: 'quad.out',
            onComplete: () => {
                // --- THIS IS CRITICAL ---
                // After the visual swap animation is done, update the underlying data model
                this.updateModelsAfterSwap(jewel1, jewel2);
                this.isSwapping = false;

                // --- FUTURE LOGIC ---
                // Here is where you would check for matches involving the two swapped jewels
            }
        });
    }
    
    /** Updates the data model and the sprite array to reflect a swap */
    private updateModelsAfterSwap(jewel1: Jewel, jewel2: Jewel) {
        const row1 = jewel1.row; const col1 = jewel1.col;
        const row2 = jewel2.row; const col2 = jewel2.col;

        // Swap the data in the model
        this.board[row1][col1] = jewel2;
        this.board[row2][col2] = jewel1;

        // Update the row/col properties within the Jewel objects themselves
        jewel1.row = row2; jewel1.col = col2;
        jewel2.row = row1; jewel2.col = col1;

        // Swap the sprites in the view array
        const sprite1 = this.jewelSprites[row1][col1];
        const sprite2 = this.jewelSprites[row2][col2];
        this.jewelSprites[row1][col1] = sprite2;
        this.jewelSprites[row2][col2] = sprite1;
    }

    private showSelectionIndicator(row: number, col: number) {
        if (!this.selectionGlow) return;
        
        const x = col * CELL_SIZE + 2;
        const y = row * CELL_SIZE + 2;
        this.selectionGlow.setPosition(x, y);
        this.selectionGlow.setVisible(true);

        // Add a pulsating "glow" animation
        this.tweens.add({
            targets: this.selectionGlow,
            alpha: 0.4,
            duration: 400,
            yoyo: true,
            repeat: -1 // Loop forever
        });
    }

    private hideSelectionIndicator() {
        if (!this.selectionGlow) return;
        this.tweens.killTweensOf(this.selectionGlow); // Stop the glow animation
        this.selectionGlow.setAlpha(1); // Reset alpha
        this.selectionGlow.setVisible(false);
    }
}
