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
    console.log(`trash===${this.trash}`);
    this.printToConsole();
  }

  prepareBoard() {
    this.populate();
    this.hTripsSeeker();
    this.vTripsSeeker();
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

  // need to test boundaries &&
  vTripsSeeker() {
    let j, currItem, z, next, marker;
    this.columns.forEach((currCol, x) => {
      //console.log(`xxx>>>>>>>>> ${x}`);
      j = 0;
      marker = 0;
      while(j < this.width-2) {
        currItem = currCol[j];
        next = currCol[j+1];
        //console.log(`upj>>>>>>>>> ${j}`);
        //console.log(`coll>>>>>>>>> ${JSON.stringify(currCol)}`);
        //console.log(`curr>>>>>>>>> ${JSON.stringify(currItem)}`);
        //console.log(`>comparing ${currItem.x}, ${currItem.y} vs ${next.x}, ${next.y}`);

        if (currItem.type === next.type && (j+2 < this.width && currItem.type === currCol[j+2].type)) {
          //console.log(`triooo <<<<<< ${currItem.x}, ${currItem.y} vs ${next.x}, ${next.y}`);
          //console.log(`j>>>>>>>>> ${j}`);
          //console.log(`marker>>>>>>>>> ${marker}`);
          //console.log(`next>>>>>>>>> ${JSON.stringify(next)}`);
          while(j < this.height && currItem.type === next.type) {
            //console.log(`pushing==${x}-${j}`);
            this.trash.push(`${x}-${j}`);
            currItem = currCol[j++]
            next = currCol[j];
          }
        }

        j++;
      }
    });
  }

  hTripsSeeker() {
    //let j, currItem, z, next;
    //for(let y = 0; y < this.width; y++) {
    //  z = 0;
    //  while(z < this.height-2) {
    //    currItem = this.columns[z][y];
    //    if (currItem.type == this.columns[z+1][y].type &&
    //      currItem.type === this.columns[z+2][y].type) {
    //      console.log(`htrio at ${z}-${y}`);
    //      this.trash.push(`${z}-${y}`);
    //      this.trash.push(`${z+1}-${y}`);
    //      this.trash.push(`${z+2}-${y}`);
    //      z+=3;
    //      if (z < this.height-2) {
    //        next = this.columns[z][y];
    //        while(z < this.width-1 && currItem.type === next.type) {
    //          console.log('hquad');
    //          this.trash.push(`${next.x}-${next.y}`);
    //          next = this.columns[++z][y];
    //        }
    //      }
    //    } else {
    //      z++;
    //    }
    //  }
    //}
  }
}
