// algemeen
let localStorageIsPresent;
let prefix = 'Memory_LOI_';
let besteResultaten;

// velden uit de index.html
let myField;  
let opnieuw;
let select;
let statusVeld;      // hier wordt de status van het spel weergegeven; zie status.js
let gefeliciteerd;   // hier wordt de gebruiker gecomplimenteerd na voltooiing van een spel
let geluidsCheckbox; // regelt of er geluid gemaakt bij het klikken van een kaart

//const myCardArray = ["duck", "kitten", "piglet", "puppy", "calf", "veal", "lamb", "rooster", "horse", "mouse", "dog", "cat", "goose", "goat", "sheep", "pig", "cow", "chick", "hen"];
const myCardArray = [];         // hier komen alle cards in
const myCardSet = [];           // de verzameling cards die in een spel gebruikt gaan worden
const uniekeCardnames = [];     // hier komen de unieke kaartnamen in om de
                                // in een spel gebruikte speelkaarten te selecteren
const imageToCard = new Map();  // map die een image afbeeldt op de bijbehorende card
const coverToCard = new Map();  // map die een cover afbeeldt op de bijbehorende card

// variabelen die in het spel gebruikt worden
let status;                  // bevat de status van het spel
let bordklasse;              // kan zijn: 4 x 4, 5 x 5 en 6 x 6
let aantalUniekeKaarten;     // keuze 8, 12 en 16; het aantal speelkaarten is het dubbele hiervan
const selectedCards = [];    // hierin komen de aangeklikte kaarten, die als de lengte 2 is, vergeleken gaan worden
let aantalGeradenKaarten = 0;  // om het einde van het spel te kunnen bepalen
let aantalKlikken;
let aantalSeconden;

let tijdsInterval;   // een timer, verhoogt het aantal seconden met 1 per seconde

window.addEventListener('load', initieer);

function initieer() {
    localStorageIsPresent = (typeof(Storage) !== 'undefined');
    document.getElementById('info').addEventListener('click', toonInfo);
    console.log('localStorage present? ' + localStorageIsPresent);
    player = prompt('welkom bij dit memory-spelletje! Wat is uw naam?');
    document.getElementById('welkom').innerHTML = `Welkom bij dit spel, ${player}!`;
    myField = document.getElementById('field');
    myField.addEventListener('click', event => verwerkKaartClick(event));
//    myField.style.width = boardWidth;
    opnieuw = document.getElementById('opnieuw');
    opnieuw.addEventListener('click', onClickOpnieuw);
    selectieVak = document.getElementById('select');
    selectieVak.addEventListener('change', e => processBordkeuze(e));
    statusVeld = document.getElementById('status');
    geluidsCheckbox = document.getElementById('geluid');
    gefeliciteerd = document.getElementById('gefeliciteerd');
    readData();   
    getBestScoresFromPlayer();
    setStatus(Status.FINISHED);
}

function toonInfo() {
    window.open('info.html', '_blank');
}

function resetVariabelen() {
    aantalKlikken = 0;
    aantalSeconden = 0;
    aantalGeradenKaarten = 0;
    myCardArray.forEach(card => card.reset());
    myCardSet.length = 0;
    selectedCards.length = 0;
    gefeliciteerd.innerHTML = '';
}

function getBestScoresFromPlayer() {
    besteResultaten = ['-', '-', '-', '-', '-', '-'];
    if (localStorageIsPresent) {
        let waarde = localStorage.getItem(prefix + player);
        if (waarde !== null) besteResultaten = waarde.split(',');   // undefined?
    } 
    document.getElementById('4x4klik').innerHTML = besteResultaten[0];
    document.getElementById('4x4tijd').innerHTML = besteResultaten[1];
    document.getElementById('5x5klik').innerHTML = besteResultaten[2];
    document.getElementById('5x5tijd').innerHTML = besteResultaten[3];
    document.getElementById('6x6klik').innerHTML = besteResultaten[4];
    document.getElementById('6x6tijd').innerHTML = besteResultaten[5];
}

