var purple = '#A500EB',
	green = '#008314',
	yellow = '#F3B700',
	red = '#FF0050',
	orange = '#FF4600',
	white = '#F7F7FF';

var requestAnimationFrame = window.requestAnimationFrame ||
							window.mozRequestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.msRequestAnimationFrame;

//Constructor function for my grid. By creating it using a constructor,
//I can make an object out of every cell.

function Grid(width, height, container){
	this.width = width;
	this.height = height;
	this.columns = [];
	this.selectedJewelPos = null;
	this.cleanUp = null;
	this.points = 0;
	
//Creates my cells, and it populates it with jewels
	this.populate = function(){
		var jewel;
		for (var i = 0; i < this.width; i++){
			this.columns[i] = [];
			for (var j = 0; j < this.height; j++){
				jewel = whichJewel();
				this.columns[i].push(jewel);
			}
		}
		this.render();
		this.checkBoard();
		
	}

//Renders my grid on dom, while setting an event listener
//to all my cells
	this.render = function(){

		var container = document.createElement('div'),
			div,
			currentJewel,
			tile;
		container.id = 'container';
		document.body.appendChild(container);
		for (var i = 0; i < this.width; i++){
				div = document.createElement('div');
			div.id = 'columnId-' + i;
			div.className = 'column';
			container.appendChild(div);
			for (var j = 0; j < this.height; j++){
					currentJewel = this.columns[i][j];
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
				currentJewel.drawJewel(currentJewel, i, j);
				
			}
		}
		// this.checkBoard();
	}

	this.checkBoard = function(){
		for (var i = 0; i < this.columns.length; i++){
			for (var j = 0; j < this.columns[i].length; j++){
				this.checkRight(i, j);
				this.checkDown(i, j);
			}
		}
		this.needRemoval();
	}

	this.checkRight = function(columnIndex, rowIndex){
		var currJewel = this.columns[ columnIndex ][ rowIndex ];

		var rightIndex = columnIndex, 
			rightCount = 0;

		while( rightIndex <= 7 &&  currJewel.type === this.columns[ rightIndex ][ rowIndex ].type ) {
			rightCount++;
			if( rightCount === 3 ) {
				this.columns[ rightIndex ][ rowIndex ].flaggedForRemoval = true;
				this.columns[ rightIndex - 1 ][ rowIndex ].flaggedForRemoval = true;
				this.columns[ rightIndex - 2 ][ rowIndex ].flaggedForRemoval = true;

				this.cleanUp = true;
			}
			else if( rightCount > 3 ){
				this.columns[ rightIndex ][ rowIndex ].flaggedForRemoval = true;

			}
			rightIndex++;

		}
	}

	this.checkDown = function(columnIndex, rowIndex){
		var currJewel = this.columns[ columnIndex ][ rowIndex ];

		var verticalIndex = rowIndex,
			vertCount = 0;

		while( verticalIndex <= 7 && currJewel.type === this.columns[ columnIndex ][ verticalIndex ].type) {
			vertCount++;
			if( vertCount === 3){
				this.columns[ columnIndex ][ verticalIndex ].flaggedForRemoval = true;
				this.columns[ columnIndex ][ verticalIndex - 1 ].flaggedForRemoval = true;
				this.columns[ columnIndex ][ verticalIndex - 2 ].flaggedForRemoval = true;

				this.cleanUp = true;
			}
			else if( vertCount > 3 ){
				this.columns[ columnIndex ][ verticalIndex ].flaggedForRemoval = true;

			}
			verticalIndex++;
		}
	}

	this.needRemoval = function(){
		if(this.cleanUp){
			this.removeJewels();
			this.cleanUp = null;
			return this.checkBoard();
		}
	}

	this.removeJewels = function(){
		var columnCount = [],
			cellCount = [],
			currColumn,
			newJewel;
		for (var i = 0; i < this.columns.length; i++){
			columnCount.push({i: i});
			currColumn = columnCount[i];
			currColumn.cellArray = [];
			for (var j = 0; j < this.columns[i].length; j++){
				if(this.columns[i][j].flaggedForRemoval === true){
					this.columns[i].splice(j, 1);
					newJewel = whichJewel();
					this.columns[i].unshift(newJewel);
					currColumn.cellArray.push(j);
					// columnCount.push(j);
					// var currCanvas = document.getElementById(i + ", " + j);
					// var ctx = currCanvas.getContext('2d');
					// ctx.clearRect(0, 0, currCanvas.width, currCanvas.height);
					// ctx.fillStyle = newJewel.type;
					// ctx.fillRect(0, 0, currCanvas.width, currCanvas.height);	
				}
			}
		}

		this.redraw();
		
	}

	this.redraw = function(){
		for(var i = 0; i < this.columns.length; i++){
			for(var j = 0; j < this.columns[i].length; j++){
				var currJewel = this.columns[i][j];
				currJewel.drawJewel(currJewel, i, j);
			}
		}
	}

	//Handler for click event on my cells
	this.move = function(e){
		var clickedElement = e.currentTarget;
		var columnIndex = parseInt( clickedElement.getAttribute('data-column') , 10 );
		var rowIndex = parseInt( clickedElement.getAttribute('data-cell') , 10 );
		// var firstCanvas = document.getElementById(columnIndex + ", " + rowIndex);
	
		if( this.selectedJewelPos && (firstColumnIndex !== columnIndex && firstRowIndex !== rowIndex)){
			
			var secondClickedPos = [ columnIndex, rowIndex ];
			console.debug('secondClickedPos: ', secondClickedPos );

			// var secondCanvas = document.getElementById(columnIndex + ", " + rowIndex);
			// var ctxA = firstCanvas.getContext('2d');
			// var ctxB = secondCanvas.getContext('2d');

			var firstJewel = this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ];
			var secondJewel = this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];

			//WHAT IS NON-SWAPABLE
			if( ( secondClickedPos[0] === this.selectedJewelPos[0] + 1 && secondClickedPos[1] === this.selectedJewelPos[1] ) || ( secondClickedPos[0] === this.selectedJewelPos[0] - 1 && secondClickedPos[1] === this.selectedJewelPos[1] )
			||  ( secondClickedPos[1] === this.selectedJewelPos[1] + 1 && secondClickedPos[0] === this.selectedJewelPos[0] ) || ( secondClickedPos[1] === this.selectedJewelPos[1] - 1 && secondClickedPos[0] === this.selectedJewelPos[0] ) ){
				
				var tempJewel = this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];
				this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ] 
				= this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ];
				this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ] = tempJewel;
					
				firstJewel.drawJewel(secondJewel, secondClickedPos[0], secondClickedPos[1]);
				secondJewel.drawJewel(firstJewel, this.selectedJewelPos[0], this.selectedJewelPos[1] );
					
				this.checkBoard();
				

				if( this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ].flaggedForRemoval === false && this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ].flaggedForRemoval === false ){
				
					this.columns[ this.selectedJewelPos[0] ][this.selectedJewelPos[1] ]
					= this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];
					this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ] = tempJewel;

					firstJewel.drawJewel(firstJewel, this.selectedJewelPos[0], this.selectedJewelPos[1]);
					secondJewel.drawJewel(secondJewel, secondClickedPos[0], secondClickedPos[1] );

					// board.render();

				}

				else if ( this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ].flaggedForRemoval || this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ].flaggedForRemoval ){
					// var first = this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ];
					// var second = this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];
					
				}
				this.selectedJewelPos = null;
				secondClickedPos = null;


			}

			this.selectedJewelPos = null;
			secondClickedPos = null;

		}
		
		//nothing selected
		else {
			var firstCanvas = document.getElementById(columnIndex + ", " + rowIndex);
			var firstColumnIndex = columnIndex;
			var firstRowIndex = rowIndex;

			var ctx = firstCanvas.getContext('2d');
			ctx.strokeStyle = '#9EFFFF';
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeRect(0, 0, firstCanvas.width, firstCanvas.height);

			

			this.selectedJewelPos = [ columnIndex, rowIndex ];

			console.debug('selectedJewelPos: ', this.selectedJewelPos );

		}
	}

}

