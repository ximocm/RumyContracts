class Card{
    constructor(number, suit){
        this.number = number;
        this.suit = suit;

        this.height = 32;
        this.width = 35;
    }
    display(){
        //<img value={this.value} isSpecial={this.isSpecial?1:0} index={this.index} className="card-deck" src={'deck-images/'+this.filename}/>
    }
    getNum(){return this.number}
    getSuit(){return this.suit}
};

