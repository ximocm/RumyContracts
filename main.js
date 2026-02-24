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

let players = [{ name: 'Human 1', hand: [], score: 0, isHuman: true }, Object.assign(new AIPlayer('Bot 1'), { score: 0, isHuman: false })];
let currentPlayer = 0;
let turnPhase = 'draw';
let round = 1;
const totalRounds = 4;
let currentContract = null;
let humanSortMode = 'none';
let gameStarted = false;
let lobbyState = LobbyCore.createInitialState({ minPlayersToStart: 2, defaultMaxPlayers: 4 });
let totalScores = Array(players.length).fill(0);
let humanJoinCount = 0;
let botJoinCount = 0;
let draggedHumanCardIndex = null;

players.forEach(player => {
    if (typeof player.score !== 'number') player.score = 0;
});

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'Joker'];
const SUIT_ORDER = ['Clubs', 'Diamonds', 'Hearts', 'Spades', 'Joker'];

function getRankWeight(card) {
    const idx = RANK_ORDER.indexOf(card.value);
    return idx === -1 ? RANK_ORDER.length : idx;
}

function getSuitWeight(card) {
    const idx = SUIT_ORDER.indexOf(card.suit);
    return idx === -1 ? SUIT_ORDER.length : idx;
}

function stableSortHand(hand, compareFn) {
    const withIndex = hand.map((card, idx) => ({ card, idx }));
    withIndex.sort((a, b) => {
        const cmp = compareFn(a.card, b.card);
        return cmp !== 0 ? cmp : a.idx - b.idx;
    });
    hand.length = 0;
    withIndex.forEach(item => hand.push(item.card));
}

function sortHandByRank(hand) {
    stableSortHand(hand, (a, b) => {
        const byRank = getRankWeight(a) - getRankWeight(b);
        if (byRank !== 0) return byRank;
        return getSuitWeight(a) - getSuitWeight(b);
    });
}

function sortHandBySuit(hand) {
    stableSortHand(hand, (a, b) => {
        const bySuit = getSuitWeight(a) - getSuitWeight(b);
        if (bySuit !== 0) return bySuit;
        return getRankWeight(a) - getRankWeight(b);
    });
}

function applyHumanSortPreference(hand) {
    if (humanSortMode === 'rank') {
        sortHandByRank(hand);
    } else if (humanSortMode === 'suit') {
        sortHandBySuit(hand);
    }
}

function setHumanSortMode(mode) {
    if (mode !== 'rank' && mode !== 'suit' && mode !== 'none') return;
    humanSortMode = mode;
    const humanIdx = players.findIndex(p => p.isHuman);
    if (humanIdx >= 0) applyHumanSortPreference(players[humanIdx].hand);
    renderHands();
    updateUI();
}

function toggleHumanSortMode(mode) {
    if (humanSortMode === mode) {
        setHumanSortMode('none');
        return;
    }
    setHumanSortMode(mode);
}

function moveCardInHand(hand, fromIndex, toIndex) {
    if (!Array.isArray(hand)) return;
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= hand.length || toIndex >= hand.length) return;
    const [card] = hand.splice(fromIndex, 1);
    hand.splice(toIndex, 0, card);
}

function setGameControlsEnabled(enabled) {
    const hasHuman = players.some(p => p.isHuman);
    ['draw', 'drawdisc', 'sort-rank', 'sort-suit'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !enabled || !hasHuman;
    });
}

function setLobbyStatus(message) {
    const statusEl = document.getElementById('lobby-status');
    if (statusEl) statusEl.textContent = message;
}

function refreshLobbyUI() {
    const select = document.getElementById('table-select');
    if (select) {
        select.innerHTML = '';
        lobbyState.tables.forEach(table => {
            const option = document.createElement('option');
            option.value = table.id;
            option.textContent = `${table.name} (${table.players.length}/${table.maxPlayers}) · ${table.status}`;
            select.appendChild(option);
        });
        if (lobbyState.selectedTableId) {
            select.value = lobbyState.selectedTableId;
        }
    }
}

function applyLobbyResult(result, successMessageBuilder) {
    if (!result.ok) {
        setLobbyStatus(`Lobby error: ${result.error} [${result.code}]`);
        return false;
    }

    lobbyState = result.state;
    refreshLobbyUI();
    const selected = LobbyCore.getSelectedTable(lobbyState);
    if (typeof successMessageBuilder === 'function') {
        setLobbyStatus(successMessageBuilder(result.table || selected));
    }
    return true;
}

