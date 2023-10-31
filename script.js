var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");

var renderCanvas = document.createElement("canvas");
var renderC = renderCanvas.getContext("2d");
document.body.appendChild(renderCanvas);
renderCanvas.style.zIndex = 0

window.onload = init;

window.addEventListener("resize", fixCanvas);

renderCanvas.addEventListener("mousemove", function (e) {
    let oldDown = mouse.down;
    mouse = {
        x: e.offsetX / scale,
        y: e.offsetY / scale,
        down: oldDown
    };
});

var board = undefined;

var local = false;

var comp = false;
var bothComp = false;

var mouse = {
    x: undefined,
    y: undefined,
    down: false
};

renderCanvas.addEventListener("mousedown", function (e) {
    mouse.down = true;
});
renderCanvas.addEventListener("mouseup", function (e) {
    if (movingPiece) {
        mouse.down = true;
    }
});

var movingPiece = undefined;
var colorToMove = "white";

var localPlayer = "black";

var lastMove = {
    from: undefined,
    tyo: undefined
}

const directionOffsets = [-8, 8, -1, 1, -9, 9, -7, 7]

const pieceValues = [100,500,320,330,900,20000];

const piecePlacingValues = [
    [
        0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
         5,  5, 10, 25, 25, 10,  5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5, -5,-10,  0,  0,-10, -5,  5,
         5, 10, 10,-20,-20, 10, 10,  5,
         0,  0,  0,  0,  0,  0,  0,  0
    ],
    [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50,
    ],[
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20,
    ],
    [
        0,  0,  0,  0,  0,  0,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
        0,  0,  0,  5,  5,  0,  0,  0
    ],
    [
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
        -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
    ],
    [
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -10,-20,-20,-20,-20,-20,-20,-10,
        20, 20,  0,  0,  0,  0, 20, 20,
        20, 30, 10,  0,  0, 10, 30, 20
    ]
]

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
    black: ["blackPiece/BlackPawn", "blackPiece/BlackRook", "blackPiece/BlackKnight", "blackPiece/BlackBishop", "blackPiece/BlackQueen", "blackPiece/BlackKing"],
    white: ["whitePiece/WhitePawn", "whitePiece/WhiteRook", "whitePiece/WhiteKnight", "whitePiece/WhiteBishop", "whitePiece/WhiteQueen", "whitePiece/WhiteKing"],
}
function startLocal() {
    if (!connection) {
        startLocalGame();
    }
}

function startComp() {
    if (!connection) {
        startLocalGame();
        comp = true;
    }
}

function startCompVsComp() {
    if (!bothComp && !connection) {
        startLocalGame();
        comp = true;
        bothComp = true;
        board.makeComputerMove();
    }
}
function startLocalGame() {
    local = true;
    localPlayer = "white";
    colorToMove = "white";
    start();
}

function start() {
    document.getElementById("buttons").style.display = "none"
    lastMove = {
        from: undefined,
        to: undefined
    }
    movingPiece = undefined;
    board = new Board();
    board.init();
}

function update() {
    renderC.clearRect(0, 0, renderCanvas.width, renderCanvas.height)
    c.clearRect(0, 0, canvas.width, canvas.height)

    if (board) {
        board.update();
    };
    c.font = "20px Arial";
    c.fillStyle = "black";
    c.textAlign = "center"
    if (board) {
        c.fillText(colorToMove == localPlayer ? (!local ? "Your turn" : "White's turn") : (!local ? "Opponent's turn" : "Black's turn"), canvas.width / 2, 20)
    }

    movingPiece?.updateMoving();

    renderC.drawImage(canvas, 0, 0, renderCanvas.width, renderCanvas.height);

    requestAnimationFrame(update);
}

async function init() {
    fixCanvas();
    await loadImages(images);
    //startLocalGame()
};



function detectCollision(x, y, w, h, x2, y2, w2, h2) {
    if (x + w > x2 && x < x2 + w2 && y + h > y2 && y < y2 + h2) {
        return true;
    };
};

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
};

