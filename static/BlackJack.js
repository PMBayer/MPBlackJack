/************************* Game Logic *********************************/
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/************************* Kartenfunktionen *********************************/
function getCard(zahl, zeichen2) {
    let zeichen = ['Kreuz', 'Pik', 'Herz', 'Karo']
    let besonders = ['Bube', 'Dame', 'Koenig']
    let karte = []
    if (zahl < 11) {
        if (zahl === 1) {
            karte[0] = 'Ass';
        } else {
            karte[0] = zahl;
        }
    } else {
        karte[0] = besonders[zahl - 11];
    }
    karte[1] = zeichen[zeichen2];
    return karte;
}

/* vermutlich nur für tests kann am ende vermutlich gelöscht werden */
function getCardgesamt(c) {
    return c[0] + ' ';
}

function getCardwert(c) {
    let besonders = ['Bube', 'Dame', 'König']
    if (c[0] === 'Ass') {
        return 11;
    }
    if (c[0] === besonders[0] || c[0] === besonders[1] || c[0] === besonders[2]) {
        return 10;
    }
    return c[0];
}

/************************* Ziehstapelfunktionen *********************************/
function getZiehstapel() {
    let stapel = [];
    stapel = Ziehstapelerneuern(stapel);
    return stapel;
}

function Ziehstapelgeben(s1) {
    let stelle = getRandomInt(s1.length);
    let karte = s1.splice(stelle, 1);
    if (s1.length === 0) {
        s1 = Ziehstapelerneuern(s1);
    }
    let alles = [];
    alles[0] = s1;
    alles[1] = karte;
    return alles;
}

function Ziehstapelerneuern(s) {
    let anzahldecks = 6;
    for (let i3 = 0; i3 < anzahldecks; i3++) {
        for (let i = 1; i < 14; i++) {
            for (let i2 = 0; i2 < 4; i2++) {
                const card5 = getCard(i, i2);
                s.push(card5);
            }
        }
    }

    return s;
}

/************************* allgemeine Spielerfunktionen *********************************/

function ziehen(h, s, m) {
    let gesamt = []
    for (let d1 = 0; d1 < m; d1++) {
        let hilf3 = Ziehstapelgeben(s);
        h.push(hilf3[1]);
        s = hilf3[0];
    }
    gesamt[0] = s;
    gesamt[1] = h;
    return gesamt;
}

/* für tests kann am ende gelöscht werden */

function gesamteHand(h) {
    let string2 = '';
    for (let i = 0; i < h.length; i++) {
        let c2 = h[i];
        string2 = string2.concat(getCardgesamt(c2));
    }
    return string2;
}

function getHandwert(h) {
    let total = 0;
    for (let h1 = 0; h1 < h.length; h1++) {
        let kartenwert = h[h1];
        total += getCardwert(kartenwert[0]);
    }
    return total;
}

function verloren(h) {
    return getHandwert(h) >= 22;
}


function rescuePossible(h) {
    if (getHandwert(h) > 21) {
        let anzahl = h.length;
        for (let ret1 = 0; ret1 < anzahl; ret1++) {
            let Kriterium1 = h[ret1];
            let Kriterium2 = Kriterium1[0];
            let kriterium3 = Kriterium2[0];
            if (kriterium3 === 'Ass') {
                Kriterium2[0] = 1;
                Kriterium1[0] = Kriterium2;
                h[ret1] = Kriterium1;
                ret1 = anzahl;
            }
        }
    }
    return h;
}

/************************* Dealerfunktionen *********************************/


function dealer(s) {
    let dHandundstapel = [];
    dHandundstapel = ziehen(dHandundstapel, s, 1)
    return dHandundstapel;
}


function Dspiel(h, s) {
    let total = [s, h];
    while (getHandwert(total[1]) < 17) {
        total = ziehen(total[1], total[0], 1);
        total[1] = rescuePossible(total[1])
    }
    return total;
}

/************************* Spielerfunktionen *********************************/

function spieler(s) {
    let sHandundstapel = [];
    sHandundstapel = ziehen(sHandundstapel, s, 2);
    return sHandundstapel;
}




