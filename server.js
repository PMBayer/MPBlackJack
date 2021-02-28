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
        console.log(data);
        io.sockets.emit('username', data);
    });
});

function getTime(){
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time;
}

const players = {};
io.on('connection', (socket) => {
    players[socket.id] = {
        'name' : 'enter name here',
        'handValue' : 0,
    }
    console.log(players);


    socket.on('disconnect', () => {
        console.log('Player ' + players[socket.id].name + ' disconnected!');
        delete players[socket.id];
        console.log(players);
    })
});


