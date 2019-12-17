const Jewel = require('./jewel');
const Grid = require('./grid');
const newGrid = new Grid(8, 8, true);

let expected = ['3-4','4-4','5-4','1-0','1-1','1-2','1-3','3-5','3-6','3-7'];
expected = expected.filter((each) => newGrid.trash.indexOf(each) < 0);

if (expected.length === 0)
  console.log(`PASS`);
else {
  console.log(`!!FAIL!! ${newGrid.trash}`);
  console.log(`!!FAILexpected!! ${expected}`);
}

/////////////////////
// test vTripsSeeker()
console.log(`==========//test vTripsSeeker()`);
const vTripsGrid = new Grid(8, 8);
const columns = vTripsGrid.columns;
vTripsGrid.trash = [];
//
for(let i = 0; i < columns.length; i++) {
  for(let y = 0; y < columns[i].length; y++) {
    if (i < 3 && y < 3) {
      columns[i][y] = new Jewel(i, y);
      columns[i][y].specificJewel(i, y, 2);
    } else if ((i >= 3 && i < 5) && (y >= 3 && y < 5)) {
      columns[i][y] = new Jewel(i, y);
      columns[i][y].specificJewel(i, y, 4);
    } else if (i >= 5 && (y >= 5 && y < 7)) {
      columns[i][y] = new Jewel(i, y);
      columns[i][y].specificJewel(i, y, 6);
    }
  }
}
vTripsGrid.vTripsSeeker();
console.log(vTripsGrid.trash);
vTripsGrid.printToConsole();
