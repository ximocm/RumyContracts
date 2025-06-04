class Card{
    constructor(number, suit){
        this.number = number;
        this.suit = suit;

        this.height = 32;
        this.width = 35;

        if (suit === 'Joker'){
            this.isSpecial = true;
            this.filename = 'joker';
        }
        else{
            this.isSpecial = false;
            this.filename = number + suit;
        }
    }
    display(){
        ctx.drawImage(this.filename, 335,275,50,64);
    }
    getNum(){return this.number}
    getSuit(){return this.suit}
};

