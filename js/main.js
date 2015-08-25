//Constructor function for my grid. By creating it using a constructor,
//I can make an object out of every cell.
function Grid(width, height, container){
	this.width = width;
	this.height = height;
	this.cells = [];
	this.containerEl = document.getElementById(container);
	
//Creates my cells, and it populates it with jewels
	this.populate = function(){
		for (var i = 0; i < this.width * this.height; i++){
			var jewel = whichJewel();
			this.cells.push(jewel);
		}
	}

//Handler for click event on my cells
	this.move = function(e){
		var clickedElement = e.currentTarget;
		var index = parseInt( clickedElement.getAttribute('data-index') , 10 );
		var clickedJewel = this.cells[index];
		var firstSquare = getFirstSquare(this);

		if(firstSquare){
			// logic for second click
			var b = clickedJewel;
			console.log(b);
			firstSquare.selected = false;
		} else {
			// logic for first click
			clickedJewel.selected = true;
			var a = clickedJewel;
			console.log(a);
			// function(index){
			// 	console.log(index);
			// }
		}
	}

//Renders my grid on dom, while setting an event listener
//to all my cells
	this.render = function(){
		for (var i = 0; i < this.width * this.height; i++){
			var currentJewel = this.cells[i];
			var isNewLine = (i !== 0 && i % 8 === 0);
			var div = document.createElement('div');
			div.addEventListener('click', this.move.bind(this) );
			div.innerHTML = currentJewel.type;
			if (isNewLine){
				var div2 = document.createElement('div');
				this.containerEl.appendChild(div2);
			}

			div.className = "cell";
			div.setAttribute('data-index', i);
			this.containerEl.appendChild(div);
		}
	}


	// this.toLeft = function(){
	// 	this.index -= 1;

	// };
	// this.onTop = function(){
	// 	index -= 8;

	// };
	// this.under = function(){
	// 	index += 8;
	// };
}

//Constructor for my jewels

function Jewel (type){
	this.type = type;
	this.selected = false;

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

function getFirstSquare(board){
	var selectedSquare = null;
	for (var i = 0; i < board.cells.length; i++) {
		if (board.cells[i].selected == true) {
			selectedSquare = board.cells[i];
		}
	}
	return selectedSquare;
}

//New instance of Grid being created
var board = new Grid(8, 8, 'container');


board.populate();
board.render();







