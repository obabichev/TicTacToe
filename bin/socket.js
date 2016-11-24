'use strict';

var io = require('socket.io').listen(8080);

io.sockets.on('connection', function (socket) {

    var ID = (socket.id).toString().substr(0, 5);
    console.log("new connection " + ID);
    var time = (new Date).toLocaleTimeString();

    socket.json.send({'event': 'connected', 'name': ID, 'time': time});
    socket.broadcast.json.send({'event': 'userJoined', 'name': ID, 'time': time});

    socket.on('message', function (msg) {
        var time = (new Date).toLocaleTimeString();
        socket.json.send({'event': 'messageSent', 'name': ID, 'text': msg, 'time': time});
        socket.broadcast.json.send({'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time})
    });

    socket.on('disconnect', function () {
        var time = (new Date).toLocaleTimeString();
        io.sockets.json.send({'event': 'userSplit', 'name': ID, 'time': time});
    });
});

console.log("socket created");

module.exports = {};