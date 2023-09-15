var emptyString = "";
var alphabet = "abcdefghijklmnopqrstuvwxyz";

while (emptyString.length < 6) {
    emptyString += alphabet[Math.floor(Math.random() * alphabet.length)];
}

const peerId = emptyString;

document.getElementById("thisId").innerHTML = "Your Id: " + peerId;

const peer = new Peer(peerId, { debug: 1 })
var connection

peer.on('connection', x => {
    x.on('data', data => {
        if (data === 'DECLINE') {
            alert("They declined!")
            connection.close();
            connection = undefined;
            board = undefined;
        }
        if (data === 'DISCONNECT') {
            alert("They disconnected!")
            connection.close();
            connection = undefined;
            board = undefined;
        }
        if (data === 'ACCEPT') {
            startOnlineGame(x.peer);
        }
        if (data.colorToMove) {
            colorToMove = data.colorToMove
            board.squares.filter(x => x.color == colorToMove)[0].checkwin();

        }
        if (data.moveFrom) {
            board.squares[data.moveFrom] = new Square(data.moveFrom);
        }
        if (data.moveTo) {
            board.squares[data.moveTo[0]] = new Piece(data.moveTo[0], data.moveTo[1], data.moveTo[2], data.moveTo[3]);
        }
        if (data.winner) {
            alert(data.winner + " Won!")
        }
        if (data.lastMove) {
            lastMove = data.lastMove
        }
    })
    x.on('open', () => {
        if (!connection) {
            connection = peer.connect(x.peer);
            console.log(connection)

            connection.on('open', function (data) {
                if (confirm(x.peer + " wants to connect to you! Do you Accept?")) {
                    startOnlineGame(x.peer);
                    connection.send("ACCEPT")
                } else {
                    connection.send("DECLINE")
                    connection.close();
                    connection = undefined;
                }
            })
        }
    });
});

peer.on('error', function (err) {
    //throw Error(err.type)
});
function startOnlineGame(id) {
    if (peerId < id) {
        localPlayer = "white";
    };
    colorToMove = "white";
    local = false;
    start();
}
function disconnect() {
    connection.send("DISCONNECT");
    connection?.close();
    connection = undefined;
    board = undefined;
}

function connect() {
    const connectTo = document.getElementById('inputId').value
    if (connectTo != peerId) {
        console.log('connecting to', connectTo)
        connection = peer.connect(connectTo)
    }
}