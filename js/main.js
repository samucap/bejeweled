function Grid(width, height, container){
	this.width = width;
	this.height = height;
	this.cells = [];
	this.containerEl = document.getElementById(container);
	
	this.populate = function(){
		for (var i = 0; i < this.width * this.height; i++){
			var jewel = whichJewel();
			this.cells.push(jewel);
		}
	}
	
	this.move = function(e){
		var clickedElement = e.currentTarget;
		var index = parseInt( clickedElement.getAttribute('data-index') , 10 );
		var clickedJewel = this.cells[index];
		console.log( clickedJewel )
	}


	this.render = function(){
		for (var i = 0; i < this.width * this.height ; i++){
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


}

function Jewel (type){
	this.type = type;	
}

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


var board = new Grid(8, 8, 'container');



board.populate();
board.render();