// deze functie wordt aangeroepen als het bord van kaarten moet worden voorzien.
function populateField() {
    // resetten van de gebruikte variabelen
    resetVariabelen();
    shuffle(uniekeCardnames, 5);
    // we selecteren het gewenste aantal strings van myCardArray
    const selectedNames = uniekeCardnames.slice(0, aantalUniekeKaarten);
    // en we filteren myCardArray op cards die een naam hebben
    // die in selectedNames voorkomt
    // de collectie myCardSet worden gestopt
    for (const string of selectedNames) {
        const filtered = myCardArray.filter(card => card.card1 === string);
        myCardSet.push(filtered[0], filtered[1]);
    }
    shuffle(myCardSet, 10);    // myCardSet wordt 10 maal geshuffeld
    emptyMyField();        // verwijdert alle div'jes van de hoofd-div
    for (const card of myCardSet) myField.appendChild(card.image);
    document.getElementById('aantalKlikken').innerHTML = aantalKlikken;
    document.getElementById('tijdinseconden').innerHTML = aantalSeconden;
    setStatus(Status.SHOWING_INITIAL_CARDS);
    setTimeout(coverTheCards, 5000);     // een time-out na 5 seconden, dan 
                                         // worden de open kaarten weer omgedraaid
}

// deze functie wordt aangeroepen als er op de knop 'opnieuw' wordt geklikt
function onClickOpnieuw() {
    if (!(status === Status.PLAYING || status === Status.FINISHED)) {
        // dan zijn we òf de kaarten bij een nieuw spel aan het tonen,
        // òf de twee aangeklikte kaarten worden vergeleken.
        // in beide gevallen doen we niks
        return;
    }
    emptyMyField();
    processBordkeuze();
}

// deze functie wordt aangeroepen als er op een kaart is geklikt,
// mits de status gelijk is aan 'PLAYING', anders heeft een kaartklik geen zin
function verwerkKaartClick(event) {
    if (status !== Status.PLAYING) return;
    aantalKlikken++;
    document.getElementById('aantalKlikken').innerHTML = aantalKlikken;
    const t = event.target;    // ik krijg de 'this' niet werkend
    // aangezien de EventListener is gehangen aan de hoofd-div, komt er
    // ook een klik door als er geklikt wordt op een plek waar een inmiddels
    // verwijderde kaart stond. In dat geval is de target de aan de hoofddiv
    // gehangen sub-div, die een class-naam heeft die met 'board'begint
    const klasse = t.getAttribute('class');
    if (!(klasse.startsWith('removed') || klasse.startsWith('covered'))) return;
    const nrOfSelectedCards = selectedCards.length;
    let card;
    switch (nrOfSelectedCards) {
        case 0:   
            // nog geen geselecteerde kaarten, er is dus geklikt op een cover-kaart
            // push the corresponding card to selectedCards
            card = coverToCard.get(t);
            selectedCards.push(card);
            // vervang de cover door de corresponderende image
            t.parentNode.replaceChild(card.image, t);
            if (geluidsCheckbox.checked) card.playSound();
            break;
        case 1:
            // er was al op een kaart geklikt. Dit is dus de tweede (of er
            // is weer op het eerste kaartje geklikt
            card = imageToCard.get(t);    // indien de klik was op het al geklikte kaartje
            if (card === null || card === undefined) card = coverToCard.get(t);
            // maar of we nu op een image of een cover hebben geklikt,
            // als we twee keer op hetzelfde kaartje hebben geklikt (dan zijn
            // de bijbehorende cards hetzelfde
            if (card === selectedCards[0]) return;
            selectedCards.push(card);
            t.parentNode.replaceChild(coverToCard.get(t).image, t);
            if (geluidsCheckbox.checked) card.playSound();
            setStatus(Status.CHECKING_CARDS);
            // geeft de speler 2 seconden om de geopenbaarde kaartje
            // in zich op te nemen
            setTimeout(checkSelectedCards, 2000);
    }
}

