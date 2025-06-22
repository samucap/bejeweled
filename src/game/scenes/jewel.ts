const JEWEL_TYPES = [
  0xc200fb, 0x8cd867, 0xf1d302, 0xa31621, 0xd74e09, 0xf7f7ff, 0x2364aa,
];

export default class Jewel {
  public row: number;
  public col: number;
  public color: number;
  public size: number = 70;
  //TODO: move GameScene.jewelSprites and everything jewel

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
    this.color = Phaser.Math.RND.pick(JEWEL_TYPES);
  }
}
