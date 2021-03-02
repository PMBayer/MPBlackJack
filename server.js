// Dependencies.
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', function(req, res) {
    res.sendFile(__dirname + "/" + "style.css");
});

//starting the server
server.listen(5000, function() {
    console.log('Starting server on port 5000');
});

//Add WebSocket handlers
io.on('connection', function(socket) {
    console.log('made socket connection at: ' + getTime());

    socket.on('username', function(data){
        players[socket.id].name = data.username;
        console.log(players);
        io.sockets.emit('username', data);
    });
});

function getTime(){
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time;
}

const players = {};
let ws = [];

function addWS(x){
    ws.push(x);
}

let maxPlayer = 0;
function getPlayerNumber(){
    if(help.length == 0 ){
        maxPlayer += 1;
        return maxPlayer;
    }
    return getHelp();
}

function getHelp(){
    let a = 1000;
    let b;
    for(i = 0; i < help.length; i++){
        if(help[i] < a){
            a = help[i];
            b = i;
        }
    }
    const c = help.splice(b, 1);
    return a
}

//for more than 5 players
function decMaxPlayer2(x){
    maxPlayer -= 1;
    if(x <= 5){
        for(i = 0; i < ws.length; i++){
            if(players[ws[i]].playerNumber === 6){
                players[ws[i]].playerNumber = x;
            }

            if(players[ws[i]].playerNumber >= 7){
                players[ws[i]].playerNumber -= 1;
            }
        }
    }else{
        for(i = 0; i < ws.length; i++){
            if(players[ws[i]].playerNumber > x){
                players[ws[i]].playerNumber -= 1;
            }
        }
    }
}

const help = [];
function decMaxPlayer1(x){
    help.push(x);
}
function removeWS(x){
    const index = ws.indexOf(x);
    const c = ws.splice(index, 1);
}

io.on('connection', (socket) => {
    addWS(socket.id);
    players[socket.id] = {
        'name' : 'enter name here',
        'playerNumber' : getPlayerNumber(),
        'handValue' : 0,
    }
    console.log(ws);
    console.log(players);

    socket.on('disconnect', () => {
        console.log('Player ' + players[socket.id].name + ' disconnected!');
        if(ws.length > 5){
            decMaxPlayer2(players[socket.id].playerNumber);
        }else{
            decMaxPlayer1(players[socket.id].playerNumber);
        }
        removeWS(ws[players[socket.id].playerNumber - 1]);
        delete players[socket.id];
        console.log(players);
    })
});


