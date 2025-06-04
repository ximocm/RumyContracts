
class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;

        this.width = 50;
        this.height = 64;

        if (suit === 'Joker') {
            this.filename = 'Joker.png';
        } else {
            this.filename = `${value}${suit}.png`;
        }

        this.image = new Image();
        this.image.src = `images/${this.filename}`;
    }

    render(ctx, x, y) {
        ctx.drawImage(this.image, x, y, this.width, this.height);
    }

    getNum() { return this.value; }
    getSuit() { return this.suit; }
};


