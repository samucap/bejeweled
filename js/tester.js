const assert = require('assert');
const Grid = require('./grid');

function testVTrips(columns) {
  let z, y;
  for (let x = 0; x < grid.width; x++) {
    y = 0;
    while (y < grid.height-2) {
      z = 0;
      curr = columns[x][y];
      next = columns[x][y+(++z)];
      nextNext = columns[x][y+(++z)];
      if (curr.type === next.type && curr.type === nextNext.type) {
        assert(curr.remove);
        assert(next.remove);
        assert(nextNext.remove);
        if (y+1 < grid.height) {
          nextNext = columns[x][y+(++z)];
          while (nextNext && curr.type === nextNext.type) {
            assert(nextNext.remove, `${x}, ${y}`);
            nextNext = columns[x][y+(++z)];
          }
        }
      }

      y++;
    }
  }
}

function testHTrips(columns) {
  let z, x;
  for (let y = 0; y < grid.width; y++) {
    x = 0;
    while (x < grid.width-2) {
      z = 0;
      //console.log(`start ${x}, ${y}, ${z}`);
      curr = columns[x][y];
      next = columns[x+(++z)][y];
      nextNext = columns[x+(++z)][y];
      //console.log(`inc ${x}, ${y}, ${z}`);
      if (curr.type === next.type && curr.type === nextNext.type) {
        assert(curr.remove, `${x}, ${y}`);
        assert(next.remove, `${x+1}, ${y}`);
        assert(nextNext.remove, `${x+2}, ${y}`);
        if (x+z+1 < grid.width-1) {
          nextNext = columns[x+(++z)][y];
          while (nextNext && curr.type === nextNext.type) {
            assert(nextNext.remove, `${x+z}, ${y}`);
            nextNext = columns[x+(++z)][y];
          }
        }
      }

      x++;
    }
  }
}

function makeGrids() {
  const grid = new Grid(8, 8);
  for (let i = 0; i < 20; i++) {
    grid.columns = [];
    grid.prepareBoard();
    testVTrips(grid.columns);
    testHTrips(grid.columns);
  }
}

makeGrids();

//const newGrid = new Grid(8, 8);
//testVTrips(newGrid);
////testHTrips();
//newGrid.printToConsole();
