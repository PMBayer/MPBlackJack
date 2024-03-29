const socket = io.connect('http://localhost:5000');

/************************ Query DOM *************************************/
const nameP1 = document.getElementById('nameP1');
const nameP2 = document.getElementById('nameP2');
const nameP3 = document.getElementById('nameP3');
const nameP4 = document.getElementById('nameP4');
const nameP5 = document.getElementById('nameP5');
const dealerText = document.getElementById('dealerID');
const readyButton = document.getElementById('ready');
const count = document.getElementById('countdown');
const handDealer = document.getElementById('handDealer')
const cardsDealer = document.getElementById('dealerCards')
const stackText = document.getElementById('stack');
const stack = document.getElementById('stack');
const namePs = [nameP1, nameP2, nameP3, nameP4, nameP5]


/************************ Emit Events ***********************************/
function emitUsername() {
    const username = document.getElementById('x').innerHTML;
    socket.emit('username', {
        username: username,
    });
}

function getPlayerData() {
    socket.emit('playerData');
    socket.on('playerData', function (data) {
        playerData = data;
    })
}

/*********************** Listen for Events ******************************/
socket.on('username', function (data, ws, help, s) {
    updatePlayers(data, ws, help, s);
});

socket.on('refresh', function (number) {
    clearNameField(number);
});

socket.on('refreshButton', function (data) {
    setTimeout(setReadyButton, to);
})

socket.on('getCardDeck', function (data) {
    cardDeck = data;
});

socket.on('createCardDeck', function (data) {
    cardDeck = getCardStack();
    socket.emit('transferCardDeck', cardDeck);
});

socket.on('showDealer', function (data) {
    clientDealer = data;
    const listOfCards = getCorrespondingCards(clientDealer);
    handDealer.innerHTML = '';
    for( let i = 0; i < listOfCards.length; i++){
        handDealer.innerHTML += '<div class="formatDealer"><img src=' + listOfCards[i] + 'width=100% heigh=100%></div>';
    }
});

socket.on('receivePlayer', function (data) {
    playerNumber = data;
});

socket.on('changeState', function (data) {
    gameState = !gameState;
});

socket.on('getState', function (data) {
    gameState = data;
})

socket.on('gameInProgress', function (data) {
    gameInProgress();
})

socket.on('getGameInformation', function (data, data2, data3) {
    currentPlayer = data;
    checked = data2;
    lastPlayer = data3;
    socket.emit('updatePlayers');
});

socket.on('updatePlayers', function (data, data2, data3, data4) {
    updatePlayers(data, data2, data3, data4);
    setTimeout(correction, 300);

});

socket.on('transferReadyAmount', function (data) {
    readyAmount = data
});

socket.on('retrieveChecked', function (data) {
    checked = data;
});

socket.on('getHands', function (data) {
    hands = data;
    socket.emit('getCardDeck');
});

socket.on('reset', function (data) {
    result = data;
});

socket.on('endRound', function (data) {
    playersFinished();
});

socket.on('left', function (data) {
    document.getElementById(border[data - 1]).style.borderColor = 'black';
});

socket.on('startCountdown', function (data) {
    help = 10;
    countdown();
});


socket.on('getResult', function (data, data2) {
    //test(data)
    for (let i = 0; i < 5; i++) {

        if (data[i] != null) {
            if (data[i] > 21) {
                result[i] = false;
            } else {
                if (verloren(data2)) {
                    result[i] = true
                } else {
                    if (data[i] > getHandwert(data2)) {
                        result[i] = true
                    } else {
                        if (data[i] === getHandwert(data2)) {
                            result[i] = "tie";
                        } else {
                            result[i] = false;
                        }
                    }
                }
            }
            //test(ergebnis[i]);
        }

    }
    //test(getHandwert(data2))
    socket.emit('updatePlayers');
});

socket.on('updateButton', function (data, data2) {
    readyAmount = data;
    playerAmount = data2;
    document.getElementById('ready').style.visibility = "visible";
    setReadyButton();
});