function initializeLobby() {
    setGameControlsEnabled(false);

    const initialTableName = (document.getElementById('table-name') && document.getElementById('table-name').value.trim()) || 'Local Table';
    applyLobbyResult(
        LobbyCore.createTable(lobbyState, { name: initialTableName, maxPlayers: 4 }),
        table => `Created ${table.name}. Add players, then start table.`
    );

    const createBtn = document.getElementById('create-table');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('table-name');
            const rawName = nameInput ? nameInput.value.trim() : '';
            applyLobbyResult(
                LobbyCore.createTable(lobbyState, { name: rawName || undefined, maxPlayers: 4 }),
                table => `Created ${table.name}.`
            );
        });
    }

    const tableSelect = document.getElementById('table-select');
    if (tableSelect) {
        tableSelect.addEventListener('change', e => {
            applyLobbyResult(
                LobbyCore.selectTable(lobbyState, e.target.value),
                table => `Selected ${table.name} (${table.players.length}/${table.maxPlayers}).`
            );
        });
    }

    const joinHumanBtn = document.getElementById('join-human');
    if (joinHumanBtn) {
        joinHumanBtn.addEventListener('click', () => {
            humanJoinCount += 1;
            const humanName = `Human ${humanJoinCount}`;
            applyLobbyResult(
                LobbyCore.addPlayerToSelected(lobbyState, humanName),
                table => `${humanName} joined ${table.name} (${table.players.length}/${table.maxPlayers}).`
            );
        });
    }

    const joinBotBtn = document.getElementById('join-bot');
    if (joinBotBtn) {
        joinBotBtn.addEventListener('click', () => {
            botJoinCount += 1;
            const botName = `Bot ${botJoinCount}`;
            applyLobbyResult(
                LobbyCore.addPlayerToSelected(lobbyState, botName),
                table => `${botName} joined ${table.name} (${table.players.length}/${table.maxPlayers}).`
            );
        });
    }

    const startTableBtn = document.getElementById('start-table');
    if (startTableBtn) {
        startTableBtn.addEventListener('click', () => {
            const started = applyLobbyResult(
                LobbyCore.startSelectedTable(lobbyState),
                table => `Started ${table.name}.`
            );
            if (!started) return;
            const selected = LobbyCore.getSelectedTable(lobbyState);
            const names = selected && selected.players.length ? selected.players.slice() : ['Human 1', 'Bot 1'];
            players = names.map(name => {
                const isHuman = /^human/i.test(name);
                if (isHuman) return { name, hand: [], score: 0, isHuman: true };
                return Object.assign(new AIPlayer(name), { score: 0, isHuman: false });
            });
            totalScores = Array(players.length).fill(0);
            gameStarted = true;
            setGameControlsEnabled(true);
            const lobbyPanel = document.getElementById('lobby-panel');
            if (lobbyPanel) lobbyPanel.style.display = 'none';
            startInitialRound();
            renderHands();
            updateUI();
        });
    }
}

const coreHooks = {
    // Sprint 1 hook points aligned with README contracts/rules.
    // Contract enforcement is intentionally non-blocking until contract logic is implemented.
    contractValidator: () => ({ ok: true }),
    ruleValidator: () => ({ ok: true })
};

function buildCoreState() {
    return GameCore.createStateFromRuntime({
        players,
        currentPlayer,
        phase: turnPhase,
        round,
        totalRounds,
        contract: currentContract,
        deck,
        discards
    });
}

function validateCoreAction(action) {
    const result = GameCore.applyAction(buildCoreState(), action, { hooks: coreHooks });
    if (!result.ok) return false;
    currentPlayer = result.state.turn.currentPlayerIndex;
    turnPhase = result.state.turn.phase;
    return true;
}

function clearHands() {
    players.forEach(p => {
        p.hand.length = 0;
    });
}

function getCurrentHandScores() {
    const hands = players.map(player => player.hand);
    if (typeof Scoring !== 'undefined' && Scoring.getRoundScoresFromHands) {
        return Scoring.getRoundScoresFromHands(hands);
    }
    return hands.map(hand => hand.length);
}

