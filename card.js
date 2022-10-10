class Card{
    constructor(number, suit){
        this.number = number;
        this.suit = suit;

        this.height = 32;
        this.width = 35;

        if (suit = 'Joker'){
            this.isSpecial = true;
            this.filename = 'joker.png';
        }
        else{
            this.isSpecial = false;
            this.filename = number + suit + '.png';
        }
    }
    display(){
        <img value={this.value} isSpecial={this.isSpecial?1:0} index={this.index} className="card-deck" src={'images/'+this.filename}/>
    }
    getNum(){return this.number}
    getSuit(){return this.suit}
};

