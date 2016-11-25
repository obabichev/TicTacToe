'use strict';

var io = require('socket.io').listen(8080);
var logic = require('../interactor/logic');

io.sockets.on('connection', function (socket) {

    var ID = (socket.id).toString();
    logic.addPlayer(ID);

    var name = logic.getPlayer(ID).name;
    var time = (new Date).toLocaleTimeString();

    socket.json.send({'event': 'connected', 'name': name, 'time': time, next: logic.getCurrentPlayer()});
    socket.broadcast.json.send({'event': 'userJoined', 'name': name, 'time': time});

    socket.on('message', function (msg) {
        time = (new Date).toLocaleTimeString();
        console.log("MSG:" + name + ":" + JSON.stringify(msg));

        if (msg.event == 'hit') {

            let hitResult = logic.tryHit(ID, msg.row, msg.column);
            if (hitResult) {

                if (hitResult.win) {
                    io.sockets.json.send({
                        event: 'win',
                        name: name,
                        time: time,
                    });
                    io.sockets.json.send({
                        event: 'newGame',
                        mapHeight: logic.getMapSize()[0],
                        mapWidth: logic.getMapSize()[1],
                    });
                } else {

                    console.log("Hit success");
                    io.sockets.json.send({
                        event: 'successHit',
                        name: name,
                        time: time,
                        next: logic.getCurrentPlayer(),
                        data: hitResult
                    });
                }
            }
        }
        if (msg.event == 'message') {
            var time = (new Date).toLocaleTimeString();
            socket.json.send({'event': 'messageSent', 'name': name, 'text': msg.text, 'time': time});
            socket.broadcast.json.send({'event': 'messageReceived', 'name': name, 'text': msg.text, 'time': time})
        }
    });

    socket.on('disconnect', function () {
        var time = (new Date).toLocaleTimeString();
        io.sockets.json.send({'event': 'userSplit', 'name': name, 'time': time, next: logic.getCurrentPlayer()});
        logic.deletePlayer(ID);
    });
});

console.log("socket created");

module.exports = {};