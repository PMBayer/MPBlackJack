const socket = io.connect('http://localhost:5000');

//Query DOM

const nameP1 = document.getElementById('nameP1');
const nameP2 = document.getElementById('nameP2');
const nameP3 = document.getElementById('nameP3');
const nameP4 = document.getElementById('nameP4');
const nameP5 = document.getElementById('nameP5');


//Emit Events
function emitUsername() {
    const username = document.getElementById('x').innerHTML;
    socket.emit('username', {
        username: username,
    });
}

//Listen for Events
socket.on('username', function (data, ws, help) {
    assignNameToField(data, ws, help);
});

socket.on('refresh', function (number){
   clearNameField(number);
   //assignNameToField(data, ws);
});

function clearNameField(number){
    if(number < 6){
        switch (number) {
            case 1:
                nameP1.innerHTML = '<p><strong>' + '' + '</strong></p>';
                break;
            case 2:
                nameP2.innerHTML = '<p><strong>' + '' + '</strong></p>';
                break;
            case 3:
                nameP3.innerHTML = '<p><strong>' + '' + '</strong></p>';
                break;
            case 4:
                nameP4.innerHTML = '<p><strong>' + '' + '</strong></p>';
                break;
            case 5:
                nameP5.innerHTML = '<p><strong>' + '' + '</strong></p>';
                break;
        }
    }
}

function assignNameToField(data, ws, help) {
    for(let i = 0; i < ws.length; i++){
        let notEmpty = true;
        for(let j = 0; j < help.length; j++){
            if(help[j] === i+1){
                notEmpty = false;
            }
        }
        if(notEmpty){
            switch (data[ws[i]].playerNumber) {
                case 1:
                    nameP1.innerHTML = '<p><strong>' + data[ws[i]].name + '</strong></p>';
                    break;
                case 2:
                    nameP2.innerHTML = '<p><strong>' + data[ws[i]].name + '</strong></p>';
                    break;
                case 3:
                    nameP3.innerHTML = '<p><strong>' + data[ws[i]].name + '</strong></p>';
                    break;
                case 4:
                    nameP4.innerHTML = '<p><strong>' + data[ws[i]].name + '</strong></p>';
                    break;
                case 5:
                    nameP5.innerHTML = '<p><strong>' + data[ws[i]].name + '</strong></p>';
                    break;
            }
        }
    }
}


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

var zeichen = ['Kreuz', 'Pik', 'Herz', 'Karo']
var besonders = ['Bube', 'Dame', 'König']

function Card(zahl, zeichen2) {
    this.number;
    if (zahl < 11) {
        if (zahl == 1) {
            this.number = 'Ass';
        } else {
            this.number = zahl;
        }
    } else {
        this.number = besonders[zahl - 11];
    }
    this.color = zeichen[zeichen2];
    this.getCard = function () {
        karte1 = this.number + ' ' + this.color + ', ';
        return karte1;
    }
    this.wert = function () {
        if (zahl < 11) {
            if (this.number == 'Ass') {
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
        var anzahldecks = 6;
        for (i = 1; i < 14; i++) {
            for (i2 = 0; i2 < 4; i2++) {
                for (i3 = 0; i3 < anzahldecks; i3++) {
                    var card5 = new Card(i, i2);
                    this.stapel.push(card5);
                }
            }
        }
    }
    this.lang = function () {
        var länge = this.stapel.length;
        return länge;
    }
    this.geben = function () {
        var stelle = getRandomInt(this.stapel.length);
        var karte = this.stapel.splice(stelle, 1);
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
        var hilf3 = Ziehstapel1.geben();
        this.blatt.push(hilf3);
        var mischen = s.leer();
        if (mischen) {
            s.erneuern();
        }
    };
    this.zeigen = function (a) {
        var c = this.blatt[a];
        //var string1=c.getCard();
        return c;//string1;
    }
    this.volleHand = function () {
        var string2 = '';
        for (var i = 0; i < this.blatt.length; i++) {
            var c2 = this.blatt[i];
            string2 = string2.concat(c2.getCard());
        }
        return string2;
    }
    this.gezogen = function () {
        var c3 = this.blatt[this.blatt.length - 1];
        //string3=c3.getCard();
        return c3; //string3;
    }
    this.Handwert = function () {
        var total = 0;
        for (h1 = 0; h1 < this.blatt.length; h1++) {
            var kartenwert = this.blatt[h1];
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
            var anzahl = this.dHand.Groß();
            for (ret1 = 0; ret1 < anzahl; ret1++) {
                var Kriterium1 = this.dHand.zeigen(ret1);
                var Kriterium2 = Kriterium1.number;
                if (Kriterium2 == 'Ass') {
                    this.veringern = true;
                    Kriterium1.number = 1;
                    ret1 = anzahl;
                }
            }
        }
    }
    this.Dverloren = function () {
        if (this.dHand.Handwert() < 22) {
            return false;
        }
        return true;
    }
    this.getDhand = function () {
        return this.dHand;
    }
}

function spieler(stapel1) {
    this.sHand = new Hand(stapel1);
    this.Sstart = function () {
        for (d1 = 0; d1 < 2; d1++) {
            this.sHand.ziehen();
        }
    }
    this.Sspiel = function () {
        do {
            var spielen = false;//window.prompt('wollen sie eine Karte ziehen?', 'true oder false');
            if (spielen) {
                this.sHand.ziehen();
                this.Srettungmöglich();
            }
        } while (spielen && this.sHand.Handwert() < 22)
    }
    this.Srettungmöglich = function () {
        if (this.sHand.Handwert() > 21) {
            var anzahl = this.sHand.Groß();
            for (ret1 = 0; ret1 < anzahl; ret1++) {
                var Kriterium1 = this.sHand.zeigen(ret1);
                var Kriterium2 = Kriterium1.number;
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
        for (Spielermenge = 0; Spielermenge < mitspielen.length; Spielermenge++) {
            if (mitspielen[Spielermenge]) {
                var Spieler1 = new spieler(liste);
                Spieler1.Sstart();
                this.Spielerliste.push(Spieler1)
            }
        }
    }
    this.Spielen = function () {
        for (Spielermenge2 = 0; Spielermenge2 < this.Spielerliste.length; Spielermenge2++) {
            var hilfe = this.Spielerliste[Spielermenge2];
            hilfe.Sspiel();
        }
        this.Dealer1.Dspiel();
    }
    this.anzeigen = function () {
        for (Spielermenge2 = 0; Spielermenge2 < this.Spielerliste.length; Spielermenge2++) {
            var hilfe2 = this.Spielerliste[Spielermenge2];
            var hilfe3 = hilfe2.getShand();
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
        var Ergebnis = '';
        for (Spielermenge3 = 0; Spielermenge3 < this.Spielerliste.length; Spielermenge3++) {
            var hilfe8 = this.verloren(this.Spielerliste[Spielermenge3]);
            var zwischenspeicher = 'Spieler' + Spielermenge3 + ' hat ' + hilfe8 + ',';
            Ergebnis = Ergebnis.concat(zwischenspeicher);
        }
        console.log(Ergebnis);
    }
}
