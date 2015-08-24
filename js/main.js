var container = document.getElementById('container');

function board(){
	for (var x = 0; x < 8; x++){
		var div = document.createElement("div");
		container.appendChild(div);
		div.className = "row";

			for (var i = 0; i < 8; i++){
				var cells = document.createElement("div");
				var rows = document.getElementsByClassName("row");
				var y = rows[x];
				y.appendChild(cells);
				cells.style.width = "60px";
				cells.style.height = "60px";
				cells.style.border = "1px blue solid";
				cells.style.display = "inline-block";
				cells.style.margin = "4px";
				y.style.textAlign = "center";
			}
	}
};

board();

