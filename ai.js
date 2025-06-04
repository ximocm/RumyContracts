class AIPlayer {
    constructor(name) {
        this.name = name;
        this.hand = [];
    }

    takeTurn(deck, discards) {
        // Draw a card from the deck
        const card = deck.draw();
        this.hand.push(card);

        // Decide which card to discard
        const discard = this.chooseDiscard();
        if (discard) {
            const idx = this.hand.indexOf(discard);
            if (idx !== -1) {
                this.hand.splice(idx, 1);
            }
            discards.push(discard);
        }
        return discard;
    }

    chooseDiscard() {
        if (this.hand.length === 0) return null;
        const order = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

        // Count cards by number for sets
        const byNumber = {};
        for (const c of this.hand) {
            byNumber[c.number] = (byNumber[c.number] || 0) + 1;
        }

        // Determine cards that are part of sets
        const meldCards = new Set();
        for (const c of this.hand) {
            if (byNumber[c.number] >= 3) {
                meldCards.add(c);
            }
        }

        // Determine runs by suit
        const bySuit = {};
        for (const c of this.hand) {
            if (!bySuit[c.suit]) bySuit[c.suit] = [];
            bySuit[c.suit].push(c);
        }
        for (const suit in bySuit) {
            const cards = bySuit[suit].slice().sort((a,b)=>order.indexOf(a.number)-order.indexOf(b.number));
            let run = [cards[0]];
            for (let i=1;i<cards.length;i++) {
                const prev = order.indexOf(cards[i-1].number);
                const curr = order.indexOf(cards[i].number);
                if (curr === prev + 1) {
                    run.push(cards[i]);
                } else {
                    if (run.length >= 3) {
                        for(const r of run) meldCards.add(r);
                    }
                    run = [cards[i]];
                }
            }
            if (run.length >= 3) {
                for(const r of run) meldCards.add(r);
            }
        }

        // Choose highest card not in any meld
        let discard = null;
        let maxValue = -1;
        for (const c of this.hand) {
            const value = order.indexOf(c.number);
            if (!meldCards.has(c) && value >= maxValue) {
                maxValue = value;
                discard = c;
            }
        }
        return discard;
    }
}