function clearNameField(number) {
    if (number < 6) {
        namePs[number - 1].innerHTML = '<p><strong>' + '' + '</strong></p>';
    }
    getPlayerAmount();
    setTimeout(setReadyButton, to);
}

function updatePlayers(data, ws, help, s) {
    for (let i = 0; i < ws.length; i++) {
        let notEmpty = true;
        for (let j = 0; j < help.length; j++) {
            if (help[j] === i + 1) {
                notEmpty = false;
            }
        }
        if (notEmpty) {
            setPlayer(data[ws[i]].name, data[ws[i]].playerNumber-1);
            updatePlayers2(s, i);
        }
    }
    getPlayerAmount();
    setTimeout(setReadyButton, to);
}

function updatePlayers2(s, i) {
    $(".ui-tooltip-content").parents('div').remove();
    let listOfCards = getCorrespondingCards(s[i]);
    let len = listOfCards.length

    if (s[i] !== false) {
        i+=1;
        namePs[i-1].innerHTML +=   '<a href="#" id="cards'+i+'">' + '<img title="test" id="img'+i+'" src=' + listOfCards[len-1] + 'width=75% heigh=100%></a>';
        $("#cards"+i+"").tooltip({ content: getCompleteHand(listOfCards)});
    }
}

/************************** Game Logic Implementation **********************/
/********* ready Button *************/
let playerData = {};
let checked = [false, false, false, false, false];
let playerAmount = 0;
let readyAmount = 0;
let playerNumber;
let gameState = false;
let currentPlayer;
let cardDeck;
let clientDealer;
let clientPlayer;
let hands;
let lastPlayer;
let result = [null, null, null, null, null];
let border = ['handP1', 'handP2', 'handP3', 'handP4', 'handP5'];
let text = [nameP1, nameP2, nameP3, nameP4, nameP5];
let help = 0;
let to = 25;


$("#ready").click(function () {
    getPlayerData();
    getCheckedFromServer();
    getPlayerAmount();
    setTimeout(readyCheck, to);
});

function readyCheck() {
    if (playerData.playerNumber < 6) {
        checked[playerData.playerNumber - 1] = !checked[playerData.playerNumber - 1];
    }

    socket.emit('checked', checked);
    readyAmount = 0;
    for (let i = 0; i < 5; i++) {
        if (checked[i] === true) {
            readyAmount++;
        }
    }

    sendReadyAmountToServer();
    socket.emit('transferReadyAmount');
    socket.emit('refreshButton');

    if (playerAmount === readyAmount) {
        socket.emit('changeState', gameState);
        socket.emit('getCardDeck');
        setTimeout(startGame, to);
        socket.emit('gameInProgress');
        socket.emit('getGameInformation');
    }
}

function gameInProgress() {
    document.getElementById('ready').style.visibility = "hidden";
}

function getCheckedFromServer() {
    socket.emit('retrieveChecked');
}

function getPlayerAmount() {
    socket.emit('getPlayerAmount');
    socket.on('playerAmount', function (data) {
        if (data > 5) {
            playerAmount = 5;
        } else {
            playerAmount = data;
        }
    })
}

function setReadyButton() {
    readyButton.innerHTML = "Bereit (" + readyAmount + "/" + playerAmount + ")";
}

function sendReadyAmountToServer() {
    socket.emit('setReadyAmount', readyAmount);
}

function startGame() {
    let a = dealer(cardDeck);
    cardDeck = a[0];
    clientDealer = a[1];
    let d;
    let c;
    for (let i = 0; i < 5; i++) {
        if (checked[i] === true) {
            d = spieler(cardDeck);
            cardDeck = d[0];
            clientPlayer = rescuePossible(d[1]);
            socket.emit('transferHand', clientPlayer, i);
        }
    }

    socket.emit('transferCardDeck', cardDeck)
    socket.emit('transferDealer', clientDealer);
}

/************ Ziehen Button **************/

