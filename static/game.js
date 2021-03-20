const socket = io.connect('http://localhost:5000');

/************************ Query DOM *************************************/
const nameP1 = document.getElementById('nameP1');
const nameP2 = document.getElementById('nameP2');
const nameP3 = document.getElementById('nameP3');
const nameP4 = document.getElementById('nameP4');
const nameP5 = document.getElementById('nameP5');
const dealerText = document.getElementById('dealerID');
const readyButton = document.getElementById('ready');
const stack = document.getElementById('stack');
const imageDealer = document.getElementById('imgDealer')


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

socket.on('username', (data, ws, help, s) => {
    updatePlayers(data, ws, help, s);
});

socket.on('refresh', (number) => {
    clearNameField(number);
});

socket.on('refreshButton', (data) => {
    setTimeout(setReadyButton, 100);
});

socket.on('getCardDeck', (data) => {
    cardDeck = data;
});

socket.on('createCardDeck', (data) => {
    cardDeck = getZiehstapel();
    socket.emit('transferCardDeck', cardDeck);
});

socket.on('showDealer', (data) => {
    clientDealer = data;
    //getCorrespondingCards(dealer)
    dealerText.innerHTML = '<br>' + gesamteHand(clientDealer);
});

socket.on('receivePlayer', (data) => {
    playerNumber = data;
});

socket.on('changeState', (data) => {
    gameState = !gameState;
});

socket.on('getState', (data) => {
    gameState = data;
});

socket.on('gameInProgress', (data) => {
    gameInProgress();
});

socket.on('getGameInformation', (data, data2, data3) => {
    currentPlayer = data;
    checked = data2;
    lastPlayer = data3;
    socket.emit('updateplayers');
});

socket.on('updateplayers', (data, data2, data3, data4) => {
    updatePlayers(data, data2, data3, data4);
    setTimeout(correction, 300);
});

socket.on('transferReadyAmount', (data) => {
    readyAmount = data
});

socket.on('retrieveChecked', (data) => {
    checked = data;
});

socket.on('getHands', (data) => {
    hands = data;
    socket.emit('getCardDeck');
});

socket.on('updateButton', (data1, data2) => {
    readyAmount = data1;
    playerAmount = data2;
    document.getElementById('ready').style.visibility = 'visible';
    setReadyButton();
});

socket.on('getResult', (data1, data2) => {
    for (let i = 0; i < 5; i++) {
        if (data1[i] > 21) {
            result[i] = false;
        } else {
            if (verloren(data2)) {
                result[i] = true;
            } else {
                if (data1[i] > getHandwert(data2)) {
                    result[i] = true;
                } else {
                    if (data1[i] === getHandwert(data2)) {
                        result[i] = 'draw';
                    }
                    result[i] = false;
                }
            }
        }
    }
    socket.emit('updateplayers');
});

socket.on('reset', (data) => {
    result = data;
});

socket.on('endRound', (data) => {
    playersFinished();
});

socket.on('playerLeft', (data) => {
    document.getElementById(border[data - 1]).style.borderColor = 'black';
})

function clearNameField(number) {
    if (number < 6) {
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
    getPlayerAmount();
    setTimeout(setReadyButton, 100);
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
            switch (data[ws[i]].playerNumber) {
                case 1:
                    setPlayerBorder(data[ws[i]].name, data[ws[i]].playerNumber - 1)
                    break;
                case 2:
                    setPlayerBorder(data[ws[i]].name, data[ws[i]].playerNumber - 1)
                    break;
                case 3:
                    setPlayerBorder(data[ws[i]].name, data[ws[i]].playerNumber - 1)
                    break;
                case 4:
                    setPlayerBorder(data[ws[i]].name, data[ws[i]].playerNumber - 1)
                    break;
                case 5:
                    setPlayerBorder(data[ws[i]].name, data[ws[i]].playerNumber - 1)
                    break;
            }
            updatePlayers2(s, i);
        }
    }
    getPlayerAmount();
    setTimeout(setReadyButton, 100);
}

