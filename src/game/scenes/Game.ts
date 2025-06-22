import Phaser from 'phaser';

// --- Constants ---
const GRID_SIZE = 8;
const CELL_SIZE = 70; // Visual size of each cell
const JEWEL_SIZE = 52; // Visual size of the jewel sprite
const JEWEL_COLORS = [0xff3333, 0x3366ff, 0x33cc33, 0xffcc00, 0xff9900, 0x9933ff, 0xcccccc];
const JEWEL_BASE_KEY = 'jewel_base';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        //Instead of 7 textures, we create ONE white texture. This is far more reliable.
        const graphics = this.make.graphics();
        graphics.fillStyle(0xffffff); // White
        graphics.fillRoundedRect(0, 0, JEWEL_SIZE, JEWEL_SIZE, 12);
        graphics.generateTexture(JEWEL_BASE_KEY, JEWEL_SIZE, JEWEL_SIZE);
        graphics.destroy();
    }

    create() {
        // A single graphics object for drawing the static grid background.
        const gridGraphics = this.add.graphics();
        gridGraphics.fillStyle(0x000000, 0.2);
        gridGraphics.lineStyle(1, 0xffffff, 0.15);

        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE;

                // Draw the background cell
                gridGraphics.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                gridGraphics.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

                // Create the jewel using our single white base texture
                const jewel = this.add.sprite(
                    x + CELL_SIZE / 2,
                    y + CELL_SIZE / 2,
                    JEWEL_BASE_KEY
                );

                // Pick a random color and APPLY IT as a tint
                const randomColor = Phaser.Math.RND.pick(JEWEL_COLORS);
                jewel.setTint(randomColor);

                // Set up interactivity
                jewel.setInteractive({ useHandCursor: true });
                jewel.setData('gridRow', row);
                jewel.setData('gridCol', col);

                jewel.on('pointerdown', () => this.handleCellClick(jewel));
            }
        }
    }

    private handleCellClick(jewel: Phaser.GameObjects.Sprite) {
        const row = jewel.getData('gridRow') as number;
        const col = jewel.getData('gridCol') as number;

        console.log(`Cell clicked! Row: ${row}, Column: ${col}`);
        console.log('Jewel Color (Tint):', jewel.tintTopLeft.toString(16));

        // Visual feedback
        this.tweens.add({
            targets: jewel,
            scale: 1.3,
            duration: 150,
            yoyo: true,
            ease: 'quad.out'
        });
    }
}