//Constructor for my jewels

function Jewel (type){
	this.type = type;
	this.flaggedForRemoval = false;

	this.drawJewel = function(jewel, i, j){
		var currJewel = jewel;
		var currCanvas = document.getElementById(i + ", " + j);

		var ctx = currCanvas.getContext('2d');

		ctx.clearRect(0, 0, currCanvas.width, currCanvas.height);
		ctx.beginPath();
		if(this.type === purple){
			
			moveTo(25, 0);
			ctx.lineTo(50, 50);
			ctx.lineTo(0, 50);
			ctx.lineTo(25, 0);
			ctx.closePath();

		}
		else if(this.type === yellow){

			moveTo(25, 0);
			ctx.lineTo( 50, 25 );
			ctx.lineTo( 25, 50 );
			ctx.lineTo( 0, 25 );
			ctx.lineTo( 25, 0 );
			ctx.closePath();


		}
		else if(this.type === green){

			ctx.rect( 0, 0, 50, 50);
			ctx.closePath();
			
		}
		else if(this.type === red){

			ctx.rect( 0, 0, 50, 50);
			ctx.closePath();
		}
		else if(this.type === orange){

			moveTo( 0, 10 );
			ctx.lineTo( 25, 0 );
			ctx.lineTo( 50, 10 );
			ctx.lineTo( 50, 40 );
			ctx.lineTo( 25, 50 );
			ctx.lineTo( 0,  40 );
			ctx.lineTo( 0,  10 );
			ctx.closePath();

		}
		else if(this.type === white){

			ctx.arc( 25, 25, 25, Math.PI * 2, false);
    		ctx.closePath();
		}
		
		ctx.fillStyle = this.type;
		ctx.fill();
	}
}

//randomizer for my different jewels
function whichJewel(){
	var jewel;
	var random = Math.random();
	//purple
	if (random < 0.143){
		jewel = new Jewel(purple);
	}
	//red
	else if ((random > 0.143) && (random < 0.286)){
		jewel = new Jewel(red);
	}
	//yellow
	else if ((random > 0.286) && (random < 0.429)){
		jewel = new Jewel(yellow);
	}
	//green
	else if ((random > 0.571) && (random < 0.714)){
		jewel = new Jewel(green);
	}
	//orange
	else if((random > 0.714) && (random < 0.857)){
		jewel = new Jewel(orange);
	}

	else {
		jewel = new Jewel(white);
	}
	return jewel;
};


//New instance of Grid being created
var board = new Grid(8, 8, 'container');

board.populate();
