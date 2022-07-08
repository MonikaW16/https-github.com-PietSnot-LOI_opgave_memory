// de Card-class maakt op basis van een string in JSON-formaat een niewue card aan
// die twee HTML-images bevat: het image dat bij de naam hoort
// alsmede een cover (de 'achterkant van de kaart')
// hiertoe wordt gebruikgemaakt van een innerfunctie, als dat zo wordt genoemd
// Elk image krijgt een aparte naam en id
// voor het JSON-formaat: zie het bestand 'card.json'

class Card {
    constructor(cardInObjectFormaat, id) {
        this.card1 = cardInObjectFormaat.card1;
        this.id = id;
        // sound en set weggelaten, daar doe ik nu niets mee
        this.card2 = cardInObjectFormaat.card2;
        this.image = Card.makeImage(this.card1, id);
        this.cover = Card.makeImage('cover', id);
        this.sound = new Audio('data/snd/' + this.card1 + '.wav');
    }
    
    makeImageInvisible = function() {
        this.image.setAttribute('class', 'removed');
        this.cover.setAttribute('class', 'removed');
    }
    
    reset = function() {
        this.image.setAttribute('class', 'covered');
        this.cover.setAttribute('class', 'covered');
    }
    
    static makeImage(name, id) {
        const im = document.createElement('img');
        const url = 'data/img/' + (name === 'cover' ? 'cover.png' : name + '.jpg');
        im.setAttribute('src', url);
        im.setAttribute('name', name);
        im.setAttribute('id', name + '_' + id);
        im.setAttribute('class', 'covered');
        return im;
    }
    
    hasSameImageAs = function(other) {
        return this.card1 === other.card1;
    }
    
    playSound = function() {
        this.sound.play();
    }
}
