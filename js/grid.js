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
      this.trash[x] = [];
      for(let y = 0; y < this.height; y++) {
        this.columns[x].push(new Jewel(x, y));
      }
    }
  }

  populateTest() {
    let currJewel;
    for(let x = 0; x < this.width; x++) {
      this.columns.push([]);
      this.trash[x] = [];
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

  vTripsSeeker(colIdx = 0, rowIdx = 0, prev) {
    let curr, currTrash, pair, i = 0;
    console.log(`verticaldoing ====== ${colIdx}, ${rowIdx}`);
    curr = this.columns[colIdx][rowIdx];

    // seeking quads+
    if (prev && prev.remove && prev.type === curr.type && !curr.remove) {
      currTrash = this.trash[colIdx].indexOf(this.trash[colIdx].find(item => {
        pair = item.split(',');
        return rowIdx === pair[0]-1 || rowIdx <= pair.reduce((acc, v) => acc+parseInt(v), 0);
      }));

      if (currTrash !== -1) {
        if (rowIdx === pair[0]-1) {
          this.trash[colIdx][currTrash] = this.trash[colIdx][currTrash].replace(/^\d/, rowIdx).replace(/\d$/, (m) => parseInt(m)+1);
        } else {
          this.trash[colIdx][currTrash] = this.trash[colIdx][currTrash].replace(/\d$/, (m) => parseInt(m)+1);
        }
      }

        console.log(`adding=======`, this.trash);
      curr.remove = true;
      prev = this.columns[colIdx][rowIdx];
    // seeking trips
    } else if (rowIdx < this.height-2 && curr.type === this.columns[colIdx][rowIdx+1].type
      && curr.type === this.columns[colIdx][rowIdx+2].type) {
      while(i < 3) {
        if (!this.columns[colIdx][rowIdx+i].remove) {
          currTrash = this.trash[colIdx].indexOf(this.trash[colIdx].find(item => {
            pair = item.split(',');
            return rowIdx === pair[0]-1 || rowIdx <= pair.reduce((acc, v) => acc+parseInt(v), 0);
          }));

          if (currTrash !== -1) {
            if (rowIdx === pair[0]-1) {
              this.trash[colIdx][currTrash] = this.trash[colIdx][currTrash].replace(/^\d/, rowIdx).replace(/\d$/, (m) => parseInt(m)+1);
            } else {
              this.trash[colIdx][currTrash] = this.trash[colIdx][currTrash].replace(/\d$/, (m) => parseInt(m)+1);
            }
          } else {
            this.trash[colIdx].push(`${rowIdx+i},1`);
          }
        }

        i++;
      }

      curr.remove = true;
      this.columns[colIdx][rowIdx+1].remove = true;
      this.columns[colIdx][rowIdx+=2].remove = true;
      prev = this.columns[colIdx][rowIdx-1];
      console.log(`newtrio=======`, this.trash);
    } else {
      prev = null;
    }

    rowIdx++;
    if (rowIdx <= this.height-3
      || (this.columns[colIdx][rowIdx] && curr.type === this.columns[colIdx][rowIdx].type))
      this.vTripsSeeker(colIdx, rowIdx, prev);
  }

  hTripsSeeker(colIdx = 0, rowIdx = 0, prev) {
    let curr, currTrash, pair, i = 0;
    console.log(`hor====== ${colIdx}, ${rowIdx}`);
    curr = this.columns[colIdx][rowIdx];

    if (prev && prev.remove && prev.type === curr.type && !curr.remove) {
        currTrash = this.trash[colIdx].indexOf(this.trash[colIdx].find(item => {
          pair = item.split(',');
          return rowIdx === pair[0]-1 || rowIdx <= pair.reduce((acc, v) => acc+parseInt(v), 0);
        }));
        if (currTrash !== -1) {
          if (rowIdx === pair[0]-1) {
            this.trash[colIdx][currTrash] = this.trash[colIdx][currTrash].replace(/^\d/, rowIdx).replace(/\d$/, (m) => parseInt(m)+1);
          } else {
            this.trash[colIdx][currTrash] = this.trash[colIdx][currTrash].replace(/\d$/, (m) => parseInt(m)+1);
          }
        } else {
          this.trash[colIdx].push(`${rowIdx},1`);
        }
        console.log(`adding=======`, this.trash);

      curr.remove = true;
      prev = this.columns[colIdx][rowIdx];
    } else if (colIdx < this.height-2 && curr.type === this.columns[colIdx+1][rowIdx].type
      && curr.type === this.columns[colIdx+2][rowIdx].type) {
      while(i < 3) {
        if (!this.columns[colIdx+i][rowIdx].remove) {
          currTrash = this.trash[colIdx+i].indexOf(this.trash[colIdx+i].find(item => {
            pair = item.split(',');
            return rowIdx === pair[0]-1 || rowIdx <= pair.reduce((acc, v) => acc+parseInt(v), 0);
          }));

          if (currTrash !== -1) {
            if (rowIdx === pair[0]-1) {
              this.trash[colIdx+i][currTrash] = this.trash[colIdx+i][currTrash].replace(/^\d/, rowIdx).replace(/\d$/, (m) => parseInt(m)+1);
            } else {
              this.trash[colIdx+i][currTrash] = this.trash[colIdx+i][currTrash].replace(/\d$/, (m) => parseInt(m)+1);
            }
          } else {
            this.trash[colIdx+i].push(`${rowIdx},1`);
          }
        }

        i++;
      }
        console.log(`newtrio=======`, this.trash);
      
      curr.remove = true;
      this.columns[colIdx+1][rowIdx].remove = true;
      this.columns[colIdx+=2][rowIdx].remove = true;
      prev = this.columns[colIdx-1][rowIdx];
    } else {
      prev = null;
    }

    colIdx++;
    if (colIdx <= this.width-3
      || (this.columns[colIdx] && curr.type === this.columns[colIdx][rowIdx].type))
      this.hTripsSeeker(colIdx, rowIdx);
  }
}
