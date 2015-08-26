//Constructor function for my grid. By creating it using a constructor,
//I can make an object out of every cell.
function Grid(width, height, container){
	this.width = width;
	this.height = height;
	this.columns = [];
	
//Creates my cells, and it populates it with jewels
	this.populate = function(){
		for (var i = 0; i < this.width; i++){
			this.columns[i] = [];
			for (var x = 0; x < this.height; x++){
				var jewel = whichJewel(i, x);
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
			for (var x = 0; x < this.height; x++){
				var currentJewel = this.columns[i][x];
				var tile = document.createElement('div');
				tile.className = "cell";
				tile.addEventListener('click', this.move.bind(this) );
				tile.setAttribute('data-column', i);
				tile.setAttribute('data-cell', x)
				tile.innerHTML = currentJewel.type;
				div.appendChild(tile);
			}
		}
	}

//Handler for click event on my cells
	this.move = function(e){
		var clickedElement = e.currentTarget;	
		var columnIndex = parseInt( clickedElement.getAttribute('data-column') , 10 );
		var cellIndex = parseInt( clickedElement.getAttribute('data-cell') , 10 );
		var clickedJewel = this.columns[columnIndex][cellIndex];
		var firstSquare = getFirstSquare(this);
		console.log(firstSquare);
		if(firstSquare){
			// logic for second click
			var secondSquare = clickedJewel;
			console.log(secondSquare);
			var fsType = firstSquare.type;
			firstSquare.type = secondSquare.type;
			secondSquare.type = fsType;
			firstSquare.selected = false;
			console.log(firstSquare.type);
			console.log(secondSquare.type);
			this.render();

		} else {
			// logic for first click
			clickedJewel.selected = true;
			console.log(clickedJewel);
			// function(index){
			// 	console.log(index);
			// }
		}
	}
}


//Constructor for my jewels

function Jewel (type, column, cell){
	this.type = type;
	this.selected = false;
	this.column = column;
	this.cell = cell;
}

//randomizer for my different jewels
function whichJewel(col, cell){
	var jewel;
	var random = Math.random();
	if (random < 0.2){
		jewel = new Jewel('blue', col, cell);
	}

	else if ((random > 0.2) && (random < 0.4)){
		jewel = new Jewel('red', col, cell);
	}

	else if ((random > 0.4) && (random < 0.6)){
		jewel = new Jewel('yellow', col, cell);
	}

	else if ((random > 0.6) && (random < 0.8)){
		jewel = new Jewel('green', col, cell);
	}

	else {
		jewel = new Jewel('white', col, cell);
	}
	return jewel;
};

function getFirstSquare(board){
	var selectedSquare = null;
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







