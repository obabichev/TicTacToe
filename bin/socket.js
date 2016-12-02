'use strict';

var io = require('socket.io').listen(8080);
var logic = require('../interactor/logic');
var players = require('../interactor/players');

var changePlayerTimer = null;

function welcomeNewUser(socket, name) {
    console.log("user " + name + " connected");

    socket.json.send({
        event: 'connected',
        name: name,
        time: time(),
        next: players.getCurrentPlayer(),
        state: makeStateObject()
    });
    socket.broadcast.json.send({event: 'userJoined', name: name, 'time': time()});
}

function makeStateObject() {
    let map = logic.getMap();
    let dim = logic.getMapSize();
    let state = {};
    for (let i = 0; i < dim[0]; i++) {
        for (let j = 0; j < dim[1]; j++) {
            state[i + ' ' + j] = map[i][j];
        }
    }
    return state;
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
        if (hitResult) {
            if (hitResult.win) {
                notifyAboutWin(hitResult);
                createResetGameTime(3000);
            } else {
                notifyAboutSuccessHit(hitResult);
                if (logic.isFieldEnded()) {
                    notifyAboutEndOfField();
                    createResetGameTime(3000);
                }
            }
            updateChangePlayerTimer();
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

    function updateChangePlayerTimer() {
        clearInterval(changePlayerTimer);
        changePlayerTimer = setInterval(()=> {
            players.nextPlayer();
            notifyAboutNextPlayer();
        }, 10000);
    }

    function notifyAboutNextPlayer() {
        io.sockets.json.send({
            event: 'nextPlayer',
            time: time(),
            next: players.getCurrentPlayer(),
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

    function notifyAboutEndOfField() {
        io.sockets.json.send({
            event: 'end',
            time: time(),
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
        deletePlayer(ID, name);
        if (players.getNumberOfPlayers() == 0) {
            logic.reset();
        }
        console.log("Player " + name + " disconnected.");
    }
}

function deletePlayer(ID, name) {
    io.sockets.json.send({event: 'userSplit', name: name, time: time(), next: players.getCurrentPlayer()});
    players.deletePlayer(ID);
    io.sockets.json.send({event: 'nextPlayer', time: time(), next: players.getCurrentPlayer()});
}

