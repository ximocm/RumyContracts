class Card{
    constructor(number, suit){
        this.number = number;
        this.suit = suit;

        this.height = 23;
        this.width = 12;
    }
    
    draw(ctx){
        ctx.save();
        ctx.beginPath();
        ctx.rect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.fill();
    };
    
};

