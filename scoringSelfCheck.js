const Scoring = require('./scoring.js');

function run() {
    const checks = [];

    checks.push(Scoring.getCardScore({ value: 'A', suit: 'Spades' }) === 15);
    checks.push(Scoring.getCardScore({ value: '2', suit: 'Hearts' }) === 5);
    checks.push(Scoring.getCardScore({ value: '9', suit: 'Clubs' }) === 5);
    checks.push(Scoring.getCardScore({ value: '10', suit: 'Diamonds' }) === 10);
    checks.push(Scoring.getCardScore({ value: 'K', suit: 'Hearts' }) === 10);
    checks.push(Scoring.getCardScore({ value: 'Joker', suit: 'Joker' }) === 25);

    const hand = [
        { value: 'A', suit: 'Spades' },
        { value: '2', suit: 'Hearts' },
        { value: '10', suit: 'Diamonds' },
        { value: 'Joker', suit: 'Joker' }
    ];
    checks.push(Scoring.getHandScore(hand) === 55);

    const roundScores = Scoring.getRoundScoresFromHands([
        hand,
        [{ value: 'K', suit: 'Clubs' }, { value: '3', suit: 'Spades' }]
    ]);
    checks.push(Array.isArray(roundScores) && roundScores.length === 2);
    checks.push(roundScores[0] === 55 && roundScores[1] === 15);

    const totals = Scoring.applyRoundScores([30, 5], roundScores);
    checks.push(totals[0] === 85 && totals[1] === 20);

    const result = {
        ok: checks.every(Boolean),
        checksPassed: checks.filter(Boolean).length,
        checksTotal: checks.length,
        sampleRoundScores: roundScores,
        sampleTotals: totals
    };

    console.log(JSON.stringify(result));
    process.exit(result.ok ? 0 : 1);
}

run();
