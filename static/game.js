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
socket.on('username', function (data, ws, help,s) {
   updateplayers(data, ws, help,s);
});

socket.on('refresh', function (number){
   clearNameField(number);
});

socket.on('refreshButton', function (data){
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
    dealerText.innerHTML = '<br>' + gesamteHand(clientDealer);
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

socket.on('getGameInformation', function (data, data2, data3){
    currentPlayer = data;
    checked = data2;
    lastPlayer = data3;
});

socket.on('updateplayers', function (data, data2, data3, data4){
    updateplayers(data, data2, data3, data4);
});

socket.on('transferReadyAmount', function (data){
    readyAmount = data
});

socket.on('retrieveChecked', function (data){
    checked = data;
});

socket.on('getHands', function (data){
    hands = data;
    socket.emit('getCardDeck');
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

function updateplayers(data, ws, help,s) {
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
            updateplayers2(s,i);

        }
    }
    getPlayerAmount();
    setTimeout(setReadyButton, 100);
}

function updateplayers2(s,i){
    if(s[i]!== false){
        switch (i) {
            case 0:
                nameP1.innerHTML += '<p>' +'<br>' + gesamteHand(s[i]) + '</p>';
                break;
            case 1:
                nameP2.innerHTML += '<p>' +'<br>' + gesamteHand(s[i]) + '</p>';
                break;
            case 2:
                nameP3.innerHTML += '<p>' +'<br>' + gesamteHand(s[i]) + '</p>';
                break;
            case 3:
                nameP4.innerHTML += '<p>' +'<br>' + gesamteHand(s[i]) + '</p>';
                break;
            case 4:
                nameP5.innerHTML += '<p>' +'<br>' + gesamteHand(s[i]) + '</p>';
                break;
        }
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

    if(playerAmount === readyAmount) {
        socket.emit('changeState', gameState);
        socket.emit('getCardDeck');
        setTimeout(startGame, 100);
        socket.emit('gameInProgress');
        socket.emit('getGameInformation');
    }
}

function gameInProgress(){
    document.getElementById('ready').style.visibility = "hidden";
}

function getCheckedFromServer(){
    socket.emit('retrieveChecked');
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

function sendReadyAmountToServer(){
    socket.emit('setReadyAmount', readyAmount);
}

function startGame() {
    let a = dealer(cardDeck);
    cardDeck = a[0];
    clientDealer = a[1];
    let d;
    let c;
    for(let i = 0; i < 5; i++){
        if(checked[i] === true){
            d = spieler(cardDeck);
            cardDeck = d[0];
            clientPlayer = d[1];
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
        //test("läuft!")
        socket.emit('getHands');
        setTimeout(draw, 100);
    }
}

function draw(){
    let x = ziehen(hands[currentPlayer - 1], cardDeck,1);
    socket.emit('transferCardDeck', x[0]);
    hands[currentPlayer - 1] = x[1];
    socket.emit('updateHands', hands);
}

/************ Stand Button **************/

$("#stand").click(function(){
    if(gameState){
        socket.emit('getPlayerNumber');
        setTimeout(stand, 100);
    }
});

function stand(){
    if(playerNumber === currentPlayer){
        socket.emit('getGameInformation');
    }
    socket.emit('getDealer');
    socket.emit('getCardDeck');
    if(currentPlayer === lastPlayer){
        setTimeout(playersFinished, 100);
    }
}

function playersFinished(){
    if(currentPlayer-1 === lastPlayer){
        let x = Dspiel(clientDealer, cardDeck);
        socket.emit('transferCardDeck', x[0]);
        socket.emit('transferDealer', x[1]);
    }

}

/************************* Universal Test Function *******************************/

function test(s){
    nameP4.innerHTML += '<p><strong>' +'<br>' + s + '</strong></p>';
}



