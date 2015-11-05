//Constructor function for my grid. By creating it using a constructor,
//I can make an object out of every cell.

function Grid(width, height, container){
	this.width = width;
	this.height = height;
	this.columns = [];
	this.selectedJewelPos = null;
	
//Creates my cells, and it populates it with jewels
	this.populate = function(){
		for (var i = 0; i < this.width; i++){
			this.columns[i] = [];
			for (var j = 0; j < this.height; j++){
				var jewel = whichJewel();
				this.columns[i].push(jewel);
			}
		}
		board.render();
		this.checkBoard();
	}

//Renders my grid on dom, while setting an event listener
//to all my cells
	this.render = function(){
		// document.body.removeChild(document.getElementById('container'));
		var container = document.createElement('div');
		container.id = 'container';
		document.body.appendChild(container);
		for (var i = 0; i < this.width; i++){
			var div = document.createElement('div');
			div.id = 'columnId-' + i;
			div.className = 'column';
			container.appendChild(div);
			for (var j = 0; j < this.height; j++){
				var currentJewel = this.columns[i][j];
				var tile = document.createElement('CANVAS');
				tile.className = "cell";
				tile.id = i + ", " + j;
				tile.addEventListener('click', this.move.bind(this) );
				tile.setAttribute('width', 70);
				tile.setAttribute('height', 70);
				tile.setAttribute('data-column', i);
				tile.setAttribute('data-cell', j);
				var ctx = tile.getContext('2d');
				ctx.fillStyle = currentJewel.type;
				ctx.fillRect(0, 0, tile.width, tile.height);
				tile.style.backgroundColor = 'gray';
				div.appendChild(tile);
			}
		}
		// this.checkBoard();
	}

	this.checkBoard = function() {
		for (var i = 0; i < this.columns.length; i++){
			for (var j = 0; j < this.columns[i].length; j++){
				this.checkForRight( i, j );
				this.checkForDown( i, j );
			}
		}
		for (var i = 0; i < this.columns.length; i++){
			for (var j = 0; j < this.columns[i].length; j++){
				if(this.columns[i][j].flaggedForRemoval === true){
					return this.removeJewels();
				}
			}
		}
		console.log('THIS.COLUMNS', this.columns);
	}

	this.removeJewels = function(){
		var columnCount = [],
			cellCount = [];
		for (var i = 0; i < this.columns.length; i++){
			columnCount.push({i: i});
			var currColumn = columnCount[i];
			currColumn.cellArray = [];
			for (var j = 0; j < this.columns[i].length; j++){
				if(this.columns[i][j].flaggedForRemoval === true){
					this.columns[i].splice(j, 1);
					var newJewel = whichJewel();
					this.columns[i].unshift(newJewel);
					columnCount[i].cellArray.push(j);
					// columnCount.push(j);
					// var currCanvas = document.getElementById(i + ", " + j);
					// var ctx = currCanvas.getContext('2d');
					// ctx.clearRect(0, 0, currCanvas.width, currCanvas.height);
					// ctx.fillStyle = newJewel.type;
					// ctx.fillRect(0, 0, currCanvas.width, currCanvas.height);	
				}
			}
		}
		// console.log('cellCount:', cellCount);
		// columnCount.numberOfOccurrences = function(num){
		// 	var count = 0;
		// 	for(var i = 0; i < this.length; i++){
		// 		if(this[i] === num){
		// 			count += 1;
		// 		}
		// 	}
		// 	return count;
		// }

		// for(var i = 0; i < columnCount.length; i++){
		// 	console.log("LOOOKK: ", columnCount.numberOfOccurrences(columnCount[i]));
		// }

		this.recolor(columnCount);
	}

	this.recolor = function(columnCount){

		for(var i = 0; i < columnCount.length; i++){
			var cellArr = columnCount[i].cellArray;
			if(cellArr.length > 0){
				// console.log('columnCount[i], ', columnCount[i]);
				var colIndex = columnCount[i].i;
				var cellIndex = cellArr[cellArr.length - 1];

				while(cellIndex >= 0){
					var currCanvas = document.getElementById(colIndex + ", " + cellIndex);
					var ctx = currCanvas.getContext('2d');
					ctx.clearRect(0, 0, currCanvas.width, currCanvas.height);
					ctx.fillStyle = this.columns[colIndex][cellIndex].type;
					ctx.fillRect(0, 25, currCanvas.width, currCanvas.height);
					// console.log("CURRACANVA: ", currCanvas);
					cellIndex--;
				}
			}
		}

		this.checkBoard();

		// columnCount.numberOfOccurrences = function(num){
		// 	var count = 0;
		// 	for(var i = 0; i < this.length; i++){
		// 		if(this[i] === num){
		// 			count += 1;
		// 		}
		// 	}
		// 	return count;
		// }

		// columnCount.unique = function(){
		// 	var whichColumn = [];

		// 	for(var i = 0; i < this.length; i++){
		// 		if(whichColumn.indexOf(this[i]) === - 1){
		// 			whichColumn.push(this[i]);
		// 		}
		// 	}
		// 	return whichColumn;
		// }

		// console.log("uniqueArrColumns: ", columnCount);

		// Count.unique = function(){
		// 	var startIndex = [];

		// 	for(var i = 0; i < this.length; i++){
		// 		if(startIndex.indexOf(this[i]) === - 1){
		// 			startIndex.push(this[i]);
		// 		}
		// 	}
		// 	return startIndex;
		// }

		// columnCount.organize = function(){
		// 	var organized = columnCount.sort();
		// 	console.log("organized", organized);
		// 	for(var i = 0; i < organized.length; i++){

		// 	}
		// }

		// console.log("UNIQUEARRCELL: ", cellCount);

		// var columnIndex = columnCount.unique();

		// var cellArray = [];

		// for(var i = 0; i < columnCount.length; i++){

		// 	console.log("LOOOKK: ", columnCount.numberOfOccurrences(columnCount[i]));

		// }


		// var currCanvas;

		// for(var i = 0; i < columnIndex.length; i++){
		// 	var occurrences = columnCount.numberOfOccurrences(columnIndex[i]);

		// 	for(var j = 0; j < occurrences; j++){
							
		// 	}

		// }

		// var canvasArr = document.querySelectorAll('canvas');
		// console.log("canvasArr", canvasArr);
		// var colors = [];

		// for (var i = 0; i < this.columns.length; i++){
		// 	for (var j = 0; j < this.columns[i].length; j++){
		// 		colors.push(this.columns[i][j].type);
		// 	}
		// }

		// var count = 0;

		// for (var i = 0; i < canvasArr.length; i++){
		// 	var currCanvas = canvasArr[i];
		// 	var ctx = currCanvas.getContext('2d');
		// 	ctx.clearRect(0, 0, currCanvas.width, currCanvas.height);
		// 	ctx.fillStyle = colors[count];
		// 	ctx.fillRect(0, 0, currCanvas.width, currCanvas.height);
		// 	count++	
		// }


	}


	//CHECK RIGHT
	this.checkForRight = function(columnIndex, rowIndex){
		
		var currJewel = this.columns[ columnIndex ][ rowIndex ],
			columnIndex = columnIndex,
			rowIndex = rowIndex;

		var rightIndex = columnIndex, 
			rightCount = 0;
		while( rightIndex <= 7 &&  currJewel.type === this.columns[ rightIndex ][ rowIndex ].type ) {
			rightCount++;
			if( rightCount === 3 ) {
				this.columns[ rightIndex ][ rowIndex ].flaggedForRemoval = true;
				this.columns[ rightIndex - 1 ][ rowIndex ].flaggedForRemoval = true;
				this.columns[ rightIndex - 2 ][ rowIndex ].flaggedForRemoval = true;
			}
			else if( rightCount > 3 ){
				this.columns[ rightIndex ][ rowIndex ].flaggedForRemoval = true;
			}
			rightIndex++;
		}
	}

	//CHECK DOWN
	this.checkForDown = function(columnIndex, rowIndex){
		
		var currJewel = this.columns[ columnIndex ][ rowIndex ],
			columnIndex = columnIndex,
			rowIndex = rowIndex;

		var verticalIndex = rowIndex,
			vertCount = 0;

		while( verticalIndex <= 7 && currJewel.type === this.columns[ columnIndex ][ verticalIndex ].type) {
			vertCount++;
			if( vertCount === 3){
				this.columns[ columnIndex ][ verticalIndex ].flaggedForRemoval = true;
				this.columns[ columnIndex ][ verticalIndex - 1 ].flaggedForRemoval = true;
				this.columns[ columnIndex ][ verticalIndex - 2 ].flaggedForRemoval = true;
			}
			else if( vertCount > 3 ){
				this.columns[ columnIndex ][ verticalIndex ].flaggedForRemoval = true;
			}
			verticalIndex++;
		}
	}

	//Handler for click event on my cells
	this.move = function(e){
		var clickedElement = e.currentTarget;
		var columnIndex = parseInt( clickedElement.getAttribute('data-column') , 10 );
		var rowIndex = parseInt( clickedElement.getAttribute('data-cell') , 10 );
	
		if( this.selectedJewelPos ){
			
			var secondClickedPos = [ columnIndex, rowIndex ];
			console.debug('secondClickedPos: ', secondClickedPos );
			
			//WHAT IS NON-SWAPABLE
			if( ( secondClickedPos[0] === this.selectedJewelPos[0] + 1 && secondClickedPos[1] === this.selectedJewelPos[1] ) || ( secondClickedPos[0] === this.selectedJewelPos[0] - 1 && secondClickedPos[1] === this.selectedJewelPos[1] )
			||  ( secondClickedPos[1] === this.selectedJewelPos[1] + 1 && secondClickedPos[0] === this.selectedJewelPos[0] ) || ( secondClickedPos[1] === this.selectedJewelPos[1] - 1 && secondClickedPos[0] === this.selectedJewelPos[0] ) ){
				
				var tempJewel = this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];
				this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ] 
				= this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ];
				this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ] = tempJewel;
				

				if( this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ].flaggedForRemoval === false && this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ].flaggedForRemoval === false ){
				
					this.columns[ this.selectedJewelPos[0] ][this.selectedJewelPos[1] ]
					= this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];
					this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ] = tempJewel;

					// board.render();
				}

				else if ( this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ].flaggedForRemoval || this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ].flaggedForRemoval ){
					this.checkBoard();
				}

			}

			this.selectedJewelPos = null;

		}
		
		//nothing selected
		else {
			clickedElement.getContext('2d');


			this.selectedJewelPos = [ columnIndex, rowIndex ];

			console.debug('selectedJewelPos: ', this.selectedJewelPos );

		}
	}

}

//Constructor for my jewels

function Jewel (type){
	this.type = type;
	this.flaggedForRemoval = false;
}

//randomizer for my different jewels
function whichJewel(){
	var jewel;
	var random = Math.random();
	if (random < 0.2){
		jewel = new Jewel('blue');
	}

	else if ((random > 0.2) && (random < 0.4)){
		jewel = new Jewel('red');
	}

	else if ((random > 0.4) && (random < 0.6)){
		jewel = new Jewel('yellow');
	}

	else if ((random > 0.6) && (random < 0.8)){
		jewel = new Jewel('green');
	}

	else {
		jewel = new Jewel('white');
	}
	return jewel;
};


//New instance of Grid being created
var board = new Grid(8, 8, 'container');

board.populate();
