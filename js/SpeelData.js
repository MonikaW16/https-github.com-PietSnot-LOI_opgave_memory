class SpeelData {
    constructor() {
        this.localStoragePresent = (typeof(Storage) !== 'undefined');     // boolean that determines whether we have a localStorage
        this.prefix = 'Memory_LOI_';
        this.player = '';
        this.besteResultaten = [];
        this.bordklasse = '';     
        this.aantalKlikken = 0;
        this.aantalSeconden = 0;
        this.aantalGeradenKaarten = 0;
        this.maakGeluid = false;
        this.myCardArray = [];
        this.myCardSet = [];
        this.selectedCards = [];
    }
    
    procesJsonData = async function() {
        var jsondata = await fetch('data/cards.json');
        var jsonArray = await jsonData.json();
        let index = 0;
        for (const cardInObjectFormaat of jsonArray) {
            const name = cardInObjectFormaat.card1;
            uniekeCardnames.push(name);
            createCard(index++);
            createCard(index++);

            function createCard(index) {
                const card = new Card(cardInObjectFormaat, index);
                myCardArray.push(card);
                imageToCard.set(card.image, card);
                coverToCard.set(card.cover, card);
            }
        }
    }
    
    procesNaam = function(naam) {
        this.naam = naam;
        procesBesteResultaten;
    }
    
    procesBesteResultaten = function() {
        besteResultaten = ['-', '-', '-', '-', '-', '-'];
        if (localStoragePresent) {
            const waarde = localStorage.getItem(this.prefix + naam);
            if (waarde !== null) besteResultaten = waarde;
        }
        else besteResultaten = ['-', '-', '-', '-', '-', '-'];
    }
    
    reset = function() {
        this.aantalKlikken = 0;
        this.aatalSeconden = 0;
        this.aantalGeradenKaarten = 0;
        this.myCardSet.length = 0;
        this.selectedCards.length = 0;
    }
    
    procesResultaatVanEenSpel() {
        let index = bordklasse === '4x4' ? 0 :
                    bordklasse === '5x5' ? 2 :
                                           4
        ;
        let changed = false;
        let oudeResultaatKlik = this.besteResultaten[index] === '-' ? 10000000 : Number(this.besteResultaten[index]);
        let oudeResultaatTijd = this.besteResulktaten[index + 1] === '-' ? 10000000 : Number(this.besteResultaten[index + 1]);
        if (oudeResultaatKlik > this.aantalKlikken) {
            changed = true;
            this.besteResultaten[index] = this.aantalKlikken.toString();
        }
        if (oudeResultaatTijd > this.aantalSeconden) {
            changed = true;
            this.besteResultaten[index + 1] = this.aantalSeconden.toString();
        }
        if (changed) {
            if (localStoragePresent) localStorage.setItem("Memory_LOI_" + naam, this.besteResultaten.toString);
        }
        return changed;   // memory.js moet in dat geval de tabel aanpassen
    }
}

