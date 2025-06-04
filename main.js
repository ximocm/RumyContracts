// Main game logic and UI management

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const imgdeck = document.getElementById('imgdeck');

canvas.width = 600;
canvas.height = 600;

ctx.fillStyle = 'green';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(imgdeck, 335, 275, 50, 64);

const deck = new Deck();
const discards = [];

const players = [{ name: 'Human', hand: [], score: 0 }, new AIPlayer('Computer')];
let currentPlayer = 0;

function dealInitialCards() {
    for (let i = 0; i < 7; i++) {
        players.forEach(p => {
            const c = deck.draw();
            if (c) p.hand.push(c);
        });
    }
}

function renderHands() {
    players.forEach((player, idx) => {
        const handDiv = document.getElementById(`player${idx + 1}-hand`);
        handDiv.innerHTML = '';
        player.hand.forEach((card, cidx) => {
            const img = document.createElement('img');
            img.src = card.image.src;
            img.width = card.width;
            img.height = card.height;
            if (idx === 0) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => discardCard(cidx));
            }
            handDiv.appendChild(img);
        });
    });

    const discardDiv = document.getElementById('discard-pile');
    discardDiv.innerHTML = '';
    if (discards.length > 0) {
        const card = discards[discards.length - 1];
        const img = document.createElement('img');
        img.src = card.image.src;
        discardDiv.appendChild(img);
    }
}

function updateUI() {
    document.getElementById('turn-info').textContent = `Turn: ${players[currentPlayer].name}`;
    const scores = players.map(p => `${p.name}: ${p.hand.length}`).join(' | ');
    document.getElementById('scores').textContent = scores;
}

function nextTurn() {
    currentPlayer = (currentPlayer + 1) % players.length;
    updateUI();
    if (players[currentPlayer] instanceof AIPlayer) {
        setTimeout(() => {
            const discard = players[currentPlayer].takeTurn(deck, discards);
            renderHands();
            updateUI();
            nextTurn();
        }, 500);
    }
}

function discardCard(index) {
    if (currentPlayer !== 0) return;
    const player = players[currentPlayer];
    const [card] = player.hand.splice(index, 1);
    if (card) discards.push(card);
    renderHands();
    updateUI();
    nextTurn();
}

function playerDraw() {
    if (currentPlayer !== 0) return;
    const card = deck.draw();
    if (!card) return;
    players[0].hand.push(card);
    renderHands();
    updateUI();
}

function drawFromDiscard() {
    if (currentPlayer !== 0) return;
    const card = discards.pop();
    if (!card) return;
    players[0].hand.push(card);
    renderHands();
    updateUI();
}

// Button bindings
const drw = document.getElementById('draw');
drw.addEventListener('click', playerDraw);
const drwDisc = document.getElementById('drawdisc');
drwDisc.addEventListener('click', drawFromDiscard);

// Initialise game
dealInitialCards();
renderHands();
updateUI();

