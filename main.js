var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var imgdeck = document.getElementById("imgdeck");

canvas.width = 600;
canvas.height = 600;

ctx.fillStyle = "green";
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.drawImage(imgdeck, 335,275,50,64);

const deck = new Deck();

// ---- Game state ----
const players = [
    {name: 'Player 1', hand: [], melds: {trios: 0, escaleras: 0}, score: 0},
    {name: 'Player 2', hand: [], melds: {trios: 0, escaleras: 0}, score: 0},
    {name: 'Player 3', hand: [], melds: {trios: 0, escaleras: 0}, score: 0},
    {name: 'Player 4', hand: [], melds: {trios: 0, escaleras: 0}, score: 0}
];

let currentRound = 0;
let activePlayer = 0;

// Contracts taken from README
const contracts = [
    {trios: 1, escaleras: 1},
    {trios: 0, escaleras: 2},
    {trios: 3, escaleras: 0},
    {trios: 1, escaleras: 2, nobajar: true}
];

// Card points mapping
const POINTS = {
    'A': 15,
    '2': 5,
    '3': 5,
    '4': 5,
    '5': 5,
    '6': 5,
    '7': 5,
    '8': 5,
    '9': 5,
    '10': 10,
    'J': 10,
    'Q': 10,
    'K': 10,
    'JOKER': 25
};

function cardPoints(card){
    if(card.suit === 'Joker' || card.number === 0){
        return POINTS['JOKER'];
    }
    return POINTS[card.number] || 0;
}

function calculatePoints(hand){
    let total = 0;
    for(const c of hand){
        total += cardPoints(c);
    }
    return total;
}

function updateScoreboard(){
    const sb = document.getElementById('scoreboard');
    sb.innerHTML = '<h3>Scores</h3>' + players.map(p => `${p.name}: ${p.score}`).join('<br>');
}

function endRound(){
    players.forEach(p => {
        p.score += calculatePoints(p.hand);
        p.hand = [];
        p.melds = {trios: 0, escaleras: 0};
    });
    updateScoreboard();
    currentRound++;
}

function nextTurn(){
    activePlayer = (activePlayer + 1) % players.length;
    if(activePlayer === 0){
        endRound();
    }
}

function playerCompletedContract(player){
    const contract = contracts[currentRound];
    if(player.melds.trios < contract.trios) return false;
    if(player.melds.escaleras < contract.escaleras) return false;
    if(contract.nobajar && player.hand.length > 0) return false;
    return true;
}

// Example draw event
const drw = document.getElementById('draw');
drw.addEventListener('click', () => {
    console.log('Draw clicked by', players[activePlayer].name);
    nextTurn();
});

updateScoreboard();

