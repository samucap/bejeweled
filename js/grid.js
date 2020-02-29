'use strict';
const chalk = require('chalk');

const Jewel = require('./jewel');

module.exports = class Grid {
  constructor(width, height, testing) {
    this.width = width;
    this.height = height;
    this.testing = testing;
    this.columns = [];
    this.trash = [];
    this.populate();
    this.checkBoard();
    if (!testing)
      this.render();
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

  checkBoard() {
    this.tripsSeeker();
    if (!this.trash.find(column => column.length))
      return;

    this.cleanTrash();
    this.checkBoard();
  }

  cleanTrash(i = 0) {
    let range, replacements, j, x;
    while(this.trash[i].length) {
      range = this.trash[i].splice(0, 1)[0].split(',').map(item => parseInt(item));
      x = range[0];
      j = 0;
      replacements = [];
      while(j < range[1]) {
        replacements.push(new Jewel(i, x++));
        j++;
      }

      this.columns[i].splice(range[0], range[1], ...replacements);
    }

    if (i < this.trash.length-1)
      this.cleanTrash(++i);
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

  render() {
    let container = document.createElement('div'),
      currCanvas;
    container.id = 'container';
    document.body.appendChild(container);
    currCanvas = document.createElement('CANVAS');
    currCanvas.id = 'currCanvas';
    currCanvas.setAttribute('width', 700);
    currCanvas.setAttribute('height', 700);
    currCanvas.addEventListener('click', this.handleClick);
    container.appendChild(currCanvas);
    this.drawJewels();
  }

  drawJewels(x = 0, y = 0) {
    if (x === this.width) return;
    this.columns[x][y].drawJewel();
    if (y < this.height-1) this.drawJewels(x, ++y);
    else this.drawJewels(++x, 0);
  }
}
