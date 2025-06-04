var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var imgdeck = document.getElementById("imgdeck");

canvas.width = 600;
canvas.height = 600;

var turno = 1;
var actplayer = 1;

ctx.fillStyle = "green";
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.drawImage(imgdeck, 335,275,50,64);

const deck = new Deck();
const discards = [];

const players = [{name: 'Human', hand: []}, new AIPlayer('Computer')];
let currentPlayer = 0;

function nextTurn() {
    currentPlayer = (currentPlayer + 1) % players.length;
    const player = players[currentPlayer];
    if (player instanceof AIPlayer) {
        player.takeTurn(deck, discards);
        updateUI();
        nextTurn();
    }
}

function updateUI() {
    console.log('Discards:', discards.map(c => c.number + c.suit).join(','));
}

const drw = document.getElementById('draw');
console.log(drw);
drw.addEventListener("click", () => {
    console.log('drw clicked');
    players[0].hand.push(deck.draw());
    nextTurn();
});