function drawimageFromSpriteSheet(x, y, w, h, frame, cropX, cropY, cropW, cropH, drawcanvas) {
    if (drawcanvas === undefined) {
        drawcanvas = c;
    }
    if (!frame) { return }
    drawcanvas.drawImage(spritesheetImage, Math.floor(cropX + frame.frame.x), Math.floor(cropY + frame.frame.y), Math.floor(cropW), Math.floor(cropH), Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

class Board {
    constructor() {
        this.squares = [];
    };
    draw() {
        c.fillStyle = "black";
        c.fillRect(-4 + (canvas.width - 20 * 8) / 2, -4 + (canvas.height - 20 * 8) / 2, 20 * 8 + 8, 20 * 8 + 8)
    };
    update() {
        this.draw();
        this.squares.forEach(e => e?.update());
    };
    async makeComputerMove() {
        console.log("he")
        let bestMove = this.search(2,-Infinity,Infinity,true);

        await new Promise(e => setTimeout(e, 100));
        board.squares[bestMove.from].getLegalMoves();

        board.squares[bestMove.from].placePiece(bestMove.to)
        await new Promise(e => setTimeout(e, 100));

    }
    evaluate(){
        if(board.squares.filter(x => (x.color == "white"))[0].checkwin() == "mate"){return 100000000}
        if(board.squares.filter(x => (x.color == "black"))[0].checkwin() == "mate"){return -100000000}
        if(board.squares.filter(x => (x.color == "black")).length == 1 && board.squares.filter(x => (x.color == "white")).length == 1){return 0}

        let score = 0;
        board.squares.filter(x => (x.color == "white")).map(e => score += e.value)
        board.squares.filter(x => (x.color == "black")).map(e => score -= e.value)
        board.squares.filter(x => (x.color == "white")).forEach(e => (score += piecePlacingValues[e.type][e.i]))
        board.squares.filter(x => (x.color == "black")).forEach(e => (score -= piecePlacingValues[e.type][63-e.i]))

        let perspective = (colorToMove == "white" ? 1 : -1)

        return score * perspective;
    }
    getAllMovesForColor(color){
        let squareWithColor = this.squares.filter(e => (e instanceof Piece && e.color == color));
        squareWithColor = squareWithColor.filter(e => e.moves.length > 0);
        let allMoves = [];
        squareWithColor.forEach(e => {
            e.getLegalMoves()

            e.moves.forEach(g => {
                allMoves.push({ to: g, from: e.i });
            });
        });
        return allMoves;
    }
    search(depth,alpha,beta,getMove){
        let bestMove;
        if(depth == 0){
            return this.evaluate();
        }
        let moves = this.orderMoves(this.getAllMovesForColor(colorToMove));

        if(moves.length == 0){
            return 0;
        }
        for(let i = 0; i < moves.length; i++){
            let move = moves[i];
            let squares = deepCopy(board.squares);
            let tmplastMove = deepCopyObject(lastMove);
            let oldTurn = colorToMove;
            board.squares[move.from].placePiece(move.to,false,true);

            let val = -this.search(depth-1,-beta,-alpha,false);   
            
            squares.forEach((e,i) =>{
                if(e.type !== undefined){
                    board.squares[i] = new Piece(i,e.type,e.color,(e.firstMove ? undefined : false));
                }else{
                    board.squares[i] = new Square(i);
                }
            })
            colorToMove = oldTurn;
            lastMove = tmplastMove;
            
            if(val >= beta){
                return beta;
            }
            if(alpha < val){
                alpha = Math.max(val,alpha)
                bestMove = move;
            }
        }
        return (getMove ? bestMove : alpha);
    }
    orderMoves(moves){
        moves.forEach(move => {
            move.sorting = 0;

            if(board.squares[move.to] instanceof Piece){
                move.sorting = 10 * pieceValues[board.squares[move.to].type] - pieceValues[board.squares[move.from].type];
            }
        })
        return moves.sort((a,b) => b.sorting - a.sorting);
    }
    init() {
        this.squares = [];

        for (let i = 0; i < 64; i++) {
            this.squares.push(new Square(i));
        };

        for (let i = 8; i < 16; i++) {
            this.squares[i] = new Piece(i, 0, "black")
        };
        for (let i = 48; i < 56; i++) {
            this.squares[i] = new Piece(i, 0, "white")
        };
        this.squares[0] = new Piece(0, 1, "black")
        this.squares[7] = new Piece(7, 1, "black")

        this.squares[1] = new Piece(1, 2, "black")
        this.squares[6] = new Piece(6, 2, "black")

        this.squares[2] = new Piece(2, 3, "black")
        this.squares[5] = new Piece(5, 3, "black")

        this.squares[3] = new Piece(3, 4, "black")

        this.squares[4] = new Piece(4, 5, "black")

        this.squares[56] = new Piece(56, 1, "white")
        this.squares[63] = new Piece(63, 1, "white")

        this.squares[57] = new Piece(57, 2, "white")
        this.squares[62] = new Piece(62, 2, "white")

        this.squares[58] = new Piece(58, 3, "white")
        this.squares[61] = new Piece(61, 3, "white")

        this.squares[59] = new Piece(59, 4, "white")

        this.squares[60] = new Piece(60, 5, "white")
    }
};

class Square {
    constructor(i) {
        this.i = i;
        let x = (localPlayer == "white") ? (i % 8) : (7 - (i % 8));
        let y = (localPlayer == "white") ? Math.floor(i / 8) : (7 - Math.floor(i / 8));
        this.x = x;
        this.y = y;
        this.isLightSquare = (this.x + this.y) % 2 != 0;
        this.piece = undefined;
        this.hover = false;
        this.size = 20;
        this.moves = [-1];
        this.lastWasFirstMoveAndMove2 = false;

        this.precomputedMoveData()
    }
    draw() {
        c.fillStyle = this.hover ? (this.isLightSquare ? "lightgray" : "gray") : (this.isLightSquare ? "white" : "orange");
        c.fillRect(this.x * this.size + (canvas.width - this.size * 8) / 2, this.y * this.size + (canvas.height - this.size * 8) / 2, this.size, this.size);
        c.globalAlpha = 0.30;
        c.fillStyle = (lastMove.from == this.i || lastMove.to == this.i) ? (movingPiece?.moves?.includes(this.i) ? "orange" : "yellow") : (movingPiece?.moves?.includes(this.i) ? "red" : "black");
        c.fillRect(this.x * this.size + (canvas.width - this.size * 8) / 2, this.y * this.size + (canvas.height - this.size * 8) / 2, this.size, this.size);
        c.globalAlpha = 1;

        if (this.drawPiece) {
            this.drawPiece();
        }

        c.font = "10px Arial";
        c.fillStyle = "black";
        //c.fillText(this.i, this.x * this.size + (canvas.width - this.size * 8) / 2, this.y * this.size + (canvas.height - this.size * 8) / 2 + 20)

    };
    update() {
        this.hover = detectCollision(mouse.x, mouse.y, 1, 1, this.x * this.size + (canvas.width - this.size * 8) / 2, this.y * this.size + (canvas.height - this.size * 8) / 2, this.size, this.size);

        if (this.hover && mouse.down && this instanceof Piece && !movingPiece) {
            mouse.down = false;
            this.pickUpPiece();
        }

        this.draw();
    };
    precomputedMoveData() {

        let numNorth = (localPlayer == "white") ? this.y : 7 - this.y;
        let numSouth = (localPlayer == "black") ? this.y : 7 - this.y;
        let numWest = (localPlayer == "white") ? this.x : 7 - this.x;
        let numEast = (localPlayer == "black") ? this.x : 7 - this.x;

        this.numSquaresToEdge = [
            numNorth,
            numSouth,
            numWest,
            numEast,
            Math.min(numNorth, numWest),
            Math.min(numSouth, numEast),
            Math.min(numNorth, numEast),
            Math.min(numSouth, numWest)
        ];
    }
};

class Piece extends Square {
    constructor(i, type, color, firstMove) {
        super(i);
        this.color = color;
        this.type = type;
        this.firstMove = firstMove == undefined ? true : false;
        this.value = pieceValues[this.type]
    };
    drawPiece() {
        if (movingPiece == this) return;
        drawimageFromSpriteSheet(this.x * this.size + 2 + (canvas.width - this.size * 8) / 2, this.y * this.size + 2 + (canvas.height - this.size * 8) / 2, 16, 16, this.color == "black" ? images.black[this.type] : images.white[this.type], 0, 0, 16, 16)
    };
    updateMoving() {
        drawimageFromSpriteSheet(mouse.x - 8, mouse.y - 8, 16, 16, this.color == "black" ? images.black[this.type] : images.white[this.type], 0, 0, 16, 16)
        if (mouse.down) {
            mouse.down = false;
            let square = board.squares.filter(e => { return e.hover })[0]
            if (!square) {
                return;
            }
            let i = ((localPlayer == "white") ? square.x : 7 - square.x) + ((localPlayer == "white") ? square.y * 8 : (56 - square.y * 8));
            this.placePiece(i);

        }
    }

    pickUpPiece() {
        if (this.color == colorToMove && colorToMove == (local ? colorToMove : localPlayer)) {
            if (this.moves.length !== 0) {
                this.checkwin();

                movingPiece = this;
            }
        }
    }
    checkwin() {
        if (this.getLegalMoves() == 0) {
            return "mate";
        };
    }
    async placePiece(i, fake,fake2) {
        if (i == this.i) {
            movingPiece = undefined;
        }
        if (!this?.moves?.includes(i)) {
            return;
        }
        if (!fake) {
            this.lastWasFirstMoveAndMove2 = (Math.abs(this.i - i) > 8 && this.type == 0) ? this.firstMove : false;

            this.firstMove = false;
        }
        if (board.squares[i].type == 5) {
            winner = this.color;
        }
        if (this.type == 5 && Math.abs(this.i - i) == 2) {
            let dir = (i - this.i) / 2
            for (let index = this.i; (dir == 1 ? (index < this.i + this.numSquaresToEdge[3] + 1) : (index >= this.i - this.numSquaresToEdge[2])); index += dir) {
                if (board.squares[index].type == 1) {
                    board.squares[index].placePiece(i - dir, true);
                }
            }
        }
        if (this.type == 0) {
            if (board.squares[this.i - 1].lastWasFirstMoveAndMove2 && i == (Math.abs(this.i - 1) - 8)) {
                board.squares[this.i - 1] = new Square(this.i - 1);
            }
            if (board.squares[this.i + 1].lastWasFirstMoveAndMove2 && i == (Math.abs(this.i + 1) - 8)) {
                board.squares[this.i + 1] = new Square(this.i + 1);
            }
        }
        board.squares[i] = new Square(i);
        if (i < 8 && this.type == 0 || i > 55 && this.type == 0) {
            board.squares[i] = new Piece(i, 4, this.color, false)
        } else {
            board.squares[i] = new Piece(i, this.type, this.color, false)
            board.squares[i].lastWasFirstMoveAndMove2 = this.lastWasFirstMoveAndMove2;
        }
        board.squares[this.i] = new Square(this.i);
        if (!fake) {
            colorToMove = this.color == "white" ? "black" : "white";
            lastMove.from = this.i;
            lastMove.to = i;
            connection?.send({ colorToMove: colorToMove, moveFrom: this.i, moveTo: [i, (i < 8 && this.type == 0 || i > 55 && this.type == 0) ? 4 : this.type, this.color, false], lastMove: lastMove })
            movingPiece = undefined;
            if(board.squares.filter(x => (x.color == colorToMove))[0].checkwin() == "mate"){
                connection?.send({ winner: (this.color == "white" ? "Black" : "White") })
                alert((this.color == "white" ? "Black" : "White") + ' Won!');
            };
            if (comp) {
                if (colorToMove == "black" || bothComp) {
                    if(!fake2){
                        board.makeComputerMove();
                    }
                };
            };
        };
    };
    getMoves() {
        let moves = [];
        if (this.type == 1 || this.type == 3 || this.type == 4 || this.type == 5) {
            moves = this.getSlidingMoves();
        }
        if (this.type == 0) {
            moves = this.getRookMoves();
        }
        if (this.type == 2) {
            moves = this.getKnightMoves();
        }
        if (this.type == 5) {
            moves = this.getCastlingMoves(moves);
        }
        return moves;
    }
    getLegalMoves() {
        let totalLegalMoves = 0;
        board.squares.filter(g => (g?.color === this?.color && g?.color)).forEach(piece => {
            let pseudoLegalMoves = piece.getMoves();

            let legalMoves = [];

            let originalSpace = piece.i;

            pseudoLegalMoves = pseudoLegalMoves.filter(e => !(e instanceof Piece))

            pseudoLegalMoves.forEach(async function (moveToVerify) {
                let old = board.squares[moveToVerify];
                let oldPiece = piece;
                board.squares[moveToVerify] = new Piece(moveToVerify, piece.type, piece.color, false);
                board.squares[originalSpace] = new Square(originalSpace);
                let removedPawn1 = undefined;
                let removedPawn2 = undefined;
                if (piece.type == 0) {
                    if (board.squares[piece.i - 1]?.lastWasFirstMoveAndMove2 && moveToVerify == (Math.abs(piece.i - 1) - 8)) {
                        removedPawn1 = board.squares[piece.i - 1];
                        board.squares[piece.i - 1] = new Square(piece.i - 1);
                    }
                    if (board.squares[piece.i + 1]?.lastWasFirstMoveAndMove2 && moveToVerify == (Math.abs(piece.i + 1) - 8)) {
                        removedPawn2 = board.squares[piece.i + 1];
                        board.squares[piece.i + 1] = new Square(piece.i + 1);
                    }
                }
                let inCheck = false;

                board.squares.filter(g => (g?.color !== piece.color && g?.color)).forEach(opponent => {
                    opponent.moves = opponent.getMoves();
                    if (opponent.moves.includes(board.squares.filter(g => (g?.color == piece?.color && g?.type == 5))[0].i)) {
                        inCheck = true;
                    }
                })
                if (!inCheck) {
                    legalMoves.push(moveToVerify);
                };
                if (removedPawn1) {
                    board.squares[piece.i - 1] = removedPawn1;
                };
                if (removedPawn2) {
                    board.squares[piece.i + 1] = removedPawn2;
                };
                board.squares[moveToVerify] = old;
                board.squares[originalSpace] = oldPiece;
            })

            piece.moves = legalMoves;
            totalLegalMoves += piece.moves.length;
        })
        return totalLegalMoves;
    }
    getSlidingMoves() {
        let startDirIndex = this.type == 3 ? 4 : 0;
        let endDirIndex = this.type == 1 ? 4 : 8;

        let possibleMoves = [];
        for (let directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
            for (let n = 0; n < (this.type != 5 ? this.numSquaresToEdge[directionIndex] : Math.min(this.numSquaresToEdge[directionIndex], 1)); n++) {

                let targetSquare = this.i + directionOffsets[directionIndex] * (n + 1);
                let pieceOnTargetSquare = board.squares[targetSquare];

                if (pieceOnTargetSquare?.color == this.color || targetSquare > 63 || targetSquare < 0) {
                    break;
                }
                possibleMoves.push(targetSquare);

                if (pieceOnTargetSquare?.color !== this.color && pieceOnTargetSquare instanceof Piece) {
                    break;
                }
            }
        }
        return possibleMoves;
    }
    getCastlingMoves(possibleMoves) {

        for (let dir = -1; dir < 2; dir += 2) {
            let tmpDir = localPlayer == 'white' ? 0 : 1;
            for (let index = this.i + 1 * dir; dir == 1 ? (index < this.i + this.numSquaresToEdge[3] + 1) : (index > this.i - this.numSquaresToEdge[2] - 1); index += 1 * dir) {
                if (board.squares[index]?.type == 1 && board.squares[index]?.firstMove) {
                    possibleMoves.push(this.i + 2 * dir);
                } else if (board.squares[index] instanceof Piece) {
                    index += dir * Infinity;
                }
            }
        }
        return possibleMoves;
    }
    getRookMoves() {
        let possibleMoves = [];
        let dir = this.color == "black" ? 1 : -1;
        if (!(board.squares[this.i + 8 * dir] instanceof Piece)) {
            if (this.firstMove && !(board.squares[this.i + 16 * dir] instanceof Piece)) {
                possibleMoves.push(this.i + 8 * dir);
                possibleMoves.push(this.i + 16 * dir);
            } else {
                possibleMoves.push(this.i + 8 * dir);
            }
        }

        if (board.squares[this.i + 7 * dir]?.color !== this.color && board.squares[this.i + 7 * dir] instanceof Piece || board.squares[this.i - 1 * dir]?.color !== this.color && board.squares[this.i - 1 * dir].lastWasFirstMoveAndMove2) {
            possibleMoves.push(this.i + 7 * dir);
        }
        if (board.squares[this.i + 9 * dir]?.color !== this.color && board.squares[this.i + 9 * dir] instanceof Piece || board.squares[this.i + 1 * dir]?.color !== this.color && board.squares[this.i + 1 * dir].lastWasFirstMoveAndMove2) {
            possibleMoves.push(this.i + 9 * dir);
        }

        return possibleMoves;
    }
    getKnightMoves() {
        let possibleMoves = [];
        for (let dir = -1; dir < 2; dir += 2) {
            if (board.squares[this.i - 17 * dir]?.color !== this.color && (dir == 1 ? this.i % 8 !== 0 : this.i % 8 < 7)) {
                possibleMoves.push(this.i - 17 * dir);
            }
            if (board.squares[this.i - 15 * dir]?.color !== this.color && (dir == 1 ? this.i % 8 < 7 : this.i % 8 !== 0)) {
                possibleMoves.push(this.i - 15 * dir);
            }
            if (board.squares[this.i - 6 * dir]?.color !== this.color && (dir == 1 ? this.i % 8 < 6 : this.i % 8 > 1)) {
                possibleMoves.push(this.i - 6 * dir);
            }
            if (board.squares[this.i - 10 * dir]?.color !== this.color && (dir == 1 ? this.i % 8 > 1 : this.i % 8 < 6)) {
                possibleMoves.push(this.i - 10 * dir);
            }
        }
        possibleMoves = possibleMoves.filter(e => (e <= 63 && e >= 0));
        return possibleMoves;
    };
};
update();


const deepCopy = (arr) => {
    let copy = [];
    arr.forEach(elem => {
      if(Array.isArray(elem)){
        copy.push(deepCopy(elem))
      }else{
        if (typeof elem === 'object') {
          copy.push(deepCopyObject(elem))
      } else {
          copy.push(elem)
        }
      }
    })
    return copy;
  }
  const deepCopyObject = (obj) => {
    let tempObj = {};
    for (let [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        tempObj[key] = deepCopy(value);
      } else {
        if (typeof value === 'object') {
          tempObj[key] = deepCopyObject(value);
        } else {
          tempObj[key] = value
        }
      }
    }
    return tempObj;
  }