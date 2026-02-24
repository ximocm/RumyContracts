const AI_RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'Joker'];

function getRankIndex(card) {
    const idx = AI_RANK_ORDER.indexOf(card.value);
    return idx === -1 ? AI_RANK_ORDER.length : idx;
}

function cardImprovesHand(card, hand) {
    if (!card) return false;
    const sameValueCount = hand.filter(c => c.value === card.value).length;
    if (sameValueCount >= 2) return true;

    const sameSuit = hand.filter(c => c.suit === card.suit);
    const rank = getRankIndex(card);
    return sameSuit.some(c => {
        const diff = Math.abs(getRankIndex(c) - rank);
        return diff === 1 || diff === 2;
    });
}

function collectMeldCards(hand) {
    const meldCards = new Set();
    const byNumber = {};

    for (const c of hand) {
        byNumber[c.value] = (byNumber[c.value] || 0) + 1;
    }
    for (const c of hand) {
        if (byNumber[c.value] >= 3) meldCards.add(c);
    }

    const bySuit = {};
    for (const c of hand) {
        if (!bySuit[c.suit]) bySuit[c.suit] = [];
        bySuit[c.suit].push(c);
    }
    for (const suit of Object.keys(bySuit)) {
        const cards = bySuit[suit].slice().sort((a, b) => getRankIndex(a) - getRankIndex(b));
        if (cards.length === 0) continue;
        let run = [cards[0]];
        for (let i = 1; i < cards.length; i++) {
            const prev = getRankIndex(cards[i - 1]);
            const curr = getRankIndex(cards[i]);
            if (curr === prev + 1) {
                run.push(cards[i]);
            } else {
                if (run.length >= 3) run.forEach(r => meldCards.add(r));
                run = [cards[i]];
            }
        }
        if (run.length >= 3) run.forEach(r => meldCards.add(r));
    }

    return meldCards;
}

function chooseDiscardIndex(hand) {
    if (!hand || hand.length === 0) return -1;
    const meldCards = collectMeldCards(hand);

    let bestIdx = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < hand.length; i++) {
        const card = hand[i];
        const rank = getRankIndex(card);
        const inMeld = meldCards.has(card) ? 1 : 0;
        const score = (inMeld * 100) - rank;

        if (score > bestScore || (score === bestScore && rank > getRankIndex(hand[bestIdx] || card))) {
            bestScore = score;
            bestIdx = i;
        }
    }
    return bestIdx;
}

function chooseDrawAction(hand, discards) {
    const topDiscard = discards && discards.length > 0 ? discards[discards.length - 1] : null;
    if (!topDiscard) return 'DRAW_FROM_DECK';
    return cardImprovesHand(topDiscard, hand) ? 'DRAW_FROM_DISCARD' : 'DRAW_FROM_DECK';
}

class AIPlayer {
    constructor(name) {
        this.name = name;
        this.hand = [];
    }

    chooseDrawAction(discards) {
        return chooseDrawAction(this.hand, discards);
    }

    chooseDiscardIndex() {
        return chooseDiscardIndex(this.hand);
    }

    chooseDiscard() {
        const idx = this.chooseDiscardIndex();
        return idx >= 0 ? this.hand[idx] : null;
    }
}

if (typeof window !== 'undefined') {
    window.RummyAI = {
        chooseDrawAction,
        chooseDiscardIndex
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AIPlayer,
        chooseDrawAction,
        chooseDiscardIndex
    };
}
