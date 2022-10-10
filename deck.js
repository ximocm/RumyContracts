class Deck{
    constructor(){
        this.deck = [];
        this.reset()//Adds cards to the deck.
        this.shuffle();//Shuffle the cards in the deck
    }
    reset(){
        console.log("reset");
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['A', '2','3','4','5','6','7','8','9','10','J','Q','K'];
        for (let i = 0;i<= 3; i++){
            //console.log(i);
            for (let suit in suits){
                //console.log(suit);
                for (let value in values){
                    //console.log(value);
                    let card = new Card(value,suit);
                    //console.log(card);
                    this.deck.push(card);
                }
            }
        }
        for(var i; i<6;i++){
            this.deck.push(card(0,'Joker'));
        }
    }
    shuffle(){
        let size = this.deck.length;
        for(var i; i < size; i++){
            let j = Math.floor(Math.random() * numberOfCards);
            let tmp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = tmp;
        }
    }
    draw(){
        let card = this.deck[this.deck.length - 1];
        console.log(this.deck[this.deck.length - 1]);
        this.deck.pop();
        card.display();
        return(card);
    }
};