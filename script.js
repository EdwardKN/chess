var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");

var renderCanvas = document.createElement("canvas");
var renderC = renderCanvas.getContext("2d");
document.body.appendChild(renderCanvas);
renderCanvas.style.zIndex = 0

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
    y:undefined,
    down:false
};

renderCanvas.addEventListener("mousedown", function (e) {
    mouse.down = true;
});
renderCanvas.addEventListener("mouseup", function (e) {
    mouse.down = false;
});

var movingPiece = undefined;
var colorToMove = "white";

var localPlayer = "black"

const directionOffsets = [-8,8,-1,1,-9,9,-7,7]



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

var spritesheet;
var spritesheetImage

async function loadSpriteSheet() {
    var response = await fetch("./images/texture.json")
    spritesheet = await response.json();
    spritesheetImage = new Image();
    spritesheetImage.src = "./images/texture.png";
}

async function loadImages(imageObject) {
    await loadSpriteSheet();
    Object.entries(imageObject).forEach(image => {
        for (i = 0; i < image[1].length; i++) {
            let src = (image[1][i].split("/"))
            let src2 = src[src.length - 2] + "/" + src[src.length - 1]
            image[1][i] = (spritesheet.frames[spritesheet.frames.map(function (e) { return e.filename; }).indexOf(src2 + ".png")])
        }
    });
}

var images = {
    black:["blackPiece/BlackPawn","blackPiece/BlackRook","blackPiece/BlackKnight","blackPiece/BlackBishop","blackPiece/BlackQueen","blackPiece/BlackKing"],
    white:["whitePiece/WhitePawn","whitePiece/WhiteRook","whitePiece/WhiteKnight","whitePiece/WhiteBishop","whitePiece/WhiteQueen","whitePiece/WhiteKing"],
}

function update(){
    renderC.clearRect(0,0,renderCanvas.width,renderCanvas.height)
    c.clearRect(0,0,canvas.width,canvas.height)

    if(board){
        board.update();
    };
    c.font = "20px Arial";
    c.fillStyle = "black";
    c.textAlign = "center"
    c.fillText(colorToMove == localPlayer ? "Your turn" : "Opponent's turn", canvas.width/2, 20)

    movingPiece?.updateMoving();

    renderC.drawImage(canvas,0,0,renderCanvas.width,renderCanvas.height);

    requestAnimationFrame(update);
}   

async function init(){
    fixCanvas();
    await loadImages(images);
};

function detectCollision(x, y, w, h, x2, y2, w2, h2) {
    if (x + w > x2 && x < x2 + w2 && y + h > y2 && y < y2 + h2) {
        return true;
    };
};

