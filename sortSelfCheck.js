function createCard(value, suit) {
    return { value, suit };
}

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

function stableSort(cards, compareFn) {
    return cards
        .map((card, idx) => ({ card, idx }))
        .sort((a, b) => {
            const cmp = compareFn(a.card, b.card);
            return cmp !== 0 ? cmp : a.idx - b.idx;
        })
        .map(item => item.card);
}

function sortByRank(cards) {
    return stableSort(cards, (a, b) => {
        const byRank = getRankWeight(a) - getRankWeight(b);
        if (byRank !== 0) return byRank;
        return getSuitWeight(a) - getSuitWeight(b);
    });
}

function sortBySuit(cards) {
    return stableSort(cards, (a, b) => {
        const bySuit = getSuitWeight(a) - getSuitWeight(b);
        if (bySuit !== 0) return bySuit;
        return getRankWeight(a) - getRankWeight(b);
    });
}

function isNonDecreasingBy(items, weightFn) {
    for (let i = 1; i < items.length; i++) {
        if (weightFn(items[i - 1]) > weightFn(items[i])) return false;
    }
    return true;
}

function run() {
    const cards = [
        createCard('K', 'Spades'),
        createCard('2', 'Hearts'),
        createCard('2', 'Clubs'),
        createCard('10', 'Diamonds'),
        createCard('A', 'Spades'),
        createCard('Joker', 'Joker'),
        createCard('10', 'Clubs')
    ];

    const byRank = sortByRank(cards);
    const bySuit = sortBySuit(cards);

    const checks = [];

    checks.push(isNonDecreasingBy(byRank, getRankWeight));
    checks.push(
        byRank.every((card, i, arr) => i === 0 || getRankWeight(arr[i - 1]) !== getRankWeight(card) || getSuitWeight(arr[i - 1]) <= getSuitWeight(card))
    );

    checks.push(isNonDecreasingBy(bySuit, getSuitWeight));
    checks.push(
        bySuit.every((card, i, arr) => i === 0 || getSuitWeight(arr[i - 1]) !== getSuitWeight(card) || getRankWeight(arr[i - 1]) <= getRankWeight(card))
    );

    const result = {
        ok: checks.every(Boolean),
        checksPassed: checks.filter(Boolean).length,
        checksTotal: checks.length,
        rankOrder: byRank.map(c => `${c.value}-${c.suit}`),
        suitOrder: bySuit.map(c => `${c.value}-${c.suit}`)
    };

    console.log(JSON.stringify(result));
    process.exit(result.ok ? 0 : 1);
}

run();
