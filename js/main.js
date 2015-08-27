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
				var jewel = whichJewel(i, j);
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

			//check();

			this.selectedJewelPos = null;

			this.checkBoard();
			this.render();
			// logic for second click
			// var secondJewel = this.columns[columnIndex][cellIndex];
			// console.log('second jewel ' , secondJewel);

			// var temp = this.columns[secondJewel.x][secondJewel.y];
			// this.columns[secondJewel.x][secondJewel.y] = this.columns[this.firstJewel.x][this.firstJewel.y];
			// this.columns[this.firstJewel.x][this.firstJewel.y] = temp;


			
			// this.firstJewel.selected = false;
			// this.firstJewel = "";
			// this.render();


		} 

		else { //nothing selected

			this.selectedJewelPos = [ columnIndex, cellIndex ];
			console.debug('selectedJewelPos: ', this.selectedJewelPos );

			// // logic for first click
			// this.firstJewel = this.columns[columnIndex][cellIndex];
			// console.log('first jewel ', this.firstJewel);
			// this.firstJewel.selected = true;
		}


		// function horizontal(x){
		// 	var right;
		// 	var left;
		// 	function (){
		// 		return {right : columnIndex + 1,
		// 				left : columnIndex - 1
		// 			};
		// 	}
		// }

		// function vertical(y){
		// 	var up;
		// 	var down;
		// 	function(){
		// 		return {top = cellIndex - 1,
		// 				bottom = cellIndex + 1
		// 			};
		// 	}
		// }

	}

	this.checkBoard = function() {
		for (var i = 0; i < this.columns.length; i++){
			for (var j = 0; j < this.columns[i].length; j++){
				var currJewel = this.columns[i][j];
					// currColor = currJewel.type
				console.debug('currJewel: ', currJewel );
				


			}
		}
		this.render();
	}
}


//Constructor for my jewels

function Jewel (type, x, y){
	this.type = type;
	//this.x = x;
	//this.y = y;
	this.selected = false;
}

//randomizer for my different jewels
function whichJewel(x, y){
	var jewel;
	var random = Math.random();
	if (random < 0.2){
		jewel = new Jewel('blue', x, y);
	}

	else if ((random > 0.2) && (random < 0.4)){
		jewel = new Jewel('red', x, y);
	}

	else if ((random > 0.4) && (random < 0.6)){
		jewel = new Jewel('yellow', x, y);
	}

	else if ((random > 0.6) && (random < 0.8)){
		jewel = new Jewel('green', x, y);
	}

	else {
		jewel = new Jewel('white', x, y);
	}
	return jewel;
};


//New instance of Grid being created
var board = new Grid(8, 8, 'container');


board.populate();
board.render();







