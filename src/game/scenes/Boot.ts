// Boot.ts (AnimatedScene) - Updated with local assets, TS fixes, and scene switching
import { Scene } from "phaser";

export default class AnimatedScene extends Scene {
  constructor() {
    super({ key: "AnimatedScene" }); // Explicit key for scene management
  }

  preload() {
    this.load.atlas(
      "cube",
      "assets/cube.png", // Local paths (ensure files are in src/assets/animations/)
      "assets/cube.json",
    );
  }

  create() {
    this.anims.create({
      key: "spin",
      frames: this.anims.generateFrameNames("cube", {
        prefix: "frame",
        start: 1,
        end: 23,
      }),
      frameRate: 50,
      repeat: -1,
    });

    const group = this.add.group({
      key: "cube",
      frame: "frame1",
      repeat: 107,
      setScale: { x: 0.55, y: 0.55 },
    });

    Phaser.Actions.GridAlign(group.getChildren(), {
      width: 12,
      cellWidth: 70,
      cellHeight: 70,
      x: -20,
      y: 0,
    });

    let i = 1;
    let ci = 0;
    let colors = [
      0xef658c, 0xff9a52, 0xffdf00, 0x31ef8c, 0x21dfff, 0x31aade, 0x5275de,
      0x9c55ad, 0xbd208c,
    ];

    group.children.iterate((child: Phaser.GameObjects.GameObject) => {
      const sprite = child as Phaser.GameObjects.Sprite;
      sprite.tint = colors[ci];

      if (i % 12 === 0) {
        i = 1;
        ci++;
      } else {
        i++;
      }

      return null; // Satisfies EachSetCallback return type
    });

    this.anims.staggerPlay("spin", group.getChildren(), 0.03);

    this.cameras.main.zoom = 0.8;

    this.tweens.add({
      targets: this.cameras.main,
      props: {
        zoom: { value: 2.5, duration: 4000, ease: "Sine.easeInOut" },
        rotation: { value: 2.3, duration: 8000, ease: "Cubic.easeInOut" },
      },
      delay: 2000,
      yoyo: true,
      repeat: -1,
    });

    // Scene switching: Press space to go to GameScene
    this.input.keyboard?.on("keydown-SPACE", () =>
      this.scene.start("GameScene"),
    );
  }
}
