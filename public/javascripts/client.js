strings = {
    'connected': '[sys][time]%time%[/time]: Вы успешно соединились с сервером как [user]%name%[/user].[/sys]',
    'userJoined': '[sys][time]%time%[/time]: Игрок [user]%name%[/user] присоединился к игре.[/sys]',
    'messageSent': '[out][time]%time%[/time]: [user]%name%[/user]: %text%[/out]',
    'messageReceived': '[in][time]%time%[/time]: [user]%name%[/user]: %text%[/in]',
    'userSplit': '[sys][time]%time%[/time]: Игрок [user]%name%[/user] покинул игру.[/sys]',
    'win': '[sys][time]%time%[/time]: Игрок [user]%name%[/user] победил.[/sys]',
    'newGame': '[sys][time]%time%[/time]: Началась новая игра.[/sys]',
};

function sendClick(row, column) {
    socket.send({event: 'hit', row: row, column: column});
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
            if (strings[msg.event]) {
                document.querySelector('#log').innerHTML +=
                    strings[msg.event]
                        .replace(/\[([a-z]+)\]/g, '<span class="$1">')
                        .replace(/\[\/[a-z]+\]/g, '</span>')
                        .replace(/\%time\%/, msg.time)
                        .replace(/\%name\%/, msg.name)
                        .replace(/\%text\%/, !msg.text ? '' : unescape(msg.text).replace('<', '&lt;').replace('>', '&gt;')) +
                    '<br>';
            }
            document.querySelector('#log').scrollTop = document.querySelector('#log').scrollHeight;

            if (msg.next) {
                document.getElementById('nextPlayer').innerHTML = 'Очередь игрока ' + msg.next.name;
            }

            if (msg.data && msg.data.hit){
                document.getElementById(msg.data.hit.row + ' ' + msg.data.hit.column).value = msg.data.hit.symbol;
            }

            if (msg.event == 'connected') {
                document.getElementById('login').innerHTML = 'Ваш логин: ' + msg.name;
            }

            if (msg.event == 'newGame'){
                for (let i = 0; i < msg.mapHeight; i++){
                    for (let j = 0; j < msg.mapWidth; j++){
                        document.getElementById(i + ' ' + j).value = '';
                    }
                }
            }

        });

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
    });
};