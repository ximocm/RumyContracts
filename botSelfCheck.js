const GameCore = require('./gameCore.js');
const { chooseDrawAction, chooseDiscardIndex } = require('./ai.js');

function run() {
    const checks = [];

    const drawAction = chooseDrawAction(
        [{ value: '7', suit: 'Hearts' }, { value: '7', suit: 'Spades' }],
        [{ value: '7', suit: 'Clubs' }]
    );
    checks.push(drawAction === 'DRAW_FROM_DISCARD');

    const hand = [
        { value: '4', suit: 'Hearts' },
        { value: '5', suit: 'Hearts' },
        { value: '6', suit: 'Hearts' },
        { value: 'K', suit: 'Clubs' }
    ];
    const discardIdx = chooseDiscardIndex(hand);
    checks.push(discardIdx >= 0 && discardIdx < hand.length);

    const state = GameCore.createInitialState({
        playerCount: 2,
        initialHandCounts: [7, 7],
        currentPlayerIndex: 1,
        phase: 'draw',
        deckCount: 10,
        discardCount: 1
    });

    const invalidDiscard = GameCore.applyAction(state, { type: 'DISCARD', playerIndex: 1 });
    checks.push(!invalidDiscard.ok && invalidDiscard.code === 'DRAW_REQUIRED');

    const drawResult = GameCore.applyAction(state, { type: drawAction, playerIndex: 1 });
    checks.push(drawResult.ok);

    const discardResult = drawResult.ok
        ? GameCore.applyAction(drawResult.state, { type: 'DISCARD', playerIndex: 1 })
        : { ok: false };
    checks.push(discardResult.ok && discardResult.state.turn.phase === 'draw');

    const result = {
        ok: checks.every(Boolean),
        checksPassed: checks.filter(Boolean).length,
        checksTotal: checks.length,
        details: {
            drawAction,
            discardIdx,
            discardedCard: discardIdx >= 0 ? hand[discardIdx] : null,
            invalidDiscardCode: invalidDiscard.code || null
        }
    };

    console.log(JSON.stringify(result));
    process.exit(result.ok ? 0 : 1);
}

run();
