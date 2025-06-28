import Grid, { MatchData } from "./grid";
import Jewel from "./jewel";

// Mock Jewel class minimally
jest.mock("./jewel", () => {
  return jest.fn().mockImplementation((row: number, col: number) => ({
    row,
    col,
    color: Math.floor(Math.random() * 5) + 1, // Random color 1-5
  }));
});

// Utility to create an 8x8 test board with specific colors
function createTestBoard(colors: number[][]): Jewel[][] {
  const size = 8;
  const board: Jewel[][] = [];
  for (let col = 0; col < size; col++) {
    board[col] = [];
    for (let row = 0; row < size; row++) {
      const jewel = new Jewel(row, col);
      jewel.color = colors[col][row];
      board[col][row] = jewel;
    }
  }
  return board;
}

describe("Grid", () => {
  let grid: Grid;

  beforeEach(() => {
    grid = new Grid();
    grid.size = 8;
    // Default board: all color 1
    grid.board = createTestBoard(
      Array(8)
        .fill(0)
        .map(() => Array(8).fill(1)),
    );
  });

  describe("swap", () => {
    it("swaps two adjacent jewels", () => {
      grid.board[0][0].color = 2;
      grid.board[0][1].color = 3;
      const jewel1 = grid.board[0][0]; // Color 2
      const jewel2 = grid.board[0][1]; // Color 3

      grid.swap(jewel1, jewel2);

      expect(grid.board[0][0].color).toBe(3);
      expect(grid.board[0][1].color).toBe(2);
      expect(grid.board[0][0].row).toBe(0);
      expect(grid.board[0][0].col).toBe(0);
      expect(grid.board[0][1].row).toBe(1);
      expect(grid.board[0][1].col).toBe(0);
    });
  });

  describe("findAllMatches", () => {
    it("returns null if no matches", () => {
      grid.board[0][0].color = 2;
      grid.board[0][1].color = 3;

      const result = grid.findAllMatches();
      expect(result).toBeNull();
    });

    it("detects a vertical match", () => {
      grid.board[0][0].color = 2;
      grid.board[0][1].color = 2;
      grid.board[0][2].color = 2;
      grid.board[0][3].color = 3;

      const result = grid.findAllMatches();
      expect(result).toHaveLength(1);
      const matchData = result![0];
      expect(matchData.removed).toHaveLength(3);
      expect(matchData.removed.map((j) => j.row)).toEqual([0, 1, 2]);
      expect(matchData.removed.every((j) => j.col === 0 && j.color === 2)).toBe(
        true,
      );
      expect(matchData.slid).toHaveLength(1);
      expect(matchData.slid[0]).toEqual({
        jewel: expect.objectContaining({ row: 0, col: 0, color: 3 }),
        fromRow: 3,
        toRow: 0,
      });
      expect(matchData.new).toHaveLength(3);
      expect(matchData.new.every((j) => j.col === 0)).toBe(true);
    });

    it("detects a horizontal match", () => {
      grid.board[0][0].color = 2;
      grid.board[1][0].color = 2;
      grid.board[2][0].color = 2;

      const result = grid.findAllMatches();
      expect(result).toHaveLength(1);
      const matchData = result![0];
      expect(matchData.removed).toHaveLength(3);
      expect(matchData.removed.map((j) => j.col)).toEqual([0, 1, 2]);
      expect(matchData.removed.every((j) => j.row === 0 && j.color === 2)).toBe(
        true,
      );
      expect(matchData.slid).toHaveLength(0);
      expect(matchData.new).toHaveLength(3);
      expect(matchData.new.every((j) => j.row === 0)).toBe(true);
    });

    it("handles cascading matches", () => {
      grid.board[0][0].color = 2;
      grid.board[0][1].color = 2;
      grid.board[0][2].color = 2;
      grid.board[0][3].color = 3;
      grid.board[1][4].color = 2;
      grid.board[2][4].color = 2;
      grid.board[3][4].color = 2;

      const originalCleanTrash = grid.cleanTrash.bind(grid);
      let callCount = 0;
      grid.cleanTrash = () => {
        if (callCount === 0) {
          originalCleanTrash();
          grid.board[0][0].color = 2; // Trigger horizontal match in row 4
          callCount++;
        } else {
          originalCleanTrash();
        }
      };

      const result = grid.findAllMatches();
      expect(result).toHaveLength(2);
      expect(result![0].removed).toHaveLength(3); // Vertical match
      expect(result![0].slid).toHaveLength(1);
      expect(result![1].removed).toHaveLength(4); // Horizontal match
      expect(result![1].slid).toHaveLength(0);
      grid.cleanTrash = originalCleanTrash; // Restore original
    });
  });

  describe("checkColumns", () => {
    it("detects a vertical match", () => {
      grid.board[0][0].color = 2;
      grid.board[0][1].color = 2;
      grid.board[0][2].color = 2;

      grid.checkColumns();
      expect(grid.trash).toEqual({
        0: [{ from: 0, len: 3 }],
      });
    });

    it("detects no vertical matches", () => {
      grid.board[0][0].color = 2;
      grid.board[0][1].color = 3;

      grid.checkColumns();
      expect(grid.trash).toEqual({});
    });
  });

  describe("checkRows", () => {
    it("detects a horizontal match", () => {
      grid.board[0][0].color = 2;
      grid.board[1][0].color = 2;
      grid.board[2][0].color = 2;

      grid.checkRows();
      expect(grid.trash).toEqual({
        0: [{ from: 0, len: 1 }],
        1: [{ from: 0, len: 1 }],
        2: [{ from: 0, len: 1 }],
      });
    });

    it("detects no horizontal matches", () => {
      grid.board[0][0].color = 2;
      grid.board[1][0].color = 3;

      grid.checkRows();
      expect(grid.trash).toEqual({});
    });
  });

  describe("mergeTrash", () => {
    it("merges overlapping trash segments", () => {
      grid.trash = {
        0: [
          { from: 0, len: 3 },
          { from: 2, len: 2 },
        ],
      };
      grid.mergeTrash();
      expect(grid.trash).toEqual({
        0: [{ from: 0, len: 4 }],
      });
    });

    it("does not merge non-overlapping segments", () => {
      grid.trash = {
        0: [
          { from: 0, len: 2 },
          { from: 3, len: 2 },
        ],
      };
      grid.mergeTrash();
      expect(grid.trash).toEqual({
        0: [
          { from: 0, len: 2 },
          { from: 3, len: 2 },
        ],
      });
    });
  });

  describe("getRemovedJewels", () => {
    it("collects unique jewels from trash", () => {
      grid.board[0][0].color = 2;
      grid.board[0][1].color = 2;
      grid.board[0][2].color = 2;
      grid.trash = { 0: [{ from: 0, len: 3 }] };

      const removed = grid.getRemovedJewels();
      expect(removed).toHaveLength(3);
      expect(removed.map((j) => j.row)).toEqual([0, 1, 2]);
    });
  });

  describe("cleanTrash", () => {
    it("removes vertical match and shifts jewels", () => {
      grid.board[0][0].color = 2;
      grid.board[0][1].color = 2;
      grid.board[0][2].color = 2;
      grid.board[0][3].color = 3;
      grid.trash = { 0: [{ from: 0, len: 3 }] };

      grid.cleanTrash();
      expect(grid.board[0][0].color).toBe(3); // Shifted from row 3
      expect(grid.board[0][0].row).toBe(0);
    });

    it("removes horizontal match and adds new jewels", () => {
      grid.board[0][0].color = 2;
      grid.board[1][0].color = 2;
      grid.board[2][0].color = 2;
      grid.trash = {
        0: [{ from: 0, len: 1 }],
        1: [{ from: 0, len: 1 }],
        2: [{ from: 0, len: 1 }],
      };

      grid.cleanTrash();
      expect(grid.board[0][0].color).not.toBe(2);
      expect(grid.board[1][0].color).not.toBe(2);
      expect(grid.board[2][0].color).not.toBe(2);
    });
  });

  describe("deriveChanges", () => {
    it("identifies sliding and new jewels after vertical match", () => {
      grid.board[0][0].color = 2;
      grid.board[0][1].color = 2;
      grid.board[0][2].color = 2;
      grid.board[0][3].color = 3;
      const beforeState = grid.board.map((col) => [...col]);
      grid.trash = { 0: [{ from: 0, len: 3 }] };

      grid.cleanTrash();
      const { slid, new: newJewels } = grid.deriveChanges(beforeState);

      expect(slid).toHaveLength(1);
      expect(slid[0]).toEqual({
        jewel: expect.objectContaining({ row: 0, col: 0, color: 3 }),
        fromRow: 3,
        toRow: 0,
      });
      expect(newJewels).toHaveLength(3);
    });

    it("identifies new jewels after horizontal match", () => {
      grid.board[0][0].color = 2;
      grid.board[1][0].color = 2;
      grid.board[2][0].color = 2;
      const beforeState = grid.board.map((col) => [...col]);
      grid.trash = {
        0: [{ from: 0, len: 1 }],
        1: [{ from: 0, len: 1 }],
        2: [{ from: 0, len: 1 }],
      };

      grid.cleanTrash();
      const { slid, new: newJewels } = grid.deriveChanges(beforeState);

      expect(slid).toHaveLength(0);
      expect(newJewels).toHaveLength(3);
      expect(newJewels.map((j) => j.col)).toEqual([0, 1, 2]);
    });
  });
});
