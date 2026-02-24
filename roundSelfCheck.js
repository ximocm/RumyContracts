const GameCore = require('./gameCore.js');

function deterministicDeal(playerCount, cardsPerPlayer) {
    const players = Array.from({ length: playerCount }, () => ({ hand: [] }));
    const fakeDeck = Array.from({ length: 120 }, (_, i) => ({ id: i + 1 }));

    for (let i = 0; i < cardsPerPlayer; i++) {
        for (const player of players) {
            const card = fakeDeck.pop();
            if (card) player.hand.push(card);
        }
    }

    return {
        players,
        remainingDeck: fakeDeck.length
    };
}

function run() {
    const checks = [];

    const expectedCardsByRound = { 1: 7, 2: 8, 3: 9, 4: 11 };
    for (const round of [1, 2, 3, 4]) {
        const contract = GameCore.getContractForRound(round);
        checks.push(Boolean(contract));
        checks.push(contract.cardsToDeal === expectedCardsByRound[round]);
        checks.push(GameCore.getRoundStartPlayerIndex(round, 2) === (round - 1) % 2);

        const deal = deterministicDeal(3, contract.cardsToDeal);
        checks.push(deal.players.every(p => p.hand.length === contract.cardsToDeal));
    }

    const result = {
        ok: checks.every(Boolean),
        checksPassed: checks.filter(Boolean).length,
        checksTotal: checks.length
    };

    console.log(JSON.stringify(result));
    process.exit(result.ok ? 0 : 1);
}

run();
