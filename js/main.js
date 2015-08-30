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
		this.checkBoard();
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
	}

	this.checkBoard = function() {
		for (var i = 0; i < this.columns.length; i++){
			for (var j = 0; j < this.columns[i].length; j++){
				this.checkForRight( i, j );
				this.checkForDown( i, j );
				if ( this.columns[i][j].flaggedForRemoval ){
					this.removeJewels(i, j);
				}
			}
		}
		board.render();
	}

	this.removeJewels = function(i, j){

		console.debug ("i: ", i, "j: ", j, "color: ", this.columns[i][j].type, this.columns[i][j].flaggedForRemoval);
		this.columns[i].splice(j, 1);
		var newJewel = whichJewel();
		this.columns[i].unshift(newJewel);
		this.checkBoard();
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
			if( ( secondClickedPos[0] === this.selectedJewelPos[0] + 1 && secondClickedPos[1] === this.selectedJewelPos[1] ) || ( secondClickedPos[0] === this.selectedJewelPos[0] - 1 && secondClickedPos[1] === this.selectedJewelPos[1] )
			||  ( secondClickedPos[1] === this.selectedJewelPos[1] + 1 && secondClickedPos[0] === this.selectedJewelPos[0] ) || ( secondClickedPos[1] === this.selectedJewelPos[1] - 1 && secondClickedPos[0] === this.selectedJewelPos[0] ) ){

				var tempJewel = this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ];
				this.columns[ secondClickedPos[0] ][ secondClickedPos[1] ] 
				= this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ];
				this.columns[ this.selectedJewelPos[0] ][ this.selectedJewelPos[1] ] = tempJewel;
			}
			this.checkBoard();

			this.selectedJewelPos = null;

			//WHAT IS NON-SWAPABLE
		}

			else { //nothing selected

			this.selectedJewelPos = [ columnIndex, rowIndex ];
			//this.directions(columnIndex, rowIndex);
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
