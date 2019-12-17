const Grid = require('./grid');
const newGrid = new Grid(8, 8, true);
let expected = ['3-4','4-4','5-4','1-0','1-1','1-2','1-3','3-5','3-6','3-7'];
expected = expected.filter((each) => newGrid.trash.indexOf(each) < 0);

if (expected.length === 0)
  console.log("PASS");
else 
  console.log("FAIL");
