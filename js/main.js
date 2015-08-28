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
	}

//Renders my grid on dom, while setting an event listener
//to all my cells
	this.render = function(){
		document.body.removeChild(document.getElementById('container'));
		var container = document.createElement('div');
		container.id = 'container';
		document.body.appendChild(container);
		for (var i = 0; i < this.width; i++){
			var div = document.createElement('div');
			div.className = 'column';
			container.appendChild(div);
			for (var j = 0; j < this.height; j++){
				var currentJewel = this.columns[i][j];
				var tile = document.createElement('div');
				tile.className = "cell";
				tile.addEventListener('click', this.move.bind(this) );
				tile.setAttribute('data-column', i);
				tile.setAttribute('data-cell', j)
				tile.innerHTML = i + ", " + j;
				tile.style.backgroundColor = currentJewel.type;
				div.appendChild(tile);
			}
		}
		this.removeJewels();
	}


//Handler for click event on my cells
	this.move = function(e){
		var clickedElement = e.currentTarget;
		var columnIndex = parseInt( clickedElement.getAttribute('data-column') , 10 );
		var cellIndex = parseInt( clickedElement.getAttribute('data-cell') , 10 );
	
		if( this.selectedJewelPos ){
			
			var secondClickedPos = [ columnIndex, cellIndex ];
			console.debug('secondClickedPos: ', secondClickedPos );

			var tempJewel = this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];
			// console.debug('tempJewel: ', tempJewel );
			this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ] 
			= this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ];
			this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ] = tempJewel;
			
			//WHAT IS NON-SWAPABLE

			//this.checkForSequences(columnIndex, cellIndex);
			this.render();
			// this.checkBoard();
			this.removeJewels();

			// function toRight(){
			// 	var toRight;
				// console.debug("first jewel x: ", this.selectedJewelPos[0]);

				// while (){
				// 	toRight = this.columns[i][j].type;
				// 	i ++;
				// }
				// console.debug("toRight: ", toRight);
			// }
			// toRight();

			// if (this.checkBoard() == false){
			// 	this.columns[ this.selectedJewelPos[0] ][this.selectedJewelPos[1] ] = this.columns[secondClickedPos[0]][secondClickedPos[1]];
			// 	this.columns[secondClickedPos[0]][secondClickedPos[1]] = tempJewel;
			// 	// setTimeout(this.render(), 500);
			// }

			this.selectedJewelPos = null;
		}

			else { //nothing selected

			this.selectedJewelPos = [ columnIndex, cellIndex ];
			//this.directions(columnIndex, cellIndex);
			console.debug('selectedJewelPos: ', this.selectedJewelPos );
			}


	}


	this.checkBoard = function() {
		for (var i = 0; i < this.columns.length; i++){
			for (var j = 0; j < this.columns[i].length; j++){
			// var currJewel = this.columns[i][j],
			// 	currColor = currJewel.type;
			this.removeJewels();
			}
		}
	}

	//CHECK RIGHT
	this.checkForRight = function(columnIndex, cellIndex){
		
		var currJewel = this.columns[ columnIndex ][ cellIndex ],
			columnIndex = columnIndex,
			cellIndex = cellIndex;

		var rightIndex = columnIndex, 
			rightCount = 0;
		while( rightIndex <= 7 &&  currJewel.type === this.columns[ rightIndex ][ cellIndex ].type ) {
			rightCount++;
			if( rightCount === 3 ) {
				this.columns[ rightIndex ][ cellIndex ].flaggedForRemoval = true;
				this.columns[ rightIndex - 1 ][ cellIndex ].flaggedForRemoval = true;
				this.columns[ rightIndex - 2 ][ cellIndex ].flaggedForRemoval = true;
			}
			else if( rightCount > 3 ){
				this.columns[ rightIndex ][ cellIndex ].flaggedForRemoval = true;
			}
			rightIndex++;
		}

	}

	//CHECK DOWN
	this.checkForDown = function(columnIndex, cellIndex){
		
		var currJewel = this.columns[ columnIndex ][ cellIndex ],
			columnIndex = columnIndex,
			cellIndex = cellIndex;

		var verticalIndex = cellIndex,
			vertCount = 0;
			// console.log("verticalIndex: " + verticalIndex);
			// console.log("currJewel: " + verticalIndex);
			// console.log("columnIndex: " + columnIndex);
			// console.log("this.columns " + this.columns[columnIndex][verticalIndex].type);
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
			
	this.removeJewels = function(){
		for( var i = 0; i < this.columns.length; i++ ){
			for( var j = 0; j < this.columns[i].length; j++){
				var currJewel = this.columns[i][j];
				this.checkForRight( i, j );
				this.checkForDown( i, j );
				if( currJewel.flaggedForRemoval ) {
				console.debug("currJewel: ", currJewel, "i: ", i, "j: ", j);
				this.columns[i].splice(j, 1);
				// var newJewel = whichJewel();
				// this.columns[i].unshift(newJewel);
				// console.debug("removed item: ", this.columns[i].splice(j, 1), "i: ", i, "j: ", j);
				}
			}
		}
	}

					
			// 	// console.debug('currentJewel flagged: ', currJewel);

			// 	console.debug('flaggedForRemoval: (' + i  + ',' + j + ')' );
			// }
				// Check left/right

				// if (i > 0 && i < 7){
				// 	if(currColor === this.columns[i + 1][j].type && currColor === this.columns[i - 1][j].type){
				// 		console.debug('horizontal: ', i, j, this.columns[i + 1][j], this.columns[i - 1][j] );
				// 		this.columns[i].splice(j, 1),
				// 		this.columns[i - 1].splice(j, 1),
				// 		this.columns[i + 1].splice(j, 1);
						
				// 		var newJewelOne = new Jewel('black');
				// 		var newJewelTwo = new Jewel('orange');
				// 		var newJewelThree = new Jewel('pink');

				// 		this.columns[i].unshift(newJewelOne);
				// 		this.columns[i - 1].unshift(newJewelTwo);
				// 		this.columns[i + 1].unshift(newJewelThree);
				// 	jewelRemove += 3;
				// 	}
				// }

				// // Check top/bottom
				// if (j > 0 && j < 7){
				// 	if(currColor === this.columns[i][j - 1].type && currColor === this.columns[i][j + 1].type){
				// 		console.debug('vertical: ', i, j, this.columns[i][j + 1], this.columns[i][j - 1] );
				// 		var center = this.columns[i].splice(j - 1, 3);
				// 		var vertJewelOne = new Jewel('purple');
				// 		var vertJewelTwo = new Jewel('brown');
				// 		var vertJewelThree = new Jewel('gray');

				// 		this.columns[i].unshift(vertJewelOne, vertJewelTwo, vertJewelThree);
						
				// 		jewelRemove += 3;
				// 	}


}
 



		//var startColumn = 7 - columnIndex;

		
		// while(startColumn++ <= 7){
		// 	//var i = 7 - movesX;

		// 	var rightJewel = this.columns[startColumn][j];
		// 	if( currJewel.type === rightJewel.type ) {

		// 	}
		// 	//i++;
		// }

		//console.debug('this is i: ', i, ' and j: ', j);
		//console.debug('toRight: ', toRight)


		// while (8 - i > 0){
		// 	var toRight = null;
		// 	toRight = this.columns[i][j];
		// 	i++;
		// }
	// }

// 	this.directions = function (){
// 		var i = ;
// 		var j = 0;
		
	// 	function toRight(){
	// 		var toRight;
	// 		while (){
	// 			toRight = this.columns[i][j].type;
	// 			i ++;
	// 		}
	// 		console.debug("toRight: ", toRight);
	// 	}
	// }
		

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
board.render();