function drawimageFromSpriteSheet(x, y, w, h, frame, cropX, cropY, cropW, cropH, drawcanvas) {
    if (drawcanvas === undefined) {
        drawcanvas = c;
    }
    drawcanvas.drawImage(spritesheetImage, Math.floor(cropX + frame.frame.x), Math.floor(cropY + frame.frame.y), Math.floor(cropW), Math.floor(cropH), Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

class Board{
    constructor(){
        this.squares = [];
    };
    draw(){
        c.fillStyle = "black";
        c.fillRect(-4 + (canvas.width-20*8)/2,-4 + (canvas.height-20*8)/2,20*8 + 8,20*8 + 8)
    };
    update(){
        this.draw();
        this.squares.forEach(e => e.update());

    };
    init(){
        this.squares = [];

        for(let i = 0; i < 64; i++){
            this.squares.push(new Square(i));
        };

        for(let i = 8; i < 16; i++){
            this.squares[i] = new Piece(i,0,"black")
        };
        for(let i = 48; i < 56; i++){
            this.squares[i] = new Piece(i,0,"white")
        };
        this.squares[0] = new Piece(0,1,"black")
        this.squares[7] = new Piece(7,1,"black")

        this.squares[1] = new Piece(1,2,"black")
        this.squares[6] = new Piece(6,2,"black")

        this.squares[2] = new Piece(2,3,"black")
        this.squares[5] = new Piece(5,3,"black")

        this.squares[3] = new Piece(3,4,"black")

        this.squares[4] = new Piece(4,5,"black")

        this.squares[56] = new Piece(56,1,"white")
        this.squares[63] = new Piece(63,1,"white")

        this.squares[57] = new Piece(57,2,"white")
        this.squares[62] = new Piece(62,2,"white")

        this.squares[58] = new Piece(58,3,"white")
        this.squares[61] = new Piece(61,3,"white")

        this.squares[59] = new Piece(59,4,"white")

        this.squares[60] = new Piece(60,5,"white")
    }
};

class Square{
    constructor(i){
        this.i = i;
        let x = i % 8;
        let y = (localPlayer == "white") ? Math.floor(i/8) : (7-Math.floor(i/8));
        this.x = x;
        this.y = y;
        this.isLightSquare = (this.x + this.y) % 2 != 0;
        this.piece = undefined;
        this.hover = false;
        this.size = 20;

        this.precomputedMoveData()
    }
    draw(){
        c.fillStyle = this.hover ? (this.isLightSquare ? "lightgray" : "gray") : (this.isLightSquare ? "white" : "orange");
        c.fillRect(this.x*this.size + (canvas.width-this.size*8)/2,this.y*this.size + (canvas.height-this.size*8)/2,this.size,this.size);
        c.fillStyle = movingPiece?.moves?.includes(this.i) ? "red" : "black";
        c.globalAlpha = 0.3;
        c.fillRect(this.x*this.size + (canvas.width-this.size*8)/2,this.y*this.size + (canvas.height-this.size*8)/2,this.size,this.size);
        c.globalAlpha = 1;

        if(this.drawPiece){
            this.drawPiece();
        }

        c.font = "10px Arial";
        c.fillStyle = "black";
        c.fillText(this.i,this.x*this.size + (canvas.width-this.size*8)/2,this.y*this.size + (canvas.height-this.size*8)/2 + 20)

    };
    update(){
        this.hover = detectCollision(mouse.x,mouse.y,1,1,this.x*this.size + (canvas.width-this.size*8)/2,this.y*this.size + (canvas.height-this.size*8)/2,this.size,this.size);
        
        if(this.hover && mouse.down && this instanceof Piece && !movingPiece){
            mouse.down = false;
            this.pickUpPiece();
        }

        this.draw();
    };
    precomputedMoveData(){

        let numNorth = (localPlayer == "white") ? this.y : 7 - this.y;
        let numSouth = (localPlayer == "black") ? this.y : 7 - this.y;
        let numWest = this.x;
        let numEast = 7 - this.x;

        this.numSquaresToEdge = [
            numNorth,
            numSouth,
            numWest,
            numEast,
            Math.min(numNorth,numWest),
            Math.min(numSouth,numEast),
            Math.min(numNorth,numEast),
            Math.min(numSouth,numWest)
        ];
    }
};

class Piece extends Square{
    constructor(i,type,color,firstMove){
        super(i);
        this.color = color;
        this.type = type;
        this.firstMove = firstMove == undefined ? true : false;
    };
    drawPiece(){
        if(movingPiece == this) return;
        drawimageFromSpriteSheet(this.x*this.size+ 2 + (canvas.width-this.size*8)/2,this.y*this.size + 2 + (canvas.height-this.size*8)/2,16,16,this.color == "black" ? images.black[this.type] : images.white[this.type],0,0,16,16)
    };
    updateMoving(){
        drawimageFromSpriteSheet(mouse.x-8,mouse.y-8,16,16,this.color == "black" ? images.black[this.type] : images.white[this.type],0,0,16,16)
        if(mouse.down){
            mouse.down = false;
            this.placePiece();
        }
    }

    pickUpPiece(){
        if(this.color == colorToMove && colorToMove == localPlayer){
            this.moves = this.getMoves();

            movingPiece = this;
        }
    }
    placePiece(){
        let square = board.squares.filter(e => {return e.hover})[0]
        if(!square){
            return;
        }
        let i = square.x + ((localPlayer == "white") ? square.y*8 : (56-square.y*8));
        if(i == this.i){
            movingPiece = undefined;
        }
        if(!this?.moves?.includes(i)){
            return;
        }
        this.firstMove = false;
        let winner;
        if(board.squares[i].type == 5){
            winner = this.color;
        }
        board.squares[i] = new Square(i);
        if(i < 8 && this.type == 0 || i > 55 && this.type == 0){
            board.squares[i] = new Piece(i,4,this.color,false)   
        }else{
            board.squares[i] = new Piece(i,this.type,this.color,false)   
        }
        board.squares[this.i] = new Square(this.i);
        colorToMove = this.color == "white"? "black" : "white";
        connection.send({colorToMove:colorToMove,moveFrom:this.i,moveTo:[i,this.type,this.color,false],winner:this.color}) 
        movingPiece = undefined;
        if(winner){
            alert("You win!")
        }

    }
    getMoves(){
        let moves = [];
        if(this.type == 1 || this.type == 3 || this.type == 4 || this.type == 5){
            moves = this.getSlidingMoves();
        }
        if(this.type == 0){
            moves = this.getRookMoves();
        }
        if(this.type == 2){
            moves = this.getKnightMoves();
        }
        return moves;
    }
    getSlidingMoves(){
        let startDirIndex = this.type == 3 ? 4 : 0;
        let endDirIndex = this.type == 1 ? 4 : 8;

        let possibleMoves = [];
        for(let directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++){
            for(let n = 0; n < (this.type != 5 ? this.numSquaresToEdge[directionIndex] : 1); n++){

                let targetSquare = this.i + directionOffsets[directionIndex] * (n+1);
                let pieceOnTargetSquare = board.squares[targetSquare];

                if(pieceOnTargetSquare?.color == this.color){
                    break;
                }
                possibleMoves.push(targetSquare);

                if(pieceOnTargetSquare?.color !== this.color && pieceOnTargetSquare instanceof Piece){
                    break;
                }
            }
        }
        return possibleMoves;
    }
    getRookMoves(){
        let possibleMoves = [];
        let dir = this.color == "black" ? 1 : -1;
        if(!(board.squares[this.i + 8*dir] instanceof Piece)){
            if(this.firstMove){
                possibleMoves.push(this.i + 8*dir);
                possibleMoves.push(this.i + 16*dir);
            }else{
                possibleMoves.push(this.i + 8*dir);
            }
        }
        
        if(board.squares[this.i + 7*dir].color !== this.color && board.squares[this.i + 7*dir] instanceof Piece){
            possibleMoves.push(this.i + 7*dir);
        }
        if(board.squares[this.i + 9*dir].color !== this.color && board.squares[this.i + 9*dir] instanceof Piece){
            possibleMoves.push(this.i + 9*dir);
        }
        
        return possibleMoves;
    }
    getKnightMoves(){
        let possibleMoves = [];
        for(let dir = -1; dir<2; dir+=2){
            if(board.squares[this.i - 17*dir]?.color !== this.color && (dir == 1 ? this.i%8 !== 0 : this.i%8 < 7)){
                possibleMoves.push(this.i - 17*dir);
            }
            if(board.squares[this.i - 15*dir]?.color !== this.color && (dir == 1 ? this.i%8 < 7 : this.i%8 !== 0)){
                possibleMoves.push(this.i - 15*dir);
            }
            if(board.squares[this.i - 6*dir]?.color !== this.color && (dir == 1 ? this.i%8 < 6 : this.i%8 > 1)){
                possibleMoves.push(this.i - 6*dir);
            }
            if(board.squares[this.i - 10*dir]?.color !== this.color && (dir == 1 ? this.i%8 > 1 : this.i%8 < 6)){
                possibleMoves.push(this.i - 10*dir);
            }
        }
        return possibleMoves;
    };
};
update();