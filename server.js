// Dependencies.
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const dir = path.join(__dirname, 'images');

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use('/images', express.static(dir));

// Routing
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + "/" + "style.css");
});

//starting the server
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});

//Add WebSocket handlers
io.on('connection', function (socket) {
    console.log('made socket connection at: ' + getTime());

    socket.on('username', function (data) {
        players[socket.id].name = data.username;
        console.log(players);
        io.sockets.emit('username', players, ws, help, playerHands);
    });

    socket.on('playerData', function (data){
        io.sockets.emit('playerData', players[socket.id]);
    });

    socket.on('retrieveChecked', function (data){
        io.sockets.emit('retrieveChecked', checked);
    });

    socket.on('checked', function(data){
        checked = data;
        io.sockets.emit('retrieveChecked', checked);
    });

    socket.on('getPlayerAmount', function (data){
        io.sockets.emit('playerAmount', playerAmount);
    });

    socket.on('setReadyAmount', function (data){
        readyAmount = data;
    });

    socket.on('refreshButton', function(data){
        io.sockets.emit('refreshButton', 1);
    });

    socket.on('transferReadyAmount', function (data){
        io.sockets.emit('transferReadyAmount', readyAmount);
    });

    socket.on('transferCardDeck', function (data){
        cardDeck = data;
    })

    socket.on('getCardDeck', function (data){
        io.sockets.emit('getCardDeck', cardDeck);
    });

    socket.on('transferDealer', function (data){
        dealer = data;
        console.log(dealer);
        io.sockets.emit('showDealer', dealer);
    });

    socket.on('getPlayerNumber', function (data){
        io.sockets.emit('receivePlayer', players[socket.id].playerNumber);
    });

    socket.on('changeState', function (data){
        state = !data;
        io.sockets.emit('changeState');
    })

    socket.on('gameInProgress', function (data){
        io.sockets.emit('gameInProgress');
    })

    socket.on('getGameInformation', function (data){
        getLastPlayer();
        currentPlayer += 1;
        io.sockets.emit('getGameInformation', currentPlayer, checked, lastPlayer);
        io.sockets.emit('getCardDeck', cardDeck)
    })

    socket.on('transferHand', function (data, data2){
        playerHands[data2] = data;
        console.log(playerHands);
        console.log(playerHands[data2]);
        io.sockets.emit('updatePlayers', players, ws, help, playerHands);
    });

    socket.on('updatePlayers', function (data){
        io.sockets.emit('updatePlayers', players, ws, help, playerHands);
    })

    socket.on('getHands', function (data){
        io.sockets.emit('getHands', playerHands)
    })

    socket.on('updateHands', function (data){
        playerHands = data;
        console.log(playerHands);
        io.sockets.emit('updatePlayers', players, ws, help, playerHands)
    })

    socket.on('getDealer', function (data){
        io.sockets.emit('showDealer', dealer);
    });

    socket.on('restart', function (data){
        io.sockets.emit('startCountdown');
        setTimeout(restart, 10000);
    });
    socket.on('sendResult', function (data,data2){
        console.log(data);
        console.log(data2);
        result[data]=data2;
    });

   socket.on('getResult', function (data){
        console.log(result);
        io.sockets.emit('getResult', result, dealer);
   });
});


