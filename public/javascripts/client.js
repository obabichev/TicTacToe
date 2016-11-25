strings = {
    'connected': '[sys][time]%time%[/time]: Вы успешно соединились к сервером как [user]%name%[/user].[/sys]',
    'userJoined': '[sys][time]%time%[/time]: Пользователь [user]%name%[/user] присоединился к чату.[/sys]',
    'messageSent': '[out][time]%time%[/time]: [user]%name%[/user]: %text%[/out]',
    'messageReceived': '[in][time]%time%[/time]: [user]%name%[/user]: %text%[/in]',
    'userSplit': '[sys][time]%time%[/time]: Пользователь [user]%name%[/user] покинул чат.[/sys]',
    'successHit': '[sys][time]%time%[/time]: Пользователь [user]%name%[/user] сделал свой ход.[/sys]',
};

function sendClick(row, column) {
    socket.send({row: row, column: column});
}

window.onload = function () {
    if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
        socket = io.connect('http://127.0.0.1:8080', {'transports': ['websocket']});
    } else {
        socket = io.connect('http://127.0.0.1:8080');
    }
    socket.on('connect', function () {

        socket.on('message', function (msg) {
            console.log(JSON.stringify(msg));
            document.querySelector('#log').innerHTML +=
                strings[msg.event]
                    .replace(/\[([a-z]+)\]/g, '<span class="$1">')
                    .replace(/\[\/[a-z]+\]/g, '</span>')
                    .replace(/\%time\%/, msg.time)
                    .replace(/\%name\%/, msg.name)
                    .replace(/\%text\%/, !msg.text?'':unescape(msg.text).replace('<', '&lt;').replace('>', '&gt;')) +
                '<br>';
            document.querySelector('#log').scrollTop = document.querySelector('#log').scrollHeight;

            if (msg.event == 'successHit'){
                document.getElementById(msg.data.row + ' ' + msg.data.column).value = msg.data.symbol;
            }

            if (msg.event == 'connected'){
                document.getElementById('login').innerHTML = 'Ваш логин: ' + msg.name;
            }

        });

        document.querySelector('#input').onkeypress = function (e) {
            if (e.which == '13') {
                socket.send(escape(document.querySelector('#input').value));
                document.querySelector('#input').value = '';
            }
        };

        document.querySelector('#send').onclick = function () {
            socket.send(escape(document.querySelector('#input').value));
            document.querySelector('#input').value = '';
        };
    });
};