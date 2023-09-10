const peerId = Math.floor(Math.random() * 900000 + 100000)

document.getElementById("thisId").innerHTML = "Id:"+peerId;

const peer = new Peer(peerId)
var connection

peer.on('connection', x => {
    x.on('data', data => {
        console.log(data)
        if(data.colorToMove){
            colorToMove = data.colorToMove
        }
        if(data.moveFrom){
            board.squares[data.moveFrom] = new Square(data.moveFrom);
        }
        if(data.moveTo){
            board.squares[data.moveTo[0]] = new Piece(data.moveTo[0],data.moveTo[1],data.moveTo[2],data.moveTo[3]);
        }
        if(data.winner){
            alert(data.winner + " wins!")
        }
    })
    x.on('open', () => {
        console.log('open called from peer', x.peer)
        if(!connection) connection = peer.connect(x.peer)
        
        if(peerId < x.peer){
            localPlayer = "white";
        };
        board = new Board();
        board.init();
    });
});

function connect(){
    const connectTo = document.getElementById('inputId').value
    console.log('connecting to', connectTo)
    if(!connection) connection = peer.connect(connectTo)
}