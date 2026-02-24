// Pure game core for state transitions (no UI side effects).
// Self-check usage (browser console): window.GameCore.runSelfCheck()

(function (globalScope) {
    const DEFAULT_TOTAL_ROUNDS = 4;
    const ROUND_CONTRACTS = {
        1: {
            id: 1,
            label: '1 Trio y 1 Escalera',
            trios: 1,
            escaleras: 1,
            cardsToDeal: 7,
            canLayDown: true
        },
        2: {
            id: 2,
            label: '2 Escaleras',
            trios: 0,
            escaleras: 2,
            cardsToDeal: 8,
            canLayDown: true
        },
        3: {
            id: 3,
            label: '3 Trios',
            trios: 3,
            escaleras: 0,
            cardsToDeal: 9,
            canLayDown: true
        },
        4: {
            id: 4,
            label: '1 Trio y 2 Escaleras (Sin bajarse)',
            trios: 1,
            escaleras: 2,
            cardsToDeal: 11,
            canLayDown: false
        }
    };

    function getContractForRound(round) {
        return ROUND_CONTRACTS[round] || null;
    }

    function getRoundStartPlayerIndex(round, playerCount) {
        if (!playerCount || playerCount < 1) return 0;
        return (Math.max(1, round) - 1) % playerCount;
    }

    function cloneState(state) {
        return {
            game: { ...state.game },
            turn: { ...state.turn },
            players: state.players.map(p => ({ ...p })),
            piles: { ...state.piles }
        };
    }

    function createInitialState(config = {}) {
        const playerCount = config.playerCount || 2;
        const initialHandCounts = config.initialHandCounts || Array(playerCount).fill(0);
        return {
            game: {
                status: config.status || 'playing',
                round: config.round || 1,
                totalRounds: config.totalRounds || DEFAULT_TOTAL_ROUNDS,
                contract: config.contract || null
            },
            turn: {
                currentPlayerIndex: config.currentPlayerIndex || 0,
                phase: config.phase || 'draw',
                turnNumber: config.turnNumber || 1
            },
            players: Array.from({ length: playerCount }, (_, idx) => ({
                handCount: initialHandCounts[idx] || 0,
                hasLaidDown: false
            })),
            piles: {
                deckCount: config.deckCount || 0,
                discardCount: config.discardCount || 0
            }
        };
    }

    function createStateFromRuntime(runtime) {
        return createInitialState({
            playerCount: runtime.players.length,
            initialHandCounts: runtime.players.map(p => p.hand.length),
            currentPlayerIndex: runtime.currentPlayer,
            phase: runtime.phase || 'draw',
            round: runtime.round || 1,
            totalRounds: runtime.totalRounds || DEFAULT_TOTAL_ROUNDS,
            contract: runtime.contract || null,
            deckCount: runtime.deck.deck.length,
            discardCount: runtime.discards.length
        });
    }

    function runRoundBootstrapSelfCheck() {
        const contractCards = [1, 2, 3, 4].map(r => {
            const contract = getContractForRound(r);
            return contract && contract.cardsToDeal;
        });

        const checks = [
            contractCards.join(',') === '7,8,9,11',
            getRoundStartPlayerIndex(1, 2) === 0,
            getRoundStartPlayerIndex(2, 2) === 1,
            getRoundStartPlayerIndex(3, 2) === 0,
            getRoundStartPlayerIndex(4, 2) === 1,
            getContractForRound(99) === null
        ];

        return {
            ok: checks.every(Boolean),
            checksPassed: checks.filter(Boolean).length,
            checksTotal: checks.length,
            details: {
                contractCards,
                startOrderTwoPlayers: [1, 2, 3, 4].map(r => getRoundStartPlayerIndex(r, 2))
            }
        };
    }

    function runValidationPipeline(state, action, options) {
        const hooks = (options && options.hooks) || {};
        const validators = [
            validateKnownAction,
            validatePlayerReference,
            validateTurnOwnership,
            validatePhaseRules,
            validatePileAvailability,
            hooks.ruleValidator,
            hooks.contractValidator
        ].filter(Boolean);

        for (const validator of validators) {
            const result = validator(state, action, options);
            if (!result.ok) return result;
        }
        return { ok: true };
    }

    function validateKnownAction(state, action) {
        const valid = new Set(['DRAW_FROM_DECK', 'DRAW_FROM_DISCARD', 'DISCARD']);
        if (!action || !valid.has(action.type)) {
            return { ok: false, error: 'Unknown action type', code: 'UNKNOWN_ACTION' };
        }
        return { ok: true };
    }

    function validatePlayerReference(state, action) {
        if (typeof action.playerIndex !== 'number') {
            return { ok: false, error: 'Action requires playerIndex', code: 'MISSING_PLAYER' };
        }
        if (action.playerIndex < 0 || action.playerIndex >= state.players.length) {
            return { ok: false, error: 'Player index out of range', code: 'INVALID_PLAYER' };
        }
        return { ok: true };
    }

    function validateTurnOwnership(state, action) {
        if (action.playerIndex !== state.turn.currentPlayerIndex) {
            return { ok: false, error: 'Out of turn action', code: 'OUT_OF_TURN' };
        }
        return { ok: true };
    }

    function validatePhaseRules(state, action) {
        if (state.turn.phase === 'draw' && action.type === 'DISCARD') {
            return { ok: false, error: 'Must draw before discarding', code: 'DRAW_REQUIRED' };
        }
        if (state.turn.phase === 'discard' && (action.type === 'DRAW_FROM_DECK' || action.type === 'DRAW_FROM_DISCARD')) {
            return { ok: false, error: 'Must discard after drawing', code: 'DISCARD_REQUIRED' };
        }
        return { ok: true };
    }

    function validatePileAvailability(state, action) {
        if (action.type === 'DRAW_FROM_DECK' && state.piles.deckCount <= 0) {
            return { ok: false, error: 'Deck is empty', code: 'DECK_EMPTY' };
        }
        if (action.type === 'DRAW_FROM_DISCARD' && state.piles.discardCount <= 0) {
            return { ok: false, error: 'Discard pile is empty', code: 'DISCARD_EMPTY' };
        }
        if (action.type === 'DISCARD' && state.players[action.playerIndex].handCount <= 0) {
            return { ok: false, error: 'No card to discard', code: 'HAND_EMPTY' };
        }
        return { ok: true };
    }

    function reduce(state, action) {
        const next = cloneState(state);
        const player = next.players[action.playerIndex];

        if (action.type === 'DRAW_FROM_DECK') {
            player.handCount += 1;
            next.piles.deckCount -= 1;
            next.turn.phase = 'discard';
        }

        if (action.type === 'DRAW_FROM_DISCARD') {
            player.handCount += 1;
            next.piles.discardCount -= 1;
            next.turn.phase = 'discard';
        }

        if (action.type === 'DISCARD') {
            player.handCount -= 1;
            next.piles.discardCount += 1;
            next.turn.currentPlayerIndex = (next.turn.currentPlayerIndex + 1) % next.players.length;
            next.turn.phase = 'draw';
            next.turn.turnNumber += 1;
        }

        return next;
    }

    function applyAction(state, action, options = {}) {
        const validation = runValidationPipeline(state, action, options);
        if (!validation.ok) return validation;
        return {
            ok: true,
            state: reduce(state, action),
            action
        };
    }

    function runSelfCheck() {
        const start = createInitialState({
            playerCount: 2,
            initialHandCounts: [7, 7],
            currentPlayerIndex: 0,
            deckCount: 20,
            discardCount: 1
        });

        const r1 = applyAction(start, { type: 'DRAW_FROM_DECK', playerIndex: 0 });
        const r2 = applyAction(r1.state, { type: 'DISCARD', playerIndex: 0 });
        const invalid = applyAction(r2.state, { type: 'DISCARD', playerIndex: 1 });

        const checks = [
            r1.ok,
            r1.state.players[0].handCount === 8,
            r1.state.turn.phase === 'discard',
            r2.ok,
            r2.state.players[0].handCount === 7,
            r2.state.turn.currentPlayerIndex === 1,
            r2.state.turn.phase === 'draw',
            !invalid.ok && invalid.code === 'DRAW_REQUIRED'
        ];

        return {
            ok: checks.every(Boolean),
            checksPassed: checks.filter(Boolean).length,
            checksTotal: checks.length,
            details: {
                firstDraw: r1,
                firstDiscard: r2,
                invalidDiscard: invalid
            }
        };
    }

    const api = {
        ROUND_CONTRACTS,
        getContractForRound,
        getRoundStartPlayerIndex,
        createInitialState,
        createStateFromRuntime,
        applyAction,
        runValidationPipeline,
        runSelfCheck,
        runRoundBootstrapSelfCheck
    };

    globalScope.GameCore = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
