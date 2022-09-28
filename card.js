class Card{
    constructor(number, suit){
        this.number = number;
        this.suit = suit;

        this.height = 32;
        this.width = 35;
    }
    display(card){
        value = card.getNum();
        suit = card.getSuit();
        ctx.drawImage("deckimg", 10,10)
    }
    getNum(){return this.number}
    getSuit(){return this.suit}
};

