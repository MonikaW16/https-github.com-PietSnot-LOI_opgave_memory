// dit bestand bevat enkele nuttige functies
function random(max) {
    // geeft een random getal tussen 0 an max, beide inclusief
    return Math.floor(Math.random() * (max + 1));
}

function schud(array) {
    for (let end = array.length - 1; end >= 1; end--) {
        const j = random(end);
        [array[end], array[j]] = [array[j], array[end]];
    }
}

function shuffle(array, aantalKeer = 3) {
    for (let i = 1; i <= aantalKeer; i++) schud(array);
}

