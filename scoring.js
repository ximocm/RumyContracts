(function (globalScope) {
    const EXPLICIT_CARD_POINTS = {
        A: 15,
        '10': 10,
        J: 10,
        Q: 10,
        K: 10,
        Joker: 25
    };

    function getCardValue(card) {
        return card && typeof card.value === 'string' ? card.value : '';
    }

    function getCardScore(card) {
        const value = getCardValue(card);
        if (Object.prototype.hasOwnProperty.call(EXPLICIT_CARD_POINTS, value)) {
            return EXPLICIT_CARD_POINTS[value];
        }

        const numeric = Number(value);
        if (Number.isInteger(numeric) && numeric >= 2 && numeric <= 9) {
            return 5;
        }

        return 0;
    }

    function getHandScore(hand) {
        if (!Array.isArray(hand)) return 0;
        return hand.reduce((sum, card) => sum + getCardScore(card), 0);
    }

    function getRoundScoresFromHands(hands) {
        if (!Array.isArray(hands)) return [];
        return hands.map(hand => getHandScore(hand));
    }

    function applyRoundScores(totals, roundScores) {
        const base = Array.isArray(totals) ? totals.slice() : [];
        const scores = Array.isArray(roundScores) ? roundScores : [];
        const size = Math.max(base.length, scores.length);

        return Array.from({ length: size }, (_, idx) => {
            const current = Number(base[idx] || 0);
            const roundValue = Number(scores[idx] || 0);
            return current + roundValue;
        });
    }

    const api = {
        getCardScore,
        getHandScore,
        getRoundScoresFromHands,
        applyRoundScores
    };

    globalScope.Scoring = api;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
