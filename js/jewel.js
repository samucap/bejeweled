const cellSize = 80;
const colors = {
  purple: '#A500EB',
  green: '#008314',
  yellow: '#F3B700',
  red: '#FF0050',
  orange: '#FF4600',
  white: '#F7F7FF',
  blue: '#65AFFF'
};

module.exports = class Jewel {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.startSpace = this.x * cellSize + this.y * cellSize;
    this.endSpace = ((this.x + 1) * cellSize + (this.y + 1) * cellSize);
    this.whichJewel();
  }

  whichJewel() {
    const min = Math.ceil(0);
    const max = Math.floor(6);
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    this.type = colors[Object.keys(colors)[randomNum]];
  }

  //this.drawJewel = function(){
	//	var currCanvas = document.getElementById('currCanvas');
  //  var startX = this.x * cellSize;
  //  var startY = this.y * cellSize;
	//	var ctx = currCanvas.getContext('2d');

	//	ctx.clearRect(startX, startY, cellSize, cellSize);
  //  ctx.beginPath();
  //  moveTo(startX, startY);

  //  switch (this.type) {
  //    //triangle
  //    case colors.purple:
  //      moveTo(startX + cellSize / 2, startY);
  //      ctx.lineTo(startX + cellSize, startY + cellSize);
  //      ctx.lineTo(startX, startY + cellSize);
  //      ctx.lineTo(startX + cellSize / 2, startY);
  //    break;

  //    // diamond
  //    case colors.yellow:
  //      moveTo(startX + cellSize / 2, startY);
  //      ctx.lineTo(startX + cellSize, startY + cellSize / 2);
  //      ctx.lineTo(startX + cellSize / 2, startY + cellSize);
  //      ctx.lineTo(startX, startY + cellSize / 2);
  //      ctx.lineTo(startX + cellSize / 2, startY);
  //    break;

  //    //square
  //    case colors.green:
  //      ctx.rect(startX, startY, cellSize, cellSize);
  //    break;

  //    //square
  //    case colors.red:
  //      ctx.rect(startX, startY, cellSize, cellSize);
  //    break;

  //    //hexa
  //    case colors.orange:
  //      moveTo(startX + cellSize / 2, startY);
  //      ctx.lineTo(startX + cellSize, startY + 20);
  //      ctx.lineTo(startX + cellSize, startY + 40);
  //      ctx.lineTo(startX + cellSize / 2, startY + cellSize);
  //      ctx.lineTo(startX, startY + 40);
  //      ctx.lineTo(startX, startY + 20);
  //      ctx.lineTo(startX + cellSize / 2, startY);
  //    break;

  //    // circle
  //    case colors.white:
  //      moveTo(startX, startY);
  //      ctx.arc(startX + cellSize/2, startY + cellSize/2, cellSize/2, Math.PI * 2, false);
  //    break;

  //    // down triangle
  //    case colors.blue:
  //      moveTo(startX, startY);
  //      ctx.lineTo(startX + cellSize, startY);
  //      ctx.lineTo(startX + cellSize / 2, startY + cellSize);
  //      ctx.lineTo(startX, startY);
  //    break;
  //  }

  //  ctx.strokeRect(startX, startY, cellSize, cellSize);
  //  ctx.fillStyle = this.type;
	//	ctx.fill();
  //  ctx.closePath();
	//}
}
