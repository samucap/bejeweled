//Constructor function for my grid. By creating it using a constructor,
//I can make an object out of every cell.
function Grid(width, height, container){
	this.width = width;
	this.height = height;
	this.columns = [];
	
//Creates my cells, and it populates it with jewels
	this.populate = function(){
		for (var x = 0; x < this.width; x++){
			this.columns[x] = [];
			for (var i = 0; i < this.height; i++){
				var jewel = whichJewel(x, i);
				this.columns[x].push(jewel);
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
			for (var x = 0; x < this.height; x++){
				var currentJewel = this.columns[i][x];
				var tile = document.createElement('div');
				tile.className = "cell";
				tile.addEventListener('click', this.move.bind(this) );
				tile.setAttribute('data-column', i);
				tile.setAttribute('data-cell', x)
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
		var firstJewel = getFirstJewel(this);
		var secondJewel;
			
		if(firstJewel){
			// logic for second click
			var secondJewel = this.columns[columnIndex][cellIndex];
			
			var fsType = firstJewel.type;
			firstJewel.type = secondJewel.type;
			secondJewel.type = fsType;
	
			var fsX = firstJewel.x;
			firstJewel.x = secondJewel.x;
			secondJewel.x = fsX;

			var fsY = firstJewel.y;
			firstJewel.y = secondJewel.y;
			secondJewel.y = fsY;

			this.render();

			firstJewel.selected = false;

			console.log(firstJewel);
			console.log(secondJewel);
			firstJewel.check(firstJewel.x, firstJewel.y);
			secondJewel.check(secondJewel.x, secondJewel.y);
		} 

		else {
			var firstJewel = this.columns[columnIndex][cellIndex];
			firstJewel.selected = true;
			}
	}
}


//Constructor for my jewels

function Jewel (type, x, y){
	this.type = type;
	this.x = x;
	this.y = y;
	this.selected = false;

	this.check = function(x, y){
				var cellsArray = document.getElementsByClassName('cell');
				var x = parseInt(x, 10);
				var y = parseInt(y, 10);
				var indexCellsArray = x + y * 8;
				console.log(indexCellsArray);
	};
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

function getFirstJewel(board){
	var selectedSquare;
	for (var i = 0; i < board.columns.length; i++) {
		for (var x = 0; x < board.columns[i].length; x++){
			if (board.columns[i][x].selected == true) {
				selectedSquare = board.columns[i][x];
			}
		}
	}
	return selectedSquare;
}

//New instance of Grid being created
var board = new Grid(8, 8, 'container');


board.populate();
board.render();







