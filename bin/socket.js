'use strict';

var io = require('socket.io').listen(8080);
var logic = require('../interactor/logic');

io.sockets.on('connection', function (socket) {

    var ID = (socket.id).toString();
    logic.addPlayer(ID);
    var name = logic.getPlayer(ID).name;

    var time = (new Date).toLocaleTimeString();

    socket.json.send({'event': 'connected', 'name': name, 'time': time});
    socket.broadcast.json.send({'event': 'userJoined', 'name': name, 'time': time});

    socket.on('message', function (msg) {

        console.log("MSG:" + ID + ":" + JSON.stringify(msg));

        let hitResult = logic.tryHit(ID, msg.row, msg.column);
        if (hitResult) {
            console.log("Hit success");
            io.sockets.json.send({'event': 'successHit', 'name': ID, 'time': time, data: hitResult});
        }

        // var time = (new Date).toLocaleTimeString();
        // socket.json.send({'event': 'messageSent', 'name': ID,    'text': msg, 'time': time});
        // socket.broadcast.json.send({'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time})
    });

    socket.on('disconnect', function () {
        var time = (new Date).toLocaleTimeString();
        io.sockets.json.send({'event': 'userSplit', 'name': ID, 'time': time});
        logic.deletePlayer(ID);
    });
});

console.log("socket created");

module.exports = {};