function updatePlayers2(s, i) {
    if (s[i] !== false) {
        switch (i) {
            case 0:
                nameP1.innerHTML += '<p>' + '<br>' + gesamteHand(s[i]) + '</p>';
                break;
            case 1:
                nameP2.innerHTML += '<p>' + '<br>' + gesamteHand(s[i]) + '</p>';
                break;
            case 2:
                nameP3.innerHTML += '<p>' + '<br>' + gesamteHand(s[i]) + '</p>';
                break;
            case 3:
                nameP4.innerHTML += '<p>' + '<br>' + gesamteHand(s[i]) + '</p>';
                break;
            case 4:
                nameP5.innerHTML += '<p>' + '<br>' + gesamteHand(s[i]) + '</p>';
                break;
        }
    }
}

/************************** Game Logic Implementation **********************/
/********* Global Var *************/
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
const border = ['handP1', 'handP2', 'handP3', 'handP4', 'handP5'];
const text = [nameP1, nameP2, nameP3, nameP4, nameP5];

/********* ready Button *************/

$("#ready").click(function () {
    getPlayerData();
    getCheckedFromServer();
    getPlayerAmount();
    setTimeout(readyCheck, 100);
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
        setTimeout(startGame, 100);
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
            clientPlayer = d[1];
            socket.emit('transferHand', clientPlayer, i);
        }
    }

    socket.emit('transferCardDeck', cardDeck)
    socket.emit('transferDealer', clientDealer);
}

/************ Hit Button **************/

$("#draw").click(function () {
    if (gameState) {
        socket.emit('getPlayerNumber');
        setTimeout(drawCard, 100);
    }
});

function drawCard() {
    if (playerNumber === currentPlayer) {
        socket.emit('getHands');
        setTimeout(draw, 100);
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
            setTimeout(stand, 100);
        }
    }
}

/************ Stand Button **************/

$("#stand").click(function () {
    if (gameState) {
        socket.emit('getPlayerNumber');
        setTimeout(stand, 100);
    }
});

function stand() {
    if (playerNumber === currentPlayer) {
        socket.emit('getHands')
        socket.emit('getGameInformation');
        setTimeout(function () {
            socket.emit('sendResult', currentPlayer - 2, getHandwert(hands[currentPlayer - 2]))
        }, 100);
    }
    socket.emit('getDealer');
    socket.emit('getCardDeck');
    if (playerNumber === lastPlayer && currentPlayer === lastPlayer) {
        setTimeout(playersFinished, 100);
    }
}

function playersFinished() {
    let x = Dspiel(clientDealer, cardDeck);
    socket.emit('transferCardDeck', x[0]);
    socket.emit('transferDealer', x[1]);
    //setTimeout(restart, 10000);
    restart();
    socket.emit('getResult');
}

function restart() {
    socket.emit('restart');
}

function setPlayerBorder(a, b) {
    if (b === currentPlayer - 1) {
        document.getElementById(border[b]).style.borderColor = 'blue';
    } else {
        document.getElementById(border[b]).style.borderColor = 'black';
    }
    if (result[b] !== null) {
        if (result[b]) {
            document.getElementById(border[b]).style.borderColor = 'green';
        }
        if (!result[b]) {
            document.getElementById(border[b]).style.borderColor = 'red';
        }
        if (result[b] === 'draw') {
            document.getElementById(border[b]).style.borderColor = 'orange';
        }
    }
    text[b].innerHTML = '<p><strong>' + a + '</strong></p>';
}

function correction() {
    if (gameState) {
        if (checked[currentPlayer - 1] === false) {
            checked[currentPlayer - 1] = true;
            getCheckedFromServer();
            currentPlayer = 10;
            socket.emit('getGameInformation');
        }
    }
}

/*function getCorrespondingCards(someHand){
    let listOfCards = [];
    for(let i = 0; i < someHand.length;i++){

}*/

/************************* Universal Test Function *******************************/

$("#stack").mouseenter(function () {
    stack.title = "Karten im Stapel: " + cardDeck.length;
});