function finalizeRoundScoring() {
    const roundScores = getCurrentHandScores();
    if (typeof Scoring !== 'undefined' && Scoring.applyRoundScores) {
        totalScores = Scoring.applyRoundScores(totalScores, roundScores);
    } else {
        totalScores = totalScores.map((score, idx) => score + (roundScores[idx] || 0));
    }

    players.forEach((player, idx) => {
        player.score = totalScores[idx] || 0;
    });

    return roundScores;
}

function dealCardsForCurrentRound(drawCardFn) {
    const draw = typeof drawCardFn === 'function' ? drawCardFn : () => deck.draw();
    const cardsToDeal = currentContract && currentContract.cardsToDeal ? currentContract.cardsToDeal : 0;
    for (let i = 0; i < cardsToDeal; i++) {
        players.forEach(p => {
            const c = draw();
            if (c) p.hand.push(c);
        });
    }
}

function startRound(roundNumber) {
    const movingToNextRound = gameStarted && currentContract && roundNumber !== round;
    if (movingToNextRound) {
        finalizeRoundScoring();
    }

    round = roundNumber;
    currentContract = GameCore.getContractForRound(round);
    currentPlayer = GameCore.getRoundStartPlayerIndex(round, players.length);
    turnPhase = 'draw';

    clearHands();
    discards.length = 0;
    deck.reset();
    deck.shuffle();

    dealCardsForCurrentRound();

    const firstDiscard = deck.draw();
    if (firstDiscard) {
        discards.push(firstDiscard);
    }

    renderHands();
    updateUI();
}

function startInitialRound() {
    startRound(1);
}

function startNextRound() {
    if (round >= totalRounds) return false;
    startRound(round + 1);
    return true;
}

function renderHands() {
    const humanIdx = players.findIndex(p => p.isHuman);
    const humanHandDiv = document.getElementById('player1-hand');
    if (humanHandDiv) {
        humanHandDiv.innerHTML = '';
        if (humanIdx >= 0) {
            const human = players[humanIdx];
            applyHumanSortPreference(human.hand);
            human.hand.forEach((card, cidx) => {
                const img = document.createElement('img');
                img.src = card.image.src;
                img.width = card.width;
                img.height = card.height;
                img.style.cursor = currentPlayer === humanIdx ? 'pointer' : 'default';
                img.draggable = true;
                img.addEventListener('dragstart', e => {
                    draggedHumanCardIndex = cidx;
                    img.classList.add('dragging');
                    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
                });
                img.addEventListener('dragend', () => {
                    draggedHumanCardIndex = null;
                    img.classList.remove('dragging');
                });
                img.addEventListener('dragover', e => {
                    e.preventDefault();
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                    img.classList.add('drag-over');
                });
                img.addEventListener('dragleave', () => {
                    img.classList.remove('drag-over');
                });
                img.addEventListener('drop', e => {
                    e.preventDefault();
                    img.classList.remove('drag-over');
                    if (draggedHumanCardIndex === null) return;
                    if (draggedHumanCardIndex === cidx) return;
                    humanSortMode = 'none';
                    moveCardInHand(human.hand, draggedHumanCardIndex, cidx);
                    draggedHumanCardIndex = null;
                    renderHands();
                    updateUI();
                });
                img.addEventListener('click', () => discardCard(cidx));
                humanHandDiv.appendChild(img);
            });
        }
    }

    renderSeatBacks(humanIdx);

    const discardDiv = document.getElementById('discard-pile');
    discardDiv.innerHTML = '';
    if (discards.length > 0) {
        const card = discards[discards.length - 1];
        const img = document.createElement('img');
        img.src = card.image.src;
        discardDiv.appendChild(img);
    }
}

