class Deck{
    constructor(){
        this.deck = [];
        this.reset()//Adds cards to the deck.
        this.shuffle();//Shuffle the cards in the deck
    }
    reset() {
        this.deck = [];
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

        for (const suit of suits) {
            for (const value of values) {
                this.deck.push(new Card(value, suit));
            }
        }
        for (let i = 0; i < 2; i++) {
            this.deck.push(new Card('Joker', 'Joker'));
        }
    }
    shuffle(){
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    draw() {
        return this.deck.pop();
    }
};