// wordt aangeroepen als er op twee verschillende kaarten is geklikt.
function checkSelectedCards() {
    const card1 = selectedCards[0];
    const card2 = selectedCards[1];
//    if (card1.card1 === card2.card1) {
    if (card1.hasSameImageAs(card2)) {
        selectedCards.forEach(card => card.makeImageInvisible());
        aantalGeradenKaarten += 2;
    }
    else {
        card1.image.parentNode.replaceChild(card1.cover, card1.image);
        card2.image.parentNode.replaceChild(card2.cover, card2.image);
    }
    selectedCards.length = 0;
    setStatus(aantalGeradenKaarten === myCardSet.length ? Status.FINISHED : Status.PLAYING);
    if (status === Status.FINISHED) {
        clearInterval(tijdsInterval);
        gefeliciteerd.innerHTML = "Grote Klasse!";
        checkBestScores();
    }
}

// deze functioe verwijdert alle images die aan de hoofd-div 'myField'hangen
function emptyMyField() {
    while (myField.hasChildNodes()) myField.removeChild(myField.children[0]);
}

// deze functie wordt aangeroepen als er een selectie is gemaakt voor de bord-grootte
function processBordkeuze() {
    if (status === Status.CHECKING_CARDS || status === Status.SHOWING_INITIAL_CARDS) return;
    if (tijdsInterval) clearInterval(tijdsInterval);
    bordklasse = selectieVak.value;
    // noot: de bordklasse kan nog op 'kies' staan als er vanuit het begin 
    // op de knop 'opnieuw' wordt geklikt
    if (bordklasse === 'kies') bordklasse = 'board4';
    // in de opdracht staat dat er een switch moet worden gebruit,
    // ikzelf vind een ternary-operator veel beter leesbaar
    // ik heb wel een switch gebruikt in de functie 'verwerkKaartClick'
    aantalUniekeKaarten = bordklasse === 'board4' ?  8 :
                          bordklasse === 'board5' ? 12 :
                                                    18
    ;
    let bordStyle = "auto auto auto auto";
    myField.style['grid-template-columns'] = aantalUniekeKaarten === 8 ? bordStyle :
                                             aantalUniekeKaarten === 12? bordStyle + " auto" :
                                                                         bordStyle + " auto auto"
    ;
    populateField();
}

// deze functie wordt aangeroepen om de initieel getoonde kaarten bij het begin
// van een spel weer te bedekken met een cover
function coverTheCards() {
    for (const im of document.images) {
        const pa = im.parentNode;
        const card = imageToCard.get(im);
        pa.replaceChild(card.cover, im);
    }
    tijdsInterval = setInterval(werkDeTijdBij, 1000);
    setStatus(Status.PLAYING);
}

function werkDeTijdBij() {
    aantalSeconden++;
    document.getElementById('tijdinseconden').innerHTML = '' + aantalSeconden;
}

function setStatus(nieuweStatus) {
    status = nieuweStatus;
    statusVeld.innerHTML = status;
    console.log(status);
}

// reads the data that comes in JSON format
// the global array 'myCardArray is filled and the look-up
// tables imageToCard and coverToCard are initialized as well
async function readData() {
    var jsonData = await fetch('data/cards.json');
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

function checkBestScores() {
    let changed = false;
    let index = bordklasse === 'board4' ? 0 :
                bordklasse === 'board5' ? 2 :
                                          4
    ;
    let oudeResultaatKlik = besteResultaten[index] === '-' ? 10000000 : Number(besteResultaten[index]);
    let oudeResultaatTijd = besteResultaten[index + 1] === '-' ? 10000000 : Number(besteResultaten[index + 1]);
    if (oudeResultaatKlik > aantalKlikken) {
        changed = true;
        besteResultaten[index] = aantalKlikken.toString();
    }
    if (oudeResultaatTijd > aantalSeconden) {
        changed = true;
        besteResultaten[index + 1] = aantalSeconden.toString();
    }
    if (changed) {
        let appie = besteResultaten.toString();
        if (localStorageIsPresent) localStorage.setItem("Memory_LOI_" + player, appie);
        document.getElementById('4x4klik').innerHTML = besteResultaten[0];
        document.getElementById('4x4tijd').innerHTML = besteResultaten[1];
        document.getElementById('5x5klik').innerHTML = besteResultaten[2];
        document.getElementById('5x5tijd').innerHTML = besteResultaten[3];
        document.getElementById('6x6klik').innerHTML = besteResultaten[4];
        document.getElementById('6x6tijd').innerHTML = besteResultaten[5];
    }
}