var colors = {
  purple: '#A500EB',
  green: '#008314',
  yellow: '#F3B700',
  red: '#FF0050',
  orange: '#FF4600',
  white: '#F7F7FF',
  blue: '#65AFFF'
}

function checkMove(firstJewelPos, nextJewelPos) {
  return (nextJewelPos[0] === firstJewelPos[0] + 1 && nextJewelPos[1] === firstJewelPos[1])
  || (nextJewelPos[0] === firstJewelPos[0] - 1 && nextJewelPos[1] === firstJewelPos[1]) 
  || (nextJewelPos[1] === firstJewelPos[1] + 1 && nextJewelPos[0] === firstJewelPos[0])
  || (nextJewelPos[1] === firstJewelPos[1] - 1 && nextJewelPos[0] === firstJewelPos[0])
}

//Constructor function for my grid. By creating it using a constructor,
//I can make an object out of every cell.

function Grid(width, height, container) {
	this.width = width;
	this.height = height;
	this.columns = [];
	this.firstJewelPos = null;
	this.cleanUp = null;
	this.points = 0;
  this.loading = true;

  this.render = function() {
		var container = document.createElement('div'),
			div,
			currentJewel,
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

  this.handleClick = function(e) {
    console.log('whatup ', e)
  }
	
//Creates cells, and it populates it with jewels
  this.populate = function() {
    var jewel, currCol, yIndex,
      missing = 0;
    if (this.columns.length === 0) {
      for (var i = 0; i < this.width; i++) {
        this.columns[i] = [];
        for (var j = 0; j < this.height; j++){
          jewel = whichJewel(i, j);
          this.columns[i].push(jewel);
        }
      }
    } else {
      for (var p = 0; p < this.width; p++) {
        currCol = this.columns[p];
        missing = this.height - currCol.length;

        while (missing) {
          yIndex = currCol.length;
          jewel = whichJewel(p, yIndex);
          currCol.push(jewel);
          jewel.drawJewel();
          missing--;
        }
      }
    }
		this.checkBoard();
	}

  this.checkBoard = function() {
    var messageEl = document.getElementById('bannerMessage');
    var t = 0;

    return new Promise(function(resolve, reject) {
      this.loading = true;
      while (t < 2) {
        this.findTrios(t);
        t++;
      } 
      resolve();
    }.bind(this))
    .then(function() {
      if (this.cleanUp) {
        this.cleanUp = false;
        this.needRemoval();
      } else {
        //messageEl.innerHTML = 'TILES LOADED';
        this.renderJewels();
        this.loading = false;
        console.log("board ", this.columns)
      }  
    }.bind(this));
	}

  this.findTrios = function(flag) {
    var currJewel, prevJewel, nextJewel,
      tripCounter, prevIndex, currIndex,
      nextIndex, y;

    y = 0;

    while (y < this.height) {
      xIndex = 0;
      tripCounter = 0;

      while (xIndex < this.width) {
        prevIndex = xIndex === 0 ? 0 : xIndex - 1;
        currIndex = xIndex;
        nextIndex = xIndex === this.width - 1 ? xIndex : xIndex + 1;
        // checking horizontal trios
        if (flag) {
          prevJewel = this.columns[prevIndex][y];
          currJewel = this.columns[currIndex][y];
          nextJewel = this.columns[nextIndex][y];
        } else {
          prevJewel = this.columns[y][prevIndex];
          currJewel = this.columns[y][currIndex];
          nextJewel = this.columns[y][nextIndex];
        }

        if ((currJewel && nextJewel) && (currIndex !== nextIndex) && currJewel.type === nextJewel.type) {
          tripCounter++;
        } else {
          tripCounter = 0;
        }

        if (tripCounter === 2) {
          this.cleanUp = true;
          console.log('removing prev', prevJewel)
          console.log('removing curr', currJewel)
          console.log('removing next', nextJewel)
          console.log('=====')
          prevJewel.remove = true;
          currJewel.remove = true;
          nextJewel.remove = true;
        } else if (tripCounter > 2) {
          console.log('trip++', nextJewel)
          nextJewel.remove = true;
        }

        xIndex++;
      }
      y++;
    }
	}

  this.needRemoval = function() {
    this.removeJewels();
    this.populate();
	}

  this.removeJewels = function() {
    var newJewel;
    var b, currCol;

    for (var a = 0; a < this.width; a++){
      b = 7;
      currCol = this.columns[a];
      while (b >= 0) {
        if (currCol[b] && currCol[b].remove) {
          console.log('removing at', a, b)
          currCol.splice(b, 1);
        }
        b--;
      }
    }
	}

  this.renderJewels = function() {
		for(var i = 0; i < this.width; i++){
			for(var j = 0; j < this.height; j++){
        if (this.columns[i][j]) {
          this.columns[i][j].x = i;
          this.columns[i][j].y = j;
          this.columns[i][j].drawJewel();	
        } else {
          var currCanvas = document.getElementById(i + ", " + j);
          var ctx = currCanvas.getContext('2d');
          ctx.clearRect(0, 0, currCanvas.width, currCanvas.height);
        }
			}
		}
	}

	this.startTime = function() {
		var timer = setInterval(boardTimer, 1000);
		var time =60;
		function boardTimer(){
			var currTimer = document.getElementById('timer-contain');
			time--;
			currTimer.innerHTML = time;
			if(time < 1){
				clearInterval(timer);
			}
		}
	}

  // logic for selecting jewels to swap
	this.move = function(e) {
    var firstJewel, secondJewel;
		var clickedElement = e.currentTarget;
		var columnIndex = parseInt(clickedElement.getAttribute('data-column') , 10);
		var rowIndex = parseInt(clickedElement.getAttribute('data-cell') , 10);
	
		if (this.firstJewelPos && (columnIndex && rowIndex)){
			
			var secondClickedPos = [columnIndex, rowIndex];

			firstJewel = this.columns[this.firstJewelPos[0]][this.firstJewelPos[1]];
			secondJewel = this.columns[secondClickedPos[0]][secondClickedPos[1]];

			//WHAT IS NON-SWAPABLE
			if (checkMove(this.firstJewelPos, secondClickedPos)) {
				var tempJewel = secondJewel;
				this.columns[secondClickedPos[0]][secondClickedPos[1]] 
				= firstJewel;

				this.columns[this.firstJewelPos[0]][this.firstJewelPos[1]] = tempJewel;
					
        secondJewel.x = secondClickedPos[0];
        secondJewel.y = secondClickedPos[1];
        firstJewel.x = this.firstJewelPos[0]
        firstJewel.y = this.firstJewelPos[1];

        firstJewel.drawJewel();
        secondJewel.drawJewel();
					
        //need to animate here
        // implement scoring
        this.checkBoard()
          .then(function() {
            if (!this.cleanUp) {
              this.columns[this.firstJewelPos[0]][this.firstJewelPos[1]]
                = this.columns[secondClickedPos[0]][secondClickedPos[1]];

              this.columns[secondClickedPos[0]][secondClickedPos[1]] = tempJewel;
              firstJewel.x = this.firstJewelPos[0];
              firstJewel.y = this.firstJewelPos[1];
              secondJewel.x = secondClickedPos[0]
              secondJewel.y = secondClickedPos[1];

              firstJewel.drawJewel();
              secondJewel.drawJewel();
            }

            this.firstJewelPos = null;
            secondClickedPos = null;  
          }.bind(this))
			} else {
				this.firstJewelPos = null;
				secondClickedPos = null;

				var canvasOne = document.getElementById(columnIndex + ", " + rowIndex);
				var context = canvasOne.getContext('2d');
				context.lineWidth = 0;
			}
		}
		// first click
		else {
			var firstCanvas = document.getElementById(columnIndex + ", " + rowIndex);

			var ctx = firstCanvas.getContext('2d');
			ctx.strokeStyle = '#9EFFFF';
			ctx.beginPath();
			ctx.lineWidth = 5;
			ctx.strokeRect(0, 0, firstCanvas.width, firstCanvas.height);

			this.firstJewelPos = [columnIndex, rowIndex];
		}
	}

	this.updateScore = function(){
		var pointsContain = document.getElementById('points-contain');
		pointsContain.innerHTML = this.points;
	}
}
var cellSize = 80;

function Jewel(type, x, y) {
	this.type = type;
  this.remove = false;
  this.x = x;
  this.y = y;
  this.startSpace = this.x * cellSize + this.y * cellSize;
  this.endSpace = ((this.x + 1) * cellSize + (this.y + 1) * cellSize);

	this.drawJewel = function(){
		var currCanvas = document.getElementById('currCanvas');
    var startX = this.x * cellSize;
    var startY = this.y * cellSize;
		var ctx = currCanvas.getContext('2d');

		ctx.clearRect(startX, startY, cellSize, cellSize);
    ctx.beginPath();
    moveTo(startX, startY);

    switch (this.type) {
      //triangle
      case colors.purple:
        moveTo(startX + cellSize / 2, startY);
        ctx.lineTo(startX + cellSize, startY + cellSize);
        ctx.lineTo(startX, startY + cellSize);
        ctx.lineTo(startX + cellSize / 2, startY);
      break;

      // diamond
      case colors.yellow:
        moveTo(startX + cellSize / 2, startY);
        ctx.lineTo(startX + cellSize, startY + cellSize / 2);
        ctx.lineTo(startX + cellSize / 2, startY + cellSize);
        ctx.lineTo(startX, startY + cellSize / 2);
        ctx.lineTo(startX + cellSize / 2, startY);
      break;

      //square
      case colors.green:
        ctx.rect(startX, startY, cellSize, cellSize);
      break;

      //square
      case colors.red:
        ctx.rect(startX, startY, cellSize, cellSize);
      break;

      //hexa
      case colors.orange:
        moveTo(startX + cellSize / 2, startY);
        ctx.lineTo(startX + cellSize, startY + 20);
        ctx.lineTo(startX + cellSize, startY + 40);
        ctx.lineTo(startX + cellSize / 2, startY + cellSize);
        ctx.lineTo(startX, startY + 40);
        ctx.lineTo(startX, startY + 20);
        ctx.lineTo(startX + cellSize / 2, startY);
      break;

      // circle
      case colors.white:
        moveTo(startX, startY);
        ctx.arc(startX + cellSize/2, startY + cellSize/2, cellSize/2, Math.PI * 2, false);
      break;

      // down triangle
      case colors.blue:
        moveTo(startX, startY);
        ctx.lineTo(startX + cellSize, startY);
        ctx.lineTo(startX + cellSize / 2, startY + cellSize);
        ctx.lineTo(startX, startY);
      break;
    }
    ctx.strokeRect(startX, startY, cellSize, cellSize);
    ctx.fillStyle = this.type;
		ctx.fill();
    ctx.closePath();
	}
}

//randomizer for my different jewels
function whichJewel(x, y) {
  var min = Math.ceil(0);
  var max = Math.floor(6);
  var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  
  return new Jewel(colors[Object.keys(colors)[randomNum]], x, y);
};

var board = new Grid(8, 8, 'container');

board.render();
board.populate();
