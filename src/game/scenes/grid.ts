import Jewel from "./jewel";

/**
 * Defines a segment of jewels to be removed from a column.
 */
interface TrashItem {
  from: number;
  len: number;
}

/**
 * A snapshot of all changes that occur in a single "clear and refill" cycle.
 * This object is returned to the GameScene to be animated.
 */
export interface MatchData {
  removed: Jewel[];
  slid: { jewel: Jewel; fromRow: number; toRow: number }[];
  new: Jewel[];
}

export default class Grid {
  board: Jewel[][] = [];
  size: number = 8;
  cellSize: number = 80;
  trash: { [col: number]: TrashItem[] } = {};

  constructor() {
    this.createBoardModel();
  }

  /**
   * Initializes the board with new jewels.
   */
  private createBoardModel() {
    for (let col = 0; col < this.size; col++) {
      this.board[col] = [];
      for (let row = 0; row < this.size; row++) {
        this.board[col][row] = new Jewel(row, col);
      }
    }
  }

  /**
   * Swaps two jewels in the data model.
   * This is called by the GameScene.
   */
  public swap(jewel1: Jewel, jewel2: Jewel) {
    const { row: r1, col: c1 } = jewel1;
    const { row: r2, col: c2 } = jewel2;

    [this.board[c1][r1], this.board[c2][r2]] = [
      this.board[c2][r2],
      this.board[c1][r1],
    ];
    [jewel1.row, jewel2.row] = [r2, r1];
    [jewel1.col, jewel2.col] = [c2, c1];
  }

  /**
   * Main logic loop for finding and clearing all matches.
   * It continues to check for matches until the board is stable.
   * @returns An array of MatchData, one for each step in the cascade.
   */
  public findAllMatches(): MatchData[] | null {
    const cascade: MatchData[] = [];

    while (true) {
      this.trash = {};
      this.checkColumns();
      this.checkRows();

      if (Object.keys(this.trash).length === 0) {
        break; // No more matches, exit the loop
      }

      this.mergeTrash();
      const removed = this.getRemovedJewels();
      const beforeState = this.board.map((col) => [...col]);

      this.cleanTrash(); // This modifies the board array

      const { slid, new: newJewels } = this.deriveChanges(beforeState);

      cascade.push({ removed, slid, new: newJewels });
    }

    return cascade.length > 0 ? cascade : null;
  }

  /**
   * Compares the board before and after a clear to find which jewels slid and which are new.
   * @param beforeState The state of the board before `cleanTrash` was called.
   * @returns An object containing arrays of sliding and new jewels.
   */
  deriveChanges(beforeState: Jewel[][]) {
    const slid: { jewel: Jewel; fromRow: number; toRow: number }[] = [];
    const newJewels: Jewel[] = [];

    for (let col = 0; col < this.size; col++) {
      const afterCol = this.board[col];
      const beforeCol = beforeState[col];

      afterCol.forEach((jewel, toRow) => {
        const fromRow = beforeCol.indexOf(jewel);
        if (fromRow !== -1) {
          // This jewel existed before, so it slid.
          if (fromRow !== toRow) {
            slid.push({ jewel, fromRow, toRow });
          }
        } else {
          // This jewel did not exist before, so it's new.
          newJewels.push(jewel);
        }
      });
    }
    return { slid, new: newJewels };
  }

  /**
   * Removes jewels marked in `this.trash` and adds new ones to the top of columns.
   */
  cleanTrash() {
    const cols = Object.keys(this.trash).map((c) => parseInt(c));
    for (const col of cols) {
      const trashItems = this.trash[col];
      trashItems.sort((a, b) => b.from - a.from); // Sort descending to splice safely

      let removedCount = 0;
      for (const item of trashItems) {
        this.board[col].splice(item.from, item.len);
        removedCount += item.len;
      }

      for (let i = 0; i < removedCount; i++) {
        this.board[col].push(new Jewel(this.board[col].length + i, col));
      }

      this.board[col].forEach((jewel, idx) => (jewel.row = idx));
    }
  }

  /**
   * Gathers all unique Jewel objects that are marked for removal.
   */
  getRemovedJewels(): Jewel[] {
    const removed = new Set<Jewel>();
    for (const col in this.trash) {
      this.trash[col].forEach((item) => {
        for (let i = 0; i < item.len; i++) {
          removed.add(this.board[parseInt(col)][item.from + i]);
        }
      });
    }
    return Array.from(removed);
  }

  checkColumns() {
    for (let col = 0; col < this.size; col++) {
      let runStart = 0;
      for (let row = 1; row < this.size; row++) {
        if (this.board[col][row].color !== this.board[col][runStart].color) {
          const runLength = row - runStart;
          if (runLength >= 3) {
            if (!this.trash[col]) this.trash[col] = [];
            this.trash[col].push({ from: runStart, len: runLength });
          }
          runStart = row;
        }
      }
      if (this.size - runStart >= 3) {
        if (!this.trash[col]) this.trash[col] = [];
        this.trash[col].push({ from: runStart, len: this.size - runStart });
      }
    }
  }

  checkRows() {
    for (let row = 0; row < this.size; row++) {
      let runStart = 0;
      for (let col = 1; col < this.size; col++) {
        if (this.board[col][row].color !== this.board[runStart][row].color) {
          const runLength = col - runStart;
          if (runLength >= 3) {
            for (let c = runStart; c < col; c++) {
              if (!this.trash[c]) this.trash[c] = [];
              this.trash[c].push({ from: row, len: 1 });
            }
          }
          runStart = col;
        }
      }
      if (this.size - runStart >= 3) {
        for (let c = runStart; c < this.size; c++) {
          if (!this.trash[c]) this.trash[c] = [];
          this.trash[c].push({ from: row, len: 1 });
        }
      }
    }
  }

  mergeTrash() {
    for (const col in this.trash) {
      if (this.trash[col].length <= 1) continue;
      this.trash[col].sort((a, b) => a.from - b.from);
      let i = 0;
      while (i < this.trash[col].length - 1) {
        const current = this.trash[col][i];
        const next = this.trash[col][i + 1];
        if (current.from + current.len >= next.from) {
          const newEnd = Math.max(
            current.from + current.len,
            next.from + next.len,
          );
          current.len = newEnd - current.from;
          this.trash[col].splice(i + 1, 1);
        } else {
          i++;
        }
      }
    }
  }
}
