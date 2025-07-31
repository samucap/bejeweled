import { Scene } from "phaser";
import Grid, { MatchData } from "./grid";
import Jewel from "./jewel";

const JEWEL_SIZE = 70;
const PARTICLE_SIZE = 16;
const JEWEL_BASE_KEY = "jewel_base";
const PARTICLE_KEY = "particle";
const SWAP_SPEED = 200;
const REMOVE_SPEED = 300;
const DROP_SPEED = 300;
const HIGHLIGHT_DELAY = 500;
const CASCADE_DELAY = 250;
const PARTICLE_BURST_COUNT = 15;

export class GameScene extends Scene {
  private grid: Grid;
  private boardContainer: Phaser.GameObjects.Container;
  private jewelSpriteMap: Map<number, Phaser.GameObjects.Sprite>;
  private firstSelection: Jewel | null = null;
  private selectionGlow: Phaser.GameObjects.Graphics | null = null;
  private selectionTween: Phaser.Tweens.Tween | null = null;
  private highlightPool: Phaser.GameObjects.Graphics[] = [];
  private isAnimating = false;
  private score: number = 0;
  private currentLevel: number = 1;
  private multiplier: number = 1;
  private progress: number = 0;
  private pointsNeeded: number = 1000;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBg!: Phaser.GameObjects.Graphics;
  private scorePanel!: Phaser.GameObjects.Graphics;

  constructor() {
    super("GameScene");
  }

  init() {
    this.grid = new Grid();
    this.jewelSpriteMap = new Map();
    this.multiplier = 1 + (this.currentLevel - 1) * 0.5;
    this.pointsNeeded = 1000 * this.currentLevel;
    this.scale.setGameSize(900, 700); // Increased height to fit progress bar under board
  }

  preload() {
    let graphics = this.make.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillRoundedRect(0, 0, JEWEL_SIZE, JEWEL_SIZE, 12);
    graphics.generateTexture(JEWEL_BASE_KEY, JEWEL_SIZE, JEWEL_SIZE);

    graphics.clear();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(
      PARTICLE_SIZE / 2,
      PARTICLE_SIZE / 2,
      PARTICLE_SIZE / 2,
    );
    graphics.generateTexture(PARTICLE_KEY, PARTICLE_SIZE, PARTICLE_SIZE);
    graphics.destroy();
  }

  create() {
    this.boardContainer = this.add.container(
      this.scale.width / 2 - 100,
      this.scale.height / 2 - 35, // Shifted up to make space for progress bar
    );

    this.createBoardView();
    this.setupInputHandler();

    const panelX = this.scale.width - 230;
    const panelY =
      this.scale.height / 2 - (this.grid.size * this.grid.cellSize) / 2 - 35; // Align with top of board
    const panelWidth = 200;
    const panelHeight = 200; // Adjusted height since progress bar is moved

    this.scorePanel = this.add.graphics();
    this.scorePanel.fillStyle(0x000000, 0.7);
    this.scorePanel.fillRoundedRect(
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      12,
    );

    this.scoreText = this.add.text(panelX + 20, panelY + 20, "Score: 0", {
      fontSize: "32px",
      color: "#ffffff",
      fontStyle: "bold",
      fontFamily: "Arial",
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#000000",
        blur: 4,
        stroke: true,
        fill: true,
      },
    });

