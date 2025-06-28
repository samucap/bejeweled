export const JEWEL_TYPES = [
  0xc200fb, 0x8cd867, 0xf1d302, 0xa31621, 0xd74e09, 0xf7f7ff, 0x2364aa,
];

let nextId = 0;

export default class Jewel {
  public id: number;
  public row: number;
  public col: number;
  public color: number;
  public size: number = 70;

  constructor(row: number, col: number) {
    this.id = nextId++; // Assign a unique ID to each new jewel
    this.row = row;
    this.col = col;
    this.color = Phaser.Math.RND.pick(JEWEL_TYPES);
  }
}
