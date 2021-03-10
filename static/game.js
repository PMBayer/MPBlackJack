const socket = io.connect('http://localhost:5000');

/************************ Query DOM *************************************/
const nameP1 = document.getElementById('nameP1');
const nameP2 = document.getElementById('nameP2');
const nameP3 = document.getElementById('nameP3');
const nameP4 = document.getElementById('nameP4');
const nameP5 = document.getElementById('nameP5');
const dealerText = document.getElementById('dealerID');
const readyButton = document.getElementById('ready');


/************************ Emit Events ***********************************/
function emitUsername() {
    const username = document.getElementById('x').innerHTML;
    socket.emit('username', {
        username: username,
    });
}

function getPlayerData(){
    socket.emit('playerData');
    socket.on('playerData', function(data){
        playerData = data;
    })
}

/*********************** Listen for Events ******************************/
socket.on('username', function (data, ws, help) {
    assignNameToField(data, ws, help);
});

socket.on('refresh', function (number){
   clearNameField(number);
});

socket.on('refreshButton', function (data){
    nameP5.innerHTML = '<p><strong>' + 'hallo' + '</strong></p>';
    setTimeout(setReadyButton, 100);
})

socket.on('getCardDeck', function (data){
    cardDeck = data;
});

socket.on('createCardDeck', function (data){
    cardDeck = getZiehstapel();
    socket.emit('transferCardDeck', cardDeck);
});

socket.on('showDealer', function (data){
    clientDealer = data;
    dealerText.innerHTML = 'Dealer ' + '<br>' + gesamteHand(clientDealer);
});

socket.on('receivePlayer', function (data){
    playerNumber = data;
});

socket.on('changeState', function (data){
    gameState = !gameState;
});

socket.on('getState', function (data){
    gameState = data;
})

socket.on('gameInProgress', function (data){
    gameInProgress();
})

socket.on('getGameInformation', function (data, data2){
    currentPlayer = data;
    checked = data2;
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
    getPlayerAmount();
    setTimeout(setReadyButton, 100);
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
    getPlayerAmount();
    setTimeout(setReadyButton, 100);
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


$("#ready").click(function(){
    getPlayerData();
    getCheckedFromServer();
    getPlayerAmount();
    setTimeout(readyCheck, 100);
});

function readyCheck(){
    if(playerData.playerNumber < 6){
        checked[playerData.playerNumber-1] = !checked[playerData.playerNumber-1];
    }
    socket.emit('checked', checked);
    readyAmount = 0;
    for(let i = 0; i < 5; i++){
        if(checked[i] === true){
            readyAmount++;
        }
    }

    sendReadyAmountToServer();
    socket.emit('transferReadyAmount');
    socket.emit('refreshButton');

    if(playerAmount === readyAmount){
        socket.emit('changeState', gameState);
        socket.emit('getCardDeck');
        setTimeout(startGame, 100);
        socket.emit('gameInProgress');
        socket.emit('getGameInformation');
    }else {
        nameP1.innerHTML = '<p><strong>' + checked + '</strong></p>';
    }
}

function gameInProgress(){
    document.getElementById('ready').style.visibility = "hidden";
}

function getCheckedFromServer(){
    socket.emit('retrieveChecked');
    socket.on('retrieveChecked', function (data){
        checked = data;
    });
}

function getPlayerAmount(){
    socket.emit('getPlayerAmount');
    socket.on('playerAmount', function(data){
        if(data > 5){
            playerAmount = 5;
        }else{
            playerAmount = data;
        }
    })
}

function setReadyButton(){
    readyButton.innerHTML = "Bereit (" + readyAmount + "/" + playerAmount + ")";
}

socket.on('transferReadyAmount', function (data){
    readyAmount = data
});

function sendReadyAmountToServer(){
    socket.emit('setReadyAmount', readyAmount);
}

let cardDeck;
let clientDealer;
let clientPlayer;

function startGame() {
    let a = dealer(cardDeck);
    cardDeck = a[0];
    let b = a[1];
    clientDealer = b[0];
    let d;
    let c;

    for(let i = 0; i < 5; i++){
        if(checked[i] === true){
            d = spieler(cardDeck);
            test(d[1])
            cardDeck = d[0];
            c = d[1];
            clientPlayer = c[0];
            socket.emit('transferHand', clientPlayer, i);
        }
    }

    socket.emit('transferCardDeck', cardDeck)
    socket.emit('transferDealer', clientDealer);
}

/************ Ziehen Button **************/

$("#draw").click(function(){
    if(gameState){
        socket.emit('getPlayerNumber');
        setTimeout(drawCard, 100);
    }
});

function drawCard(){
    if(playerNumber === currentPlayer){

    }
}

/************************* Universal Test Function *******************************/

function test(s){
    nameP4.innerHTML = '<p><strong>' + s + '</strong></p>';
}