$("#draw").click(function () {
    if (gameState) {
        socket.emit('getPlayerNumber');
        setTimeout(drawCard, to);
        socket.emit('updateplayers')
    }
});

function drawCard() {
    if (playerNumber === currentPlayer) {
        //test("läuft!")
        socket.emit('getHands');
        setTimeout(draw, to);
    }
}

function draw() {
    if (playerNumber === currentPlayer) {
        let x = ziehen(hands[currentPlayer - 1], cardDeck, 1);
        socket.emit('transferCardDeck', x[0]);
        rescuePossible(x[1]);
        hands[currentPlayer - 1] = x[1];
        socket.emit('updateHands', hands);
        if (verloren(x[1])) {
            socket.emit('getPlayerNumber');
            setTimeout(stand, to);
        }
    }
}


$("#stand").click(function () {
    if (gameState) {
        socket.emit('getPlayerNumber');
        setTimeout(stand, to);
    }
});

function stand() {
    if (playerNumber === currentPlayer) {
        socket.emit('getHands');
        socket.emit('getGameInformation');
        setTimeout(function () {
            socket.emit('sendResult', currentPlayer - 2, getHandwert(hands[currentPlayer - 2]))
        }, to);
    }
    socket.emit('getDealer');
    socket.emit('getCardDeck');
    setTimeout(playersFinished, to);
}

function playersFinished() {
    if (playerNumber === lastPlayer && currentPlayer - 1 === lastPlayer) {
        let x = Dspiel(clientDealer, cardDeck);
        socket.emit('transferCardDeck', x[0]);
        socket.emit('transferDealer', x[1]);
        restart();
        socket.emit('getResult');
    }
}

function restart() {
    socket.emit('restart');
}

function test(s) {
    nameP3.innerHTML += '<p><strong>' + '<br>' + s + '</strong></p>';
}

function setPlayer(a, b) {

    if (b === currentPlayer - 1) {
        if (checked[currentPlayer - 1] != false) {
            document.getElementById(border[b]).style.borderColor = 'blue';
        }
    } else {
        document.getElementById(border[b]).style.borderColor = 'black';
    }
    if (result[b] != null) {
        if (result[b]) {
            document.getElementById(border[b]).style.borderColor = 'green';
        }
        if (!result[b]) {
            document.getElementById(border[b]).style.borderColor = 'red';
        }
        if (result[b] === "tie") {
            document.getElementById(border[b]).style.borderColor = 'orange';
        }
    }
    text[b].innerHTML = '<p><strong>' + a + '</strong></p>';
}

function correction() {
    if (gameState) {
        if (checked[currentPlayer - 1] === false) {
            getCheckedFromServer();
            socket.emit('getGameInformation');
        }
    }
}

$("#stack").mouseover(function () {
    stackText.title = "Karten im Stapel: " + cardDeck.length;
});

function countdown() {
    if (help == 0) {
        count.innerHTML = '';
    } else {
        count.innerHTML = '' + help;
        help = help - 1;
        setTimeout(countdown, 1000);
    }
}

function getCorrespondingCards(someHand) {
    let listOfCards = [];
    for (let i = 0; i < someHand.length; i++) {
        let x = someHand[i];
        let card = x[0];
        let y = card[0];
        let cardString;

        if(y == 1){
            y = 'Ass';
        }
        if (card[1] == 'Kreuz') {
            cardString = '"images/' + y + 'C.png"';
        }
        if (card[1] == 'Pik') {
            cardString = '"images/' + y + 'S.png"';
        }
        if (card[1] == 'Herz') {
            cardString = '"images/' + y + 'H.png"';
        }
        if (card[1] == 'Karo') {
            cardString = '"images/' + y + 'D.png"';
        }
        listOfCards.push(cardString)

    }
    return listOfCards;
}

function getCompleteHand(x){
    let imgSrc = '';
    for(let i = 0; i < x.length; i++){
        let singleStr = '<img src='+x[i]+' width=20%/>'
        imgSrc += singleStr
    }
    return imgSrc;
}

// Hallo wie geht es?





