const chalk = require('chalk');

const Jewel = require('./jewel');

module.exports = class Grid {
  constructor(width, height, testing) {
    this.width = width;
    this.height = height;
    this.testing = testing;
    this.ready = false;
    this.columns = [];
    this.trash = [];
    this.prepareBoard();
    this.printToConsole();
  }

  prepareBoard() {
    this.populate();
    this.hTripsSeeker();
    this.vTripsSeeker();
    console.log(`trash===${this.trash}`);
  }

  populate() {
    for(let x = 0; x < this.width; x++) {
      this.columns.push([]);
      for(let y = 0; y < this.height; y++) {
        this.columns[x].push(new Jewel(x, y, this.testing));
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
        column += `${chalk.hex(currJewel.type).bold(`JEWEL: ${currJewel.x}, ${currJewel.y}`)}${z > 0 ? `   ` : ''}`;
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

  vTripsSeeker() {
    let j, currItem, z, next, marker;
    this.columns.forEach((currCol, x) => {
      j = 0;
      marker = 0;
      while(j < this.width-2) {
        currItem = currCol[j];
        next = currCol[++j]
        console.log(`>comparing ${currItem.x}, ${currItem.y} vs ${next.x}, ${next.y}`);
        if (currItem.type === next.type && currItem.type === currCol[j+1].type) {
          console.log(`<<<<<< comparing ${currItem.x}, ${currItem.y} vs ${next.x}, ${next.y}`);
          next = currCol[j+=2];
          marker+= 3;
          while(j < this.width && currItem.type === next.type) {
            next = currCol[++j];
            marker++;
          }

          console.log(`j>>>>>${j}`);
          marker = j - marker;
          console.log(`marker>>>>>${marker}`);
          while(marker < j) {
            console.log(`pushing==${x}-${marker}`);
            this.trash.push(`${x}-${marker}`);
            marker++;
          }
        }
      }
    });
  }

  hTripsSeeker() {
    let j, currItem, z, next;
    for(let y = 0; y < this.width; y++) {
      z = 0;
      while(z < this.height-2) {
        currItem = this.columns[z][y];
        if (currItem.type == this.columns[z+1][y].type &&
          currItem.type === this.columns[z+2][y].type) {
          console.log(`htrio at ${z}-${y}`);
          this.trash.push(`${z}-${y}`);
          this.trash.push(`${z+1}-${y}`);
          this.trash.push(`${z+2}-${y}`);
          z+=3;
          if (z < this.height-2) {
            next = this.columns[z][y];
            while(z < this.width-1 && currItem.type === next.type) {
              console.log('hquad');
              this.trash.push(`${next.x}-${next.y}`);
              next = this.columns[++z][y];
            }
          }
        } else {
          z++;
        }
      }
    }
  }
}
