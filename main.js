var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var imgdeck = document.getElementById("imgdeck");

canvas.width = 600;
canvas.height = 600;


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
drw.addEventListener("click", ()=>{
    const card = deck.draw();
    if (!card) return;
    const img = document.createElement('img');
    img.src = card.image.src;
    img.width = card.width;
    img.height = card.height;
    const player = players[currentPlayer];
    player.hand.push(card);
    const hand = document.getElementById(`player${currentPlayer + 1}-hand`);
    hand.appendChild(img);
});
