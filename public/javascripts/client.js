'use strict';

var socket;

var currentPlayerId = null;
var changePlayerTimer = null;

function sendClick(row, column) {
    socket.send({event: 'hit', row: row, column: column});
}

window.onload = function () {
    socket = connect();

    socket.on('connect', () => {
        socket.on('message', onMessage);
        initChat();
    });
};

function connect() {
    if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
        return io.connect('http://127.0.0.1:8080', {'transports': ['websocket']});
    } else {
        return io.connect('http://127.0.0.1:8080');
    }
}

function onMessage(msg) {

    console.log(JSON.stringify(msg));

    if (msg.event == 'connected') {
        updatePlayerName(msg.name);
    }

    if (msg.state) {
        updateState(msg.state);
    }

    updateLog(msg);

    if (msg.next) {
        if (currentPlayerId != msg.next.id) {
            currentPlayerId = msg.next.id;
            startTimer();
        }
        updateNextPlayerField(msg.next);
    }

    if (msg.data && msg.data.hit) {
        document.getElementById(msg.data.hit.row + ' ' + msg.data.hit.column).value = msg.data.hit.symbol;
    }

    if (msg.event == 'newGame') {
        reset(msg.mapHeight, msg.mapWidth);
    }
}

function startTimer() {
    clearInterval(changePlayerTimer);
    var leftTime = 10;
    changePlayerTimer = setInterval(()=> {
        if (leftTime > 0) {
            leftTime -= 1;
        }
        document.getElementById('timer').innerHTML = leftTime;
    }, 1000);
}

function updatePlayerName(name) {
    document.getElementById('login').innerHTML = 'Ваш логин: ' + name;
}

function updateState(state) {
    for (let i in state) {
        document.getElementById(i).value = state[i];
    }
}

function updateLog(msg) {

    var strings = {
        'connected': '[sys][time]%time%[/time]: Вы успешно соединились с сервером как [user]%name%[/user].[/sys]',
        'userJoined': '[sys][time]%time%[/time]: Игрок [user]%name%[/user] присоединился к игре.[/sys]',
        'messageSent': '[out][time]%time%[/time]: [user]%name%[/user]: %text%[/out]',
        'messageReceived': '[in][time]%time%[/time]: [user]%name%[/user]: %text%[/in]',
        'userSplit': '[sys][time]%time%[/time]: Игрок [user]%name%[/user] покинул игру.[/sys]',
        'win': '[sys][time]%time%[/time]: Игрок [user]%name%[/user] победил.[/sys]',
        'newGame': '[sys][time]%time%[/time]: Началась новая игра.[/sys]',
        'end': '[sys][time]%time%[/time]: Закончилось место для ходов >_<.[/sys]'
    };

    if (strings[msg.event]) {
        document.querySelector('#log').innerHTML +=
            strings[msg.event]
                .replace(/\[([a-z]+)\]/g, '<span class="$1">')
                .replace(/\[\/[a-z]+\]/g, '</span>')
                .replace(/\%time\%/, msg.time)
                .replace(/\%name\%/, msg.name)
                .replace(/\%text\%/, !msg.text ? '' : unescape(msg.text).replace('<', '&lt;').replace('>', '&gt;')) +
            '<br>';
        document.querySelector('#log').scrollTop = document.querySelector('#log').scrollHeight;
    }
}

function updateNextPlayerField(next) {
    document.getElementById('nextPlayer').innerHTML = 'Очередь игрока ' + next.name;
}

function reset(mapHeight, mapWidth) {
    for (let i = 0; i < mapHeight; i++) {
        for (let j = 0; j < mapWidth; j++) {
            document.getElementById(i + ' ' + j).value = '';
        }
    }
}

function initChat() {
    document.querySelector('#message-input').onkeypress = function (e) {
        if (e.which == '13') {
            socket.send({event: 'message', text: escape(document.querySelector('#message-input').value)});
            document.querySelector('#message-input').value = '';
        }
    };

    document.querySelector('#send').onclick = function () {
        socket.send({event: 'message', text: escape(document.querySelector('#message-input').value)});
        document.querySelector('#message-input').value = '';
    };
}