io.on('connection', (socket) => {
    if(playerAmount === 0){
        io.sockets.emit('createCardDeck');
        //console.log(cardDeck);
    }else{
        io.sockets.emit('getCardDeck', cardDeck);
    }
    if(state){
        io.sockets.emit('gameInProgress');
    }
    if(dealer != null){
        io.sockets.emit('showDealer', dealer);
    }
    io.sockets.emit('updatePlayers', players, ws, help, playerHands);
    io.sockets.emit('getGameInformation', currentPlayer, checked);
    playerAmount += 1;
    addWS(socket.id);
    io.sockets.emit('getState', state);
    io.sockets.emit('transferReadyAmount', readyAmount);

    players[socket.id] = {
        'name': '',
        'playerNumber': getPlayerNumber(),
        'handValue': 0,
        'ready' : false,
    }

    console.log(players);

    socket.on('disconnect', () => {
        playerAmount -= 1;
        if(playerAmount===0){
            restart();
        }
        if(players[socket.id].playerNumber===currentPlayer){
             getLastPlayer();
             currentPlayer += 1;
             io.sockets.emit('getGameInformation', currentPlayer, checked, lastPlayer);
             io.sockets.emit('left',currentPlayer-1);
             if(currentPlayer>lastPlayer){
                io.sockets.emit('endRound');
             }
        }
        console.log('Player ' + players[socket.id].name + ' disconnected at: ' + getTime());
        if (ws.length > 5) {
            decMaxPlayer2(players[socket.id].playerNumber);
            removeWS2(ws[players[socket.id].playerNumber - 1]);
        } else {
            decMaxPlayer1(players[socket.id].playerNumber);
        }
        if(players[socket.id].playerNumber < 6){
            if(checked[players[socket.id].playerNumber -1] === true){
                if(!state){
                readyAmount -= 1;
                io.sockets.emit('transferReadyAmount', readyAmount);
                }
            }
            checked[players[socket.id].playerNumber - 1] = false;
        }

        if(players[socket.id].playerNumber<6){
            playerHands[players[socket.id].playerNumber-1]=false;
            io.sockets.emit('leaved',players[socket.id].playerNumber);
        }

        io.sockets.emit('refresh', players[socket.id].playerNumber);

        delete players[socket.id];
        console.log(playerHands);
        io.sockets.emit('updatePlayers', players, ws, help,playerHands);
        console.log(ws);
        console.log(players);
    })
});

/********************************************************************************************************************/

let cardDeck;
let checked = [false, false, false, false, false];
let playerAmount = 0;
let readyAmount = 0;
let dealer;
let state = false;
let currentPlayer = 0;
let playerHands = [false, false, false, false, false];
let lastPlayer;
let result=[null,null,null,null,null];


function getLastPlayer(){
    let x = 0;
    for(let i = 0; i < checked.length; i++){
        if(checked[i] === true){
            x = i;
        }
    }
    lastPlayer = x + 1;
}

function getTime() {
    const today = new Date();
    return today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
}

const players = {};
let ws = [];

function addWS(x) {
    if(help.length === 0){
        ws.push(x);
    }else{
        let p = 1000;
        for(let i=0; i < help.length; i++){
            if(help[i] < p){
                p = help[i];
            }
        }
        ws[p-1] = x;
    }

}

let maxPlayer = 0;

function getPlayerNumber() {
    if (help.length === 0) {
        maxPlayer += 1;
        return maxPlayer;
    }
    return getHelp();
}

function getHelp() {
    let a = 1000;
    let b;
    for (let i = 0; i < help.length; i++) {
        if (help[i] < a) {
            a = help[i];
            b = i;
        }
    }
    const c = help.splice(b, 1);
    return a
}

//for more than 5 players
function decMaxPlayer2(x) {
    maxPlayer -= 1;
    if (x <= 5) {
        for (let i = 0; i < ws.length; i++) {
            if (players[ws[i]].playerNumber === 6) {
                players[ws[i]].playerNumber = x;
                u = true;
            }

            if (players[ws[i]].playerNumber >= 7) {
                players[ws[i]].playerNumber -= 1;
            }
        }
    } else {
        for (let i = 0; i < ws.length; i++) {
            if (players[ws[i]].playerNumber > x) {
                players[ws[i]].playerNumber -= 1;
            }
        }
    }
}

const help = [];

function decMaxPlayer1(x) {
    help.push(x);
    removeWS1(x);
}

let u = false;
function removeWS2(x) {
    const index = ws.indexOf(x);
    if (u) {
        const spliced = ws.splice(5, 1);
        ws[index] = spliced;
        u = false;
    } else {
        const c = ws.splice(index, 1);
    }
}

function removeWS1(x){
    ws[x-1] = null;
}

function restart(){
    result=[null,null,null,null,null];
    checked = [false, false, false, false, false];
    readyAmount = 0;
    dealer=[];
    state = false;
    currentPlayer = 0;
    playerHands = [false, false, false, false, false];
    io.sockets.emit('reset', result);
    io.sockets.emit('changeState');
    io.sockets.emit('updatePlayers', players, ws, help,playerHands);
    io.sockets.emit('updateButton',readyAmount,playerAmount);
    io.sockets.emit('showDealer', dealer);
    console.log(players)

}



