'use strict';
const chalk = require('chalk');
const Jewel = require('./jewel');

module.exports = class Grid {
  constructor(width, height, testing) {
    this.width = width;
    this.height = height;
    this.testing = testing;
    this.columns = [];
    this.trash = {};
    this.prepareBoard();
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
    let columns = ``;
    let counter = 0;
    let z, currJewel;
    for(let y = 0; y < this.height; y++) {
      z = 0;
      if (y !== 0 && y < this.height) columns += `\n`;
      while(z < this.width) {
        currJewel = this.columns[z++][y];
        columns += `${chalk.hex(currJewel.type).bold(`JEWEL: ${currJewel.x}, ${currJewel.y}${currJewel.remove ? chalk.red(' RM') : '   '}`)}${z > 0 ? `   ` : ''}`;
      }
    }

    console.log(columns);
    console.log(this.trash);
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

  tripsSeeker() {
    this.vTrips();
    this.hTrips();
  }

  putTrash(colIdx, idx, count) {
    let pair, i = 0;
    const currTrash = this.trash[colIdx].indexOf(this.trash[colIdx].find(item => {
      pair = item.split(',').map(item => parseInt(item));
      return idx >= pair[0]-1 && idx <= pair[0]+pair[1];
    }));

    if (currTrash < 0) {
      this.trash[colIdx].push(`${idx},${count}`);
    } else {
      do {
        if (!this.columns[colIdx][idx+i].remove) {
          if (idx === pair[0]-1)
            this.trash[colIdx][currTrash] = this.trash[colIdx][currTrash]
              .replace(/^\d/, idx).replace(/\d$/, (m) => parseInt(m)+1);
          else
            this.trash[colIdx][currTrash] = this.trash[colIdx][currTrash].replace(/\d$/, (m) => parseInt(m)+1);
        }

        i++;
      } while(i < count);
    }
  }

  vTrips(x = 0, y = 0, prev) {
    let next;
    const curr = this.columns[x][y];
    if (prev && curr.type === prev.type) {
      this.putTrash(x, y, 1);
      curr.remove = true;
      next = curr;
    } else if (y < this.height-2 &&
      curr.type === this.columns[x][y+1].type && curr.type === this.columns[x][y+2].type) {
      this.putTrash(x, y, 3);
      curr.remove = true;
      this.columns[x][++y].remove = true;
      this.columns[x][++y].remove = true;
      next = curr;
    }

    if (y < this.height-1) {
      if (next)
        this.vTrips(x, ++y, next);
      else this.vTrips(x, ++y);
    }
    else if (x < this.width-1)
      this.vTrips(++x, 0);
  }

  hTrips(x = 0, y = 0, prev) {
    let next;
    const curr = this.columns[x][y];
    if (prev && curr.type === prev.type) {
      this.putTrash(x, y, 1);
      curr.remove = true;
      next = curr;
    } else if (x < this.width-2 &&
      curr.type === this.columns[x+1][y].type && curr.type === this.columns[x+2][y].type) {
      this.putTrash(x, y, 1);
      this.putTrash(x+1, y, 1);
      this.putTrash(x+2, y, 1);
      curr.remove = true;
      this.columns[++x][y].remove = true;
      this.columns[++x][y].remove = true;
      next = curr;
    }

    if (x < this.width-1) {
      if (next)
        this.hTrips(++x, y, next);
      else this.hTrips(++x, y);
    }
    else if (y < this.height-1)
      this.hTrips(0, ++y);
  }
}
