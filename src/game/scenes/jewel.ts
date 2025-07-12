export const JEWEL_TYPES = [
  0xc200fb, // Purple
  0x8cd867, // Green
  0xf1d302, // Yellow
  0xa31621, // Red
  0xd74e09, // Orange
  0xf7f7ff, // White
  0x2364aa, // Blue
];

// Corresponds to JEWEL_TYPES by index
export const JEWEL_SHAPES = [
  "star",
  "diamond",
  "triangle",
  "hexagon",
  "pentagon",
  "circle",
  "plus",
];

let nextId = 0;

export default class Jewel {
  public id: number;
  public row: number;
  public col: number;
  public color: number;
  public shape: string;
  public size: number = 70;

  constructor(row: number, col: number) {
    this.id = nextId++;
    this.row = row;
    this.col = col;

    const typeIndex = Phaser.Math.RND.between(0, JEWEL_TYPES.length - 1);
    this.color = JEWEL_TYPES[typeIndex];
    this.shape = JEWEL_SHAPES[typeIndex];
  }
}
