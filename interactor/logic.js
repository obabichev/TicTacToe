'use strict';

var height = 5;
var width = 10;

var map = [];

var nextAvailableIndex = 0;
var players = [];
var currentPlayer = '';


for (let i = 0; i < height; i++) {
    map.push([]);
    for (let j = 0; j < width; j++) {
        map[i].push('');
    }
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

function indexOfPlayer(playerId){
    for (let i in players) {
        if (players[i].id == playerId) {
            return parseInt(i);
        }
    }
    return -1;
}

function createName(playerId){
    return 'Player' + playerSymbol(playerId);
}

module.exports = {

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
        console.log("player " + playerId + " added");
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

        nextPlayer();
        return {
            next: currentPlayer.id,
            row: row,
            column: column,
            symbol: map[row][column]
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
    }
};