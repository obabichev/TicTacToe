'use strict';

var height = 5;
var width = 10;

var map;

var gameEnd;
var nextAvailableIndex = 0;
var players = [];
var currentPlayer = '';

init();

function init() {
    map = [];
    for (let i = 0; i < height; i++) {
        map.push([]);
        for (let j = 0; j < width; j++) {
            map[i].push('');
        }
    }
    gameEnd = false;
}

function playerSymbol(index) {
    switch (index) {
        case 0:
            return 'X';
        case 1:
            return 'O';
        default:
            return index - 1;
    }
}

function nextPlayer() {

    let index = indexOfCurrentPlayer();
    index += 1;
    if (index >= players.length) {
        index = 0;
    }
    currentPlayer = players[index];
}

function indexOfCurrentPlayer() {
    return indexOfPlayer(currentPlayer.id)
}

function indexOfPlayer(playerId) {
    for (let i in players) {
        if (players[i].id == playerId) {
            return parseInt(i);
        }
    }
    return -1;
}

function createName(playerId) {
    return 'Player' + playerSymbol(playerId);
}

function isWin() {
    let symbol = currentPlayer.symbol;

    function thereIsWinRow(i, j) {
        for (let k = 0; k < 5; k++) {
            if (j + k >= width || map[i][j + k] != symbol) {
                return;
            }
        }
        return true;
    }

    function thereIsWinColumn(i, j) {
        for (let k = 0; k < 5; k++) {
            if (i + k >= height || map[i + k][j] != symbol) {
                return;
            }
        }
        return true;
    }

    function thereIsWinFallingDiagonal(i, j) {
        for (let k = 0; k < 5; k++) {
            if (i + k >= height || j + k >= width || map[i + k][j + k] != symbol) {
                return;
            }
        }
        return true;
    }

    function thereIsWinRisingDiagonal(i, j) {
        for (let k = 0; k < 5; k++) {
            if (i + k >= height || j - k < 0 || map[i + k][j - k] != symbol) {
                return;
            }
        }
        return true;
    }

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (thereIsWinRow(i, j)
                || thereIsWinColumn(i, j)
                || thereIsWinFallingDiagonal(i, j)
                || thereIsWinRisingDiagonal(i, j)) {
                return true;
            }
        }
    }
}

module.exports = {

    getMapSize: function () {
        return [height, width];
    },

    getMap: function () {
        return map;
    },

    getCurrentPlayer(){
        return currentPlayer;
    },

    addPlayer(playerId){
        players.push({
            id: playerId,
            symbol: playerSymbol(nextAvailableIndex),
            name: createName(nextAvailableIndex),
        });
        if (players.length == 1) {
            currentPlayer = players[0];
        }
        nextAvailableIndex += 1;
        console.log("Player " + playerId + " added");
        return currentPlayer;
    },

    tryHit(playerId, row, column){
        if (playerId != currentPlayer.id) {
            return;
        }

        if (map[row][column] != '') {
            return;
        }

        map[row][column] = currentPlayer.symbol;

        if (isWin()) {
            gameEnd = true;
            return {
                win: currentPlayer,
                hit: {
                    row: row,
                    column: column,
                    symbol: map[row][column]
                }
            }
        }

        nextPlayer();
        return {
            next: currentPlayer,
            hit: {
                row: row,
                column: column,
                symbol: map[row][column]
            }
        };
    },

    getPlayer(playerId){
        for (let i in players) {
            let player = players[i];
            if (playerId == player.id) {
                return player;
            }
        }
    },

    deletePlayer(playerId){
        if (playerId == currentPlayer.id) {
            nextPlayer();
        }
        let index = indexOfPlayer(playerId);
        players.splice(index, index + 1);
        console.log("Players after delete " + JSON.stringify(players));
        return currentPlayer;
    },

    reset(){
        init();
    },

    isGameEnd(){
        return gameEnd;
    }
};