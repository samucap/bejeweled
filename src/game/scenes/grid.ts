import Jewel, { JEWEL_TYPES } from "./jewel";

interface TrashItem {
  from: number;
  len: number;
}

export interface MatchData {
  removed: Jewel[];
  slid: { jewel: Jewel; fromRow: number; toRow: number }[];
  new: Jewel[];
  trash: { [col: number]: TrashItem[] };
  score: number;
}

export default class Grid {
  board: Jewel[][] = [];
  size: number = 8;
  cellSize: number = 80;

  constructor() {
    this.createBoardModel();
  }

  /**
   * **UPDATED LOGIC**
   * Creates the initial board, ensuring no three-in-a-row matches exist from the start.
   */
  private createBoardModel() {
    for (let col = 0; col < this.size; col++) {
      this.board[col] = [];
      for (let row = 0; row < this.size; row++) {
        let possibleColors = [...JEWEL_TYPES];

        // Check for horizontal match to the left
        if (
          col >= 2 &&
          this.board[col - 1][row].color === this.board[col - 2][row].color
        ) {
          const invalidColor = this.board[col - 1][row].color;
          possibleColors = possibleColors.filter((c) => c !== invalidColor);
        }

        // Check for vertical match below
        if (
          row >= 2 &&
          this.board[col][row - 1].color === this.board[col][row - 2].color
        ) {
          const invalidColor = this.board[col][row - 1].color;
          possibleColors = possibleColors.filter((c) => c !== invalidColor);
        }

        const chosenColor = Phaser.Math.RND.pick(possibleColors);
        const jewel = new Jewel(row, col);
        jewel.color = chosenColor;
        this.board[col][row] = jewel;
      }
    }
  }

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

  public findAllMatches(): MatchData[] | null {
    const cascade: MatchData[] = [];
    while (true) {
      const currentTrash: { [col: number]: TrashItem[] } = {};
      let stepScore = 0;
      stepScore += this.checkColumns(currentTrash);
      stepScore += this.checkRows(currentTrash);
      if (Object.keys(currentTrash).length === 0) break;
      this.mergeTrash(currentTrash);
      const removed = this.getRemovedJewels(currentTrash);
      const beforeState = this.board.map((col) => [...col]);
      this.cleanTrash(currentTrash);
      const { slid, new: newJewels } = this.deriveChanges(beforeState);
      cascade.push({
        removed,
        slid,
        new: newJewels,
        trash: currentTrash,
        score: stepScore,
      });
    }
    return cascade.length > 0 ? cascade : null;
  }

  public hasPossibleMoves(): boolean {
    // Check horizontal swaps
    for (let col = 0; col < this.size - 1; col++) {
      for (let row = 0; row < this.size; row++) {
        this.swap(this.board[col][row], this.board[col + 1][row]);
        const tempTrash: { [col: number]: TrashItem[] } = {};
        this.checkColumns(tempTrash);
        this.checkRows(tempTrash);
        this.swap(this.board[col][row], this.board[col + 1][row]);
        if (Object.keys(tempTrash).length > 0) return true;
      }
    }
    // Check vertical swaps
    for (let col = 0; col < this.size; col++) {
      for (let row = 0; row < this.size - 1; row++) {
        this.swap(this.board[col][row], this.board[col][row + 1]);
        const tempTrash: { [col: number]: TrashItem[] } = {};
        this.checkColumns(tempTrash);
        this.checkRows(tempTrash);
        this.swap(this.board[col][row], this.board[col][row + 1]);
        if (Object.keys(tempTrash).length > 0) return true;
      }
    }
    return false;
  }

  private deriveChanges(beforeState: Jewel[][]) {
    const slid: { jewel: Jewel; fromRow: number; toRow: number }[] = [];
    const newJewels: Jewel[] = [];
    for (let col = 0; col < this.size; col++) {
      const afterCol = this.board[col];
      const beforeCol = beforeState[col];
      afterCol.forEach((jewel, toRow) => {
        const fromRow = beforeCol.indexOf(jewel);
        if (fromRow !== -1) {
          if (fromRow !== toRow) {
            slid.push({ jewel, fromRow, toRow });
          }
        } else {
          newJewels.push(jewel);
        }
      });
    }
    return { slid, new: newJewels };
  }

  private cleanTrash(trash: { [col: number]: TrashItem[] }) {
    const cols = Object.keys(trash).map((c) => parseInt(c));
    for (const col of cols) {
      const trashItems = trash[col];
      trashItems.sort((a, b) => b.from - a.from);
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

  private getRemovedJewels(trash: { [col: number]: TrashItem[] }): Jewel[] {
    const removed = new Set<Jewel>();
    for (const col in trash) {
      trash[col].forEach((item) => {
        for (let i = 0; i < item.len; i++) {
          removed.add(this.board[parseInt(col)][item.from + i]);
        }
      });
    }
    return Array.from(removed);
  }

  private checkColumns(trash: { [col: number]: TrashItem[] }): number {
    let score = 0;
    for (let col = 0; col < this.size; col++) {
      let runStart = 0;
      for (let row = 1; row < this.size; row++) {
        if (this.board[col][row].color !== this.board[col][runStart].color) {
          const runLength = row - runStart;
          if (runLength >= 3) {
            if (!trash[col]) trash[col] = [];
            trash[col].push({ from: runStart, len: runLength });
            score += 50 * (runLength - 2);
          }
          runStart = row;
        }
      }
      const runLength = this.size - runStart;
      if (runLength >= 3) {
        if (!trash[col]) trash[col] = [];
        trash[col].push({ from: runStart, len: runLength });
        score += 50 * (runLength - 2);
      }
    }
    return score;
  }

  private checkRows(trash: { [col: number]: TrashItem[] }): number {
    let score = 0;
    for (let row = 0; row < this.size; row++) {
      let runStart = 0;
      for (let col = 1; col < this.size; col++) {
        if (this.board[col][row].color !== this.board[runStart][row].color) {
          const runLength = col - runStart;
          if (runLength >= 3) {
            score += 50 * (runLength - 2);
            for (let c = runStart; c < col; c++) {
              if (!trash[c]) trash[c] = [];
              trash[c].push({ from: row, len: 1 });
            }
          }
          runStart = col;
        }
      }
      const runLength = this.size - runStart;
      if (runLength >= 3) {
        score += 50 * (runLength - 2);
        for (let c = runStart; c < this.size; c++) {
          if (!trash[c]) trash[c] = [];
          trash[c].push({ from: row, len: 1 });
        }
      }
    }
    return score;
  }

  private mergeTrash(trash: { [col: number]: TrashItem[] }) {
    for (const col in trash) {
      if (trash[col].length <= 1) continue;
      trash[col].sort((a, b) => a.from - b.from);
      let i = 0;
      while (i < trash[col].length - 1) {
        const current = trash[col][i];
        const next = trash[col][i + 1];
        if (current.from + current.len >= next.from) {
          const newEnd = Math.max(
            current.from + current.len,
            next.from + next.len,
          );
          current.len = newEnd - current.from;
          trash[col].splice(i + 1, 1);
        } else {
          i++;
        }
      }
    }
  }
}
