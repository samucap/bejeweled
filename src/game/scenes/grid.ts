import Jewel from "./jewel";

export default class Grid {
  board: Jewel[][] = [];
  size: number = 8;
  cellSize: number = 80;

  constructor() {
    this.createBoardModel();
  }

  private createBoardModel() {
    for (let row = 0; row < this.size; row++) {
      this.board[row] = [];
      for (let col = 0; col < this.size; col++) {
        this.board[row][col] = new Jewel(row, col);
      }
    }
  }

  checkBoard(x: number, y: number) {
    let change = 1;
    console.log(x, y, change);
  }

  /** Updates the data model and the sprite array to reflect a swap */
  updateBoard(jewel1: Jewel, jewel2: Jewel) {
    const row1 = jewel1.row;
    const col1 = jewel1.col;
    const row2 = jewel2.row;
    const col2 = jewel2.col;

    // Swap the data in the model
    this.board[row1][col1] = jewel2;
    this.board[row2][col2] = jewel1;

    // Update the row/col properties within the Jewel objects themselves
    jewel1.row = row2;
    jewel1.col = col2;
    jewel2.row = row1;
    jewel2.col = col1;
  }
}
