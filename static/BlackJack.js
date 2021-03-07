function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

var zeichen = ['Kreuz', 'Pik', 'Herz', 'Karo']
var besonders = ['Bube', 'Dame', 'König']

function Card(zahl, zeichen2) {
    this.number;
    if (zahl < 11) {
        if (zahl === 1) {
            this.number = 'Ass';
        } else {
            this.number = zahl;
        }
    } else {
        this.number = besonders[zahl - 11];
    }
    this.color = zeichen[zeichen2];
    this.getCard = function () {
        const karte1 = this.number + ' ' + this.color + ', ';
        return karte1;
    }
    this.wert = function () {
        if (zahl < 11) {
            if (this.number === 'Ass') {
                return 11;
            } else {
                return zahl;
            }
        }
        return 10;
    }
}

function Ziehstapel() {
    this.stapel = [];
    this.erneuern = function () {
        const anzahldecks = 6;
        for (let i = 1; i < 14; i++) {
            for (let i2 = 0; i2 < 4; i2++) {
                for (let i3 = 0; i3 < anzahldecks; i3++) {
                    const card5 = new Card(i, i2);
                    this.stapel.push(card5);
                }
            }
        }
    }
    this.lang = function () {
        const laenge = this.stapel.length;
        return laenge;
    }
    this.geben = function () {
        const stelle = getRandomInt(this.stapel.length);
        const karte = this.stapel.splice(stelle, 1);
        return karte[0];
    }
    this.leer = function () {
        if (this.stapel.length === 0) {
            return true;
        }
        return false;
    }
}

Ziehstapel1 = new Ziehstapel();
Ziehstapel1.erneuern();

function Hand(s) {
    this.blatt = [];
    this.ziehen = function () {
        const hilf3 = Ziehstapel1.geben();
        this.blatt.push(hilf3);
        const mischen = s.leer();
        if (mischen) {
            s.erneuern();
        }
    };
    this.zeigen = function (a) {
        const c = this.blatt[a];
        //var string1=c.getCard();
        return c;//string1;
    }
    this.volleHand = function () {
        let string2 = '';
        for (let i = 0; i < this.blatt.length; i++) {
            const c2 = this.blatt[i];
            string2 = string2.concat(c2.getCard());
        }
        return string2;
    }
    this.gezogen = function () {
        const c3 = this.blatt[this.blatt.length - 1];
        //string3=c3.getCard();
        return c3; //string3;
    }
    this.Handwert = function () {
        let total = 0;
        for (let h1 = 0; h1 < this.blatt.length; h1++) {
            const kartenwert = this.blatt[h1];
            total += kartenwert.wert();
        }
        return total;
    }
    this.Groß = function () {
        return this.blatt.length;
    }
}

function dealer(stapel1) {
    this.dHand = new Hand(stapel1);
    this.Dstart = function () {
        this.dHand.ziehen();
    }
    this.Dspiel = function () {
        while (this.dHand.Handwert() < 17) {
            this.dHand.ziehen();
            this.Drettungmöglich()
        }
    }
    this.Drettungmöglich = function () {
        if (this.dHand.Handwert() > 21) {
            const anzahl = this.dHand.Groß();
            for (let ret1 = 0; ret1 < anzahl; ret1++) {
                const Kriterium1 = this.dHand.zeigen(ret1);
                const Kriterium2 = Kriterium1.number;
                if (Kriterium2 == 'Ass') {
                    this.veringern = true;
                    Kriterium1.number = 1;
                    ret1 = anzahl;
                }
            }
        }
    }
    this.Dverloren = function () {
        return this.dHand.Handwert() >= 22;

    }
    this.getDhand = function () {
        return this.dHand;
    }
}

function spieler(stapel1) {
    this.sHand = new Hand(stapel1);
    this.Sstart = function () {
        for (let d1 = 0; d1 < 2; d1++) {
            this.sHand.ziehen();
        }
    }
    this.Sspiel = function () {
        const spielen = false;//window.prompt('wollen sie eine Karte ziehen?', 'true oder false');
        do {
            if (spielen) {
                this.sHand.ziehen();
                this.Srettungmöglich();
            }
        } while (spielen && this.sHand.Handwert() < 22)
    }
    this.Srettungmöglich = function () {
        if (this.sHand.Handwert() > 21) {
            const anzahl = this.sHand.Groß();
            for (let ret1 = 0; ret1 < anzahl; ret1++) {
                const Kriterium1 = this.sHand.zeigen(ret1);
                const Kriterium2 = Kriterium1.number;
                if (Kriterium2 == 'Ass') {
                    Kriterium1.number = 1;
                    ret1 = anzahl;
                }
            }
        }
    }
    this.Sverloren = function () {
        if (this.sHand.Handwert() < 22) {
            return false;
        }
        return true;
    }
    this.getShand = function () {
        return this.sHand;
    }
}

function Blackjack(mitspielen, liste) {
    this.Dealer1 = new dealer(liste);
    this.Spielerliste = []
    this.Vorbereiten = function () {
        this.Dealer1.Dstart();
        for (let Spielermenge = 0; Spielermenge < mitspielen.length; Spielermenge++) {
            if (mitspielen[Spielermenge]) {
                var Spieler1 = new spieler(liste);
                Spieler1.Sstart();
                this.Spielerliste.push(Spieler1)
            }
        }
    }
    this.Spielen = function () {
        for (let Spielermenge2 = 0; Spielermenge2 < this.Spielerliste.length; Spielermenge2++) {
            const hilfe = this.Spielerliste[Spielermenge2];
            hilfe.Sspiel();
        }
        this.Dealer1.Dspiel();
    }
    this.anzeigen = function () {
        for (let Spielermenge2 = 0; Spielermenge2 < this.Spielerliste.length; Spielermenge2++) {
            const hilfe2 = this.Spielerliste[Spielermenge2];
            const hilfe3 = hilfe2.getShand();
            console.log(hilfe3);
        }
        var hilfe4 = this.Dealer1.getDhand();
        console.log(hilfe4);
    }
    this.verloren = function (s1) {
        var hilfe5 = s1.getShand();
        var hilfe6 = s1.Sverloren();
        var hilfe7 = this.Dealer1.getDhand();
        if (hilfe5.Handwert() == hilfe7.Handwert) {
            return 'unentschieden'
        }
        if (hilfe6 || hilfe5.Handwert() < hilfe7.Handwert()) {
            return 'verloren'
        }
        return 'gewonnen'
    }
    this.Resultat = function () {
        let Ergebnis = '';
        for (let Spielermenge3 = 0; Spielermenge3 < this.Spielerliste.length; Spielermenge3++) {
            const hilfe8 = this.verloren(this.Spielerliste[Spielermenge3]);
            const zwischenspeicher = 'Spieler' + Spielermenge3 + ' hat ' + hilfe8 + ',';
            Ergebnis = Ergebnis.concat(zwischenspeicher);
        }
        console.log(Ergebnis);
    }
}
