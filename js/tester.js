const assert = require('assert');
const Grid = require('./grid');

function testVTrips(columns) {
  let z, y;
  for (let x = 0; x < columns.length; x++) {
    y = 0;
    while (y < columns.length-2) {
      z = 0;
      curr = columns[x][y];
      next = columns[x][y+(++z)];
      nextNext = columns[x][y+(++z)];
      if (curr.type === next.type && curr.type === nextNext.type) {
        assert(curr.remove);
        assert(next.remove);
        assert(nextNext.remove);
        while (y+z+1 < columns.length && curr.type === columns[x][y+z+1].type) {
          nextNext = columns[x][y+(++z)];
          assert(nextNext.remove, `${x}, ${y}`);
        }

        y+=z;
      }
      //else {
      //  assert(!curr.remove, `${x}, ${y}`);
      //}

      y++;
    }
  }
}

function testHTrips(columns) {
  let z, x;
  for (let y = 0; y < columns.length; y++) {
    x = 0;
    while (x < columns.length-2) {
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
        while (x+z+1 < columns.length && curr.type === columns[x+z+1][y].type) {
          nextNext = columns[x+(++z)][y];
          assert(nextNext.remove, `${x+z}, ${y}`);
        }

        x+=z;
      }
      //else {
      //  assert(!curr.remove, `${x}, ${y}`);
      //}

      x++;
    }
  }
}

function checkTrash(grid) {
  for (let x = 0; x < grid.columns.length; x++) {
    grid.trash[x].forEach(item => {
      pair = item.split(',').map(each => parseInt(each));
      while (pair[1]) {
        //rmItems[x].push([x,pair[0]++]);
        assert(grid.columns[x][pair[0]++].remove, `${x}-${pair[0]}`);
        pair[1]--;
      }
    });
  }
}

function makeGrids() {
  const grid = new Grid(8, 8);
  for (let i = 0; i < 30; i++) {
    grid.columns = [];
    grid.prepareBoard();
    // need to test separately cuz of existing remove
    testVTrips(grid.columns);
    testHTrips(grid.columns);
    checkTrash(grid);
  }
}

makeGrids();
