'use strict';

var io = require('socket.io').listen(8080);
var logic = require('../interactor/logic');
var players = require('../interactor/players');

// var ID;
// var name;

function welcomeNewUser(socket, name) {
    socket.json.send({event: 'connected', name: name, time: time(), next: players.getCurrentPlayer()});
    socket.broadcast.json.send({event: 'userJoined', name: name, 'time': time()});
}

function time() {
    return (new Date).toLocaleTimeString();
}

io.sockets.on('connection', function (socket) {

    let ID = (socket.id).toString();
    players.addPlayer(ID);

    let name = players.getPlayer(ID).name;

    welcomeNewUser(socket, name);

    socket.on('message', onMessage);

    socket.on('disconnect', onDisconnect(ID, name));

    function onMessage(msg) {
        console.log("MSG:" + name + ":" + JSON.stringify(msg));

        if (msg.event == 'hit' && !logic.isGameEnd()) {
            tryHit(msg.row, msg.column);
        }

        if (msg.event == 'message') {
            sendTextMessage(msg.text);
        }
    }

    function sendTextMessage(text) {
        socket.json.send({event: 'messageSent', name: name, 'text': text, time: time()});
        socket.broadcast.json.send({event: 'messageReceived', name: name, text: text, time: time()})
    }

    function tryHit(row, column) {
        let hitResult = logic.tryHit(ID, row, column);
        console.log(JSON.stringify(hitResult));
        if (hitResult) {
            if (hitResult.win) {
                notifyAboutWin(hitResult);
                var timerId = createResetGameTime(3000);
            } else {
                notifyAboutSuccessHit(hitResult);
            }
        }
    }

    function notifyAboutSuccessHit(hitResult) {
        io.sockets.json.send({
            event: 'successHit',
            name: name,
            time: time(),
            next: players.getCurrentPlayer(),
            data: hitResult
        });
    }

    function notifyAboutWin(hitResult) {
        io.sockets.json.send({
            event: 'win',
            name: name,
            time: time(),
            data: hitResult
        });
    }

    function createResetGameTime(delay) {
        return setTimeout(()=> {
            logic.reset();
            io.sockets.json.send({
                event: 'newGame',
                time: time(),
                mapHeight: logic.getMapSize()[0],
                mapWidth: logic.getMapSize()[1],
            });
        }, delay);
    }
});

function onDisconnect(ID, name) {
    return () => {
        io.sockets.json.send({event: 'userSplit', name: name, time: time(), next: players.getCurrentPlayer()});
        players.deletePlayer(ID);
    }
}

