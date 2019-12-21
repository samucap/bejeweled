const chalk = require('chalk');

const Jewel = require('./jewel');

module.exports = class Grid {
  constructor(width, height, testing) {
    this.width = width;
    this.height = height;
    this.testing = testing;
    this.ready = false;
    this.columns = [];
    this.trash = {};
    this.prepareBoard();
    console.log(`trash===${JSON.stringify(this.trash)}`);
  }

  prepareBoard() {
    if (!this.testing) this.populate();
    else this.populateTest();
    this.printToConsole();
    //this.hTripsSeeker(0);
    this.tripsSeeker();
  }

  populate() {
    let currJewel;
    for(let x = 0; x < this.width; x++) {
      this.columns.push([]);
      for(let y = 0; y < this.height; y++) {
        this.columns[x].push(new Jewel(x, y));
      }
    }
  }

  populateTest() {
    let currJewel;
    for(let x = 0; x < this.width; x++) {
      this.columns.push([]);
      for(let y = 0; y < this.height; y++) {
        currJewel = new Jewel(x, y);
        if (x < 3 && y < 3) {
          currJewel.changeType('red');
        } else if ((x > 3 && x <= 6) && (y > 3 && y <= 6)) {
          currJewel.changeType('blue');
        }
        this.columns[x].push(currJewel);
      }
    }
  }

  printToConsole() {
    let column = ``;
    let counter = 0;
    let z, currJewel;
    for(let y = this.height - 1; y >= 0; y--) {
      z = 0;
      if (y < this.height) column += `\n`;
      while(z < this.width) {
        currJewel = this.columns[z++][y];
        column += `${chalk.hex(currJewel.type).bold(`JEWEL: ${currJewel.x}, ${currJewel.y}${currJewel.remove ? ' RM' : '   '}`)}${z > 0 ? `   ` : ''}`;
      }
    }

    console.log(column);
  }

  render() {
    let container = document.createElement('div'),
      currCanvas;
    container.id = 'container';
    document.body.appendChild(container);
    currCanvas = document.createElement('CANVAS');
    currCanvas.id = 'currCanvas';
    currCanvas.setAttribute('width', 640);
    currCanvas.setAttribute('height', 640);
    currCanvas.addEventListener('click', this.handleClick);
    container.appendChild(currCanvas);
  }

  checkTrips(currItem, next, currCol, idx) {
    //console.log(`curr>>>>>>>>> ${JSON.stringify(currItem)}`);
    //console.log(`next>>>>>>>>> ${JSON.stringify(next)}`);
    if (idx+2 < this.height && currItem.type === next.type && currItem.type === currCol[idx+2].type) {
      // remove attr instead of array of to remove because two trips in one column
      // it will remove wrong indexing after first removes
      currItem.remove = true;
      next.remove = true;
      idx+=2;
      currCol[idx].remove = true;
      currItem = currCol[idx];
      next = currCol[idx+1];
      this.checkTrips(currItem, next, currCol, idx);
    } else {
      idx+=3;
      return;
    }
  }

  // need to test boundaries &&
  vTripsSeeker() {
    let j, currItem, next;
    this.columns.forEach((currCol) => {
      j = 0;
      while(j < this.width-2) {
        currItem = currCol[j];
        next = currCol[j+1];
        this.checkTrips(currItem, next, currCol, j++);
      }
    });
  }
  
  tripsSeeker(colIdx = 0, rowIdx = 0) {
    let currArr;

    if (colIdx < this.width) {
      currArr = this.columns[colIdx]; 
      this.checkTrips(currArr[rowIdx], currArr[rowIdx+1], currArr, rowIdx);
      this.tripsSeeker(++colIdx, rowIdx);
    }
  }
}
