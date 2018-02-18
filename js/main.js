var colors = {
  purple: '#A500EB',
  green: '#008314',
  yellow: '#F3B700',
  red: '#FF0050',
  orange: '#FF4600',
  white: '#F7F7FF',
  blue: '#65AFFF'
}
//const requestAnimationFrame = window.requestAnimationFrame ||
//							window.mozRequestAnimationFrame ||
//							window.webkitRequestAnimationFrame ||
//							window.msRequestAnimationFrame;
//
//requestAnimationFrame(Grid)

//Constructor function for my grid. By creating it using a constructor,
//I can make an object out of every cell.

function Grid(width, height, container){
	this.width = width;
	this.height = height;
	this.columns = [];
	this.selectedJewelPos = null;
	this.cleanUp = null;
	this.points = 0;
  this.loading = true;
	
//Creates cells, and it populates it with jewels
  this.populate = function() {
		var jewel;
		for (var i = 0; i < this.width; i++){
			this.columns[i] = [];
			for (var j = 0; j < this.height; j++){
				jewel = whichJewel();
				this.columns[i].push(jewel);
			}
		}
		this.checkBoard();
	}

  this.checkBoard = function(){
    var messageEl = document.getElementById('bannerMessage');
    messageEl.innerHTML = 'LOADING TILES...';
    this.loading = true;
    var directions = ['x-axis', 'y-axis'];
    directions.forEach(function(axis, indice) {
      this.checkRows(axis, indice);
    }.bind(this))
    if (this.cleanUp) {
      this.needRemoval();
      this.loading = false;
    } else {
      this.loading = false;
      messageEl.innerHTML = 'TILES LOADED';
    }  
	}

  this.checkRows = function(flag, indice) {
    var currJewel, prevJewel, nextJewel,
      tripCounter, prevIndex, currIndex,
      nextIndex;

    for (var y = 0; y < this.height; y++) {
      xIndex = 0;
      tripCounter = 0;

      while (xIndex < this.width - 1) {
        prevIndex = xIndex === 0 ? 0 : xIndex - 1;
        currIndex = xIndex;
        nextIndex = xIndex === this.width - 1 ? xIndex : xIndex + 1;

        if (flag === 'x-axis') {
          prevJewel = this.columns[prevIndex][y]
          currJewel = this.columns[currIndex][y];
          nextJewel = this.columns[nextIndex][y];
        } else {
          prevJewel = this.columns[y][prevIndex]
          currJewel = this.columns[y][currIndex];
          nextJewel = this.columns[y][nextIndex];
        }
        if ((currJewel && nextJewel) && currJewel.type === nextJewel.type) {
          tripCounter++;
        } else {
          tripCounter = 0;
        }

        if (tripCounter === 2) {
          this.cleanUp = true;
          this.columns[prevIndex].splice(y, 1);
          this.columns[currIndex].splice(y, 1);
          this.columns[nextIndex].splice(y, 1);
        }
        else if (tripCounter > 2) {
          this.columns[currIndex].splice(y, 1);
        }

        xIndex++;
      }
    }
	}

  this.needRemoval = function() {
    this.restockJewels()
    this.cleanUp = false;
    this.checkBoard();  
	}

  this.restockJewels = function() {
    var newJewel;
    var b;

    for (var a = 0; a < this.columns.length; a++){
      b = 0;
      var missing = this.width - this.columns[a].length;
      if (missing > 0) {
        while (b < missing) {
          newJewel = whichJewel();
          this.columns[a].unshift(newJewel);
          b++;
        }
      }
    }

    this.redraw();
	}

  this.redraw = function(){
		for(var i = 0; i < this.columns.length; i++){
			for(var j = 0; j < this.columns[i].length; j++){
				this.columns[i][j].drawJewel(i, j);	
			}
		}
	}

//Renders my grid on dom, while setting an event listener
//to all my cells
	this.render = function(){
		var container = document.createElement('div'),
			pointsContain = document.createElement('div'),
			timerContain = document.createElement('div'),
			div,
			currentJewel,
			tile;
		container.id = 'container';
		pointsContain.id = 'points-contain';
		timerContain.id = 'timer-contain';
		pointsContain.innerHTML = this.points;
		timerContain.innerHTML = 60;
		timerContain.style.padding = '10px';
		timerContain.style.display = 'inline-block';
		timerContain.style.border = '1px solid black';
		timerContain.addEventListener('click', this.startTime.bind(this));
		document.body.appendChild(container);
		document.body.appendChild(pointsContain);
		document.body.appendChild(timerContain);
		for (var i = 0; i < this.width; i++){
      div = document.createElement('div');
			div.id = 'columnId-' + i;
			div.className = 'column';
			container.appendChild(div);
			for (var j = 0; j < this.height; j++){
        tile = document.createElement('CANVAS');
				tile.className = "cell";
				tile.id = i + ", " + j;
				tile.addEventListener('click', this.move.bind(this) );
				tile.setAttribute('width', 50);
				tile.setAttribute('height', 50);
				tile.setAttribute('data-column', i);
				tile.setAttribute('data-cell', j);

				// var ctx = tile.getContext('2d');
				
				// ctx.fillStyle = currentJewel.type;
				// ctx.fillRect(0, 0, tile.width, tile.height);

				tile.style.backgroundColor = '#002240';
				div.appendChild(tile);
			}
		}
	}

	this.startTime = function(){
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

	//Handler for click event on my cells
	this.move = function(e){
		var clickedElement = e.currentTarget;
		var columnIndex = parseInt( clickedElement.getAttribute('data-column') , 10 );
		var rowIndex = parseInt( clickedElement.getAttribute('data-cell') , 10 );
		// var firstCanvas = document.getElementById(columnIndex + ", " + rowIndex);
	
		if (this.selectedJewelPos && (firstColumnIndex !== columnIndex && firstRowIndex !== rowIndex)){
			
			var secondClickedPos = [ columnIndex, rowIndex ];

			var firstJewel = this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ];
			var secondJewel = this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];

			//WHAT IS NON-SWAPABLE
			if( ( secondClickedPos[0] === this.selectedJewelPos[0] + 1 && secondClickedPos[1] === this.selectedJewelPos[1] ) || ( secondClickedPos[0] === this.selectedJewelPos[0] - 1 && secondClickedPos[1] === this.selectedJewelPos[1] )
			||  ( secondClickedPos[1] === this.selectedJewelPos[1] + 1 && secondClickedPos[0] === this.selectedJewelPos[0] ) || ( secondClickedPos[1] === this.selectedJewelPos[1] - 1 && secondClickedPos[0] === this.selectedJewelPos[0] ) ){
				
				var tempJewel = this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];
				this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ] 
				= this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ];
				this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ] = tempJewel;
					
				firstJewel.drawJewel(secondClickedPos[0], secondClickedPos[1]);
				secondJewel.drawJewel(this.selectedJewelPos[0], this.selectedJewelPos[1]);
					
        // implement scoring
				this.checkBoard();

        this.columns[ this.selectedJewelPos[0] ][this.selectedJewelPos[1] ]
        = this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];
        this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ] = tempJewel;

        firstJewel.drawJewel(this.selectedJewelPos[0], this.selectedJewelPos[1]);
        secondJewel.drawJewel(secondClickedPos[0], secondClickedPos[1] );

				this.selectedJewelPos = null;
				secondClickedPos = null;
			}
			else{
				this.selectedJewelPos = null;
				secondClickedPos = null;

				var canvasOne = document.getElementById(columnIndex + ", " + rowIndex);
				var context = canvasOne.getContext('2d');
				context.lineWidth = 0;
			}
		}
		
		// first click
		else {
			var firstCanvas = document.getElementById(columnIndex + ", " + rowIndex);
			var firstColumnIndex = columnIndex;
			var firstRowIndex = rowIndex;

			var ctx = firstCanvas.getContext('2d');
			ctx.strokeStyle = '#9EFFFF';
			ctx.beginPath();
			ctx.lineWidth = 5;
			ctx.strokeRect(0, 0, firstCanvas.width, firstCanvas.height);

			this.selectedJewelPos = [ columnIndex, rowIndex ];
		}
	}

	this.updateScore = function(){
		var pointsContain = document.getElementById('points-contain');
		pointsContain.innerHTML = this.points;
	}
}