    this.levelText = this.add.text(panelX + 20, panelY + 70, "Level: 1", {
      fontSize: "28px",
      color: "#ffffff",
      fontStyle: "bold",
      fontFamily: "Arial",
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#000000",
        blur: 4,
        stroke: true,
        fill: true,
      },
    });

    // Progress bar under the board
    const barX =
      this.boardContainer.x - (this.grid.size * this.grid.cellSize) / 2;
    const barY =
      this.scale.height / 2 -
      35 +
      (this.grid.size * this.grid.cellSize) / 2 +
      10; // 10px padding under board
    const barWidth = this.grid.size * this.grid.cellSize; // Same as board width
    const barHeight = 20;

    this.progressBar = this.add.graphics();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRoundedRect(barX, barY, 0, barHeight, 6);

    this.tweens.add({
      targets: this.scorePanel,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 600,
      yoyo: true,
      repeat: 2,
      ease: "Sine.easeInOut",
    });
  }

  private updateProgressBar() {
    const barX =
      this.boardContainer.x - (this.grid.size * this.grid.cellSize) / 2;
    const barY =
      this.scale.height / 2 -
      35 +
      (this.grid.size * this.grid.cellSize) / 2 +
      10;
    const barWidth = this.grid.size * this.grid.cellSize;
    const barHeight = 20;
    const targetWidth = barWidth * (this.progress / this.pointsNeeded);
    this.tweens.add({
      targets: { width: this.progressBar.w || 0 },
      width: targetWidth,
      duration: 500,
      ease: "Sine.easeInOut",
      onUpdate: (tween) => {
        this.progressBar.clear();
        this.progressBar.fillStyle(0x00ff00, 1);
        this.progressBar.fillRoundedRect(
          barX,
          barY,
          tween.getValue() || 0,
          barHeight,
          6,
        );
      },
    });
  }

  private createBoardView() {
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
        this.animateSwap(
          jewel1,
          jewel2,
          () => {
            this.grid.swap(jewel1, jewel2);
            this.isAnimating = false;
          },
          SWAP_SPEED / 2,
          "Elastic.easeOut",
        );
      }
    });
  }

  private animateCascade(cascadeData: MatchData[], index: number) {
    if (index >= cascadeData.length) {
      this.isAnimating = false;
      if (!this.grid.hasPossibleMoves()) {
        const gameOverText = this.add
          .text(
            this.scale.width / 2 - 100,
            this.scale.height / 2 - 35,
            "Game Over",
            {
              fontSize: "64px",
              color: "#ff0000",
              fontStyle: "bold",
              shadow: {
                offsetX: 3,
                offsetY: 3,
                color: "#000000",
                blur: 5,
                stroke: true,
                fill: true,
              },
            },
          )
          .setOrigin(0.5);
        this.input.enabled = false;
      }
      return;
    }
    const matchData = cascadeData[index];
    const highlights = this.showHighlights(matchData.trash);
    this.time.delayedCall(HIGHLIGHT_DELAY, () => {
      this.animateRemoval(matchData.removed, highlights, () => {
        this.animateDropDown(matchData, () => {
          const stepScore = matchData.score;
          const multiplied = stepScore * this.multiplier;
          this.score += multiplied;
          this.progress += stepScore;
          this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
          this.tweens.add({
            targets: this.scoreText,
            scale: 1.1,
            duration: 200,
            yoyo: true,
            ease: "Sine.easeInOut",
          });
          while (this.progress >= this.pointsNeeded) {
            this.progress -= this.pointsNeeded;
            this.currentLevel++;
            this.multiplier = 1 + (this.currentLevel - 1) * 0.5;
            this.pointsNeeded = 1000 * this.currentLevel;
            this.levelText.setText(`Level: ${this.currentLevel}`);
            this.tweens.add({
              targets: this.levelText,
              scale: 1.1,
              duration: 200,
              yoyo: true,
              ease: "Sine.easeInOut",
            });
          }
          this.updateProgressBar();
          this.time.delayedCall(CASCADE_DELAY, () => {
            this.animateCascade(cascadeData, index + 1);
          });
        });
      });
    });
  }

  private animateSwap(
    jewel1: Jewel,
    jewel2: Jewel,
    onComplete: () => void,
    duration: number = SWAP_SPEED,
    easing: string = "Cubic.easeInOut",
  ) {
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
      duration,
      ease: easing,
    });
    this.tweens.add({
      targets: sprite2,
      x: sprite1.x,
      y: sprite1.y,
      duration,
      ease: easing,
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
    const jewelSprites = removed
      .map((j) => this.jewelSpriteMap.get(j.id))
      .filter(Boolean) as Phaser.GameObjects.Sprite[];

    if (highlights && highlights.length > 0) {
      this.tweens.add({
        targets: highlights,
        alpha: 0,
        duration: REMOVE_SPEED,
        ease: "quad.in",
      });
    }

    if (jewelSprites.length > 0) {
      let completedCount = 0;
      jewelSprites.forEach((sprite, idx) => {
        const jewel = removed[idx];
        const emitter = this.add.particles(sprite.x, sprite.y, PARTICLE_KEY, {
          speed: { min: 100, max: 300 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.5, end: 0 },
          lifespan: 400,
          blendMode: "ADD",
          tint: jewel.color,
          quantity: PARTICLE_BURST_COUNT,
        });
        emitter.explode(PARTICLE_BURST_COUNT);

        this.time.delayedCall(500, () => {
          emitter.destroy();
        });

        this.tweens.add({
          targets: sprite,
          angle: 180,
          scale: 0,
          alpha: 0,
          duration: REMOVE_SPEED,
          ease: "quad.in",
          onComplete: () => {
            completedCount++;
            if (completedCount === jewelSprites.length) {
              if (highlights) {
                highlights.forEach((h) => h.setVisible(false));
              }
              onComplete();
            }
          },
        });
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

    const reusableSprites = removed
      .map((j) => this.jewelSpriteMap.get(j.id))
      .filter(Boolean);

    slid.forEach(({ jewel }) => {
      animations++;
      const sprite = this.jewelSpriteMap.get(jewel.id);
      if (!sprite) {
        onAnimComplete();
        return;
      }
      const { y } = this.getSpritePosition(jewel.row, jewel.col);
      this.tweens.add({
        targets: sprite,
        y,
        duration: DROP_SPEED,
        ease: "Bounce.easeOut",
        onComplete: onAnimComplete,
      });
    });

    newJewels.forEach((jewel) => {
      animations++;
      const { x, y } = this.getSpritePosition(jewel.row, jewel.col);
      const sprite =
        reusableSprites.pop() || this.add.sprite(x, y, JEWEL_BASE_KEY);
      if (!sprite.scene) {
        this.add.existing(sprite);
      }

      sprite.x = x;
      sprite.y = y - this.grid.cellSize * this.grid.size;
      sprite.setTint(jewel.color).setAlpha(1).setScale(1);

      this.jewelSpriteMap.set(jewel.id, sprite);

      this.tweens.add({
        targets: sprite,
        y,
        duration: DROP_SPEED,
        ease: "Bounce.easeOut",
        onComplete: onAnimComplete,
      });
    });
  }

  private showHighlights(
    trash: MatchData["trash"],
  ): Phaser.GameObjects.Graphics[] {
    const activeHighlights: Phaser.GameObjects.Graphics[] = [];
    let poolIndex = 0;

    const verticalRuns: { col: number; from: number; len: number }[] = [];
    const horizontalCandidates: { [row: number]: number[] } = {};

    for (const colStr in trash) {
      if (!Object.prototype.hasOwnProperty.call(trash, colStr)) continue;

      const col = parseInt(colStr);
      trash[col].forEach((item) => {
        if (item.len > 1) {
          verticalRuns.push({ col, from: item.from, len: item.len });
        } else {
          if (!horizontalCandidates[item.from]) {
            horizontalCandidates[item.from] = [];
          }
          horizontalCandidates[item.from].push(col);
        }
      });
    }

    verticalRuns.forEach((run) => {
      if (poolIndex >= this.highlightPool.length) return;
      const highlightRect = this.highlightPool[poolIndex++];
      const startPos = this.getSpritePosition(run.from, run.col);
      const endPos = this.getSpritePosition(run.from + run.len - 1, run.col);
      this.drawHighlightRect(
        highlightRect,
        startPos.x - this.grid.cellSize / 2,
        endPos.y - this.grid.cellSize / 2,
        this.grid.cellSize,
        this.grid.cellSize * run.len,
      );
      this.tweens.add({
        targets: highlightRect,
        scale: 1.05,
        duration: 200,
        yoyo: true,
        repeat: 1,
      });
      activeHighlights.push(highlightRect);
    });

    for (const rowStr in horizontalCandidates) {
      const row = parseInt(rowStr);
      const cols = horizontalCandidates[row].sort((a, b) => a - b);
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
            this.tweens.add({
              targets: highlightRect,
              scale: 1.05,
              duration: 200,
              yoyo: true,
              repeat: 1,
            });
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
          this.tweens.add({
            targets: highlightRect,
            scale: 1.05,
            duration: 200,
            yoyo: true,
            repeat: 1,
          });
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
    rect.setPosition(x, y).setVisible(true).setAlpha(0).setScale(1);
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
    const touchX = pointer.x - this.boardContainer.x;
    const touchY = pointer.y - this.boardContainer.y;
    const col = Math.floor(
      (touchX + (this.grid.size * this.grid.cellSize) / 2) / this.grid.cellSize,
    );
    const viewRow = Math.floor(
      (touchY + (this.grid.size * this.grid.cellSize) / 2) / this.grid.cellSize,
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

    const sprite = this.jewelSpriteMap.get(this.grid.board[col][row].id);
    if (sprite) {
      this.selectionTween = this.tweens.add({
        targets: sprite,
        scale: 1.1,
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private hideSelectionIndicator() {
    if (!this.selectionGlow) return;
    this.tweens.killTweensOf(this.selectionGlow);
    this.selectionGlow.setAlpha(1).setVisible(false);

    if (this.selectionTween) {
      this.selectionTween.stop();
      (this.selectionTween.targets[0] as Phaser.GameObjects.Sprite).setScale(1);
      this.selectionTween = null;
    }
  }
}
