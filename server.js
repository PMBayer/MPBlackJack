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

// Routing
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + "/" + "style.css");
});

app.use(express.static(dir));

//starting the server
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});

//Add WebSocket handlers
io.on('connection', (socket) => {
    console.log('made socket connection at: ' + getTime());

    socket.on('username', (data) => {
        players[socket.id].name = data.username;
        console.log(players);
        io.sockets.emit('username', players, ws, help, playerHands);
    });

    socket.on('playerData', (data) => {
        io.sockets.emit('playerData', players[socket.id]);
    });

    socket.on('retrieveChecked', (data) => {
        io.sockets.emit('retrieveChecked', checked);
    });

    socket.on('checked', (data) => {
        checked = data;
        io.sockets.emit('retrieveChecked', checked);
    });

    socket.on('getPlayerAmount', (data) => {
        io.sockets.emit('playerAmount', playerAmount);
    });

    socket.on('setReadyAmount', (data) => {
        readyAmount = data;
    });

    socket.on('refreshButton', (data) => {
        io.sockets.emit('refreshButton', 1);
    });

    socket.on('transferReadyAmount', (data) => {
        io.sockets.emit('transferReadyAmount', readyAmount);
    });

    socket.on('transferCardDeck', (data) => {
        cardDeck = data;
        //console.log(cardDeck);
    })

    socket.on('getCardDeck', (data) => {
        io.sockets.emit('getCardDeck', cardDeck);
    });

    socket.on('transferDealer', (data) => {
        dealer = data;
        io.sockets.emit('showDealer', dealer);
    });

    socket.on('getPlayerNumber', (data) => {
        io.sockets.emit('receivePlayer', players[socket.id].playerNumber);
    });

    socket.on('changeState', (data) => {
        state = !data;
        io.sockets.emit('changeState');
    })

    socket.on('gameInProgress', (data) => {
        io.sockets.emit('gameInProgress');
    })

    socket.on('getGameInformation', (data) => {
        getLastPlayer();
        currentPlayer += 1;
        io.sockets.emit('getGameInformation', currentPlayer, checked, lastPlayer);
    })

    socket.on('transferHand', (data, data2) => {
        playerHands[data2] = data;
        io.sockets.emit('updateplayers', players, ws, help, playerHands);
    });

    socket.on('updateplayers', (data) => {
        io.sockets.emit('updateplayers', players, ws, help, playerHands);
    })

    socket.on('getHands', (data) => {
        io.sockets.emit('getHands', playerHands)
    })

    socket.on('updateHands', (data) => {
        playerHands = data;
        io.sockets.emit('updateplayers', players, ws, help, playerHands)
    })

    socket.on('getDealer', (data) => {

        io.sockets.emit('showDealer', dealer);
    });

    socket.on('restart', (data) => {
        setTimeout(restart, 10000);
    })

    socket.on('sendResult', (data1, data2) => {
        result[data1] = data2;

    })

    socket.on('getResult', (data) => {
        io.sockets.emit('getResult', result, dealer);
    });
});


io.on('connection', (socket) => {
    if (playerAmount === 0) {
        io.sockets.emit('createCardDeck');
    }
    if (state) {
        io.sockets.emit('gameInProgress');
    }
    if (dealer != null) {
        io.sockets.emit('showDealer', dealer);
    }
    io.sockets.emit('updateplayers', players, ws, help, playerHands);
    io.sockets.emit('getGameInformation', currentPlayer, checked);
    playerAmount += 1;
    addWS(socket.id);
    io.sockets.emit('getState', state);
    io.sockets.emit('transferReadyAmount', readyAmount);

    players[socket.id] = {
        'name': '',
        'playerNumber': getPlayerNumber(),
        'handValue': 0,
        'ready': false,
    }

    console.log(players);

    socket.on('disconnect', () => {
        playerAmount -= 1;

        if (playerAmount === 0) {
            restart();
        }

        if (players[socket.id].playerNumber === currentPlayer) {
            getLastPlayer();
            currentPlayer += 1;
            io.sockets.emit('getGameInformation', currentPlayer, checked, lastPlayer);
            io.sockets.emit('playerLeft', currentPlayer - 1);
            if (currentPlayer > lastPlayer) {
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

        if (players[socket.id].playerNumber < 6) {
            if (checked[players[socket.id].playerNumber - 1] === true) {
                readyAmount -= 1;
            }
            checked[players[socket.id].playerNumber - 1] = false;
        }

        if (players[socket.id].playerNumber < 6) {
            playerHands[players[socket.id].playerNumber - 1] = false;
            io.sockets.emit('playerLeft', players[socket.id].playerNumber);
        }

        io.sockets.emit('transferReadyAmount', readyAmount);
        io.sockets.emit('refresh', players[socket.id].playerNumber);

        delete players[socket.id];
        io.sockets.emit('updateplayers', players, ws, help, playerHands);
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
let result = [null, null, null, null, null];
const players = {};
let ws = [];
let maxPlayer = 0;
const help = [];
let u = false;

function restart() {
    result = [null, null, null, null, null];
    checked = [false, false, false, false, false];
    state = false;
    readyAmount = 0;
    dealer = [];
    currentPlayer = 0;
    playerHands = [false, false, false, false, false];
    io.sockets.emit('reset', result);
    io.sockets.emit('changeState');
    io.sockets.emit('updateplayers', players, ws, help, playerHands);
    io.sockets.emit('updateButton', readyAmount, playerAmount);
    io.sockets.emit('showDealer', dealer);

}

function getLastPlayer() {
    let x = 0;
    for (let i = 0; i < checked.length; i++) {
        if (checked[i] === true) {
            x = i;
        }
    }
    lastPlayer = x + 1;
}

function getTime() {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time;
}

function addWS(x) {
    if (help.length === 0) {
        ws.push(x);
    } else {
        let p = 1000;
        for (let i = 0; i < help.length; i++) {
            if (help[i] < p) {
                p = help[i];
            }
        }
        ws[p - 1] = x;
    }

}

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
        for (i = 0; i < ws.length; i++) {
            if (players[ws[i]].playerNumber === 6) {
                players[ws[i]].playerNumber = x;
                u = true;
            }

            if (players[ws[i]].playerNumber >= 7) {
                players[ws[i]].playerNumber -= 1;
            }
        }
    } else {
        for (i = 0; i < ws.length; i++) {
            if (players[ws[i]].playerNumber > x) {
                players[ws[i]].playerNumber -= 1;
            }
        }
    }
}

function decMaxPlayer1(x) {
    help.push(x);
    removeWS1(x);
}

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

function removeWS1(x) {
    ws[x - 1] = null;
}