//Constructor for my jewels

function Jewel (type){
	this.type = type;

	this.drawJewel = function(i, j){
		var currCanvas = document.getElementById(i + ", " + j);
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
        ctx.lineTo( 50, 25 );
        ctx.lineTo( 25, 50 );
        ctx.lineTo( 0, 25 );
        ctx.lineTo( 25, 0 );
        ctx.closePath();
      break;

      case colors.green:
        ctx.rect( 0, 0, 50, 50);
        ctx.closePath();
      break;

      case colors.red:
        ctx.rect( 0, 0, 50, 50);
        ctx.closePath();
      break;

      case colors.orange:
        moveTo( 0, 10 );
        ctx.lineTo( 25, 0 );
        ctx.lineTo( 50, 10 );
        ctx.lineTo( 50, 40 );
        ctx.lineTo( 25, 50 );
        ctx.lineTo( 0,  40 );
        ctx.lineTo( 0,  10 );
        ctx.closePath();
      break;

      case colors.white:
        ctx.arc( 25, 25, 25, Math.PI * 2, false);
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
    //ctx.font = '24px serif'
		ctx.fillStyle = this.type;
    //ctx.fillText(i + ', ' + j, 10, 30);
		ctx.fill();
	}
}

//randomizer for my different jewels
function whichJewel(){
	var jewel;
	var random = Math.random();
  var min = Math.ceil(0);
  var max = Math.floor(6);
  var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  
  return new Jewel(colors[Object.keys(colors)[randomNum]]);
};

var board = new Grid(8, 8, 'container');

board.render();
board.populate();
