const colors = {
  purple: '#C200FB',
  green: '#8CD867',
  yellow: '#F1D302',
  red: '#A31621',
  orange: '#D74E09',
  white: '#F7F7FF',
  blue: '#2364AA'
};

module.exports = class Jewel {
  constructor(x, y, cellPad, cellSize) {
    this.x = x;
    this.y = y;
    this.cellPad = cellPad;
    this.cellSize = cellSize;
    this.personalSpace = [
      (this.x * (this.cellSize+this.cellPad)) + (this.y * (this.cellSize+this.cellPad))+this.cellPad,
      ((this.x + 1) * (this.cellSize+this.cellPad)) + ((this.y + 1) * (this.cellSize+this.cellPad))+this.cellPad
    ];
    this.whichJewel(x, y);
    this.remove = false;
  }

  whichJewel(x, y) {
    const min = Math.ceil(0);
    const max = Math.floor(6);
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    this.type = colors[Object.keys(colors)[randomNum]];
  }

  changeType(type) {
    this.type = colors[type];
  }

  drawJewel(){
    const currCanvas = document.getElementById('currCanvas');
    const startX = (this.x * this.cellSize) + (this.x * 15) + 15;
    const startY = (this.y * this.cellSize) + (this.y * 15) + 15;
    const ctx = currCanvas.getContext('2d');

    ctx.clearRect(startX, startY, this.cellSize, this.cellSize);
    ctx.beginPath();
    moveTo(startX, startY);

    switch (this.type) {
        //triangle
      case colors.purple:
        moveTo(startX + this.cellSize / 2, startY);
        ctx.lineTo(startX + this.cellSize, startY + this.cellSize);
        ctx.lineTo(startX, startY + this.cellSize);
        ctx.lineTo(startX + this.cellSize / 2, startY);
        break;

        // diamond
      case colors.yellow:
        moveTo(startX + this.cellSize / 2, startY);
        ctx.lineTo(startX + this.cellSize, startY + this.cellSize / 2);
        ctx.lineTo(startX + this.cellSize / 2, startY + this.cellSize);
        ctx.lineTo(startX, startY + this.cellSize / 2);
        ctx.lineTo(startX + this.cellSize / 2, startY);
        break;

        //square
      case colors.green:
        ctx.rect(startX, startY, this.cellSize, this.cellSize);
        break;

        //square
      case colors.red:
        ctx.rect(startX, startY, this.cellSize, this.cellSize);
        break;

        //hexa
      case colors.orange:
        moveTo(startX + this.cellSize / 2, startY);
        ctx.lineTo(startX + this.cellSize, startY + 20);
        ctx.lineTo(startX + this.cellSize, startY + 40);
        ctx.lineTo(startX + this.cellSize / 2, startY + this.cellSize);
        ctx.lineTo(startX, startY + 40);
        ctx.lineTo(startX, startY + 20);
        ctx.lineTo(startX + this.cellSize / 2, startY);
        break;

        // circle
      case colors.white:
        moveTo(startX, startY);
        ctx.arc(startX + this.cellSize/2, startY + this.cellSize/2, this.cellSize/2, Math.PI * 2, false);
        break;

        // down triangle
      case colors.blue:
        moveTo(startX, startY);
        ctx.lineTo(startX + this.cellSize, startY);
        ctx.lineTo(startX + this.cellSize / 2, startY + this.cellSize);
        ctx.lineTo(startX, startY);
        break;
    }

    ctx.strokeRect(startX, startY, this.cellSize, this.cellSize);
    ctx.fillStyle = this.type;
    ctx.fill();
    ctx.closePath();
  }
}
