class Card{
    constructor(number, suit){
        this.number = number;
        this.suit = suit;

        this.height = 32;
        this.width = 35;
    }
    display(){
        ctx.drawImage(ASpades, 265,275,50,64)
    }
    getNum(){return this.number}
    getSuit(){return this.suit}
};

