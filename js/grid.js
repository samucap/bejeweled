'use strict';
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
    else {
      this.populateTest();
    }
    this.tripsSeeker();
    //this.printToConsole();
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
        if (x < 3 && y < 4) {
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
    for(let y = 0; y < this.height; y++) {
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

  tripsSeeker(levels = 0) {
    if (levels < this.width) {
      this.vTripsSeeker(levels, 0);
      this.hTripsSeeker(0, levels);
      this.tripsSeeker(++levels);
    }
  }

  vTripsSeeker(colIdx = 0, rowIdx = 0) {
    let curr, prev;
    console.log(`verticaldoing ====== ${colIdx}, ${rowIdx}`);
    prev = rowIdx !== 0 ? this.columns[colIdx][rowIdx-1] : null;
    curr = this.columns[colIdx][rowIdx];

    if (prev && prev.remove && prev.type === curr.type) {
      curr.remove = true;
    } else if (curr.type === this.columns[colIdx][rowIdx+1].type
      && curr.type === this.columns[colIdx][rowIdx+2].type) {
      curr.remove = true;
      this.columns[colIdx][rowIdx+1].remove = true;
      this.columns[colIdx][rowIdx+2].remove = true;
      rowIdx+=2;
    }

    rowIdx++;
    if (rowIdx <= this.height-3
      || (this.columns[colIdx][rowIdx] && curr.type === this.columns[colIdx][rowIdx].type))
      this.vTripsSeeker(colIdx, rowIdx);
  }

  hTripsSeeker(colIdx = 0, rowIdx = 0) {
    let curr, prev;
    console.log(`hor====== ${colIdx}, ${rowIdx}`);
    prev = colIdx !== 0 ? this.columns[colIdx-1][rowIdx] : null;
    curr = this.columns[colIdx][rowIdx];

    if (prev && prev.remove && prev.type === curr.type) {
      curr.remove = true;
    } else if (curr.type === this.columns[colIdx+1][rowIdx].type
      && curr.type === this.columns[colIdx+2][rowIdx].type) {
      curr.remove = true;
      this.columns[colIdx+1][rowIdx].remove = true;
      this.columns[colIdx+=2][rowIdx].remove = true;
    }

    colIdx++;
    if (colIdx <= this.width-3
      || (this.columns[colIdx] && curr.type === this.columns[colIdx][rowIdx].type))
      this.hTripsSeeker(colIdx, rowIdx);
  }
}
