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
        console.log('fini')
        this.renderJewels();
        //messageEl.innerHTML = 'TILES LOADED';
      }  
      this.loading = false;
      //messageEl.innerHTML = 'LOADING TILES...';

    }.bind(this))
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
    //this.checkBoard();  
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

	this.render = function() {
		var container = document.createElement('div'),
      //pointsContain = document.createElement('div'),
      //timerContain = document.createElement('div'),
			div,
			currentJewel,
			tile;
		container.id = 'container';
    //pointsContain.id = 'points-contain';
    //timerContain.id = 'timer-contain';
    //pointsContain.innerHTML = this.points;
    //timerContain.innerHTML = 60;
		//timerContain.style.padding = '10px';
		//timerContain.style.display = 'inline-block';
		//timerContain.style.border = '1px solid black';
		//timerContain.addEventListener('click', this.startTime.bind(this));
		document.body.appendChild(container);
		document.body.appendChild(pointsContain);
		document.body.appendChild(timerContain);
    for (var i = 0; i < this.width; i++){
      div = document.createElement('div');
			div.id = 'columnId-' + i;
			div.className = 'column';
			container.appendChild(div);
      for (var j = 7; j >= 0; j--){
        tile = document.createElement('CANVAS');
				tile.className = "cell";
				tile.id = i + ", " + j;
				tile.addEventListener('click', this.move.bind(this));
				tile.setAttribute('width', 50);
				tile.setAttribute('height', 50);
				tile.setAttribute('data-column', i);
				tile.setAttribute('data-cell', j);
				div.appendChild(tile);
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

function Jewel(type, x, y) {
	this.type = type;
  this.remove = false;
  this.x = x;
  this.y = y;

	this.drawJewel = function(){
		var currCanvas = document.getElementById(this.x + ", " + this.y);
		var ctx = currCanvas.getContext('2d');
		ctx.clearRect(0, 0, currCanvas.width, currCanvas.height);
    ctx.beginPath();

    switch (this.type) {
      case colors.purple:
        moveTo(25, 0);
        ctx.lineTo(50, 50);
        ctx.lineTo(0, 50);
        ctx.lineTo(25, 0);
        ctx.closePath();
      break;

      case colors.yellow:
        moveTo(25, 0);
        ctx.lineTo(50, 25);
        ctx.lineTo(25, 50);
        ctx.lineTo(0, 25);
        ctx.lineTo(25, 0);
        ctx.closePath();
      break;

      case colors.green:
        ctx.rect(0, 0, 50, 50);
        ctx.closePath();
      break;

      case colors.red:
        ctx.rect(0, 0, 50, 50);
        ctx.closePath();
      break;

      case colors.orange:
        moveTo(0, 10);
        ctx.lineTo(25, 0);
        ctx.lineTo(50, 10);
        ctx.lineTo(50, 40);
        ctx.lineTo(25, 50);
        ctx.lineTo(0, 40);
        ctx.lineTo(0, 10);
        ctx.closePath();
      break;

      case colors.white:
        ctx.arc(25, 25, 25, Math.PI * 2, false);
    		ctx.closePath();
      break;

      case colors.blue:
        moveTo(0, 0);
        ctx.lineTo(50, 0);
        ctx.lineTo(25, 50);
        ctx.lineTo(0, 0);
        ctx.closePath();
      break;
    }
		ctx.fillStyle = this.type;
    ctx.closePath();
		ctx.fill();
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