function renderSeatBacks(humanIdx) {
    const seatRoots = {
        top: document.getElementById('seat-top'),
        left: document.getElementById('seat-left'),
        right: document.getElementById('seat-right'),
        bottom: document.getElementById('seat-bottom')
    };
    const seats = {
        top: document.querySelector('#seat-top .seat-cards'),
        left: document.querySelector('#seat-left .seat-cards'),
        right: document.querySelector('#seat-right .seat-cards'),
        bottom: document.querySelector('#seat-bottom .seat-cards')
    };
    const seatNames = {
        top: document.querySelector('#seat-top .seat-name'),
        left: document.querySelector('#seat-left .seat-name'),
        right: document.querySelector('#seat-right .seat-name'),
        bottom: document.querySelector('#seat-bottom .seat-name')
    };

    ['top', 'left', 'right', 'bottom'].forEach(k => {
        if (seats[k]) seats[k].innerHTML = '';
        if (seatNames[k]) seatNames[k].textContent = k[0].toUpperCase() + k.slice(1);
        if (seatRoots[k]) seatRoots[k].classList.remove('seat-current');
    });

    const seatOrder = humanIdx >= 0 ? ['top', 'left', 'right'] : ['bottom', 'left', 'top', 'right'];
    const opponents = players
        .map((player, idx) => ({ player, idx }))
        .filter(entry => entry.idx !== humanIdx);

    opponents.slice(0, seatOrder.length).forEach((entry, pos) => {
        const seat = seatOrder[pos];
        if (seatNames[seat]) {
            const turnMarker = currentPlayer === entry.idx ? ' • Turn' : '';
            seatNames[seat].textContent = `${entry.player.name}${turnMarker}`;
        }
        if (currentPlayer === entry.idx && seatRoots[seat]) {
            seatRoots[seat].classList.add('seat-current');
        }
        const seatCardsEl = seats[seat];
        if (!seatCardsEl) return;
        for (let i = 0; i < entry.player.hand.length; i++) {
            const img = document.createElement('img');
            img.src = imgdeck.src;
            img.className = 'card-back';
            seatCardsEl.appendChild(img);
        }
    });

    if (humanIdx >= 0 && seatNames.bottom) {
        const turnMarker = currentPlayer === humanIdx ? ' • Turn' : '';
        seatNames.bottom.textContent = `${players[humanIdx].name}${turnMarker}`;
        if (currentPlayer === humanIdx && seatRoots.bottom) {
            seatRoots.bottom.classList.add('seat-current');
        }
    }
}

function updateUI() {
    if (!gameStarted) {
        document.getElementById('turn-info').textContent = 'Waiting for table start';
        document.getElementById('scores').textContent = players.map(p => `${p.name}: total ${p.score || 0}`).join(' | ');
        return;
    }
    const contractLabel = currentContract ? currentContract.label : 'N/A';
    document.getElementById('turn-info').textContent = `Round ${round}/${totalRounds} · Contract: ${contractLabel} · Turn: ${players[currentPlayer].name}`;
    const handScores = getCurrentHandScores();
    const scores = players
        .map((p, idx) => `${p.name}: hand ${handScores[idx] || 0} · total ${p.score || 0}`)
        .join(' | ');
    document.getElementById('scores').textContent = scores;
}

function nextTurn() {
    updateUI();
    if (players[currentPlayer] instanceof AIPlayer) {
        setTimeout(() => {
            const ai = players[currentPlayer];
            const playerIndex = currentPlayer;

            const drawAction = ai.chooseDrawAction(discards);
            if (!validateCoreAction({ type: drawAction, playerIndex })) return;

            const drawnCard = drawAction === 'DRAW_FROM_DISCARD' ? discards.pop() : deck.draw();
            if (!drawnCard) return;
            ai.hand.push(drawnCard);

            const discardIdx = ai.chooseDiscardIndex();
            const discardCard = discardIdx >= 0 ? ai.hand[discardIdx] : null;
            if (!discardCard) return;

            if (!validateCoreAction({ type: 'DISCARD', playerIndex })) return;
            ai.hand.splice(discardIdx, 1);
            discards.push(discardCard);

            renderHands();
            updateUI();
            if (players[currentPlayer] instanceof AIPlayer) {
                nextTurn();
            }
        }, 500);
    }
}

function discardCard(index) {
    if (!gameStarted) return;
    const humanIdx = players.findIndex(p => p.isHuman);
    if (humanIdx < 0 || currentPlayer !== humanIdx) return;
    const playerIndex = humanIdx;
    const player = players[playerIndex];
    const card = player.hand[index];
    if (!card) return;
    if (!validateCoreAction({ type: 'DISCARD', playerIndex })) return;
    player.hand.splice(index, 1);
    if (card) discards.push(card);
    renderHands();
    updateUI();
    nextTurn();
}

function playerDraw() {
    if (!gameStarted) return;
    const humanIdx = players.findIndex(p => p.isHuman);
    if (humanIdx < 0 || currentPlayer !== humanIdx) return;
    if (!validateCoreAction({ type: 'DRAW_FROM_DECK', playerIndex: humanIdx })) return;
    const card = deck.draw();
    if (!card) return;
    players[humanIdx].hand.push(card);
    renderHands();
    updateUI();
}

