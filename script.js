var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");

var renderCanvas = document.createElement("canvas");
var renderC = renderCanvas.getContext("2d");
document.body.appendChild(renderCanvas);

window.onload = init;

window.addEventListener("resize", fixCanvas);

renderCanvas.addEventListener("mousemove", function (e) {
    mouse = {
        x: e.offsetX / scale,
        y: e.offsetY / scale,
    };
});

var board = undefined;

var mouse = {
    x:undefined,
    y:undefined
};


function fixCanvas() {
    canvas.width = 1920 / 5;
    canvas.height = 1080 / 5;
    if (window.innerWidth * 9 > window.innerHeight * 16) {
        renderCanvas.width = window.innerHeight * 16 / 9;
        renderCanvas.height = window.innerHeight;
        scale = renderCanvas.width / canvas.width;
    } else {
        renderCanvas.width = window.innerWidth;
        renderCanvas.height = window.innerWidth * 9 / 16;
        scale = renderCanvas.height / canvas.height;
    };
};

function update(){
    renderC.clearRect(0,0,renderCanvas.width,renderCanvas.height)

    if(board){
        board.update();
    };

    renderC.drawImage(canvas,0,0,renderCanvas.width,renderCanvas.height);

    requestAnimationFrame(update);
}   ;

function init(){
    fixCanvas();

    board = new Board();
};

function detectCollision(x, y, w, h, x2, y2, w2, h2) {
    if (x + w > x2 && x < x2 + w2 && y + h > y2 && y < y2 + h2) {
        return true;
    };
};

class Board{
    constructor(){
        this.squares = [];

        for(let i = 0; i < 64; i++){
            this.squares.push(new Square(i));
        };
    };
    draw(){
        this.squares.forEach(e => e.update());
    };
    update(){
        this.draw();
    };
};

class Square{
    constructor(i){
        let x = i % 8;
        let y = Math.floor(i/8);
        this.x = x;
        this.y = y;
        this.isLightSquare = (this.x + this.y) % 2 != 0;
        this.piece = undefined;
        this.hover = false;
    }
    draw(){
        c.fillStyle = this.hover ? (this.isLightSquare ? "lightgray" : "gray") : (this.isLightSquare ? "white" : "black");
        c.fillRect(this.x*27 + 84,this.y*27,27,27);
    };
    update(){
        this.hover = detectCollision(mouse.x,mouse.y,1,1,this.x*27 + 84,this.y*27,27,27);

        this.draw();
    };
};

class Piece{
    constructor(type,color){
        
    };
    draw(){

    };
};

update();