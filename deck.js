class Deck{
    constructor(){
        this.deck = [];
        this.reset()//Adds cards to the deck.
        this.shuffle();//Shuffle the cards in the deck
        this.draw();
    }
    reset(){
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['Ace', 2,3,4,5,6,7,8,9,10,'Jack','Queen','King'];
        for (let _ in 3){
            for (let suit in suits){
                for (let value in values){
                    this.deck.push(card(value,suit));
                }
            }
        }
        for(var i; i<6;i++){
            this.deck.push(card(0,'Joker'));
        }
    }
    shuffle(){
        let size = this.deck.length();
        for(var i; i < size; i++){
            let j = Math.floor(Math.random() * numberOfCards);
            let tmp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = tmp;
        }
    }
    draw(){
        var carda = deck[this.deck.length -1];
        this.deck.pop();
        carda.display(carda);
        return(carda);
    }
}