function drawFromDiscard() {
    if (!gameStarted) return;
    const humanIdx = players.findIndex(p => p.isHuman);
    if (humanIdx < 0 || currentPlayer !== humanIdx) return;
    if (!validateCoreAction({ type: 'DRAW_FROM_DISCARD', playerIndex: humanIdx })) return;
    const card = discards.pop();
    if (!card) return;
    players[humanIdx].hand.push(card);
    renderHands();
    updateUI();
}

function runRoundIntegrationSelfCheck() {
    const fakePlayers = [{ hand: [] }, { hand: [] }, { hand: [] }];
    const fakeDeck = Array.from({ length: 60 }, (_, i) => ({ id: i + 1 }));
    const fakeDraw = () => fakeDeck.pop() || null;

    const checks = [];
    [1, 2, 3, 4].forEach(r => {
        const contract = GameCore.getContractForRound(r);
        const expected = contract.cardsToDeal;
        fakePlayers.forEach(p => { p.hand.length = 0; });
        for (let i = 0; i < expected; i++) {
            fakePlayers.forEach(p => {
                const c = fakeDraw();
                if (c) p.hand.push(c);
            });
        }
        checks.push(fakePlayers.every(p => p.hand.length === expected));
        checks.push(GameCore.getRoundStartPlayerIndex(r, fakePlayers.length) === (r - 1) % fakePlayers.length);
    });

    return {
        ok: checks.every(Boolean),
        checksPassed: checks.filter(Boolean).length,
        checksTotal: checks.length
    };
}

function runBotDecisionSelfCheck() {
    const checks = [];

    const drawPrefersDiscard = RummyAI.chooseDrawAction(
        [{ value: '7', suit: 'Hearts' }, { value: '7', suit: 'Spades' }],
        [{ value: '7', suit: 'Clubs' }]
    );
    checks.push(drawPrefersDiscard === 'DRAW_FROM_DISCARD');

    const drawFallsBackToDeck = RummyAI.chooseDrawAction(
        [{ value: '2', suit: 'Hearts' }, { value: '9', suit: 'Spades' }],
        []
    );
    checks.push(drawFallsBackToDeck === 'DRAW_FROM_DECK');

    const botHand = [
        { value: '4', suit: 'Hearts' },
        { value: '5', suit: 'Hearts' },
        { value: '6', suit: 'Hearts' },
        { value: 'K', suit: 'Clubs' }
    ];
    const discardIdx = RummyAI.chooseDiscardIndex(botHand);
    checks.push(discardIdx >= 0 && discardIdx < botHand.length);

    const start = GameCore.createInitialState({
        playerCount: 2,
        initialHandCounts: [7, 7],
        currentPlayerIndex: 1,
        phase: 'draw',
        deckCount: 10,
        discardCount: 1
    });

    const drawResult = GameCore.applyAction(start, { type: drawPrefersDiscard, playerIndex: 1 });
    checks.push(drawResult.ok);

    const invalidDiscardBeforeDraw = GameCore.applyAction(start, { type: 'DISCARD', playerIndex: 1 });
    checks.push(!invalidDiscardBeforeDraw.ok && invalidDiscardBeforeDraw.code === 'DRAW_REQUIRED');

    const discardResult = drawResult.ok
        ? GameCore.applyAction(drawResult.state, { type: 'DISCARD', playerIndex: 1 })
        : { ok: false };
    checks.push(discardResult.ok && discardResult.state.turn.phase === 'draw');

    return {
        ok: checks.every(Boolean),
        checksPassed: checks.filter(Boolean).length,
        checksTotal: checks.length
    };
}

window.RummyRound = {
    startInitialRound,
    startNextRound,
    startRound,
    getCurrentHandScores,
    finalizeRoundScoring,
    runRoundIntegrationSelfCheck,
    runBotDecisionSelfCheck
};

// Button bindings
const drw = document.getElementById('draw');
drw.addEventListener('click', playerDraw);
const drwDisc = document.getElementById('drawdisc');
drwDisc.addEventListener('click', drawFromDiscard);
const sortRankBtn = document.getElementById('sort-rank');
if (sortRankBtn) sortRankBtn.addEventListener('click', () => toggleHumanSortMode('rank'));
const sortSuitBtn = document.getElementById('sort-suit');
if (sortSuitBtn) sortSuitBtn.addEventListener('click', () => toggleHumanSortMode('suit'));

// Initialise lobby/game shell
renderHands();
updateUI();
initializeLobby();
