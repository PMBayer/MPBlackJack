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

