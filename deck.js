class Deck{
    constructor(){
        this.deck = [];
        this.reset()//Adds cards to the deck.
        this.shuffle();//Shuffle the cards in the deck
    }
    reset(){
        console.log("reset");
        this.deck = [];
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
        for (const suit of suits) {
            for (const value of values) {
                const card = new Card(value, suit);
                this.deck.push(card);
            }
        }
        for (let i = 0; i < 6; i++) {
            this.deck.push(new Card(0, 'Joker'));
        }
    }
    shuffle(){
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = tmp;
        }
    }
    draw(){
        let card = this.deck[this.deck.length - 1];
        card.display();
        console.log(this.deck[this.deck.length - 1]);
        this.deck.pop();
        card.display();
        return(card);
    }
};